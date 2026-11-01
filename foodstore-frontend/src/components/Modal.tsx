import { useEffect, useId } from 'react'
import type { ReactNode } from 'react'

type Rol = 'dialog' | 'alertdialog'
type Tamano = 'sm' | 'lg'

interface ModalProps {
  titulo: string
  // Texto que el lector de pantalla anuncia junto al título (diálogos de confirmación).
  descripcion?: string
  rol?: Rol
  tamano?: Tamano
  // false mientras hay una operación en curso: Escape no cierra el modal.
  cerrable?: boolean
  onCerrar: () => void
  children: ReactNode
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'max-w-sm',
  lg: 'max-w-lg',
}

// Estructura común de los diálogos: fondo oscuro, panel, título, accesibilidad y cierre con Escape.
export default function Modal({
  titulo,
  descripcion,
  rol = 'dialog',
  tamano = 'lg',
  cerrable = true,
  onCerrar,
  children,
}: ModalProps) {
  const idTitulo = useId()
  const idDescripcion = useId()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cerrable) onCerrar()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [cerrable, onCerrar])

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-stone-900/50 p-4">
      <div
        role={rol}
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={descripcion ? idDescripcion : undefined}
        className={`w-full ${TAMANOS[tamano]} rounded-xl bg-white p-6 shadow-xl`}
      >
        <h2 id={idTitulo} className="text-lg font-semibold text-stone-900">
          {titulo}
        </h2>
        {descripcion && (
          <p id={idDescripcion} className="mt-2 text-sm text-stone-600">
            {descripcion}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
