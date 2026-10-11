from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import text, select
from app.config import settings as app_settings
from app.routers import auth, blockchain, verification, participants, settings as settings_router, notifications
from app.database import engine, async_session_maker
from app.models import Base
from app.models.settings import Setting
from app.middleware import RateLimitMiddleware, TrustedHostMiddleware


logging.basicConfig(
    level=getattr(logging, app_settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("civictruth")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "style-src 'self' 'unsafe-inline' https:; "
            "script-src 'self' 'unsafe-inline' https:; "
            "connect-src 'self'"
        )
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await _run_legacy_migrations(conn)

    await _seed_default_settings()

    yield


async def _run_legacy_migrations(conn) -> None:
    """Idempotently add columns that predate the ORM model definitions.

    This mirrors the historical column additions so that databases created
    against older versions of the schema are brought up to date. Each column
    addition is guarded so it is safe to run on every startup.
    """
    is_postgres = conn.dialect.name == "postgresql"

    # Columns the models declare but which may be missing on legacy databases.
    if is_postgres:
        migrations = [
            "ALTER TABLE participants ADD COLUMN IF NOT EXISTS email VARCHAR",
            "ALTER TABLE blocks ADD COLUMN IF NOT EXISTS image_url VARCHAR",
            "ALTER TABLE blocks ADD COLUMN IF NOT EXISTS image_features TEXT",
            "ALTER TABLE verification_records ADD COLUMN IF NOT EXISTS input_image_url VARCHAR",
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR",
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT",
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by VARCHAR",
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS participant_id VARCHAR",
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE",
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()",
        ]
    else:
        # SQLite lacks `ADD COLUMN IF NOT EXISTS` until very recent versions;
        # guard each statement individually so a pre-existing column doesn't
        # abort the remaining migrations.
        migrations = [
            "ALTER TABLE participants ADD COLUMN email VARCHAR",
            "ALTER TABLE blocks ADD COLUMN image_url VARCHAR",
            "ALTER TABLE blocks ADD COLUMN image_features TEXT",
            "ALTER TABLE verification_records ADD COLUMN input_image_url VARCHAR",
        ]

    for statement in migrations:
        try:
            await conn.execute(text(statement))
        except Exception as exc:  # noqa: BLE001 - column may already exist
            logger.warning("Skipping migration %r: %s", statement, exc)


async def _seed_default_settings() -> None:
    default_settings = [
        {"key": "enable.notifications", "value": "true", "value_type": "bool", "description": "Show in-app notifications"},
        {"key": "support.email", "value": "support@civictruth.io", "value_type": "string", "description": "Support email address"},
        {"key": "app.theme", "value": "light", "value_type": "string", "description": "Application theme"},
        {"key": "session.timeout", "value": "30", "value_type": "int", "description": "Session timeout in minutes"},
        {"key": "api.rate.limit", "value": "100", "value_type": "int", "description": "API rate limit per minute"},
        {"key": "site.name", "value": "CivicTruth", "value_type": "string", "description": "Site name"},
    ]
    async with async_session_maker() as session:
        async with session.begin():
            for ds in default_settings:
                existing = (
                    await session.execute(select(Setting).where(Setting.key == ds["key"]))
                ).scalar_one_or_none()
                if not existing:
                    session.add(Setting(**ds))


app = FastAPI(title="CivicTruth Blockchain API", version="1.0.0", lifespan=lifespan)

# Enforce an allowed-host allowlist (Host header validation) to mitigate
# host-header injection / DNS rebinding attacks unless wildcarded for dev.
allowed_hosts = [h.strip() for h in app_settings.ALLOWED_HOSTS.split(",") if h.strip()]
if allowed_hosts and "*" not in allowed_hosts:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

app.add_middleware(SecurityHeadersMiddleware)

cors_origins = [o.strip() for o in app_settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

api_prefix = "/api/v1"
app.add_middleware(
    RateLimitMiddleware,
    limit=app_settings.RATE_LIMIT_PER_MINUTE,
    window_seconds=60,
)
app.include_router(auth.router, prefix=api_prefix)
app.include_router(blockchain.router, prefix=api_prefix)
app.include_router(verification.router, prefix=api_prefix)
app.include_router(participants.router, prefix=api_prefix)
app.include_router(settings_router.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)


@app.get("/")
async def root():
    return {"message": "CivicTruth Immutable Blockchain API"}


@app.get("/health")
async def health():
    return {"status": "ok"}


if app_settings.ENV == "production":

    @app.exception_handler(Exception)
    async def prod_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception in production")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
else:

    @app.exception_handler(Exception)
    async def dev_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception in development")
        return JSONResponse(status_code=500, content={"detail": str(exc)})
