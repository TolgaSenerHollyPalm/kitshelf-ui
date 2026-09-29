const DAY_MS = 24 * 60 * 60 * 1000
const FIRST_REMINDER_MS = 7 * DAY_MS
const OLD_BACKUP_MS = 30 * DAY_MS

export interface ReminderInput {
  now: Date
  hasUserData: boolean
  lastBackupAt?: string
  dataSince?: string
  lastChangeAt?: string
  snoozedUntil?: string
}

export interface Reminder {
  due: boolean // the settings button shows its dot, even while the banner is snoozed
  showBanner: boolean
  reason: 'never' | 'old'
}

const time = (iso?: string) => (iso ? Date.parse(iso) : Number.NaN)

/** Elapsed time, not calendar days: 7 × 24 hours after the data appeared, 30 × 24 hours after the last backup. */
export function backupDue({ now, hasUserData, lastBackupAt, dataSince, lastChangeAt, snoozedUntil }: ReminderInput): Reminder {
  const at = now.getTime()
  const never = !lastBackupAt && at - time(dataSince) >= FIRST_REMINDER_MS
  const old = Boolean(lastBackupAt) && at - time(lastBackupAt) >= OLD_BACKUP_MS && time(lastChangeAt) > time(lastBackupAt)
  const due = hasUserData && (never || old)
  return { due, showBanner: due && !(at < time(snoozedUntil)), reason: lastBackupAt ? 'old' : 'never' }
}
