from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import SessionLocal
from schemas.asistencia import EventoAsistencia, RegistroAsistencia
from models.usuario import UsuarioDB
from models.asistencia import AsistenciaDB
import datetime

router = APIRouter(prefix="/asistencia", tags=["asistencia"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=dict)
def registrar_evento(evento: EventoAsistencia, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioDB).filter_by(nombre=evento.nombre).first()
    if not usuario:
        usuario = UsuarioDB(nombre=evento.nombre)
        db.add(usuario)
        db.commit()
    fecha, hora = evento.fecha.split("T")
    if evento.tipo == "entrada":
        # INSERTAMOS un nuevo registro de entrada
        nueva = AsistenciaDB(
            id_usuario=usuario.id,
            fecha=fecha,
            hora_entrada=hora,
            lugar=evento.aula,
        )
        db.add(nueva)
    else:
        registro = (
            db.query(AsistenciaDB)
            .filter_by(id_usuario=usuario.id, fecha=fecha)
            .filter(AsistenciaDB.hora_entrada.isnot(None))
            .filter(AsistenciaDB.hora_salida.is_(None))
            .order_by(AsistenciaDB.id.desc())
            .first()
        )

        if not registro:
            raise HTTPException(400, "No hay registro de entrada abierto")
        registro.hora_salida = hora
    db.commit()
    return {"mensaje": "Asistencia registrada correctamente"}
