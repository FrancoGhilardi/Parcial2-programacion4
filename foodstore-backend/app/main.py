from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.core.database import create_db_and_tables, engine
from app.core.seed import seed_unidades_medida
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.unidades_medida.router import router as unidades_medida_router

FRONTEND_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    create_db_and_tables()
    with Session(engine) as session:
        seed_unidades_medida(session)
    yield


app = FastAPI(
    title="Food Store - Catálogo de Productos",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(unidades_medida_router, prefix="/api/v1")
app.include_router(productos_router, prefix="/api/v1")
app.include_router(categorias_router, prefix="/api/v1")
