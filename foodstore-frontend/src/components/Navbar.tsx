interface NavbarProps {
  onNuevo: () => void
}

export default function Navbar({ onNuevo }: NavbarProps) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Food Store</h1>
          <p className="text-sm text-stone-500">Administración del catálogo</p>
        </div>
        <button
          type="button"
          onClick={onNuevo}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        >
          + Nuevo producto
        </button>
      </nav>
    </header>
  )
}
