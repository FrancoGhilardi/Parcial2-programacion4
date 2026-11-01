from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.modules.productos.model import ProductoCategoria

if TYPE_CHECKING:
    from app.modules.productos.model import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    descripcion: str | None = None
    activo: bool = Field(default=True, sa_column_kwargs={"server_default": "true"})
    anulado_at: datetime | None = None

    # Navegación N:N de solo lectura; los vínculos se escriben por ProductoCategoria.
    productos: list["Producto"] = Relationship(
        back_populates="categorias",
        link_model=ProductoCategoria,
        sa_relationship_kwargs={"viewonly": True},
    )
    producto_links: list[ProductoCategoria] = Relationship(back_populates="categoria")
