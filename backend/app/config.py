import os
from pydantic_settings import BaseSettings
from pydantic import ValidationError, field_validator
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:mysecretpassword@localhost:5432/civictruth")
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    HF_MODEL_ID: str = os.getenv("HF_MODEL_ID", "sentence-transformers/all-MiniLM-L6-v2")
    DINOV2_MODEL_ID: str = os.getenv("DINOV2_MODEL_ID", "facebook/dinov2-small")
    HF_DEVICE: str = os.getenv("HF_DEVICE", "cpu")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    ENV: str = os.getenv("ENV", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    ALLOWED_HOSTS: str = os.getenv("ALLOWED_HOSTS", "*")
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "100"))

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if len(v.encode("utf-8")) < 32:
            raise ValueError("SECRET_KEY must be at least 32 bytes")
        return v

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if v.startswith("sqlite"):
            return v
        if not v.startswith("postgresql") and not v.startswith("mysql"):
            raise ValueError("DATABASE_URL must start with postgresql, mysql, or sqlite")
        return v

    @field_validator("ENV")
    @classmethod
    def validate_env(cls, v: str) -> str:
        env = v.strip().lower()
        if env not in {"development", "production", "test", "staging"}:
            raise ValueError("ENV must be one of: development, production, test, staging")
        return env

    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        level = v.strip().upper()
        if level not in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
            raise ValueError("LOG_LEVEL must be a valid Python logging level")
        return level

try:
    settings = Settings()
except ValidationError as e:
    raise RuntimeError(
        f"Invalid configuration. {e}. "
        "Please set the SECRET_KEY environment variable to a secure, random value."
    )