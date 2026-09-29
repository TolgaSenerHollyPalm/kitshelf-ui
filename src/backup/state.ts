/** Where the reminder remembers things; localStorage in the browser, a Map in tests. */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

// A private window may refuse storage; the reminder then simply starts over next time.
export const browserStore: KeyValueStore = {
  getItem(key) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Nothing to remember it with.
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Nothing was stored either.
    }
  },
}

const DAY_MS = 24 * 60 * 60 * 1000
export const SNOOZE_MS = 7 * DAY_MS

/** The kit's backup keys, e.g. tripkit-last-backup; a kit adds `backupKeyList` to what wiping removes. */
export function backupKeys(kit: string) {
  return {
    lastBackup: `${kit}-last-backup`,
    dataSince: `${kit}-data-since`,
    snoozedUntil: `${kit}-backup-snoozed-until`,
  }
}

export function backupKeyList(kit: string): string[] {
  return Object.values(backupKeys(kit))
}

export interface BackupState {
  lastBackupAt?: string
  dataSince?: string // when the device first had user data
  snoozedUntil?: string
}

export function readBackupState(kit: string, store: KeyValueStore = browserStore): BackupState {
  const keys = backupKeys(kit)
  return {
    lastBackupAt: store.getItem(keys.lastBackup) ?? undefined,
    dataSince: store.getItem(keys.dataSince) ?? undefined,
    snoozedUntil: store.getItem(keys.snoozedUntil) ?? undefined,
  }
}

export function recordBackup(kit: string, at: Date, store: KeyValueStore = browserStore): void {
  store.setItem(backupKeys(kit).lastBackup, at.toISOString())
}

/** After a restore the device holds that backup's data, so the backup counts from its own date if later. */
export function recordRestore(kit: string, exportedAt: string, store: KeyValueStore = browserStore): void {
  const key = backupKeys(kit).lastBackup
  const saved = Date.parse(store.getItem(key) ?? '')
  if (Number.isNaN(saved) || Date.parse(exportedAt) > saved) store.setItem(key, exportedAt)
}

export function snoozeReminder(kit: string, now: Date, store: KeyValueStore = browserStore): void {
  store.setItem(backupKeys(kit).snoozedUntil, new Date(now.getTime() + SNOOZE_MS).toISOString())
}

/** Starts the "no backup yet" clock when data appears and stops it when the last of it is deleted. */
export function trackDataSince(kit: string, hasUserData: boolean, now: Date, store: KeyValueStore = browserStore): string | undefined {
  const key = backupKeys(kit).dataSince
  if (!hasUserData) {
    store.removeItem(key)
    return undefined
  }
  const since = store.getItem(key)
  if (since) return since
  store.setItem(key, now.toISOString())
  return now.toISOString()
}
