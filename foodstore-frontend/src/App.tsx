import { useEffect, useState } from 'react'
import Alert from './components/Alert'
import Button from './components/Button'
import ConfirmDialog from './components/ConfirmDialog'
import Navbar from './components/Navbar'
import ProductoList from './components/ProductoList'
import ProductoModal from './components/ProductoModal'
import type { Producto, ProductoPayload } from './types/producto'
import type { UnidadMedida } from './types/unidadMedida'

const API_URL = 'http://localhost:8000/api/v1'
// La API pagina con limit (máx. 50); la UI pide el máximo.
const URL_PRODUCTOS = `${API_URL}/productos?limit=50`

// Nombres con los que el usuario conoce cada campo del formulario.
const ETIQUETAS_CAMPO: Record<string, string> = {
  nombre: 'El nombre',
  descripcion: 'La descripción',
  precio_base: 'El precio',
  unidad_venta_id: 'La unidad de venta',
  stock_cantidad: 'El stock',
  disponible: 'La disponibilidad',
}

interface ErrorValidacion {
  type?: string
  loc?: unknown[]
  ctx?: Record<string, unknown>
}

// Traduce un error de validación de Pydantic (422) a un mensaje en español.
function traducirErrorValidacion(item: ErrorValidacion): string {
  const campo = ETIQUETAS_CAMPO[String(item.loc?.at(-1))] ?? 'Un dato'
  const ctx = item.ctx ?? {}
  switch (item.type) {
    case 'missing':
      return `${campo} es obligatorio.`
    case 'string_too_short':
      return `${campo} debe tener al menos ${String(ctx.min_length)} caracteres.`
    case 'greater_than_equal':
      return ctx.ge === 0 ? `${campo} no puede ser negativo.` : `${campo} debe ser mayor o igual a ${String(ctx.ge)}.`
    case 'decimal_max_places':
      return `${campo} admite hasta ${String(ctx.decimal_places)} decimales.`
    case 'decimal_whole_digits':
    case 'decimal_max_digits':
    case 'less_than_equal':
      return `${campo} es demasiado grande.`
    case 'decimal_parsing':
    case 'decimal_type':
    case 'int_parsing':
    case 'int_type':
      return `${campo} debe ser un número.`
    default:
      return `${campo} tiene un valor no válido.`
  }
}

// Convierte el {"detail": ...} de la API en un texto para mostrar.
// detail es un string (HTTPException) o una lista de errores (422 de Pydantic).
async function leerError(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json()
    if (typeof data === 'object' && data !== null && 'detail' in data) {
      const { detail } = data
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) {
        const mensajes = detail.map((item: unknown) =>
          typeof item === 'object' && item !== null ? traducirErrorValidacion(item) : 'Hay datos inválidos.',
        )
        return [...new Set(mensajes)].join(' ')
      }
    }
  } catch {
    // respuesta sin cuerpo JSON
  }
  return res.status >= 500
    ? `El servidor tuvo un problema (código ${res.status}). Intentá de nuevo en unos minutos.`
    : `El servidor rechazó la solicitud (código ${res.status}).`
}

function mensajeDeError(e: unknown): string {
  if (e instanceof TypeError) {
    return 'No se pudo conectar con el servidor. Verificá que esté en funcionamiento e intentá de nuevo.'
  }
  return e instanceof Error ? e.message : 'Ocurrió un error inesperado. Intentá de nuevo.'
}

// GET de productos: lo usan la carga inicial y el refresco tras cada operación.
async function obtenerProductos(): Promise<Producto[]> {
  const res = await fetch(URL_PRODUCTOS)
  if (!res.ok) throw new Error(await leerError(res))
  return res.json()
}

// POST si id es null (alta), PUT si no (edición o cambio de disponibilidad).
function enviarProducto(id: number | null, payload: ProductoPayload): Promise<Response> {
  return fetch(id === null ? `${API_URL}/productos` : `${API_URL}/productos/${id}`, {
    method: id === null ? 'POST' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

function payloadDesde(producto: Producto): ProductoPayload {
  return {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio_base: producto.precio_base,
    unidad_venta_id: producto.unidad_venta.id,
    stock_cantidad: producto.stock_cantidad,
    disponible: producto.disponible,
  }
}

export default function App() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [unidades, setUnidades] = useState<UnidadMedida[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [productoAAnular, setProductoAAnular] = useState<Producto | null>(null)

  // cargando arranca en true: el setState ocurre después de las respuestas.
  const cargarCatalogo = async () => {
    try {
      const [listaProductos, resUnidades] = await Promise.all([
        obtenerProductos(),
        fetch(`${API_URL}/unidades-medida`),
      ])
      if (!resUnidades.ok) throw new Error(await leerError(resUnidades))
      const listaUnidades: UnidadMedida[] = await resUnidades.json()
      setProductos(listaProductos)
      setUnidades(listaUnidades)
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setCargando(false)
    }
  }

  const reintentar = () => {
    setCargando(true)
    setError(null)
    void cargarCatalogo()
  }

  // Carga inicial del catálogo y de las unidades al montar.
  useEffect(() => {
    void cargarCatalogo()
  }, [])

  // Refresca la lista después de cada operación. Su error se informa aparte:
  // la operación ya se hizo en el servidor, lo que falló es la recarga.
  const refrescarProductos = async () => {
    try {
      setProductos(await obtenerProductos())
    } catch {
      setErrorAccion('El cambio se guardó, pero no pudimos actualizar la lista. Recargá la página para ver los datos actuales.')
    }
  }

  const abrirNuevo = () => {
    setProductoSeleccionado(null)
    setErrorModal(null)
    setModalAbierto(true)
  }

  const abrirEdicion = (producto: Producto) => {
    setProductoSeleccionado(producto)
    setErrorModal(null)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setProductoSeleccionado(null)
    setErrorModal(null)
  }

  // Alta (POST) o edición (PUT) según haya producto seleccionado.
  const guardarProducto = async (payload: ProductoPayload) => {
    setGuardando(true)
    setErrorModal(null)
    try {
      const res = await enviarProducto(productoSeleccionado?.id ?? null, payload)
      if (!res.ok) {
        // 409 (nombre repetido), 404 o 422: se muestra dentro del modal sin cerrarlo.
        setErrorModal(await leerError(res))
        return
      }
    } catch (e) {
      setErrorModal(mensajeDeError(e))
      return
    } finally {
      setGuardando(false)
    }
    cerrarModal()
    await refrescarProductos()
  }

  // Ejecuta una acción de la tarjeta y refresca la lista.
  const ejecutarAccion = async (accion: () => Promise<Response>) => {
    setProcesando(true)
    setErrorAccion(null)
    try {
      const res = await accion()
      if (!res.ok) {
        setErrorAccion(await leerError(res))
        return
      }
    } catch (e) {
      setErrorAccion(mensajeDeError(e))
      return
    } finally {
      setProcesando(false)
    }
    await refrescarProductos()
  }

  // PUT con todos los campos y disponible invertido.
  const toggleDisponible = (producto: Producto) =>
    ejecutarAccion(() => enviarProducto(producto.id, { ...payloadDesde(producto), disponible: !producto.disponible }))

  // Baja lógica (DELETE) tras confirmar en el diálogo: el producto sale del listado.
  const confirmarAnulacion = async () => {
    if (productoAAnular === null) return
    const { id } = productoAAnular
    await ejecutarAccion(() => fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' }))
    setProductoAAnular(null)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar onNuevo={abrirNuevo} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {errorAccion && (
          <Alert className="mb-6" onCerrar={() => setErrorAccion(null)}>
            {errorAccion}
          </Alert>
        )}

        {cargando ? (
          <div className="flex flex-col items-center gap-3 py-20 text-stone-500" aria-live="polite">
            <span className="size-8 animate-spin rounded-full border-4 border-stone-200 border-t-orange-600" />
            Cargando catálogo…
          </div>
        ) : error ? (
          <Alert titulo="No pudimos cargar el catálogo" tamano="lg" className="text-center">
            <p className="mt-1">{error}</p>
            <Button variante="danger" className="mt-4" onClick={reintentar}>
              Reintentar
            </Button>
          </Alert>
        ) : productos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <p className="font-semibold text-stone-800">Todavía no hay productos</p>
            <p className="mt-1 text-sm text-stone-500">Cargá el primero con el botón “Nuevo producto”.</p>
          </div>
        ) : (
          <ProductoList
            productos={productos}
            procesando={procesando}
            onEditar={abrirEdicion}
            onToggleDisponible={(producto) => void toggleDisponible(producto)}
            onAnular={setProductoAAnular}
          />
        )}
      </main>

      {modalAbierto && (
        <ProductoModal
          key={productoSeleccionado?.id ?? 'nuevo'}
          producto={productoSeleccionado}
          unidades={unidades}
          error={errorModal}
          guardando={guardando}
          onGuardar={(payload) => void guardarProducto(payload)}
          onCancelar={cerrarModal}
        />
      )}

      {productoAAnular && (
        <ConfirmDialog
          titulo="Anular producto"
          mensaje={`¿Anular «${productoAAnular.nombre}»? Va a dejar de aparecer en el catálogo. Esta acción no se puede deshacer desde la interfaz.`}
          textoConfirmar="Sí, anular"
          procesando={procesando}
          onConfirmar={() => void confirmarAnulacion()}
          onCancelar={() => setProductoAAnular(null)}
        />
      )}
    </div>
  )
}
