import type { FC, ReactNode } from 'react'

// Atributos que el campo le pasa al control (input, select o textarea) para vincularlo con su etiqueta y su ayuda.
interface ControlProps {
  id: string
  'aria-describedby'?: string
}

interface FieldProps {
  id: string
  etiqueta: string
  obligatorio?: boolean
  opcional?: boolean
  ayuda?: string
  children: (control: ControlProps) => ReactNode
}

// Estilos compartidos por todos los controles de formulario.
export const claseControl =
  'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:bg-stone-100'

// Etiqueta + control + texto de ayuda. El asterisco es decorativo: el lector de pantalla
// anuncia "obligatorio" a partir del atributo required del control.
const Field: FC<FieldProps> = ({ id, etiqueta, obligatorio = false, opcional = false, ayuda, children }) => {
  const idAyuda = `${id}-ayuda`
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {etiqueta}
        {obligatorio && <span aria-hidden="true"> *</span>}
        {opcional && <span className="font-normal text-stone-400"> (opcional)</span>}
      </label>
      {children({ id, 'aria-describedby': ayuda ? idAyuda : undefined })}
      {ayuda && (
        <p id={idAyuda} className="mt-1 text-xs text-stone-500">
          {ayuda}
        </p>
      )}
    </div>
  )
}

export default Field
