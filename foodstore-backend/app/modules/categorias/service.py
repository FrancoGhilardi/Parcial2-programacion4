from datetime import datetime, timezone

from fastapi import HTTPException
from sqlmodel import Session, col, func, select

from app.modules.categorias.model import Categoria
from app.modules.categorias.schema import CategoriaCreate, CategoriaPublic, CategoriaUpdate


# ---------- Helpers de validación ----------

def obtener_categoria_o_404(session: Session, categoria_id: int) -> Categoria:
    # RN-03: también lo usa productos al clasificar (FK a categoría inexistente).
    categoria = session.get(Categoria, categoria_id)
    if categoria is None:
        raise HTTPException(status_code=404, detail=f"Categoría {categoria_id} no encontrada")
    return categoria


def _validar_categoria_activa(categoria: Categoria) -> None:
    # RN-05: una categoría anulada no admite modificación.
    if not categoria.activo:
        raise HTTPException(status_code=409, detail=f"La categoría {categoria.id} está anulada")


def _validar_nombre_unico(session: Session, nombre: str, excluir_id: int | None = None) -> None:
    # RN-02: nombre único entre las categorías activas (sin distinguir mayúsculas).
    query = select(Categoria).where(
        Categoria.activo == True,  # noqa: E712
        func.lower(Categoria.nombre) == nombre.lower(),
    )
    if excluir_id is not None:
        query = query.where(Categoria.id != excluir_id)
    if session.exec(query).first() is not None:
        raise HTTPException(status_code=409, detail=f"Ya existe una categoría activa con el nombre '{nombre}'")


# ---------- Casos de uso ----------

def crear_categoria(session: Session, data: CategoriaCreate) -> CategoriaPublic:
    _validar_nombre_unico(session, data.nombre)

    categoria = Categoria(**data.model_dump())
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return CategoriaPublic.model_validate(categoria)


def listar_categorias(session: Session, activo: bool | None, search: str | None) -> list[CategoriaPublic]:
    # activo omitido o true -> solo activas; false -> solo anuladas.
    query = select(Categoria).where(Categoria.activo == (True if activo is None else activo))
    if search:
        # Se escapan % y _ para que se busquen literalmente.
        texto = search.replace("\\", "\\\\").replace("%", r"\%").replace("_", r"\_")
        query = query.where(col(Categoria.nombre).ilike(f"%{texto}%", escape="\\"))

    query = query.order_by(Categoria.id)
    return [CategoriaPublic.model_validate(categoria) for categoria in session.exec(query).all()]


def obtener_categoria(session: Session, categoria_id: int) -> CategoriaPublic:
    return CategoriaPublic.model_validate(obtener_categoria_o_404(session, categoria_id))


def actualizar_categoria(session: Session, categoria_id: int, data: CategoriaUpdate) -> CategoriaPublic:
    categoria = obtener_categoria_o_404(session, categoria_id)
    _validar_categoria_activa(categoria)
    _validar_nombre_unico(session, data.nombre, excluir_id=categoria_id)

    categoria.sqlmodel_update(data.model_dump())
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return CategoriaPublic.model_validate(categoria)


def anular_categoria(session: Session, categoria_id: int) -> None:
    categoria = obtener_categoria_o_404(session, categoria_id)
    # RN-04: anular un registro ya anulado se rechaza.
    if not categoria.activo:
        raise HTTPException(status_code=409, detail=f"La categoría {categoria_id} ya está anulada")

    # RN-06: no se tocan los productos clasificados en ella.
    categoria.activo = False
    categoria.anulado_at = datetime.now(timezone.utc)
    session.add(categoria)
    session.commit()
