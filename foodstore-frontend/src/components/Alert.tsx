import type { FC, ReactNode } from 'react'
import Button from './Button'

type Tamano = 'md' | 'lg'

interface AlertProps {
  titulo?: string
  // Si se pasa, se muestra el botón "Cerrar" y el aviso lo cierra el usuario.
  onCerrar?: () => void
  tamano?: Tamano
  className?: string
  children: ReactNode
}

const TAMANOS: Record<Tamano, string> = {
  md: 'rounded-lg px-4 py-3',
  lg: 'rounded-xl p-8',
}

// Aviso de error: role="alert" hace que el lector de pantalla lo anuncie al aparecer.
const Alert: FC<AlertProps> = ({ titulo, onCerrar, tamano = 'md', className = '', children }) => {
  return (
    <div role="alert" className={`border border-red-200 bg-red-50 text-sm text-red-700 ${TAMANOS[tamano]} ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {titulo && <p className="font-semibold text-red-800">{titulo}</p>}
          {children}
        </div>
        {onCerrar && (
          <Button variante="ghost" tamano="sm" onClick={onCerrar}>
            Cerrar
          </Button>
        )}
      </div>
    </div>
  )
}

export default Alert
