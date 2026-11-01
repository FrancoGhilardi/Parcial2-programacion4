from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.core.database import ID_MAX
from app.modules.unidades_medida.model import UnidadMedidaPublic


class ProductoBase(BaseModel):
    # Recorta espacios antes de validar: "   " no pasa min_length y "Harina " == "Harina".
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: Annotated[str, Field(min_length=3)]
    descripcion: str | None = None
    precio_base: Annotated[Decimal, Field(ge=0, max_digits=10, decimal_places=2)]
    unidad_venta_id: Annotated[int, Field(gt=0, le=ID_MAX)]
    stock_cantidad: Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=3)] = Decimal("0")
    disponible: bool = True


class ProductoCreate(ProductoBase):
    pass


# PUT reemplaza los campos propios del producto: mismos campos que Create.
class ProductoUpdate(ProductoBase):
    pass


class ProductoCategoriaCreate(BaseModel):
    categoria_id: Annotated[int, Field(gt=0, le=ID_MAX)]
    es_principal: bool = False


class CategoriaDeProducto(BaseModel):
    id: int
    nombre: str
    activo: bool
    es_principal: bool


class ProductoPublic(BaseModel):
    id: int
    nombre: str
    descripcion: str | None
    # Se exponen como número (Decimal se serializaría como string en JSON).
    precio_base: float
    stock_cantidad: float
    disponible: bool
    activo: bool
    anulado_at: datetime | None
    unidad_venta: UnidadMedidaPublic
    categorias: list[CategoriaDeProducto]
    hay_stock: bool
