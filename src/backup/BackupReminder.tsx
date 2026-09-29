import { CloseIcon, HistoryIcon } from '../ui/icons.tsx'
import styles from './BackupReminder.module.css'
import type { Reminder } from './reminder.ts'
import { bannerTitle } from './texts.ts'

interface BackupReminderProps {
  reminder: Reminder
  lastBackupAt?: string
  text: string // the kit's own words, e.g. what would be lost with the phone
  href: string // the settings screen
  onDismiss: () => void // snoozes the banner for a week
}

/** The home screen's nudge; show it while `reminder.showBanner` is true. */
export default function BackupReminder({ reminder, lastBackupAt, text, href, onDismiss }: BackupReminderProps) {
  return (
    <div className={styles.banner} role="status">
      <span className={styles.icon}>
        <HistoryIcon />
      </span>
      <div className={styles.body}>
        <strong className={styles.title}>{bannerTitle(reminder, lastBackupAt)}</strong>
        <span className={styles.text}>{text}</span>
        <a className={styles.link} href={href}>
          Şimdi yedekle
        </a>
      </div>
      <button type="button" className={styles.close} aria-label="Hatırlatmayı kapat" onClick={onDismiss}>
        <CloseIcon size={16} strokeWidth={2.2} />
      </button>
    </div>
  )
}
