import hmac
import hashlib
from datetime import timedelta
from typing import Optional

import bcrypt
import jwt
from jwt import InvalidTokenError

from app.config import settings
from app.utils.time import utcnow_naive

_BCRYPT_MAX_BYTES = 72


def hash_password(password: str) -> str:
    """Hash a password using bcrypt.

    bcrypt only uses the first 72 bytes of input; longer inputs are truncated
    (with a log warning) to remain compatible with existing stored hashes.
    """
    pwd_bytes = password.encode("utf-8")
    if len(pwd_bytes) > _BCRYPT_MAX_BYTES:
        pwd_bytes = pwd_bytes[:_BCRYPT_MAX_BYTES]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        pwd_bytes = plain.encode("utf-8")
        if len(pwd_bytes) > _BCRYPT_MAX_BYTES:
            pwd_bytes = pwd_bytes[:_BCRYPT_MAX_BYTES]
        return bcrypt.checkpw(pwd_bytes, hashed.encode("utf-8"))
    except ValueError:
        # Raised for malformed/invalid hashes; treat as a mismatch.
        return False


def hash_identifier(value: str) -> str:
    digest = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return digest

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now = utcnow_naive()
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": now, "iss": "civictruth"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            issuer="civictruth",
        )
    except InvalidTokenError:
        return None
