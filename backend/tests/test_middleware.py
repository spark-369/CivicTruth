"""Isolated tests for the rate-limit middleware and IP resolution."""

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from app.middleware import RateLimitMiddleware, get_client_ip


def _build_app(limit: int, window_seconds: int = 60) -> FastAPI:
    test_app = FastAPI()
    test_app.add_middleware(RateLimitMiddleware, limit=limit, window_seconds=window_seconds)

    @test_app.get("/ping")
    async def ping():
        return {"pong": True}

    @test_app.get("/health")
    async def health():
        return {"status": "ok"}

    return test_app


def test_requests_under_limit_succeed():
    client = TestClient(_build_app(limit=5))
    for _ in range(5):
        assert client.get("/ping").status_code == 200


def test_limit_exceeded_returns_429():
    client = TestClient(_build_app(limit=3))
    codes = [client.get("/ping").status_code for _ in range(4)]
    assert codes == [200, 200, 200, 429]
    assert client.get("/ping").json()["detail"] == "Rate limit exceeded"


def test_exempt_paths_are_not_rate_limited():
    client = TestClient(_build_app(limit=1))
    # /health and / are exempt, so many calls stay 200 while /ping trips the limit.
    for _ in range(10):
        assert client.get("/health").status_code == 200
    assert client.get("/ping").status_code == 200
    assert client.get("/ping").status_code == 429


def test_get_client_ip_prefers_x_forwarded_for():
    app = FastAPI()

    @app.get("/ip")
    async def ip(request: Request):
        return {"ip": get_client_ip(request)}

    client = TestClient(app)
    resp = client.get("/ip", headers={"X-Forwarded-For": "203.0.113.9, 10.0.0.1"})
    assert resp.json()["ip"] == "203.0.113.9"


def test_get_client_ip_falls_back_to_peer_address():
    app = FastAPI()

    @app.get("/ip")
    async def ip(request: Request):
        return {"ip": get_client_ip(request)}

    client = TestClient(app)
    resp = client.get("/ip")
    # TestClient's default peer host.
    assert resp.json()["ip"] in {"testclient", "127.0.0.1"}
