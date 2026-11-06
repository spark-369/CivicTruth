"""End-to-end tests for the authentication router (``/api/v1/auth``)."""

from tests.conftest import API, register_user, login_user


def test_register_returns_token_and_participant(client):
    _, _, data = register_user(client, full_name="Ada Lovelace", email="ada@example.com")
    assert data["token_type"] == "bearer"
    assert data["role"] == "participant"
    assert data["access_token"]
    participant = data["participant"]
    assert participant["full_name"] == "Ada Lovelace"
    assert participant["role"] == "participant"
    assert participant["is_active"] is True
    # The raw national id must never be echoed back.
    assert "national_id" not in participant


def test_register_rejects_duplicate_national_id(client):
    national_id = "NID-DUPLICATE-1"
    register_user(client, national_id=national_id)
    resp = client.post(
        f"{API}/auth/register",
        json={"national_id": national_id, "password": "Password123!", "full_name": "Dup"},
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Participant already registered"


def test_register_validates_short_password(client):
    resp = client.post(
        f"{API}/auth/register",
        json={"national_id": "NID-SHORT", "password": "short", "full_name": "Short"},
    )
    assert resp.status_code == 422


def test_register_rejects_invalid_dob(client):
    resp = client.post(
        f"{API}/auth/register",
        json={
            "national_id": "NID-BADDOB",
            "password": "Password123!",
            "full_name": "Bad Dob",
            "dob": "not-a-date",
        },
    )
    assert resp.status_code == 400
    assert "Invalid dob" in resp.json()["detail"]


def test_login_success(client):
    national_id, password, _ = register_user(client)
    data = login_user(client, national_id, password)
    assert data["role"] == "participant"
    assert data["access_token"]


def test_login_wrong_password(client):
    national_id, _, _ = register_user(client)
    resp = client.post(f"{API}/auth/login", json={"national_id": national_id, "password": "WrongPass123!"})
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid credentials"


def test_login_unknown_user(client):
    resp = client.post(f"{API}/auth/login", json={"national_id": "NID-NOBODY", "password": "Password123!"})
    assert resp.status_code == 401


def test_me_requires_authentication(client):
    resp = client.get(f"{API}/auth/me")
    assert resp.status_code == 401


def test_me_returns_current_user(client, participant):
    resp = client.get(f"{API}/auth/me", headers=participant["headers"])
    assert resp.status_code == 200
    assert resp.json()["id"] == participant["id"]


def test_me_rejects_invalid_token(client):
    resp = client.get(f"{API}/auth/me", headers={"Authorization": "Bearer not.a.token"})
    assert resp.status_code == 401


def test_update_me(client, participant):
    resp = client.put(
        f"{API}/auth/me",
        headers=participant["headers"],
        json={"full_name": "Updated Name", "bio": "Hello", "email": "me@example.com"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["full_name"] == "Updated Name"
    assert body["bio"] == "Hello"
    assert body["email"] == "me@example.com"


def test_update_me_clears_dob_when_empty(client, participant):
    resp = client.put(
        f"{API}/auth/me",
        headers=participant["headers"],
        json={"dob": ""},
    )
    assert resp.status_code == 200
    assert resp.json()["dob"] is None
