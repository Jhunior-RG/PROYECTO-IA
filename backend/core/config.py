# app/core/config.py

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Valor por defecto: SQLite local
    DATABASE_URL: str = "sqlite:///./database.db"
    FRONTEND_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"   # si exportas DATABASE_URL en .env o en el entorno, lo usará

settings = Settings()
