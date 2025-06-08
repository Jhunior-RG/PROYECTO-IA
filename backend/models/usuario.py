from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from db.database import Base


class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String, unique=True, index=True)

    asistencias = relationship("AsistenciaDB", back_populates="usuario")
