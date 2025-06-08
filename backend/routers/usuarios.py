from fastapi import APIRouter, File, UploadFile, Form, Depends,HTTPException,Request

import os
from uuid import uuid4
from typing import List,Dict

from sqlalchemy.orm import Session

from db.database import SessionLocal
from schemas.usuario import *
from pathlib import Path
from models.usuario import UsuarioDB

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
async def register_user(
    nombre: str = Form(
        ...
    ),  # campo de texto en multipart/form-data :contentReference[oaicite:1]{index=1}
    files: List[UploadFile] = File(
        ...
    ),  # múltiple lista de archivos :contentReference[oaicite:2]{index=2}
    db: Session = Depends(get_db),
):
    # 1. Crear usuario en BD
    usuario = db.query(UsuarioDB).filter(UsuarioDB.nombre == nombre).first()
    if not usuario:
        nuevo_usuario = UsuarioDB(nombre=nombre)
        db.add(nuevo_usuario)
        db.commit()
        usuario = nuevo_usuario

    # 2. Guardar cada archivo en disco (bajo uploads/{user_id}/)
    saved_filenames = []
    upload_dir = os.path.join("uploads", str(usuario.id))  # directorio por usuario
    os.makedirs(upload_dir, exist_ok=True)

    for upload in files:
        content = (
            await upload.read()
        )  # leer contenido async :contentReference[oaicite:3]{index=3}
        filename = (
            upload.filename or f"file_{uuid4()}"
        )  # fallback to random name if filename is None
        dest_path = os.path.join(upload_dir, filename)
        with open(dest_path, "wb") as f:
            f.write(content)
        saved_filenames.append(upload.filename)

        # 3. (Opcional) Guardar metadato en BD
        # imagen = ImagenDB(
        #     id_usuario=user_id,
        #     filename=upload.filename,
        #     path=dest_path,
        # )
        # db.add(imagen)

    # if you used ImagenDB:
    # db.commit()

    return {"ok": True, "filenames": saved_filenames}



@router.get("/", response_model=List[UsuarioConImagenes])
def listar_usuarios(request: Request, db: Session = Depends(get_db)):
    base = Path("uploads")
    if not base.exists() or not base.is_dir():
        raise HTTPException(500, "Directorio 'uploads/' no encontrado")

    resultado = []
    usuarios = db.query(UsuarioDB).all()
    for usuario in usuarios:
        user_dir = base / str(usuario.id)
        imagenes_urls = []

        if user_dir.exists():
            for img in user_dir.iterdir():
                if img.is_file():
                    base_url = str(request.base_url)  
                    url = base_url + f"uploads/{usuario.id}/{img.name}"
                    imagenes_urls.append(url)

        resultado.append({
            "id": usuario.id,
            "nombre": usuario.nombre,
            "imagenes": imagenes_urls
        })

    return resultado