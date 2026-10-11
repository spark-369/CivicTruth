from datetime import datetime, timezone


def utcnow_naive() -> datetime:
    """Return the current UTC time as a naive datetime.

    SQLAlchemy DateTime columns (TIMESTAMP WITHOUT TIME ZONE) cannot store
    timezone-aware datetimes via asyncpg, so we store a naive UTC value. This
    replaces the deprecated ``datetime.utcnow()`` (removed in Python 3.12+).
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)


def parse_iso_date(value: str) -> datetime:
    """Parse an ISO-8601 date/datetime string into a naive datetime.

    Raises ``ValueError`` for invalid input so callers can translate it into an
    appropriate HTTP 400/422 response instead of a 500 server error.
    """
    if not value:
        raise ValueError("date must not be empty")
    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is not None:
        parsed = parsed.astimezone(timezone.utc).replace(tzinfo=None)
    return parsed
