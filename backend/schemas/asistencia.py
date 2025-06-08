from pydantic import BaseModel
from typing import Optional

class EventoAsistencia(BaseModel):
    nombre: str
    aula: str
    fecha: str  # ISO with T
    tipo: str   # "entrada" | "salida"

class RegistroAsistencia(BaseModel):
    id_usuario: str
    fecha: str
    hora_entrada: Optional[str]
    hora_salida: Optional[str]
    lugar: str

    class Config:
        orm_mode = True
