import { describe, expect, it, vi } from 'vitest'
import { restoreBackup, saveBackup } from './save.ts'
import { readBackupState, type KeyValueStore } from './state.ts'
import { testKit } from './testKit.ts'

const NOW = new Date(2026, 8, 29, 21, 40)
const memory = (): KeyValueStore => {
  const map = new Map<string, string>()
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) }
}
const refuse = (name: string) => () => Promise.reject(new DOMException('no', name))

describe('saveBackup', () => {
  it('shares the file where the browser can, and remembers the backup', async () => {
    const store = memory()
    const share = vi.fn(() => Promise.resolve())
    const download = vi.fn()
    const result = await saveBackup(testKit(), { now: NOW, store, canShare: () => true, share, download })
    expect(result).toEqual({ status: 'shared', fileName: 'testkit-yedek-2026-09-29.json' })
    expect(download).not.toHaveBeenCalled()
    const [[data]] = share.mock.calls as unknown as [[ShareData]]
    expect(data.title).toBe('TestKit yedeği')
    expect(data.files?.[0].type).toBe('application/json')
    expect(JSON.parse(await data.files![0].text())).toMatchObject({ format: 'kitshelf-backup', kit: 'testkit' })
    expect(readBackupState('testkit', store).lastBackupAt).toBe(NOW.toISOString())
  })

  it('takes no backup date when the user closes the share sheet', async () => {
    const store = memory()
    const download = vi.fn()
    const result = await saveBackup(testKit(), { now: NOW, store, canShare: () => true, share: refuse('AbortError'), download })
    expect(result).toEqual({ status: 'cancelled' })
    expect(download).not.toHaveBeenCalled()
    expect(readBackupState('testkit', store).lastBackupAt).toBeUndefined()
  })

  it('downloads the file when sharing is refused', async () => {
    const store = memory()
    const download = vi.fn()
    const result = await saveBackup(testKit(), { now: NOW, store, canShare: () => true, share: refuse('NotAllowedError'), download })
    expect(result).toEqual({ status: 'downloaded', fileName: 'testkit-yedek-2026-09-29.json' })
    expect(download).toHaveBeenCalledOnce()
    expect(readBackupState('testkit', store).lastBackupAt).toBe(NOW.toISOString())
  })

  it('downloads straight away where files cannot be shared', async () => {
    const share = vi.fn()
    const download = vi.fn()
    const result = await saveBackup(testKit(), { now: NOW, store: memory(), canShare: () => false, share, download })
    expect(result.status).toBe('downloaded')
    expect(share).not.toHaveBeenCalled()
    expect((download.mock.calls[0][0] as File).name).toBe('testkit-yedek-2026-09-29.json')
  })

  it('reports a failure without remembering a backup', async () => {
    const store = memory()
    const download = () => {
      throw new Error('blocked')
    }
    expect(await saveBackup(testKit(), { now: NOW, store, canShare: () => false, download })).toEqual({ status: 'failed' })
    expect(readBackupState('testkit', store).lastBackupAt).toBeUndefined()
  })
})

describe('restoreBackup', () => {
  const backup = { exportedAt: '2026-08-26T18:40:00.000Z', data: { notes: [{ id: 'a', text: 'Bir' }] } }

  it('counts the backup as the latest one when it is newer than the last', async () => {
    const store = memory()
    const outcome = await restoreBackup(backup as never, testKit(), 'merge', store)
    expect(outcome).toEqual({ ok: true, counts: [{ key: 'notes', label: 'not', added: 1, updated: 0, total: 1 }] })
    expect(readBackupState('testkit', store).lastBackupAt).toBe('2026-08-26T18:40:00.000Z')
  })

  it('keeps a later backup date, and reports a failed write', async () => {
    const store = memory()
    store.setItem('testkit-last-backup', '2026-09-20T10:00:00.000Z')
    await restoreBackup(backup as never, testKit(), 'merge', store)
    expect(readBackupState('testkit', store).lastBackupAt).toBe('2026-09-20T10:00:00.000Z')

    const failing = { ...testKit(), restore: () => Promise.reject(new Error('quota')) }
    expect(await restoreBackup(backup as never, failing, 'replace', store)).toEqual({ ok: false })
  })
})
