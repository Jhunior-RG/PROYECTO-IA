from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import defaultdict
from typing import List
from db.database import SessionLocal
from models.asistencia import AsistenciaDB
from models.usuario import UsuarioDB
from schemas.ubicacion import UbicacionActual, PersonaActual

router = APIRouter(prefix="/api", tags=["ubicaciones"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/ubicaciones/actuales",
    response_model=List[UbicacionActual],
)
def obtener_ubicaciones_actuales(db: Session = Depends(get_db)):
    registros = (
        db.query(AsistenciaDB, UsuarioDB.nombre)
          .join(UsuarioDB, AsistenciaDB.id_usuario == UsuarioDB.id)
          .filter(
            AsistenciaDB.hora_entrada.isnot(None),
            AsistenciaDB.hora_salida.is_(None)
          )
          .all()
    )

    aulas: dict[str, list[PersonaActual]] = defaultdict(list)

    for asistencia, nombre in registros:
        persona = PersonaActual(
            id=asistencia.id_usuario,
            nombre=nombre,
            fecha=asistencia.fecha,
            hora_entrada=asistencia.hora_entrada,
        )
        # evita duplicados
        if persona not in aulas[asistencia.lugar]:
            aulas[asistencia.lugar].append(persona)

    return [
        UbicacionActual(ubicacion=lugar, personas=personas)
        for lugar, personas in aulas.items()
    ]


@router.get("/ubicaciones")
def obtener_ubicaciones(db: Session = Depends(get_db)):
    registros = (
        db.query(AsistenciaDB, UsuarioDB.nombre)
        .join(UsuarioDB, UsuarioDB.id == AsistenciaDB.id_usuario)
        .filter(
            AsistenciaDB.hora_entrada.isnot(None), AsistenciaDB.hora_salida.is_(None)
        )
        .all()
    )
    aulas = defaultdict(set)
    for asistencia, nombre in registros:
        aulas[asistencia.lugar].add(nombre)
    return [
        {"aula": aula, "personas": list(personas)} for aula, personas in aulas.items()
    ]


@router.get("/historial")
def historial(db: Session = Depends(get_db)):
    registros = (
        db.query(AsistenciaDB, UsuarioDB.nombre)
        .join(UsuarioDB)
        .order_by(AsistenciaDB.fecha, AsistenciaDB.hora_entrada)
        .all()
    )
    historial = defaultdict(list)
    for asistencia, nombre in registros:
        historial[asistencia.lugar].append(
            {
                "nombre": nombre,
                "fecha": asistencia.fecha,
                "entrada": asistencia.hora_entrada,
                "salida": asistencia.hora_salida,
            }
        )
    return [{"aula": aula, "eventos": eventos} for aula, eventos in historial.items()]
