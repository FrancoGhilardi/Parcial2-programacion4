import type { ComponentPropsWithoutRef } from 'react'

type Variante = 'primary' | 'danger' | 'ghost' | 'neutral' | 'warning' | 'dangerSoft'
type Tamano = 'sm' | 'md'

// Acepta cualquier atributo de <button> (onClick, disabled, type, aria-label, autoFocus...).
interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variante?: Variante
  tamano?: Tamano
}

// Estilos comunes: foco visible y estado deshabilitado.
const BASE =
  'rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const VARIANTES: Record<Variante, string> = {
  primary: 'bg-orange-600 font-semibold text-white hover:bg-orange-700',
  danger: 'bg-red-600 font-semibold text-white hover:bg-red-700',
  ghost: 'font-medium text-stone-700 hover:bg-stone-100',
  neutral: 'bg-stone-100 font-medium text-stone-800 hover:bg-stone-200',
  warning: 'bg-amber-100 font-medium text-amber-900 hover:bg-amber-200',
  dangerSoft: 'bg-red-50 font-medium text-red-700 hover:bg-red-100',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
}

export default function Button({
  variante = 'neutral',
  tamano = 'md',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return <button type={type} className={`${BASE} ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`} {...props} />
}
