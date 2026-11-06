"""End-to-end tests for the verification router (``/api/v1/verify``)."""

from tests.conftest import API


def _create_text_block(client, headers, participant_id, text, tx_type="document"):
    return client.post(
        f"{API}/blockchain/",
        headers=headers,
        json={
            "participant_id": participant_id,
            "transaction_type": tx_type,
            "transaction_data": text,
        },
    ).json()


def _create_image_block(client, headers, participant_id, url):
    return client.post(
        f"{API}/blockchain/",
        headers=headers,
        json={
            "participant_id": participant_id,
            "transaction_type": "image",
            "image_url": url,
        },
    ).json()


def test_verify_text_exact_match(client, participant):
    _create_text_block(client, participant["headers"], participant["id"], "The quick brown fox")
    resp = client.post(
        f"{API}/verify/",
        headers=participant["headers"],
        json={"participant_id": participant["id"], "input_text": "The quick brown fox"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["prediction_label"] == "Exact Match"
    assert body["prediction_score"] == 1.0
    assert body["status"] == "completed"
    assert body["matched_blocks"]
    assert body["result_text"]


def test_verify_text_unrelated_is_uncertain(client, participant):
    _create_text_block(client, participant["headers"], participant["id"], "Blockchain record A")
    resp = client.post(
        f"{API}/verify/",
        headers=participant["headers"],
        json={"participant_id": participant["id"], "input_text": "Completely different document"},
    )
    assert resp.status_code == 200
    # Stub returns (Mismatch, 0.4) which is below the 0.60 threshold.
    assert resp.json()["prediction_label"] == "Uncertain"


def test_verify_requires_input(client, participant):
    resp = client.post(f"{API}/verify/", headers=participant["headers"], json={})
    assert resp.status_code == 422


def test_verify_no_blocks_returns_404(client, participant):
    resp = client.post(
        f"{API}/verify/",
        headers=participant["headers"],
        json={"participant_id": participant["id"], "input_text": "anything"},
    )
    assert resp.status_code == 404


def test_verify_scopes_to_current_participant(client, participant, make_user):
    """A participant cannot verify against another participant's blocks."""
    other = make_user("participant")
    _create_text_block(client, other["headers"], other["id"], "private record")

    resp = client.post(
        f"{API}/verify/",
        headers=participant["headers"],
        json={"participant_id": other["id"], "input_text": "private record"},
    )
    assert resp.status_code == 403


def test_verify_by_block_id(client, participant):
    block = _create_text_block(client, participant["headers"], participant["id"], "specific block content")
    resp = client.post(
        f"{API}/verify/",
        headers=participant["headers"],
        json={"block_id": block["id"], "input_text": "specific block content"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["block_id"] == block["id"]
    assert body["prediction_label"] == "Exact Match"


def test_verify_unknown_block_id_returns_404(client, admin):
    resp = client.post(
        f"{API}/verify/",
        headers=admin["headers"],
        json={"block_id": "does-not-exist", "input_text": "x"},
    )
    assert resp.status_code == 404


def test_verify_image_exact_match(client, participant):
    _create_image_block(client, participant["headers"], participant["id"], "https://example.com/stored.png")
    resp = client.post(
        f"{API}/verify/",
        headers=participant["headers"],
        json={"participant_id": participant["id"], "image_url": "https://example.com/query.png"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    # Stub features are identical -> cosine similarity 1.0 -> Exact Match.
    assert body["prediction_label"] == "Exact Match"
    assert body["prediction_score"] == 1.0
    assert body["ai_model_id"] == "dinov2-small"


def test_verify_persists_record(client, participant, db_path):
    import sqlite3

    _create_text_block(client, participant["headers"], participant["id"], "persist me")
    client.post(
        f"{API}/verify/",
        headers=participant["headers"],
        json={"participant_id": participant["id"], "input_text": "persist me"},
    )
    conn = sqlite3.connect(db_path)
    try:
        count = conn.execute("SELECT COUNT(*) FROM verification_records").fetchone()[0]
    finally:
        conn.close()
    assert count == 1


def test_verify_requires_authentication(client, participant):
    resp = client.post(
        f"{API}/verify/",
        json={"participant_id": participant["id"], "input_text": "x"},
    )
    assert resp.status_code == 401
