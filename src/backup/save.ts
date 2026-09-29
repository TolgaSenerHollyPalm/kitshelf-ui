import { backupFileName, createBackup, type Backup, type BackupAdapter, type RestoreCount, type RestoreMode } from './format.ts'
import { browserStore, recordBackup, recordRestore, type KeyValueStore } from './state.ts'

export type SaveResult = { status: 'shared' | 'downloaded'; fileName: string } | { status: 'cancelled' | 'failed' }

/** The browser's share sheet and download by default; tests hand in their own. */
export interface SaveOptions {
  now?: Date
  store?: KeyValueStore
  canShare?: (data: ShareData) => boolean
  share?: (data: ShareData) => Promise<void>
  download?: (file: File) => void
}

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file)
  const link = Object.assign(document.createElement('a'), { href: url, download: file.name })
  document.body.append(link)
  link.click()
  link.remove()
  // Revoked at once, some browsers cancel the download before it starts.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * Call it straight from the tap, with no await before it: the share sheet only opens while the tap still counts
 * as the user's. The backup date is written once the file is shared or its download has started.
 */
export async function saveBackup<Data>(adapter: BackupAdapter<Data>, options: SaveOptions = {}): Promise<SaveResult> {
  const now = options.now ?? new Date()
  const store = options.store ?? browserStore
  const canShare = options.canShare ?? ((data: ShareData) => navigator.canShare?.(data) ?? false)
  const share = options.share ?? ((data: ShareData) => navigator.share(data))
  const download = options.download ?? downloadFile

  let file: File
  try {
    const body = JSON.stringify(createBackup(adapter, now), null, 2)
    file = new File([body], backupFileName(adapter.kit, now), { type: 'application/json' })
  } catch {
    return { status: 'failed' }
  }

  const data = { files: [file], title: `${adapter.kitName} yedeği` }
  if (canShare(data)) {
    try {
      await share(data)
      recordBackup(adapter.kit, now, store)
      return { status: 'shared', fileName: file.name }
    } catch (error) {
      if ((error as { name?: string } | null)?.name === 'AbortError') return { status: 'cancelled' }
      // NotAllowedError or anything else: the file can still be downloaded.
    }
  }
  try {
    download(file)
  } catch {
    return { status: 'failed' }
  }
  recordBackup(adapter.kit, now, store)
  return { status: 'downloaded', fileName: file.name }
}

export type RestoreOutcome = { ok: true; counts: RestoreCount[] } | { ok: false }

/** Writes a backup that `readBackup` accepted; on failure the kit's single transaction leaves everything as it was. */
export async function restoreBackup<Data>(
  backup: Backup<Data>,
  adapter: BackupAdapter<Data>,
  mode: RestoreMode,
  store: KeyValueStore = browserStore,
): Promise<RestoreOutcome> {
  try {
    const counts = await adapter.restore(backup.data, mode)
    recordRestore(adapter.kit, backup.exportedAt, store)
    return { ok: true, counts }
  } catch {
    return { ok: false }
  }
}
