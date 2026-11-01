import type { CategoriaDeProducto } from './categoria'
import type { UnidadMedida } from './unidadMedida'

// ProductoPublic de la API: mismos nombres de campo
export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  stock_cantidad: number
  disponible: boolean
  activo: boolean
  anulado_at: string | null
  unidad_venta: UnidadMedida
  categorias: CategoriaDeProducto[]
  hay_stock: boolean
}

// Cuerpo de POST y PUT /api/v1/productos
export interface ProductoPayload {
  nombre: string
  descripcion: string | null
  precio_base: number
  unidad_venta_id: number
  stock_cantidad: number
  disponible: boolean
}
