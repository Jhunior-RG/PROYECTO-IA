from pydantic import BaseModel
from typing import List

class Usuario(BaseModel):
    id: str
    nombre: str

    class Config:
        orm_mode = True

class UsuarioCreate(BaseModel):
    nombre: str


class UsuarioConImagenes(BaseModel):
    id: int           # ó `str` si tu ID es texto
    nombre: str
    imagenes: List[str]

