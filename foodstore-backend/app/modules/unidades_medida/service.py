from sqlmodel import Session, select

from app.modules.unidades_medida.model import UnidadMedida


def listar_unidades_medida(session: Session) -> list[UnidadMedida]:
    return list(session.exec(select(UnidadMedida).order_by(UnidadMedida.id)).all())
