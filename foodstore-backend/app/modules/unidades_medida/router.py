from fastapi import APIRouter
from sqlmodel import select

from app.core.database import SessionDep
from app.modules.unidades_medida.model import UnidadMedida, UnidadMedidaPublic

router = APIRouter(prefix="/unidades-medida", tags=["Unidades de medida"])


@router.get("", response_model=list[UnidadMedidaPublic], status_code=200)
def listar_unidades_medida(session: SessionDep) -> list[UnidadMedida]:
    """Catálogo de solo lectura: origen del selector de unidad de venta del frontend."""
    return list(session.exec(select(UnidadMedida).order_by(UnidadMedida.id)).all())
