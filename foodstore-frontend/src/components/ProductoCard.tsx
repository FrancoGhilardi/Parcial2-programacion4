import type { FC } from 'react'
import type { Producto } from '../types/producto'
import Button from './Button'

interface ProductoCardProps {
  producto: Producto
  procesando: boolean
  onEditar: (producto: Producto) => void
  onToggleDisponible: (producto: Producto) => void
  onAnular: (producto: Producto) => void
}

// "$ 12,50" y "3,5" con formato argentino
const formatoPrecio = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatoStock = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 })

const ProductoCard: FC<ProductoCardProps> = ({
  producto,
  procesando,
  onEditar,
  onToggleDisponible,
  onAnular,
}) => {
  const simbolo = producto.unidad_venta.simbolo

  return (
    <article className="flex h-full flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-900">{producto.nombre}</h2>
        <p className="shrink-0 text-lg font-bold text-orange-700">
          $ {formatoPrecio.format(producto.precio_base)} / {simbolo}
        </p>
      </div>

      {producto.descripcion && <p className="mt-1 text-sm text-stone-500">{producto.descripcion}</p>}

      <p className="mt-3 text-sm text-stone-700">
        stock: {formatoStock.format(producto.stock_cantidad)} {simbolo}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            producto.disponible ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
          }`}
        >
          {producto.disponible ? 'Disponible' : 'Venta pausada'}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            producto.hay_stock ? 'bg-sky-100 text-sky-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {producto.hay_stock ? 'Con stock' : 'Sin stock'}
        </span>
      </div>

      {producto.categorias.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {producto.categorias.map((categoria) => (
            <li
              key={categoria.id}
              className={`rounded border px-2 py-0.5 text-xs ${
                categoria.es_principal
                  ? 'border-orange-300 bg-orange-50 text-orange-800'
                  : 'border-stone-200 text-stone-600'
              }`}
            >
              {categoria.es_principal && '★ '}
              {categoria.nombre}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex gap-2 pt-4">
        <Button
          tamano="sm"
          onClick={() => onEditar(producto)}
          aria-label={`Editar ${producto.nombre}`}
          disabled={procesando}
        >
          Editar
        </Button>
        <Button
          variante="warning"
          tamano="sm"
          onClick={() => onToggleDisponible(producto)}
          aria-label={`${producto.disponible ? 'Pausar' : 'Reanudar'} venta de ${producto.nombre}`}
          disabled={procesando}
        >
          {producto.disponible ? 'Pausar venta' : 'Reanudar venta'}
        </Button>
        <Button
          variante="dangerSoft"
          tamano="sm"
          className="ml-auto"
          onClick={() => onAnular(producto)}
          aria-label={`Anular ${producto.nombre}`}
          disabled={procesando}
        >
          Anular
        </Button>
      </div>
    </article>
  )
}

export default ProductoCard
