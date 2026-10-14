import { useId } from 'react'
import { TrashIcon } from '../ui/icons.tsx'
import styles from './BackupCard.module.css'

interface WipeCardProps {
  description: string // what deleting takes away, in the kit's words
  busy?: boolean // while the data is being deleted
  onWipe: () => void // the kit asks first, in its own ConfirmDialog
}

/** "Tüm verileri sil" as one red row in the backup card's shape, the kit's words below. */
export default function WipeCard({ description, busy, onWipe }: WipeCardProps) {
  const describedBy = useId()
  return (
    <div className={`${styles.wrap} ${styles.apart}`}>
      <section className={styles.card}>
        <button type="button" className={`${styles.row} ${styles.danger}`} disabled={busy} onClick={onWipe} aria-describedby={describedBy}>
          <span className={styles.icon}>
            <TrashIcon />
          </span>
          {busy ? 'Siliniyor…' : 'Tüm verileri sil'}
        </button>
      </section>
      <p id={describedBy} className={styles.description}>
        {description}
      </p>
    </div>
  )
}
