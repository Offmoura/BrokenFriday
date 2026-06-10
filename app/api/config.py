import os
import secrets
import logging
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # Fallback to an in-memory SQLite if not provided, but issue a severe warning
    database_url: str = "sqlite:///./test.db"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

def get_settings() -> Settings:
    settings = Settings()
    if settings.database_url == "sqlite:///./test.db":
        logger.warning("DATABASE_URL not set. Falling back to local sqlite (test.db). This is insecure and not for production.")
    return settings

settings = get_settings()
