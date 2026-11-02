import type { FC } from 'react'
import Button from './Button'

interface NavbarProps {
  onNuevo: () => void
}

const Navbar: FC<NavbarProps> = ({ onNuevo }) => {
  return (
    <header className="border-b border-stone-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Food Store</h1>
          <p className="text-sm text-stone-500">Administración del catálogo</p>
        </div>
        <Button variante="primary" onClick={onNuevo}>
          + Nuevo producto
        </Button>
      </nav>
    </header>
  )
}

export default Navbar
