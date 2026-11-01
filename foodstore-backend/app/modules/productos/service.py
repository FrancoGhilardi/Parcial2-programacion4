from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException
from sqlmodel import Session, col, func, select

from app.modules.categorias.service import obtener_categoria_o_404
from app.modules.productos.model import Producto, ProductoCategoria
from app.modules.productos.schema import (
    CategoriaDeProducto,
    ProductoCategoriaCreate,
    ProductoCreate,
    ProductoPublic,
    ProductoUpdate,
)
from app.modules.unidades_medida.model import TipoUnidad, UnidadMedida, UnidadMedidaPublic


# ---------- Helpers de validación ----------

def obtener_producto_o_404(session: Session, producto_id: int) -> Producto:
    producto = session.get(Producto, producto_id)
    if producto is None:
        raise HTTPException(status_code=404, detail=f"Producto {producto_id} no encontrado")
    return producto


def _validar_producto_activo(producto: Producto) -> None:
    # RN-05: un producto anulado no admite modificación.
    if not producto.activo:
        raise HTTPException(status_code=409, detail=f"El producto {producto.id} está anulado")


def _obtener_unidad_o_404(session: Session, unidad_id: int) -> UnidadMedida:
    # RN-03: no se puede referenciar por FK una unidad inexistente.
    unidad = session.get(UnidadMedida, unidad_id)
    if unidad is None:
        raise HTTPException(status_code=404, detail=f"Unidad de medida {unidad_id} no encontrada")
    return unidad


def _validar_stock_segun_unidad(unidad: UnidadMedida, stock: Decimal) -> None:
    # RN-10: con unidad contable el stock debe ser un número entero.
    if unidad.tipo == TipoUnidad.contable and stock != stock.to_integral_value():
        raise HTTPException(
            status_code=422,
            detail=f"La unidad '{unidad.nombre}' es contable: stock_cantidad debe ser un número entero",
        )


def _validar_nombre_unico(session: Session, nombre: str, excluir_id: int | None = None) -> None:
    # RN-02: nombre único entre los productos activos (sin distinguir mayúsculas).
    query = select(Producto).where(
        Producto.activo == True,  # noqa: E712
        func.lower(Producto.nombre) == nombre.lower(),
    )
    if excluir_id is not None:
        query = query.where(Producto.id != excluir_id)
    if session.exec(query).first() is not None:
        raise HTTPException(status_code=409, detail=f"Ya existe un producto activo con el nombre '{nombre}'")


def to_public(producto: Producto) -> ProductoPublic:
    categorias = [
        CategoriaDeProducto(
            id=link.categoria.id,
            nombre=link.categoria.nombre,
            activo=link.categoria.activo,
            es_principal=link.es_principal,
        )
        for link in sorted(producto.categoria_links, key=lambda link: link.categoria_id)
    ]
    return ProductoPublic(
        id=producto.id,
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio_base=producto.precio_base,
        stock_cantidad=producto.stock_cantidad,
        disponible=producto.disponible,
        activo=producto.activo,
        anulado_at=producto.anulado_at,
        unidad_venta=UnidadMedidaPublic.model_validate(producto.unidad_venta),
        categorias=categorias,
        # RN-11: hay_stock se calcula en cada lectura, no se persiste.
        hay_stock=producto.stock_cantidad > 0,
    )


# ---------- Casos de uso ----------

def crear_producto(session: Session, data: ProductoCreate) -> ProductoPublic:
    unidad = _obtener_unidad_o_404(session, data.unidad_venta_id)
    _validar_stock_segun_unidad(unidad, data.stock_cantidad)
    _validar_nombre_unico(session, data.nombre)

    producto = Producto(**data.model_dump())
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return to_public(producto)


def listar_productos(
    session: Session,
    skip: int,
    limit: int,
    activo: bool | None,
    disponible: bool | None,
    categoria_id: int | None,
    search: str | None,
) -> list[ProductoPublic]:
    # activo omitido o true -> solo activos; false -> solo anulados.
    query = select(Producto).where(Producto.activo == (True if activo is None else activo))
    if disponible is not None:
        query = query.where(Producto.disponible == disponible)
    if categoria_id is not None:
        # Subconsulta sobre la tabla intermedia: no duplica filas.
        en_categoria = select(ProductoCategoria.producto_id).where(
            ProductoCategoria.categoria_id == categoria_id
        )
        query = query.where(col(Producto.id).in_(en_categoria))
    if search:
        # Se escapan % y _ para que se busquen literalmente.
        texto = search.replace("\\", "\\\\").replace("%", r"\%").replace("_", r"\_")
        query = query.where(col(Producto.nombre).ilike(f"%{texto}%", escape="\\"))

    query = query.order_by(Producto.id).offset(skip).limit(limit)
    return [to_public(producto) for producto in session.exec(query).all()]


def obtener_producto(session: Session, producto_id: int) -> ProductoPublic:
    return to_public(obtener_producto_o_404(session, producto_id))


def actualizar_producto(session: Session, producto_id: int, data: ProductoUpdate) -> ProductoPublic:
    producto = obtener_producto_o_404(session, producto_id)
    _validar_producto_activo(producto)
    unidad = _obtener_unidad_o_404(session, data.unidad_venta_id)
    # RN-10 también aplica cuando cambia unidad_venta_id: se valida con la unidad nueva.
    _validar_stock_segun_unidad(unidad, data.stock_cantidad)
    _validar_nombre_unico(session, data.nombre, excluir_id=producto_id)

    # Solo campos propios; activo y anulado_at no se tocan (RN-12).
    producto.sqlmodel_update(data.model_dump())
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return to_public(producto)


def anular_producto(session: Session, producto_id: int) -> None:
    producto = obtener_producto_o_404(session, producto_id)
    # RN-04: anular un registro ya anulado se rechaza.
    if not producto.activo:
        raise HTTPException(status_code=409, detail=f"El producto {producto_id} ya está anulado")

    # Baja lógica: no modifica disponible ni stock (RN-12).
    producto.activo = False
    producto.anulado_at = datetime.now(timezone.utc)
    session.add(producto)
    session.commit()


# ---------- Relación N:N con Categoria ----------

def clasificar_producto(
    session: Session, producto_id: int, data: ProductoCategoriaCreate
) -> CategoriaDeProducto:
    producto = obtener_producto_o_404(session, producto_id)
    # RN-08: no se clasifica un producto anulado ni en una categoría anulada.
    _validar_producto_activo(producto)
    categoria = obtener_categoria_o_404(session, data.categoria_id)
    if not categoria.activo:
        raise HTTPException(status_code=409, detail=f"La categoría {categoria.id} está anulada")
    # RN-07: un producto no se clasifica dos veces en la misma categoría.
    if session.get(ProductoCategoria, (producto_id, data.categoria_id)) is not None:
        raise HTTPException(
            status_code=409,
            detail=f"El producto {producto_id} ya está clasificado en la categoría {data.categoria_id}",
        )

    # RN-09: la principal anterior deja de serlo en la misma operación (un solo commit).
    if data.es_principal:
        for link in producto.categoria_links:
            if link.es_principal:
                link.es_principal = False
                session.add(link)

    link = ProductoCategoria(
        producto_id=producto_id,
        categoria_id=data.categoria_id,
        es_principal=data.es_principal,
    )
    session.add(link)
    session.commit()
    return CategoriaDeProducto(
        id=categoria.id,
        nombre=categoria.nombre,
        activo=categoria.activo,
        es_principal=data.es_principal,
    )


def listar_categorias_de_producto(session: Session, producto_id: int) -> list[CategoriaDeProducto]:
    return to_public(obtener_producto_o_404(session, producto_id)).categorias
