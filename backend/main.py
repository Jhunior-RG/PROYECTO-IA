# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.database import engine, Base
from routers import usuarios, asistencia, ubicaciones

from fastapi.staticfiles import StaticFiles


# crea tablas si no existen
Base.metadata.create_all(bind=engine)
app = FastAPI()
app.mount(
    "/uploads",
    StaticFiles(directory="uploads", html=False),
    name="conocidos",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios.router)
app.include_router(asistencia.router)
app.include_router(ubicaciones.router)
