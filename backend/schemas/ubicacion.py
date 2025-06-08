
from pydantic import BaseModel
from typing import List, Optional

class PersonaActual(BaseModel):
    id: int
    nombre: str
    fecha: str
    hora_entrada: Optional[str]

class UbicacionActual(BaseModel):
    ubicacion: str
    personas: List[PersonaActual]
