# Food Store — Backend (API REST del catálogo)

API REST con **FastAPI**, **SQLModel** y **PostgreSQL** para administrar el catálogo de Food Store: unidades de medida, categorías y productos (con stock y clasificación N:N en categorías).

## Requisitos

- Python 3.12 o superior
- PostgreSQL 15 o superior (instalado localmente **o** con Docker)

## 1. Base de datos

La aplicación crea las tablas y carga el seed de unidades de medida al arrancar; solo hace falta que exista la base `foodstore`.

### Opción A — PostgreSQL local

Crear la base (con pgAdmin, o desde una terminal):

```bash
createdb -U postgres -h localhost foodstore
```

### Opción B — Docker (opcional)

El proyecto incluye `docker-compose.yml` con PostgreSQL 16 expuesto en el puerto **5433** (para no chocar con un PostgreSQL local en 5432):

```bash
docker compose up -d        # levantar
docker compose down         # detener (conserva los datos)
docker compose down -v      # detener y borrar la base (base limpia)
```

## 2. Configurar la conexión

La cadena de conexión se define en `app/core/database.py`:

```python
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/foodstore",
)
```

- Si el usuario, la contraseña o el puerto son distintos, **editar el valor por defecto** en ese archivo, **o** definir la variable de entorno `DATABASE_URL` antes de ejecutar.
- Formato: `postgresql+psycopg://USUARIO:CONTRASEÑA@HOST:PUERTO/foodstore`

Ejemplo con la base de Docker (puerto 5433):

```powershell
# PowerShell
$env:DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5433/foodstore"
```

```bash
# bash
export DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5433/foodstore"
```

## 3. Instalación

```bash
python -m venv .venv

# Activar el entorno virtual
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux / macOS

pip install -r requirements.txt
```

## 4. Ejecución

```bash
fastapi dev app/main.py
```

- API: http://localhost:8000/api/v1
- Swagger: http://localhost:8000/docs

Al iniciar se crean las tablas y se insertan las 6 unidades de medida (kilogramo, gramo, litro, mililitro, pieza y docena). El seed solo inserta si la tabla está vacía: reiniciar la aplicación no duplica filas.

CORS habilitado para el frontend en `http://localhost:5173`.

## 5. Pruebas con REST Client

Los archivos `.http` están en `tests/` y se ejecutan con la extensión **REST Client** de VS Code (botón *Send Request* sobre cada petición). Cada petición indica el código esperado en un comentario `# Esperado: ...`.

| Archivo | Contenido |
|---|---|
| `tests/productos.http` | Los 5 endpoints de productos, los filtros del listado (`activo`, `disponible`, `categoria_id`, `search`) y la paginación, errores 404 / 409 / 422 (incluidos stock negativo y stock con decimales en unidad contable) y `hay_stock` antes y después de llevar el stock a 0. |
| `tests/relaciones.http` | Alta de categorías, nombre repetido (409), anulación de una categoría con sus productos activos, clasificación en dos categorías con cambio de principal, clasificación duplicada (409) y filtro `categoria_id`. |

> Ejecutar las peticiones **en orden** y sobre una **base recién creada**: los archivos crean datos con nombres fijos, por lo que una segunda ejecución sobre la misma base devuelve 409 por nombre repetido. Con Docker: `docker compose down -v && docker compose up -d`.

## Endpoints

| Método | Endpoint | Código |
|---|---|---|
| GET | `/api/v1/unidades-medida` | 200 |
| POST | `/api/v1/productos` | 201 |
| GET | `/api/v1/productos` | 200 |
| GET | `/api/v1/productos/{id}` | 200 |
| PUT | `/api/v1/productos/{id}` | 200 |
| DELETE | `/api/v1/productos/{id}` | 204 |
| POST | `/api/v1/productos/{id}/categorias` | 201 |
| GET | `/api/v1/productos/{id}/categorias` | 200 |
| POST | `/api/v1/categorias` | 201 |
| GET | `/api/v1/categorias` | 200 |
| GET | `/api/v1/categorias/{id}` | 200 |
| PUT | `/api/v1/categorias/{id}` | 200 |
| DELETE | `/api/v1/categorias/{id}` | 204 |

Los errores se devuelven con formato `{"detail": "..."}`. La baja es siempre lógica (`activo = false` y `anulado_at`); ninguna fila se borra físicamente.

## Estructura

```
app/
├── main.py                  # FastAPI, CORS, lifespan (tablas + seed) y routers
├── core/
│   ├── database.py          # engine, cadena de conexión y dependencia de sesión
│   └── seed.py              # seed de unidades de medida
└── modules/
    ├── unidades_medida/     # model · router · service (catálogo de solo lectura)
    ├── categorias/          # model · schema · service · router
    └── productos/           # model (+ ProductoCategoria) · schema · service · router
tests/
├── productos.http
└── relaciones.http
```

Cada módulo separa responsabilidades: el **router** define el contrato HTTP, el **schema** valida entrada y salida con Pydantic, el **service** aplica las reglas de negocio y el **model** define las tablas SQLModel.

## Decisiones de implementación

- La unicidad del nombre (productos y categorías activos) no distingue mayúsculas y recorta espacios.
- `precio_base` y `stock_cantidad` se guardan como `NUMERIC` y se devuelven como número en JSON.
- `GET /productos?categoria_id=` con una categoría inexistente devuelve una lista vacía (es un filtro).
- Las categorías anuladas siguen apareciendo en las categorías de un producto, con su `activo = false`.
