"""End-to-end tests for the notifications router (``/api/v1/notifications``)."""

from tests.conftest import API


def test_create_notification_requires_admin(client, participant):
    resp = client.post(
        f"{API}/notifications/",
        headers=participant["headers"],
        json={"title": "Hi", "message": "Hello there"},
    )
    assert resp.status_code == 403


def test_admin_creates_notification(client, admin):
    resp = client.post(
        f"{API}/notifications/",
        headers=admin["headers"],
        json={"title": "Maintenance", "message": "System update at 22:00"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["title"] == "Maintenance"
    assert body["is_read"] is False
    assert body["created_by"] == admin["id"]


def test_list_notifications_broadcast_visible_to_all(client, admin, participant):
    client.post(
        f"{API}/notifications/",
        headers=admin["headers"],
        json={"title": "Broadcast", "message": "For everyone"},
    )
    resp = client.get(f"{API}/notifications/", headers=participant["headers"])
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_mark_notification_read(client, admin):
    created = client.post(
        f"{API}/notifications/",
        headers=admin["headers"],
        json={"title": "Read me", "message": "body"},
    ).json()
    resp = client.patch(
        f"{API}/notifications/{created['id']}/read",
        headers=admin["headers"],
        json={"is_read": True},
    )
    assert resp.status_code == 200
    assert resp.json()["is_read"] is True


def test_mark_missing_notification_read(client, admin):
    resp = client.patch(
        f"{API}/notifications/missing/read",
        headers=admin["headers"],
        json={"is_read": True},
    )
    assert resp.status_code == 404


def test_admin_updates_notification(client, admin):
    created = client.post(
        f"{API}/notifications/",
        headers=admin["headers"],
        json={"title": "Old", "message": "old body"},
    ).json()
    resp = client.put(
        f"{API}/notifications/{created['id']}",
        headers=admin["headers"],
        json={"title": "New", "message": "new body"},
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "New"


def test_update_notification_requires_admin(client, admin, participant):
    created = client.post(
        f"{API}/notifications/",
        headers=admin["headers"],
        json={"title": "T", "message": "body"},
    ).json()
    resp = client.put(
        f"{API}/notifications/{created['id']}",
        headers=participant["headers"],
        json={"title": "Hacked"},
    )
    assert resp.status_code == 403


def test_admin_deletes_notification(client, admin):
    created = client.post(
        f"{API}/notifications/",
        headers=admin["headers"],
        json={"title": "Temp", "message": "body"},
    ).json()
    resp = client.delete(f"{API}/notifications/{created['id']}", headers=admin["headers"])
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]

    remaining = client.get(f"{API}/notifications/", headers=admin["headers"]).json()
    assert remaining == []


def test_delete_missing_notification(client, admin):
    resp = client.delete(f"{API}/notifications/missing", headers=admin["headers"])
    assert resp.status_code == 404
