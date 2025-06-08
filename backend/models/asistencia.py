from typing import Optional
from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base
from models.usuario import UsuarioDB  

class AsistenciaDB(Base):
    __tablename__ = "asistencias"

    id:            Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario:    Mapped[str]           = mapped_column(ForeignKey("usuarios.id"))
    fecha:         Mapped[str]           = mapped_column(String, index=True)
    hora_entrada:  Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hora_salida:   Mapped[Optional[str]] = mapped_column(String, nullable=True)
    lugar:         Mapped[str]           = mapped_column(String)

    usuario: Mapped["UsuarioDB"] = relationship("UsuarioDB", back_populates="asistencias")
