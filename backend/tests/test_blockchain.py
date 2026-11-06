"""End-to-end tests for the blockchain router and hash-chain integrity."""

from tests.conftest import API


def _create_block(client, headers, participant_id, transaction_data="Hello chain",
                  transaction_type="document", image_url=None):
    payload = {
        "participant_id": participant_id,
        "transaction_type": transaction_type,
        "transaction_data": transaction_data,
    }
    if image_url:
        payload["image_url"] = image_url
    return client.post(f"{API}/blockchain/", headers=headers, json=payload)


def test_create_block_genesis(client, participant):
    resp = _create_block(client, participant["headers"], participant["id"])
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["data_hash"]
    assert body["block_hash"]
    assert body["participant_name"] == participant["data"]["participant"]["full_name"]
    blocks = client.get(f"{API}/blockchain/", headers=participant["headers"]).json()
    assert len(blocks) == 1


def test_create_block_links_to_previous(client, participant):
    first = _create_block(client, participant["headers"], participant["id"], "first").json()
    second = _create_block(client, participant["headers"], participant["id"], "second").json()
    assert first["block_hash"] != second["block_hash"]
    verify = client.get(f"{API}/blockchain/chain/verify", headers=participant["headers"]).json()
    assert verify["valid"] is True
    assert verify["blocks_checked"] == 2


def test_create_block_requires_data_or_image(client, participant):
    resp = client.post(
        f"{API}/blockchain/",
        headers=participant["headers"],
        json={"participant_id": participant["id"], "transaction_type": "document"},
    )
    assert resp.status_code == 422


def test_create_block_for_other_participant_forbidden(client, participant, make_user):
    other = make_user("participant")
    resp = _create_block(client, participant["headers"], other["id"], "x")
    assert resp.status_code == 403


def test_admin_can_create_block_for_other_participant(client, admin, participant):
    resp = _create_block(client, admin["headers"], participant["id"], "admin-authored")
    assert resp.status_code == 200


def test_create_block_unknown_participant(client, admin):
    resp = _create_block(client, admin["headers"], "00000000-0000-0000-0000-000000000000", "x")
    assert resp.status_code == 404


def test_create_block_records_ai_verification(client, participant):
    resp = _create_block(client, participant["headers"], participant["id"], "some content")
    body = resp.json()
    # The AI stub returns ("Factual", 0.9).
    assert body["ai_verification_label"] == "Factual"
    assert body["ai_verification_score"] == "0.9000"


def test_create_block_with_image_extracts_features(client, participant):
    resp = _create_block(
        client,
        participant["headers"],
        participant["id"],
        transaction_data=None,
        image_url="https://example.com/image.png",
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["image_url"] == "https://example.com/image.png"
    assert body["image_features"] == [0.5, 0.5, 0.5, 0.5]


def test_list_blocks_scoped_to_participant(client, participant, make_user):
    other = make_user("participant")
    _create_block(client, participant["headers"], participant["id"], "mine")
    _create_block(client, other["headers"], other["id"], "theirs")

    mine = client.get(f"{API}/blockchain/", headers=participant["headers"]).json()
    assert len(mine) == 1
    assert mine[0]["participant_id"] == participant["id"]


def test_admin_lists_all_blocks(client, admin, participant, make_user):
    other = make_user("participant")
    _create_block(client, participant["headers"], participant["id"], "a")
    _create_block(client, other["headers"], other["id"], "b")
    all_blocks = client.get(f"{API}/blockchain/", headers=admin["headers"]).json()
    assert len(all_blocks) == 2


def test_get_block_by_id(client, participant):
    created = _create_block(client, participant["headers"], participant["id"], "get-me").json()
    resp = client.get(f"{API}/blockchain/{created['id']}", headers=participant["headers"])
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


def test_get_block_not_found(client, participant):
    resp = client.get(f"{API}/blockchain/nope", headers=participant["headers"])
    assert resp.status_code == 404


def test_get_other_participants_block_forbidden(client, participant, make_user):
    other = make_user("participant")
    created = _create_block(client, other["headers"], other["id"], "secret").json()
    resp = client.get(f"{API}/blockchain/{created['id']}", headers=participant["headers"])
    assert resp.status_code == 403


def test_update_block_requires_admin(client, participant):
    created = _create_block(client, participant["headers"], participant["id"], "orig").json()
    resp = client.put(
        f"{API}/blockchain/{created['id']}",
        headers=participant["headers"],
        json={"transaction_data": "changed"},
    )
    assert resp.status_code == 403


def test_admin_update_last_block_keeps_chain_valid(client, admin, participant):
    """Updating the *last* block re-hashes it and the chain stays valid."""
    _create_block(client, participant["headers"], participant["id"], "one")
    _create_block(client, participant["headers"], participant["id"], "two")
    third = _create_block(client, participant["headers"], participant["id"], "three").json()

    resp = client.put(
        f"{API}/blockchain/{third['id']}",
        headers=admin["headers"],
        json={"transaction_data": "three-updated"},
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["transaction_data"] == "three-updated"
    # The block's own hash must change after the mutation.
    assert updated["block_hash"] != third["block_hash"]

    verify = client.get(f"{API}/blockchain/chain/verify", headers=admin["headers"]).json()
    assert verify["valid"] is True
    assert verify["blocks_checked"] == 3


def test_admin_update_block_rehashes_downstream(client, admin, participant):
    """Editing an earlier block recomputes the hashes of subsequent blocks.

    Note: this asserts the *hashes* are recomputed. The endpoint does not
    rewrite downstream ``parent_hash`` values (unlike the delete endpoint), a
    known inconsistency that is documented here rather than asserted as
    correct behaviour.
    """
    first = _create_block(client, participant["headers"], participant["id"], "one").json()
    second = _create_block(client, participant["headers"], participant["id"], "two").json()
    third = _create_block(client, participant["headers"], participant["id"], "three").json()

    resp = client.put(
        f"{API}/blockchain/{first['id']}",
        headers=admin["headers"],
        json={"transaction_data": "one-updated"},
    )
    assert resp.status_code == 200
    assert resp.json()["block_hash"] != first["block_hash"]

    second_after = client.get(f"{API}/blockchain/{second['id']}", headers=admin["headers"]).json()
    third_after = client.get(f"{API}/blockchain/{third['id']}", headers=admin["headers"]).json()
    # Downstream block hashes are recomputed (values change).
    assert second_after["block_hash"] != second["block_hash"]
    assert third_after["block_hash"] != third["block_hash"]


def test_update_block_not_found(client, admin):
    resp = client.put(
        f"{API}/blockchain/missing",
        headers=admin["headers"],
        json={"transaction_data": "x"},
    )
    assert resp.status_code == 404


def test_delete_block_by_owner_keeps_chain_valid(client, participant):
    first = _create_block(client, participant["headers"], participant["id"], "a").json()
    _create_block(client, participant["headers"], participant["id"], "b")
    _create_block(client, participant["headers"], participant["id"], "c")

    resp = client.delete(f"{API}/blockchain/{first['id']}", headers=participant["headers"])
    assert resp.status_code == 200
    assert resp.json()["id"] == first["id"]

    verify = client.get(f"{API}/blockchain/chain/verify", headers=participant["headers"]).json()
    assert verify["valid"] is True
    assert verify["blocks_checked"] == 2


def test_delete_block_forbidden_for_non_owner(client, participant, make_user):
    other = make_user("participant")
    created = _create_block(client, other["headers"], other["id"], "x").json()
    resp = client.delete(f"{API}/blockchain/{created['id']}", headers=participant["headers"])
    assert resp.status_code == 403


def test_delete_block_not_found(client, participant):
    resp = client.delete(f"{API}/blockchain/missing", headers=participant["headers"])
    assert resp.status_code == 404


def test_chain_verify_empty(client, participant):
    verify = client.get(f"{API}/blockchain/chain/verify", headers=participant["headers"]).json()
    assert verify["valid"] is True
    assert verify["blocks_checked"] == 0
    assert verify["broken_at"] is None


def test_chain_verify_detects_tampering(client, participant, db_path):
    """A raw DB edit that breaks a stored hash must be flagged by verify_chain."""
    import sqlite3

    _create_block(client, participant["headers"], participant["id"], "original-data")

    conn = sqlite3.connect(db_path)
    try:
        conn.execute("UPDATE blocks SET transaction_data = 'tampered-data'")
        conn.commit()
    finally:
        conn.close()

    verify = client.get(f"{API}/blockchain/chain/verify", headers=participant["headers"]).json()
    assert verify["valid"] is False
    assert verify["broken_at"] is not None

