# app/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

# Si usas SQLite local, necesitas este connect_args; de lo contrario, lo omites
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Crea el engine con la URL de configuración
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=True,  # opcional: para ver el SQL generado
)

# Sesión habitual de SQLAlchemy
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

# Base declarativa para tus modelos
Base = declarative_base()
