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
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    groq_api_key: str | None = None
    
    class Config:
        env_file = ".env"

settings = Settings()
