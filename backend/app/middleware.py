from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
import time
from collections import defaultdict

# Paths that are exempt from rate limiting.
_EXEMPT_PATHS = {
    "/health",
    "/",
    "/api/v1/auth/login",
    "/api/v1/auth/register",
}


def get_client_ip(request: Request) -> str:
    """Resolve the client IP, honoring reverse-proxy forwarding headers.

    Uses `X-Forwarded-For` when present (e.g. behind nginx/ALB) and falls back
    to the direct peer address. Only the first (left-most) value is trusted;
    deployment should ensure the proxy is the only thing setting this header.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.limit = limit
        self.window_seconds = window_seconds
        self.clients = defaultdict(list)
        self._last_cleanup = 0.0

    def _prune(self, now: float) -> None:
        """Drop expired client windows and remove empty keys to bound memory."""
        cutoff = now - self.window_seconds
        for client_ip in list(self.clients.keys()):
            window = self.clients[client_ip]
            window[:] = [t for t in window if t >= cutoff]
            if not window:
                del self.clients[client_ip]

    async def dispatch(self, request: Request, call_next):
        if request.url.path in _EXEMPT_PATHS:
            return await call_next(request)

        client_ip = get_client_ip(request)
        now = time.time()

        # Periodically clean up stale entries to prevent unbounded growth.
        if now - self._last_cleanup > self.window_seconds:
            self._prune(now)
            self._last_cleanup = now

        window = self.clients[client_ip]
        window[:] = [t for t in window if now - t < self.window_seconds]

        if len(window) >= self.limit:
            return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

        window.append(now)
        return await call_next(request)
