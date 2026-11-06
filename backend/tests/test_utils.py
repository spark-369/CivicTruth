"""Unit tests for pure helper functions (no I/O, no DB)."""

from datetime import datetime, timedelta

import pytest

from app.services.tamper_proof import GENESIS_HASH, compute_block_hash, compute_data_hash
from app.utils.security import (
    create_access_token,
    decode_access_token,
    hash_identifier,
    hash_password,
    verify_password,
)
from app.utils.time import parse_iso_date, utcnow_naive


# --------------------------------------------------------------------------
# utils.security
# --------------------------------------------------------------------------
def test_password_hash_roundtrip():
    hashed = hash_password("s3cret-password")
    assert hashed != "s3cret-password"
    assert verify_password("s3cret-password", hashed) is True
    assert verify_password("wrong-password", hashed) is False


def test_password_hash_is_salted():
    assert hash_password("same") != hash_password("same")


def test_verify_password_with_malformed_hash_returns_false():
    assert verify_password("anything", "not-a-bcrypt-hash") is False


def test_hash_identifier_is_deterministic_and_secret():
    a = hash_identifier("ABC-123")
    b = hash_identifier("ABC-123")
    assert a == b
    assert hash_identifier("ABC-124") != a
    # HMAC-SHA256 output length.
    assert len(a) == 64


def test_access_token_roundtrip():
    token = create_access_token({"sub": "user-1", "role": "admin"})
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "user-1"
    assert payload["role"] == "admin"
    assert payload["iss"] == "civictruth"


def test_expired_access_token_is_rejected():
    token = create_access_token({"sub": "user-1"}, expires_delta=timedelta(seconds=-1))
    assert decode_access_token(token) is None


def test_decode_garbage_token_returns_none():
    assert decode_access_token("garbage.token.value") is None


# --------------------------------------------------------------------------
# utils.time
# --------------------------------------------------------------------------
def test_utcnow_naive_has_no_tzinfo():
    now = utcnow_naive()
    assert now.tzinfo is None


def test_parse_iso_date_valid():
    parsed = parse_iso_date("2020-01-02")
    assert isinstance(parsed, datetime)
    assert parsed.year == 2020 and parsed.month == 1 and parsed.day == 2


def test_parse_iso_date_rejects_empty():
    with pytest.raises(ValueError):
        parse_iso_date("")


def test_parse_iso_date_rejects_invalid():
    with pytest.raises(ValueError):
        parse_iso_date("not-a-date")


def test_parse_iso_date_normalizes_timezone():
    parsed = parse_iso_date("2020-01-02T03:04:05+02:00")
    assert parsed.tzinfo is None
    # 03:04:05+02:00 -> 01:04:05 UTC.
    assert parsed.hour == 1


# --------------------------------------------------------------------------
# services.tamper_proof (pure hash helpers)
# --------------------------------------------------------------------------
def test_compute_data_hash_is_deterministic():
    assert compute_data_hash("abc") == compute_data_hash("abc")
    assert compute_data_hash("abc") != compute_data_hash("abcd")


def test_compute_data_hash_includes_image_url():
    without = compute_data_hash("abc")
    with_image = compute_data_hash("abc", "https://example.com/x.png")
    assert without != with_image


def test_compute_block_hash_depends_on_all_inputs():
    ts = datetime(2021, 1, 1, 0, 0, 0)
    base = compute_block_hash("datahash", GENESIS_HASH, ts)
    assert base == compute_block_hash("datahash", GENESIS_HASH, ts)
    assert base != compute_block_hash("otherhash", GENESIS_HASH, ts)
    assert base != compute_block_hash("datahash", "f" * 64, ts)
    assert base != compute_block_hash("datahash", GENESIS_HASH, datetime(2022, 1, 1))


def test_genesis_hash_constant():
    assert GENESIS_HASH == "0" * 64
