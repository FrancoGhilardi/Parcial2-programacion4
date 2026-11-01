# Se importan todos los modelos al cargar el paquete para que queden registrados
# en SQLModel.metadata y las relaciones entre módulos se resuelvan, sin importar
# qué módulo se importe primero (main, router, seed o un script).
from app.modules.categorias.model import Categoria  # noqa: F401
from app.modules.productos.model import Producto, ProductoCategoria  # noqa: F401
from app.modules.unidades_medida.model import UnidadMedida  # noqa: F401
