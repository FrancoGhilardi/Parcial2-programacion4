import type { Producto } from '../types/producto'
import ProductoCard from './ProductoCard'

interface ProductoListProps {
  productos: Producto[]
  procesando: boolean
  onEditar: (producto: Producto) => void
  onToggleDisponible: (producto: Producto) => void
  onAnular: (producto: Producto) => void
}

export default function ProductoList({
  productos,
  procesando,
  onEditar,
  onToggleDisponible,
  onAnular,
}: ProductoListProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {productos.map((producto) => (
        <li key={producto.id}>
          <ProductoCard
            producto={producto}
            procesando={procesando}
            onEditar={onEditar}
            onToggleDisponible={onToggleDisponible}
            onAnular={onAnular}
          />
        </li>
      ))}
    </ul>
  )
}
