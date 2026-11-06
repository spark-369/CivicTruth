"""Application-level smoke tests: root, health, security headers, CORS."""

from tests.conftest import API


def test_root_endpoint(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json() == {"message": "CivicTruth Immutable Blockchain API"}


def test_health_endpoint(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_security_headers_present(client):
    resp = client.get("/health")
    headers = resp.headers
    assert headers["X-Content-Type-Options"] == "nosniff"
    assert headers["X-Frame-Options"] == "DENY"
    assert headers["X-XSS-Protection"] == "1; mode=block"
    assert "Strict-Transport-Security" in headers
    assert "Content-Security-Policy" in headers
    assert headers["Content-Security-Policy"].startswith("default-src 'self'")


def test_openapi_schema_available(client):
    resp = client.get("/openapi.json")
    assert resp.status_code == 200
    schema = resp.json()
    assert schema["info"]["title"] == "CivicTruth Blockchain API"
    # Every router should be wired into the documented API surface.
    for path in ("/api/v1/auth/login", "/api/v1/blockchain/", "/api/v1/verify/"):
        assert path in schema["paths"]


def test_cors_preflight_allows_configured_origin(client):
    resp = client.options(
        f"{API}/auth/login",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert resp.status_code == 200
    assert resp.headers.get("access-control-allow-origin") == "http://localhost:5173"
