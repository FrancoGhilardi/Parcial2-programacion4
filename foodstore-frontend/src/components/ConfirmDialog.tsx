import type { FC } from 'react'
import Button from './Button'
import Modal from './Modal'

interface ConfirmDialogProps {
  titulo: string
  mensaje: string
  textoConfirmar: string
  procesando: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  titulo,
  mensaje,
  textoConfirmar,
  procesando,
  onConfirmar,
  onCancelar,
}) => {
  return (
    <Modal
      titulo={titulo}
      descripcion={mensaje}
      rol="alertdialog"
      tamano="sm"
      cerrable={!procesando}
      onCerrar={onCancelar}
    >
      <div className="mt-6 flex justify-end gap-2">
        {/* El foco inicial va a Cancelar: la opción segura. */}
        <Button variante="ghost" onClick={onCancelar} disabled={procesando} autoFocus>
          Cancelar
        </Button>
        <Button variante="danger" onClick={onConfirmar} disabled={procesando}>
          {procesando ? 'Procesando…' : textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
