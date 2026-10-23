from django.middleware.csrf import CsrfViewMiddleware
from rest_framework import exceptions
from rest_framework.authentication import SessionAuthentication


class _CsrfFailureReason(CsrfViewMiddleware):
    def _reject(self, request, reason):
        return reason


class CsrfEnforcedSessionAuthentication(SessionAuthentication):
    """Require a valid CSRF pair even for anonymous unsafe requests."""

    def enforce_csrf(self, request):
        check = _CsrfFailureReason(lambda req: None)
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise exceptions.PermissionDenied(
                "La sesión de seguridad venció. Recarga e intenta de nuevo."
            )

    def authenticate(self, request):
        authenticated = super().authenticate(request)
        if authenticated is None:
            self.enforce_csrf(request)
        return authenticated
