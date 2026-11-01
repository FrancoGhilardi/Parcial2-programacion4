import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Producto, ProductoPayload } from '../types/producto'
import type { UnidadMedida } from '../types/unidadMedida'

interface ProductoModalProps {
  producto: Producto | null
  unidades: UnidadMedida[]
  error: string | null
  guardando: boolean
  onGuardar: (payload: ProductoPayload) => void
  onCancelar: () => void
}

// Los inputs trabajan con strings; se convierten a número al guardar.
interface FormState {
  nombre: string
  descripcion: string
  precio_base: string
  unidad_venta_id: string
  stock_cantidad: string
  disponible: boolean
}

function estadoInicial(producto: Producto | null): FormState {
  if (producto === null) {
    return { nombre: '', descripcion: '', precio_base: '', unidad_venta_id: '', stock_cantidad: '0', disponible: true }
  }
  return {
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? '',
    precio_base: String(producto.precio_base),
    unidad_venta_id: String(producto.unidad_venta.id),
    stock_cantidad: String(producto.stock_cantidad),
    disponible: producto.disponible,
  }
}

const inputClase =
  'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:bg-stone-100'
const labelClase = 'block text-sm font-medium text-stone-700'

export default function ProductoModal({
  producto,
  unidades,
  error,
  guardando,
  onGuardar,
  onCancelar,
}: ProductoModalProps) {
  const [form, setForm] = useState<FormState>(() => estadoInicial(producto))

  // Escape cierra el modal (salvo mientras se guarda).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !guardando) onCancelar()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [guardando, onCancelar])

  const unidadSeleccionada = unidades.find((unidad) => String(unidad.id) === form.unidad_venta_id)
  const esContable = unidadSeleccionada?.tipo === 'contable'

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onGuardar({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() === '' ? null : form.descripcion.trim(),
      precio_base: Number(form.precio_base),
      unidad_venta_id: Number(form.unidad_venta_id),
      stock_cantidad: Number(form.stock_cantidad),
      disponible: form.disponible,
    })
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-stone-900/50 p-4">
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="titulo-modal" className="text-lg font-semibold text-stone-900">
          {producto === null ? 'Nuevo producto' : `Editar ${producto.nombre}`}
        </h2>

        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="nombre" className={labelClase}>
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              minLength={3}
              autoFocus
              className={inputClase}
            />
          </div>

          <div>
            <label htmlFor="descripcion" className={labelClase}>
              Descripción <span className="font-normal text-stone-400">(opcional)</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={2}
              className={inputClase}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="precio_base" className={labelClase}>
                Precio ($)
              </label>
              <input
                id="precio_base"
                name="precio_base"
                type="number"
                min={0}
                step="0.01"
                value={form.precio_base}
                onChange={handleChange}
                required
                className={inputClase}
              />
            </div>

            <div>
              <label htmlFor="unidad_venta_id" className={labelClase}>
                Unidad de venta
              </label>
              <select
                id="unidad_venta_id"
                name="unidad_venta_id"
                value={form.unidad_venta_id}
                onChange={handleChange}
                required
                className={inputClase}
              >
                <option value="" disabled>
                  Seleccionar…
                </option>
                {unidades.map((unidad) => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre} ({unidad.simbolo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="stock_cantidad" className={labelClase}>
              Stock {unidadSeleccionada && `(${unidadSeleccionada.simbolo})`}
            </label>
            <input
              id="stock_cantidad"
              name="stock_cantidad"
              type="number"
              min={0}
              step={esContable ? '1' : '0.001'}
              value={form.stock_cantidad}
              onChange={handleChange}
              required
              className={inputClase}
            />
            {esContable && <p className="mt-1 text-xs text-stone-500">Unidad contable: solo números enteros.</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={form.disponible}
              onChange={(e) => setForm((prev) => ({ ...prev, disponible: e.target.checked }))}
              className="size-4 accent-orange-600"
            />
            Disponible para la venta
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={guardando}
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
