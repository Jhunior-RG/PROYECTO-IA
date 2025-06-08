from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.database import engine, Base
from routers import usuarios, asistencia, ubicaciones

from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse


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

@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Server Status</title>
    </head>
    <body>
        <h1>Jhunior Goood</h1>
    </body>
    </html>
    """

app.include_router(usuarios.router)
app.include_router(asistencia.router)
app.include_router(ubicaciones.router)
