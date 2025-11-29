import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Compute absolute path to database/app_v2.db
    # This file is in backend/app/config.py
    # DB is in backend/database/app_v2.db
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DB_PATH: str = os.path.join(BASE_DIR, "database", "app_v2.db")
    
    database_url: str = f"sqlite:///{DB_PATH}"
    cors_origins: List[str] = [
        "http://localhost:5173", 
        "http://localhost:3000",
    ]
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    groq_api_key: str | None = os.getenv("GROQ_API_KEY", None)
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    class Config:
        env_file = ".env"

settings = Settings()

# For production/serverless (Vercel), configure for serverless environment
if os.getenv("VERCEL") or os.getenv("VERCEL_ENV"):
    # Use DATABASE_URL from environment (Neon PostgreSQL) if available
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        settings.database_url = db_url
        print(f"[config] Using PostgreSQL database from DATABASE_URL")
    else:
        # Fallback to in-memory SQLite (data won't persist)
        settings.database_url = "sqlite:///:memory:"
        print(f"[config] Warning: No DATABASE_URL set, using in-memory SQLite")
    settings.cors_origins = ["*"]
    
    # Ensure GROQ_API_KEY is read from environment
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        settings.groq_api_key = groq_key
        print(f"[config] GROQ_API_KEY loaded from environment")
    else:
        print(f"[config] Warning: No GROQ_API_KEY set")
# For Render deployment
elif os.getenv("RENDER"):
    # Allow all origins for Render (frontend will be on Vercel)
    settings.cors_origins = ["*"]
    # Use file-based SQLite on Render (persists)
    # Ensure database directory exists and is writable
    try:
        db_dir = os.path.dirname(settings.DB_PATH)
        os.makedirs(db_dir, exist_ok=True)
        print(f"[config] Database directory ensured: {db_dir}")
    except Exception as e:
        print(f"[config] Warning: Could not create database directory: {e}")
    # For production, consider using Render PostgreSQL
# For Fly.io or other cloud deployments
elif os.getenv("FLY_APP_NAME") or os.getenv("PORT"):
    # Allow all origins for cloud deployments
    settings.cors_origins = ["*"]
