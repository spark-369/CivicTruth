"""End-to-end tests for the participants router (``/api/v1/participants``)."""

from tests.conftest import API


def test_list_participants_requires_auth(client):
    resp = client.get(f"{API}/participants/")
    assert resp.status_code == 401


def test_list_participants(client, participant):
    resp = client.get(f"{API}/participants/", headers=participant["headers"])
    assert resp.status_code == 200
    assert any(p["id"] == participant["id"] for p in resp.json())


def test_list_participants_pagination(client, admin, make_user):
    for _ in range(3):
        make_user("participant")
    resp = client.get(f"{API}/participants/?limit=2&offset=0", headers=admin["headers"])
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_list_participants_invalid_limit(client, participant):
    resp = client.get(f"{API}/participants/?limit=0", headers=participant["headers"])
    assert resp.status_code == 422


def test_get_participant(client, participant):
    resp = client.get(f"{API}/participants/{participant['id']}", headers=participant["headers"])
    assert resp.status_code == 200
    assert resp.json()["id"] == participant["id"]


def test_get_participant_not_found(client, participant):
    resp = client.get(f"{API}/participants/missing-id", headers=participant["headers"])
    assert resp.status_code == 404


def test_create_participant_requires_admin(client, participant):
    resp = client.post(
        f"{API}/participants/",
        headers=participant["headers"],
        json={"full_name": "New", "national_id": "NID-NEW", "password": "Password123!"},
    )
    assert resp.status_code == 403


def test_admin_creates_participant(client, admin):
    resp = client.post(
        f"{API}/participants/",
        headers=admin["headers"],
        json={
            "full_name": "Created By Admin",
            "national_id": "NID-ADMIN-CREATED",
            "password": "Password123!",
            "email": "created@example.com",
        },
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["full_name"] == "Created By Admin"


def test_admin_create_duplicate_participant(client, admin, participant):
    resp = client.post(
        f"{API}/participants/",
        headers=admin["headers"],
        json={
            "full_name": "Dup",
            "national_id": participant["national_id"],
            "password": "Password123!",
        },
    )
    assert resp.status_code == 400


def test_admin_updates_participant(client, admin, participant):
    resp = client.put(
        f"{API}/participants/{participant['id']}",
        headers=admin["headers"],
        json={"full_name": "Renamed", "is_active": False},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["full_name"] == "Renamed"
    assert body["is_active"] is False


def test_admin_update_participant_not_found(client, admin):
    resp = client.put(
        f"{API}/participants/missing",
        headers=admin["headers"],
        json={"full_name": "x"},
    )
    assert resp.status_code == 404


def test_admin_deletes_participant(client, admin, make_user):
    victim = make_user("participant")
    resp = client.delete(f"{API}/participants/{victim['id']}", headers=admin["headers"])
    assert resp.status_code == 200
    assert resp.json()["id"] == victim["id"]


def test_admin_cannot_delete_self(client, admin):
    resp = client.delete(f"{API}/participants/{admin['id']}", headers=admin["headers"])
    assert resp.status_code == 400


def test_delete_participant_requires_admin(client, participant, make_user):
    other = make_user("participant")
    resp = client.delete(f"{API}/participants/{other['id']}", headers=participant["headers"])
    assert resp.status_code == 403
