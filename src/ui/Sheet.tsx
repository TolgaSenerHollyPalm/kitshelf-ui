import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'
import styles from './Sheet.module.css'

interface SheetProps {
  open: boolean
  title: string
  subtitle?: string // under the title, e.g. what the sheet belongs to
  onClose: () => void // Escape, the Android back gesture, or a tap on the dimmed page
  busy?: boolean // something is being written: the sheet stays until it is done
  children: ReactNode
}

/** A panel from the bottom of the screen for one small task; its content starts fresh at every opening. */
export default function Sheet({ open, title, subtitle, onClose, busy, children }: SheetProps) {
  const sheet = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const element = sheet.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  // A click on the backdrop reports the dialog itself as its target, and so does one on the sheet's own padding.
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom
    if (event.target === event.currentTarget && outside && !busy) onClose()
  }

  return (
    <dialog
      ref={sheet}
      className={styles.sheet}
      aria-labelledby={titleId}
      onClick={onClick}
      onCancel={(event) => {
        // Escape or the Android back gesture: React state decides whether the sheet is open.
        event.preventDefault()
        if (!busy) onClose()
      }}
    >
      {open && (
        <>
          <span className={styles.handle} aria-hidden="true" />
          <div className={styles.heading}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {children}
        </>
      )}
    </dialog>
  )
}
