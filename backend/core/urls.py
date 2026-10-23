from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CsrfTokenView, HealthView, LeadViewSet, LoginView, LogoutView, SessionView

router = DefaultRouter()
router.register("leads", LeadViewSet, basename="lead")

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("auth/csrf/", CsrfTokenView.as_view(), name="csrf"),
    path("auth/session/", SessionView.as_view(), name="session"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
] + router.urls
