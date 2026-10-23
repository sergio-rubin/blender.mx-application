import re

from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Lead

PHONE_PATTERN = re.compile(r"^\+?[\d\s().-]+$")


class LeadSerializer(serializers.ModelSerializer):
    privacy_consent = serializers.BooleanField(write_only=True)
    website = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")

    class Meta:
        model = Lead
        fields = (
            "id",
            "name",
            "phone",
            "email",
            "privacy_consent",
            "website",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate_name(self, value):
        value = " ".join(value.split())
        if len(value) < 2:
            raise serializers.ValidationError("Escribe tu nombre completo.")
        return value

    def validate_phone(self, value):
        value = value.strip()
        if not PHONE_PATTERN.fullmatch(value):
            raise serializers.ValidationError("Escribe un teléfono válido.")
        digits = re.sub(r"\D", "", value)
        if not 10 <= len(digits) <= 15:
            raise serializers.ValidationError("Escribe un teléfono válido.")
        if len(digits) == 10:
            digits = f"52{digits}"
        return f"+{digits}"

    def validate_email(self, value):
        return value.strip().lower()

    def validate_privacy_consent(self, value):
        if value is not True:
            raise serializers.ValidationError("Debes aceptar el aviso de privacidad.")
        return value

    def create(self, validated_data):
        validated_data.pop("privacy_consent", None)
        validated_data.pop("website", None)
        return super().create(validated_data)


class SessionSerializer(serializers.Serializer):
    authenticated = serializers.BooleanField(read_only=True)
    username = serializers.CharField(read_only=True, allow_null=True)
    csrfToken = serializers.CharField(read_only=True, required=False)


class CsrfTokenSerializer(serializers.Serializer):
    csrfToken = serializers.CharField(read_only=True)


class LeadCreatedSerializer(serializers.Serializer):
    message = serializers.CharField(read_only=True)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, trim_whitespace=True)
    password = serializers.CharField(max_length=128, trim_whitespace=False, write_only=True)

    def validate(self, attrs):
        request = self.context["request"]
        user = authenticate(
            request=request,
            username=attrs["username"],
            password=attrs["password"],
        )
        if user is None or not user.is_active or not user.is_staff:
            raise serializers.ValidationError("Usuario o contraseña incorrectos.")
        attrs["user"] = user
        return attrs
