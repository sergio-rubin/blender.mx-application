from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Lead
from .serializers import (
    CsrfTokenSerializer,
    LeadCreatedSerializer,
    LeadSerializer,
    LoginSerializer,
    SessionSerializer,
)
from .throttles import LeadCreateThrottle, LoginThrottle


@extend_schema_view(
    create=extend_schema(
        summary="Registrar una persona interesada",
        auth=[],
        responses={201: LeadCreatedSerializer},
    ),
    list=extend_schema(summary="Listar interesados del más reciente al más antiguo"),
)
class LeadViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = LeadSerializer
    queryset = Lead.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_throttles(self):
        if self.action == "create":
            return [LeadCreateThrottle()]
        return super().get_throttles()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get("website"):
            return Response(
                {"message": "Gracias, te contactaremos pronto"},
                status=status.HTTP_201_CREATED,
            )
        self.perform_create(serializer)
        return Response(
            {"message": "Gracias, te contactaremos pronto"},
            status=status.HTTP_201_CREATED,
        )


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfTokenView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(auth=[], responses={200: CsrfTokenSerializer})
    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class SessionView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(auth=[], responses={200: SessionSerializer})
    def get(self, request):
        user = request.user
        authenticated = bool(user.is_authenticated and user.is_active and user.is_staff)
        return Response(
            {
                "authenticated": authenticated,
                "username": user.get_username() if authenticated else None,
            }
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginThrottle]

    @extend_schema(auth=[], request=LoginSerializer, responses={200: SessionSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        auth_login(request, serializer.validated_data["user"])
        return Response(
            {
                "authenticated": True,
                "username": serializer.validated_data["user"].get_username(),
                "csrfToken": get_token(request),
            }
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        auth_logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class HealthView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(auth=[], responses={200: dict})
    def get(self, request):
        return Response({"status": "ok"})
