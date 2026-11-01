import { useEffect } from 'react'

interface ConfirmDialogProps {
  titulo: string
  mensaje: string
  textoConfirmar: string
  procesando: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export default function ConfirmDialog({
  titulo,
  mensaje,
  textoConfirmar,
  procesando,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  // Escape cancela (salvo mientras se procesa la acción).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !procesando) onCancelar()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [procesando, onCancelar])

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-stone-900/50 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmacion"
        aria-describedby="mensaje-confirmacion"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="titulo-confirmacion" className="text-lg font-semibold text-stone-900">
          {titulo}
        </h2>
        <p id="mensaje-confirmacion" className="mt-2 text-sm text-stone-600">
          {mensaje}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          {/* El foco inicial va a Cancelar: la opción segura. */}
          <button
            type="button"
            onClick={onCancelar}
            disabled={procesando}
            autoFocus
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={procesando}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {procesando ? 'Procesando…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
