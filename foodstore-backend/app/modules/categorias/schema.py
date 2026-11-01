from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class CategoriaBase(BaseModel):
    # Recorta espacios antes de validar: "   " no pasa min_length y "Pastas " == "Pastas".
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: Annotated[str, Field(min_length=3)]
    descripcion: str | None = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(CategoriaBase):
    pass


class CategoriaPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str | None
    activo: bool
    anulado_at: datetime | None
