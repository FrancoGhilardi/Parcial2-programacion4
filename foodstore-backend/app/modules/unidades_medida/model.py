from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.model import Producto


class TipoUnidad(str, Enum):
    peso = "peso"
    volumen = "volumen"
    contable = "contable"


class UnidadMedidaBase(SQLModel):
    nombre: str = Field(unique=True)
    simbolo: str = Field(unique=True)
    tipo: TipoUnidad


class UnidadMedida(UnidadMedidaBase, table=True):
    __tablename__ = "unidad_medida"

    id: int | None = Field(default=None, primary_key=True)

    productos: list["Producto"] = Relationship(back_populates="unidad_venta")


# El módulo no tiene schema.py: el schema de salida vive junto al modelo.
class UnidadMedidaPublic(UnidadMedidaBase):
    id: int
