import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button.tsx'
import styles from './ConfirmDialog.module.css'

interface InfoDialogProps {
  open: boolean
  title: string
  onClose: () => void
  buttonLabel?: string
  children: ReactNode
}

/** A modal message with a single button, e.g. why a file could not be opened. */
export default function InfoDialog({ open, title, onClose, buttonLabel = 'Tamam', children }: InfoDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <div className={styles.body}>{children}</div>
      <Button variant="primary" onClick={onClose}>
        {buttonLabel}
      </Button>
    </dialog>
  )
}
