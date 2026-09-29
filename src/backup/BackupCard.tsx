import { useRef } from 'react'
import { Button } from '../ui/Button.tsx'
import Chip from '../ui/Chip.tsx'
import { DownloadIcon, HistoryIcon, ShareIcon } from '../ui/icons.tsx'
import styles from './BackupCard.module.css'
import type { Reminder } from './reminder.ts'
import { lastBackupText } from './texts.ts'

interface BackupCardProps {
  lastBackupAt?: string
  reminder: Reminder
  description: string // the kit's own words, e.g. what stays only on this device
  busy?: boolean // while the file is being made
  onSave: () => void // call saveBackup from here, before any await
  onFile: (file: File) => void // the file the user picked to restore from
}

/** The settings screen's backup card: when the last one was taken, and the two ways to use one. */
export default function BackupCard({ lastBackupAt, reminder, description, busy, onSave, onFile }: BackupCardProps) {
  const picker = useRef<HTMLInputElement>(null)
  const needsOne = !lastBackupAt || reminder.due

  return (
    <section className={styles.card}>
      <div className={styles.last}>
        <span className={needsOne ? `${styles.tile} ${styles.attention}` : styles.tile}>
          <HistoryIcon />
        </span>
        <span className={styles.lines}>
          <span className={styles.label}>Son yedek</span>
          <span className={styles.value}>{lastBackupText(lastBackupAt)}</span>
        </span>
        {reminder.due && reminder.reason === 'old' && (
          <Chip tone="amber" strong>
            Eski
          </Chip>
        )}
      </div>
      <p className={styles.description}>{description}</p>
      <Button variant="primary" disabled={busy} onClick={onSave}>
        <ShareIcon />
        {busy ? 'Hazırlanıyor…' : 'Yedeği kaydet'}
      </Button>
      <Button onClick={() => picker.current?.click()}>
        <DownloadIcon />
        Yedekten geri yükle
      </Button>
      {/* No accept filter: some Android file pickers grey out .json they label differently; reading checks instead. */}
      <input
        ref={picker}
        type="file"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = '' // picking the same file again still counts as a change
          if (file) onFile(file)
        }}
      />
    </section>
  )
}
