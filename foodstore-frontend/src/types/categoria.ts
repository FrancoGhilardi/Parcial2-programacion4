// Categoría tal como la devuelve GET /api/v1/categorias
export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
  anulado_at: string | null
}

// Categoría dentro de un producto (incluye si es la principal)
export interface CategoriaDeProducto {
  id: number
  nombre: string
  activo: boolean
  es_principal: boolean
}
