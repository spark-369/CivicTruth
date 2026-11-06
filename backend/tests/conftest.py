"""Shared pytest fixtures for the CivicTruth backend test-suite.

Design notes
------------
* The environment is configured *before* importing ``app`` because
  ``app.database`` builds its async engine at import time from
  ``DATABASE_URL``. We point it at a throwaway SQLite file so the suite never
  touches a real PostgreSQL instance.
* The suite drives the *real* ASGI application (routers, middleware, lifespan,
  async SQLAlchemy) through FastAPI's ``TestClient`` — i.e. true end-to-end
  HTTP tests.
* The heavy AI stack (HuggingFace / DINOv2, network model downloads) is
  monkeypatched with deterministic fakes so tests stay fast and offline.
* Table contents are wiped between tests using a plain synchronous ``sqlite3``
  connection to the same file, avoiding the need for ``pytest-asyncio`` or a
  second event loop.
"""

import os
import sqlite3
import tempfile
import uuid

# --- Configure the environment BEFORE importing the application ------------
_TMP_DIR = tempfile.mkdtemp(prefix="civictruth-tests-")
_DB_PATH = os.path.join(_TMP_DIR, "civictruth_test.db")

# A >=32 byte key is required by the Settings validator.
os.environ["SECRET_KEY"] = "test-secret-key-0123456789-0123456789ab"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_DB_PATH}"
os.environ["ENV"] = "test"
os.environ["ALLOWED_HOSTS"] = "*"
os.environ["CORS_ORIGINS"] = "http://localhost:5173"
# Effectively disable rate limiting for the functional tests; the middleware is
# exercised in isolation in test_middleware.py.
os.environ["RATE_LIMIT_PER_MINUTE"] = "1000000"
os.environ["LOG_LEVEL"] = "WARNING"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

API = "/api/v1"
DEFAULT_PASSWORD = "Password123!"


# --------------------------------------------------------------------------
# Low-level helpers
# --------------------------------------------------------------------------
def _db_connection() -> sqlite3.Connection:
    return sqlite3.connect(_DB_PATH)


def _wipe_tables() -> None:
    """Delete all rows from the mutable tables (seeded settings are kept)."""
    conn = _db_connection()
    try:
        cur = conn.cursor()
        # FK-safe order.
        for table in ("notifications", "verification_records", "blocks", "participants"):
            cur.execute(f"DELETE FROM {table}")  # noqa: S608 - fixed table names
        conn.commit()
    finally:
        conn.close()


def _promote_to_admin(participant_id: str) -> None:
    """Directly set a participant's role to ``admin``.

    ``/auth/register`` always creates ``participant`` accounts, so the first
    admin for every test is bootstrapped directly in the database. This mirrors
    the documented bootstrap path (there is no public admin sign-up endpoint).
    """
    conn = _db_connection()
    try:
        conn.execute("UPDATE participants SET role = 'admin' WHERE id = ?", (participant_id,))
        conn.commit()
    finally:
        conn.close()


def register_user(client, national_id=None, password=DEFAULT_PASSWORD, full_name="Test User", email=None):
    national_id = national_id or f"NID-{uuid.uuid4().hex[:12]}"
    payload = {"national_id": national_id, "password": password, "full_name": full_name}
    if email:
        payload["email"] = email
    resp = client.post(f"{API}/auth/register", json=payload)
    assert resp.status_code == 200, resp.text
    return national_id, password, resp.json()


def login_user(client, national_id, password=DEFAULT_PASSWORD):
    resp = client.post(f"{API}/auth/login", json={"national_id": national_id, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()


# --------------------------------------------------------------------------
# Fixtures
# --------------------------------------------------------------------------
@pytest.fixture(scope="session")
def client():
    """A session-scoped TestClient with the app's lifespan executed once."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def _clean_db(client):
    """Ensure every test starts from an empty (but migrated/seeded) database."""
    _wipe_tables()
    yield


@pytest.fixture(autouse=True)
def _stub_ai(monkeypatch):
    """Replace the heavyweight, non-deterministic AI services with fakes.

    ``verify_text_locally`` and ``extract_image_features`` are imported into the
    blockchain/verification routers, so we patch them at those module paths.
    """

    async def fake_verify_text_locally(text, reference_text=None, candidate_labels=None, threshold=0.60):
        if reference_text is not None:
            if (text or "").strip() == (reference_text or "").strip():
                return "Exact Match", 1.0
            return "Mismatch", 0.4
        return "Factual", 0.9

    async def fake_extract_image_features(image_url):
        # Deterministic, unit-normalised so cosine similarity is 1.0 vs itself.
        return [0.5, 0.5, 0.5, 0.5]

    monkeypatch.setattr("app.routers.blockchain.verify_text_locally", fake_verify_text_locally)
    monkeypatch.setattr("app.routers.blockchain.extract_image_features", fake_extract_image_features)
    monkeypatch.setattr("app.routers.verification.verify_text_locally", fake_verify_text_locally)
    monkeypatch.setattr("app.routers.verification.extract_image_features", fake_extract_image_features)


@pytest.fixture
def make_user(client):
    """Factory building an authenticated user (participant or admin)."""

    def _make(role="participant", full_name=None, email=None):
        national_id, password, data = register_user(
            client, full_name=full_name or f"{role.title()} User", email=email
        )
        participant_id = data["participant"]["id"]
        if role == "admin":
            _promote_to_admin(participant_id)
        tokens = login_user(client, national_id, password)
        token = tokens["access_token"]
        return {
            "id": participant_id,
            "national_id": national_id,
            "password": password,
            "role": role,
            "token": token,
            "headers": {"Authorization": f"Bearer {token}"},
            "data": data,
        }

    return _make


@pytest.fixture
def participant(make_user):
    return make_user("participant")


@pytest.fixture
def admin(make_user):
    return make_user("admin")


@pytest.fixture
def db_path():
    """Absolute path to the throwaway SQLite database used by the suite."""
    return _DB_PATH


