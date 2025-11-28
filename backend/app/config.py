from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    database_url: str = "sqlite:///./database/app_v2.db"
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    groq_api_key: str | None = None
    
    class Config:
        env_file = ".env"

settings = Settings()
