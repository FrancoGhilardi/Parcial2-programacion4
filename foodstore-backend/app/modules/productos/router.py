from typing import Annotated

from fastapi import APIRouter, Path, Query

from app.core.database import ID_MAX, SessionDep
from app.modules.productos import service
from app.modules.productos.schema import (
    CategoriaDeProducto,
    ProductoCategoriaCreate,
    ProductoCreate,
    ProductoPublic,
    ProductoUpdate,
)

router = APIRouter(prefix="/productos", tags=["Productos"])

ProductoId = Annotated[int, Path(gt=0, le=ID_MAX, description="ID del producto")]


@router.post("", response_model=ProductoPublic, status_code=201)
def crear_producto(data: ProductoCreate, session: SessionDep) -> ProductoPublic:
    """Crea un producto. 404 si la unidad no existe, 409 si el nombre ya existe, 422 si es inválido."""
    return service.crear_producto(session, data)


@router.get("", response_model=list[ProductoPublic], status_code=200)
def listar_productos(
    session: SessionDep,
    skip: Annotated[int, Query(ge=0, description="Registros a saltear")] = 0,
    limit: Annotated[int, Query(ge=1, le=50, description="Cantidad máxima de registros")] = 10,
    activo: Annotated[
        bool | None, Query(description="Omitido o true: solo activos. false: solo anulados")
    ] = None,
    disponible: Annotated[bool | None, Query(description="Filtra por disponible; omitido no filtra")] = None,
    categoria_id: Annotated[
        int | None, Query(gt=0, le=ID_MAX, description="Solo productos de esa categoría")
    ] = None,
    search: Annotated[str | None, Query(description="Coincidencia parcial sobre el nombre")] = None,
) -> list[ProductoPublic]:
    """Lista productos con paginación y filtros."""
    return service.listar_productos(session, skip, limit, activo, disponible, categoria_id, search)


@router.get("/{producto_id}", response_model=ProductoPublic, status_code=200)
def obtener_producto(producto_id: ProductoId, session: SessionDep) -> ProductoPublic:
    """Detalle del producto con su unidad de venta, categorías, stock_cantidad y hay_stock."""
    return service.obtener_producto(session, producto_id)


@router.put("/{producto_id}", response_model=ProductoPublic, status_code=200)
def actualizar_producto(producto_id: ProductoId, data: ProductoUpdate, session: SessionDep) -> ProductoPublic:
    """Reemplaza los campos propios del producto. 404 si no existe, 409 si está anulado o el nombre se repite."""
    return service.actualizar_producto(session, producto_id, data)


@router.delete("/{producto_id}", response_model=None, status_code=204)
def anular_producto(producto_id: ProductoId, session: SessionDep) -> None:
    """Baja lógica: activo = false y anulado_at. 409 si ya estaba anulado."""
    service.anular_producto(session, producto_id)


@router.post("/{producto_id}/categorias", response_model=CategoriaDeProducto, status_code=201)
def clasificar_producto(
    producto_id: ProductoId, data: ProductoCategoriaCreate, session: SessionDep
) -> CategoriaDeProducto:
    """Clasifica el producto en una categoría. Si es_principal = true, la principal anterior deja de serlo.
    404 si el producto o la categoría no existen; 409 si alguno está anulado o el vínculo ya existe."""
    return service.clasificar_producto(session, producto_id, data)


@router.get("/{producto_id}/categorias", response_model=list[CategoriaDeProducto], status_code=200)
def listar_categorias_de_producto(producto_id: ProductoId, session: SessionDep) -> list[CategoriaDeProducto]:
    """Categorías del producto indicando cuál es la principal."""
    return service.listar_categorias_de_producto(session, producto_id)
