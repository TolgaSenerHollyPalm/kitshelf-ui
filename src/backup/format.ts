/** One kit's data in a file the user keeps: the same envelope for every kit, the kit's own data inside. */
export const BACKUP_FORMAT = 'kitshelf-backup'
export const FORMAT_VERSION = 1
// No kit's backup comes near this; a bigger file is something else.
const MAX_BYTES = 20 * 1024 * 1024

/** A count for people to read, e.g. { key: 'trips', count: 3, label: 'seyahat' } → "3 seyahat". */
export interface CountLine {
  key: string
  count: number
  label: string
}

/** What a restore did to one kind of record; `total` is how many are on the device afterwards. */
export interface RestoreCount {
  key: string
  label: string
  added: number
  updated: number
  total: number
}

export type RestoreMode = 'merge' | 'replace'

/** What a kit tells the package about its data. */
export interface BackupAdapter<Data> {
  kit: string // e.g. 'tripkit'; the file name and the storage keys start with it
  kitName: string // e.g. 'TripKit', for messages
  dataVersion: number // the shape of `data`, the kit's own number
  appBuild: string // when the kit was built
  exportData(): Data // from memory and synchronous: the share sheet has to open right after the tap
  summarize(data: Data): CountLine[]
  migrate(data: unknown, from: number): unknown // throws for a version it does not know
  validate(data: unknown): data is Data // structure only; the kit's own older records must pass
  restore(data: Data, mode: RestoreMode): Promise<RestoreCount[]> // one transaction: all or nothing
  lastChangeAt(): string | undefined
  hasUserData(): boolean
}

export interface Backup<Data = unknown> {
  format: typeof BACKUP_FORMAT
  formatVersion: number
  kit: string
  kitName: string
  dataVersion: number
  exportedAt: string
  appBuild: string
  summary: Record<string, number>
  data: Data
}

export function createBackup<Data>(adapter: BackupAdapter<Data>, now: Date): Backup<Data> {
  const data = adapter.exportData()
  return {
    format: BACKUP_FORMAT,
    formatVersion: FORMAT_VERSION,
    kit: adapter.kit,
    kitName: adapter.kitName,
    dataVersion: adapter.dataVersion,
    exportedAt: now.toISOString(),
    appBuild: adapter.appBuild,
    summary: Object.fromEntries(adapter.summarize(data).map((line) => [line.key, line.count])),
    data,
  }
}

/** "tripkit-yedek-2026-09-29.json", by the phone's own calendar. */
export function backupFileName(kit: string, now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${kit}-yedek-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`
}

export type BackupError = 'not-backup' | 'other-kit' | 'too-new' | 'damaged'

export interface BackupPreview {
  fileName: string
  exportedAt: string
  counts: CountLine[] // recomputed from the data, zero counts left out
}

export type ReadResult<Data> =
  | { ok: true; backup: Backup<Data>; preview: BackupPreview }
  | { ok: false; error: BackupError; kitName?: string } // kitName: the other kit's, for 'other-kit'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isVersion = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 1

/** Opens a file the user picked; nothing on the device changes until `restoreBackup`. */
export async function readBackup<Data>(file: File, adapter: BackupAdapter<Data>): Promise<ReadResult<Data>> {
  if (file.size > MAX_BYTES) return { ok: false, error: 'not-backup' }
  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    return { ok: false, error: 'not-backup' }
  }
  if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT) return { ok: false, error: 'not-backup' }

  const { kit, kitName, formatVersion, dataVersion, exportedAt, appBuild } = parsed
  const damaged = { ok: false, error: 'damaged' } as const
  if (typeof kit !== 'string') return damaged
  // Before the versions, so a newer backup of another kit is not answered with "update the app".
  if (kit !== adapter.kit) return { ok: false, error: 'other-kit', kitName: typeof kitName === 'string' ? kitName : kit }
  if ((isVersion(formatVersion) && formatVersion > FORMAT_VERSION) || (isVersion(dataVersion) && dataVersion > adapter.dataVersion)) {
    return { ok: false, error: 'too-new' }
  }
  if (!isVersion(formatVersion) || !isVersion(dataVersion) || typeof exportedAt !== 'string' || Number.isNaN(Date.parse(exportedAt))) {
    return damaged
  }

  let data: unknown
  try {
    data = adapter.migrate(parsed.data, dataVersion)
  } catch {
    return damaged
  }
  if (!adapter.validate(data)) return damaged

  const counts = adapter.summarize(data)
  const backup: Backup<Data> = {
    format: BACKUP_FORMAT,
    formatVersion,
    kit,
    kitName: typeof kitName === 'string' ? kitName : adapter.kitName,
    dataVersion: adapter.dataVersion,
    exportedAt,
    appBuild: typeof appBuild === 'string' ? appBuild : '',
    summary: Object.fromEntries(counts.map((line) => [line.key, line.count])),
    data,
  }
  return { ok: true, backup, preview: { fileName: file.name, exportedAt, counts: counts.filter((line) => line.count > 0) } }
}
