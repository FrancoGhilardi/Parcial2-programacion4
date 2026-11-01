from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.model import Categoria
    from app.modules.unidades_medida.model import UnidadMedida


class ProductoCategoria(SQLModel, table=True):
    __tablename__ = "producto_categoria"

    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", primary_key=True)
    es_principal: bool = Field(default=False, sa_column_kwargs={"server_default": "false"})

    producto: "Producto" = Relationship(back_populates="categoria_links")
    categoria: "Categoria" = Relationship(back_populates="producto_links")


class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: int | None = Field(default=None, primary_key=True)
    unidad_venta_id: int = Field(foreign_key="unidad_medida.id")
    nombre: str
    descripcion: str | None = None
    precio_base: Decimal = Field(max_digits=10, decimal_places=2)
    stock_cantidad: Decimal = Field(
        default=Decimal("0"),
        max_digits=12,
        decimal_places=3,
        sa_column_kwargs={"server_default": "0"},
    )
    disponible: bool = Field(default=True, sa_column_kwargs={"server_default": "true"})
    activo: bool = Field(default=True, sa_column_kwargs={"server_default": "true"})
    anulado_at: datetime | None = None

    unidad_venta: "UnidadMedida" = Relationship(back_populates="productos")
    # Navegación N:N de solo lectura; los vínculos se escriben por ProductoCategoria.
    categorias: list["Categoria"] = Relationship(
        back_populates="productos",
        link_model=ProductoCategoria,
        sa_relationship_kwargs={"viewonly": True},
    )
    categoria_links: list[ProductoCategoria] = Relationship(back_populates="producto")
