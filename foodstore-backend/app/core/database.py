import os
from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

# Cadena de conexión a PostgreSQL.
# Se puede sobrescribir con la variable de entorno DATABASE_URL (ver README).
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/foodstore",
)

engine = create_engine(DATABASE_URL)

# Máximo de una columna INTEGER de PostgreSQL. Los ids recibidos se validan contra
# este valor para responder 422 en lugar de un error de la base (500).
ID_MAX = 2_147_483_647


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
