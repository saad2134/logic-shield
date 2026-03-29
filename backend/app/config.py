import os
import json
from pydantic_settings import BaseSettings
from pydantic import model_validator
from typing import Optional, List, Union


def get_database_url() -> str:
    if os.getenv("VERCEL_ENV"):
        prisma_url = os.getenv("VERCEL_DB_PRISMA_DATABASE_URL") or os.getenv("VERCEL_DB_PRISMA_POSTGRES_URL")
        if prisma_url:
            if prisma_url.startswith("postgres://"):
                prisma_url = prisma_url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif prisma_url.startswith("postgresql://"):
                prisma_url = prisma_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return prisma_url
    return os.getenv("DATABASE_URL") or "sqlite:///./logicshield.db"


def get_secret_key() -> str:
    key = os.getenv("SECRET_KEY")
    if key and key.strip():
        return key
    return "logic-shield-secret-key-change-in-production"


def get_optional_env(key: str, default: str = "") -> str:
    value = os.getenv(key)
    if value and value.strip():
        return value
    return default


def parse_cors_origins() -> List[str]:
    cors_env = os.getenv("CORS_ORIGINS")
    if cors_env and cors_env.strip():
        if cors_env.startswith("["):
            import json
            try:
                return json.loads(cors_env)
            except:
                pass
        origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
        if origins:
            return origins
    return ["http://localhost:3000", "http://127.0.0.1:3000"]


def parse_bool(value: Optional[str]) -> bool:
    if not value:
        return True
    return value.lower() in ("true", "1", "yes")


def parse_int(value: Optional[str], default: int = 8000) -> int:
    if not value:
        return default
    try:
        return int(value)
    except ValueError:
        return default


def is_demo_mode() -> bool:
    demo_env = os.getenv("DEMO_MODE", "")
    vercel_env = os.getenv("VERCEL_ENV")
    return demo_env.lower() in ("true", "1", "yes") or vercel_env is not None


class Settings(BaseSettings):
    PROJECT_NAME: str = "LogicShield"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "sqlite:///./logicshield.db"
    SECRET_KEY: str = "logic-shield-secret-key-change-in-production"
    
    HF_TOKEN: Optional[str] = None
    HF_ENDPOINT: Optional[str] = None
    
    FALLACY_MODEL: str = "facebook/bart-large-mnli"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    LOG_LEVEL: str = "INFO"
    
    DEMO_MODE: bool = False
    
    DEMO_MESSAGE: str = "Running in demo mode due to deployment constraints. This is simulated data for demonstration purposes."
    
    CORS_ORIGINS: str = '["http://localhost:3000","http://127.0.0.1:3000"]'
    
    @model_validator(mode='after')
    def parse_cors(self):
        import json
        cors_env = self.CORS_ORIGINS
        if cors_env.startswith("["):
            try:
                self.CORS_ORIGINS = json.loads(cors_env)
            except:
                self.CORS_ORIGINS = [c.strip() for c in cors_env.split(",") if c.strip()]
        else:
            self.CORS_ORIGINS = [c.strip() for c in cors_env.split(",") if c.strip()]
        return self
    
    model_config = {"case_sensitive": True, "extra": "ignore"}


settings = Settings(
    DATABASE_URL=get_database_url(),
    SECRET_KEY=get_secret_key(),
    HF_TOKEN=get_optional_env("HF_TOKEN") or None,
    HF_ENDPOINT=get_optional_env("HF_ENDPOINT") or None,
    DEBUG=parse_bool(os.getenv("DEBUG")),
    PORT=parse_int(os.getenv("PORT"), 8000),
    HOST=get_optional_env("HOST", "0.0.0.0"),
    LOG_LEVEL=get_optional_env("LOG_LEVEL", "INFO").upper(),
    DEMO_MODE=is_demo_mode(),
)
