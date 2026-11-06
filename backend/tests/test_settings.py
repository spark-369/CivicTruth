"""End-to-end tests for the settings router (``/api/v1/settings``)."""

from tests.conftest import API


def test_list_settings_requires_auth(client):
    resp = client.get(f"{API}/settings/")
    assert resp.status_code == 401


def test_list_settings_includes_seeded_defaults(client, participant):
    resp = client.get(f"{API}/settings/", headers=participant["headers"])
    assert resp.status_code == 200
    keys = {s["key"] for s in resp.json()}
    # Seeded in the app lifespan.
    assert {"support.email", "app.theme", "site.name"} <= keys


def test_get_setting_by_id(client, participant):
    settings = client.get(f"{API}/settings/", headers=participant["headers"]).json()
    target = settings[0]
    resp = client.get(f"{API}/settings/{target['id']}", headers=participant["headers"])
    assert resp.status_code == 200
    assert resp.json()["id"] == target["id"]


def test_get_setting_not_found(client, participant):
    resp = client.get(f"{API}/settings/missing", headers=participant["headers"])
    assert resp.status_code == 404


def test_update_setting_requires_admin(client, participant):
    settings = client.get(f"{API}/settings/", headers=participant["headers"]).json()
    target = settings[0]
    resp = client.put(
        f"{API}/settings/{target['id']}",
        headers=participant["headers"],
        json={"value": "hacked"},
    )
    assert resp.status_code == 403


def test_admin_updates_setting(client, admin):
    settings = client.get(f"{API}/settings/", headers=admin["headers"]).json()
    target = next(s for s in settings if s["key"] == "site.name")
    resp = client.put(
        f"{API}/settings/{target['id']}",
        headers=admin["headers"],
        json={"value": "CivicTruth Renamed"},
    )
    assert resp.status_code == 200
    assert resp.json()["value"] == "CivicTruth Renamed"


def test_admin_update_setting_not_found(client, admin):
    resp = client.put(
        f"{API}/settings/missing",
        headers=admin["headers"],
        json={"value": "x"},
    )
    assert resp.status_code == 404
