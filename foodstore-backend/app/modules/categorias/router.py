from typing import Annotated

from fastapi import APIRouter, Path, Query

from app.core.database import SessionDep
from app.modules.categorias import service
from app.modules.categorias.schema import CategoriaCreate, CategoriaPublic, CategoriaUpdate

router = APIRouter(prefix="/categorias", tags=["Categorías"])

CategoriaId = Annotated[int, Path(gt=0, description="ID de la categoría")]


@router.post("", response_model=CategoriaPublic, status_code=201)
def crear_categoria(data: CategoriaCreate, session: SessionDep) -> CategoriaPublic:
    """Crea una categoría. 409 si el nombre ya existe entre las activas, 422 si es inválido."""
    return service.crear_categoria(session, data)


@router.get("", response_model=list[CategoriaPublic], status_code=200)
def listar_categorias(
    session: SessionDep,
    activo: Annotated[
        bool | None, Query(description="Omitido o true: solo activas. false: solo anuladas")
    ] = None,
    search: Annotated[str | None, Query(description="Coincidencia parcial sobre el nombre")] = None,
) -> list[CategoriaPublic]:
    """Lista categorías con los filtros activo y search."""
    return service.listar_categorias(session, activo, search)


@router.get("/{categoria_id}", response_model=CategoriaPublic, status_code=200)
def obtener_categoria(categoria_id: CategoriaId, session: SessionDep) -> CategoriaPublic:
    """Detalle de la categoría."""
    return service.obtener_categoria(session, categoria_id)


@router.put("/{categoria_id}", response_model=CategoriaPublic, status_code=200)
def actualizar_categoria(categoria_id: CategoriaId, data: CategoriaUpdate, session: SessionDep) -> CategoriaPublic:
    """Actualiza nombre y descripcion. 404 si no existe, 409 si está anulada o el nombre se repite."""
    return service.actualizar_categoria(session, categoria_id, data)


@router.delete("/{categoria_id}", response_model=None, status_code=204)
def anular_categoria(categoria_id: CategoriaId, session: SessionDep) -> None:
    """Baja lógica: activo = false y anulado_at. No anula sus productos. 409 si ya estaba anulada."""
    service.anular_categoria(session, categoria_id)
