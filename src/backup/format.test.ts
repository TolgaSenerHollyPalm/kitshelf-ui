import { describe, expect, it } from 'vitest'
import { backupFileName, createBackup, readBackup } from './format.ts'
import { testKit } from './testKit.ts'

const NOW = new Date('2026-09-29T18:40:00.000Z')
const envelope = (fields: Record<string, unknown>) => ({
  format: 'kitshelf-backup',
  formatVersion: 1,
  kit: 'testkit',
  kitName: 'TestKit',
  dataVersion: 2,
  exportedAt: '2026-08-26T18:40:00.000Z',
  appBuild: '2026-08-20T09:12:00.000Z',
  summary: { notes: 99 },
  data: { notes: [{ id: 'a', text: 'Bir' }] },
  ...fields,
})
const file = (content: unknown, name = 'testkit-yedek-2026-08-26.json') =>
  new File([typeof content === 'string' ? content : JSON.stringify(content)], name, { type: 'application/json' })

describe('createBackup', () => {
  it('wraps the data with what a reader needs to know about it', () => {
    expect(createBackup(testKit(), NOW)).toEqual({
      format: 'kitshelf-backup',
      formatVersion: 1,
      kit: 'testkit',
      kitName: 'TestKit',
      dataVersion: 2,
      exportedAt: '2026-09-29T18:40:00.000Z',
      appBuild: '2026-09-01T09:00:00.000Z',
      summary: { notes: 1, photos: 0 },
      data: { notes: [{ id: 'a', text: 'Bir' }] },
    })
  })
})

describe('backupFileName', () => {
  it("uses the phone's own date, also right around midnight", () => {
    expect(backupFileName('tripkit', new Date(2026, 8, 29, 23, 59, 59))).toBe('tripkit-yedek-2026-09-29.json')
    expect(backupFileName('tripkit', new Date(2026, 8, 30, 0, 0, 1))).toBe('tripkit-yedek-2026-09-30.json')
    expect(backupFileName('bookkit', new Date(2027, 0, 5, 12))).toBe('bookkit-yedek-2027-01-05.json')
  })
})

describe('readBackup', () => {
  it('accepts its own backup and previews it from the data, not from the summary', async () => {
    const result = await readBackup(file(envelope({})), testKit())
    expect(result).toMatchObject({
      ok: true,
      backup: { kit: 'testkit', dataVersion: 2, exportedAt: '2026-08-26T18:40:00.000Z', data: { notes: [{ id: 'a' }] } },
      preview: {
        fileName: 'testkit-yedek-2026-08-26.json',
        exportedAt: '2026-08-26T18:40:00.000Z',
        counts: [{ key: 'notes', count: 1, label: 'not' }],
      },
    })
  })

  it('brings an older data version up to date first', async () => {
    const result = await readBackup(file(envelope({ dataVersion: 1, data: { items: [{ id: 'x', text: 'Eski' }] } })), testKit())
    expect(result).toMatchObject({ ok: true, backup: { dataVersion: 2, data: { notes: [{ id: 'x', text: 'Eski' }] } } })
  })

  it('turns away what is not a KitShelf backup at all', async () => {
    for (const content of ['not json', '[1, 2]', { format: 'something-else' }, JSON.stringify({ trips: [] })]) {
      expect(await readBackup(file(content), testKit())).toEqual({ ok: false, error: 'not-backup' })
    }
  })

  it('turns away a file over 20 MB before reading it', async () => {
    const big = new File([new Uint8Array(20 * 1024 * 1024 + 1)], 'big.json')
    expect(await readBackup(big, testKit())).toEqual({ ok: false, error: 'not-backup' })
  })

  it("names the other kit, and checks the kit before the versions", async () => {
    const other = envelope({ kit: 'bookkit', kitName: 'BookKit', dataVersion: 99 })
    expect(await readBackup(file(other), testKit())).toEqual({ ok: false, error: 'other-kit', kitName: 'BookKit' })
  })

  it('asks for an update when the envelope or the data is newer than this app', async () => {
    expect(await readBackup(file(envelope({ formatVersion: 2 })), testKit())).toEqual({ ok: false, error: 'too-new' })
    expect(await readBackup(file(envelope({ dataVersion: 99 })), testKit())).toEqual({ ok: false, error: 'too-new' })
  })

  it('rejects the whole file when a single record or a field is broken', async () => {
    const broken = [
      envelope({ data: { notes: [{ id: 'a', text: 'Bir' }, { id: 'b' }] } }), // a note without text
      envelope({ data: { notes: [{ id: 'a', text: 'Bir' }, { id: 'a', text: 'İki' }] } }), // the same id twice
      envelope({ exportedAt: 'yesterday' }),
      envelope({ dataVersion: 0 }),
      envelope({ kit: 7 }),
      envelope({ dataVersion: 1, data: { notes: [] } }), // version 1 has items, so its migration finds none
    ]
    for (const content of broken) {
      expect(await readBackup(file(content), testKit())).toEqual({ ok: false, error: 'damaged' })
    }
  })
})
