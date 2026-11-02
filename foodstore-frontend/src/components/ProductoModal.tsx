import { useState } from 'react'
import type { ChangeEvent, FC, SubmitEvent } from 'react'
import type { Producto, ProductoPayload } from '../types/producto'
import type { UnidadMedida } from '../types/unidadMedida'
import Alert from './Alert'
import Button from './Button'
import Field, { claseControl } from './Field'
import Modal from './Modal'

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

const estadoInicial = (producto: Producto | null): FormState => {
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

const ProductoModal: FC<ProductoModalProps> = ({
  producto,
  unidades,
  error,
  guardando,
  onGuardar,
  onCancelar,
}) => {
  const [form, setForm] = useState<FormState>(() => estadoInicial(producto))

  const unidadSeleccionada = unidades.find((unidad) => String(unidad.id) === form.unidad_venta_id)
  const esContable = unidadSeleccionada?.tipo === 'contable'

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>): void => {
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
    <Modal
      titulo={producto === null ? 'Nuevo producto' : `Editar ${producto.nombre}`}
      cerrable={!guardando}
      onCerrar={onCancelar}
    >
      <form onSubmit={handleSubmit}>
        <p className="mt-1 text-sm text-stone-500">Los campos con * son obligatorios.</p>

        {error && <Alert className="mt-4">{error}</Alert>}

        <div className="mt-4 space-y-4">
          <Field id="nombre" etiqueta="Nombre" obligatorio ayuda="Mínimo 3 caracteres.">
            {(control) => (
              <input
                {...control}
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                minLength={3}
                autoFocus
                className={claseControl}
              />
            )}
          </Field>

          <Field id="descripcion" etiqueta="Descripción" opcional>
            {(control) => (
              <textarea
                {...control}
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={2}
                className={claseControl}
              />
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field id="precio_base" etiqueta="Precio ($)" obligatorio>
              {(control) => (
                <input
                  {...control}
                  name="precio_base"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.precio_base}
                  onChange={handleChange}
                  required
                  className={claseControl}
                />
              )}
            </Field>

            <Field id="unidad_venta_id" etiqueta="Unidad de venta" obligatorio>
              {(control) => (
                <select
                  {...control}
                  name="unidad_venta_id"
                  value={form.unidad_venta_id}
                  onChange={handleChange}
                  required
                  className={claseControl}
                >
                  <option value="" disabled>
                    Seleccioná una unidad
                  </option>
                  {unidades.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre} ({unidad.simbolo})
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <Field
            id="stock_cantidad"
            etiqueta={unidadSeleccionada ? `Stock (${unidadSeleccionada.simbolo})` : 'Stock'}
            obligatorio
            ayuda={
              esContable ? 'Esta unidad se vende por unidades enteras: ingresá un número sin decimales.' : undefined
            }
          >
            {(control) => (
              <input
                {...control}
                name="stock_cantidad"
                type="number"
                min={0}
                step={esContable ? '1' : '0.001'}
                value={form.stock_cantidad}
                onChange={handleChange}
                required
                className={claseControl}
              />
            )}
          </Field>

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
          <Button variante="ghost" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </Button>
          <Button variante="primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : producto === null ? 'Crear producto' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductoModal
