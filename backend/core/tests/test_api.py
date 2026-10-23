import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from core.models import Lead


@pytest.fixture
def csrf_client():
    client = APIClient(enforce_csrf_checks=True)
    response = client.get("/api/v1/auth/csrf/")
    client.credentials(HTTP_X_CSRFTOKEN=response.data["csrfToken"])
    return client


@pytest.fixture
def staff_user(db):
    return get_user_model().objects.create_user(
        username="reviewer",
        password="correct-horse-battery-staple",
        is_staff=True,
    )


@pytest.mark.django_db
def test_public_lead_creation_requires_valid_csrf_pair():
    client = APIClient(enforce_csrf_checks=True)
    response = client.post(
        "/api/v1/leads/",
        {
            "name": "Ana López",
            "phone": "3312345678",
            "email": "ana@example.com",
            "privacy_consent": True,
        },
        format="json",
    )
    assert response.status_code == 403
    assert Lead.objects.count() == 0


@pytest.mark.django_db
def test_public_lead_creation_normalizes_and_persists(csrf_client):
    response = csrf_client.post(
        "/api/v1/leads/",
        {
            "name": "  Ana   López ",
            "phone": "33 1234 5678",
            "email": "ANA@EXAMPLE.COM",
            "privacy_consent": True,
        },
        format="json",
    )
    assert response.status_code == 201
    assert response.data == {"message": "Gracias, te contactaremos pronto"}
    lead = Lead.objects.get()
    assert lead.name == "Ana López"
    assert lead.phone == "+523312345678"
    assert lead.email == "ana@example.com"


@pytest.mark.django_db
def test_honeypot_returns_success_without_saving(csrf_client):
    response = csrf_client.post(
        "/api/v1/leads/",
        {
            "name": "Robot",
            "phone": "3312345678",
            "email": "bot@example.com",
            "privacy_consent": True,
            "website": "spam.test",
        },
        format="json",
    )
    assert response.status_code == 201
    assert Lead.objects.count() == 0


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("payload", "field"),
    [
        (
            {"name": "", "phone": "3312345678", "email": "a@example.com", "privacy_consent": True},
            "name",
        ),
        (
            {"name": "Ana", "phone": "123", "email": "a@example.com", "privacy_consent": True},
            "phone",
        ),
        (
            {"name": "Ana", "phone": "3312345678", "email": "incorrecto", "privacy_consent": True},
            "email",
        ),
        (
            {
                "name": "Ana",
                "phone": "3312345678",
                "email": "a@example.com",
                "privacy_consent": False,
            },
            "privacy_consent",
        ),
    ],
)
def test_lead_validation_rejects_invalid_fields(csrf_client, payload, field):
    response = csrf_client.post("/api/v1/leads/", payload, format="json")
    assert response.status_code == 400
    assert field in response.data["errors"]


@pytest.mark.django_db
def test_lead_list_requires_staff_session(csrf_client):
    response = csrf_client.get("/api/v1/leads/")
    assert response.status_code == 403


@pytest.mark.django_db
def test_staff_login_requires_valid_csrf_pair(staff_user):
    response = APIClient(enforce_csrf_checks=True).post(
        "/api/v1/auth/login/",
        {"username": staff_user.username, "password": "correct-horse-battery-staple"},
        format="json",
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_staff_login_rotates_csrf_and_lists_newest_first(csrf_client, staff_user):
    older = Lead.objects.create(name="Ana", phone="+523311111111", email="ana@example.com")
    newer = Lead.objects.create(name="Carlos", phone="+523322222222", email="carlos@example.com")

    login_response = csrf_client.post(
        "/api/v1/auth/login/",
        {"username": staff_user.username, "password": "correct-horse-battery-staple"},
        format="json",
    )
    assert login_response.status_code == 200
    csrf_client.credentials(HTTP_X_CSRFTOKEN=login_response.data["csrfToken"])

    session_response = csrf_client.get("/api/v1/auth/session/")
    assert session_response.status_code == 200
    assert session_response.data == {"authenticated": True, "username": "reviewer"}

    response = csrf_client.get("/api/v1/leads/")
    assert response.status_code == 200
    assert [item["id"] for item in response.data["results"]] == [str(newer.id), str(older.id)]


@pytest.mark.django_db
def test_staff_can_search_by_name(csrf_client, staff_user):
    Lead.objects.create(name="Ana López", phone="+523311111111", email="ana@example.com")
    Lead.objects.create(name="Carlos Ruiz", phone="+523322222222", email="carlos@example.com")
    csrf_client.force_login(staff_user)

    response = csrf_client.get("/api/v1/leads/?search=ana")
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["name"] == "Ana López"


def test_health_is_public():
    response = APIClient().get("/api/v1/health/")
    assert response.status_code == 200
    assert response.data == {"status": "ok"}
