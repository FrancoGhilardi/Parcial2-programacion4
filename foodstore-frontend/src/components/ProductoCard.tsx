import type { Producto } from '../types/producto'

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

const botonBase =
  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

export default function ProductoCard({
  producto,
  procesando,
  onEditar,
  onToggleDisponible,
  onAnular,
}: ProductoCardProps) {
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
        <button
          type="button"
          onClick={() => onEditar(producto)}
          disabled={procesando}
          className={`${botonBase} bg-stone-100 text-stone-800 hover:bg-stone-200`}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onToggleDisponible(producto)}
          disabled={procesando}
          className={`${botonBase} bg-amber-100 text-amber-900 hover:bg-amber-200`}
        >
          {producto.disponible ? 'Pausar venta' : 'Reanudar venta'}
        </button>
        <button
          type="button"
          onClick={() => onAnular(producto)}
          disabled={procesando}
          className={`${botonBase} ml-auto bg-red-50 text-red-700 hover:bg-red-100`}
        >
          Anular
        </button>
      </div>
    </article>
  )
}
