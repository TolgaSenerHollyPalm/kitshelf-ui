import { describe, expect, it } from 'vitest'
import { snoozeReminder, trackDataSince, backupKeyList, readBackupState, type KeyValueStore } from './state.ts'
import { bannerTitle, exportedAtText, lastBackupText, readErrorMessage, restoreMessage, saveMessage, wipeWarning } from './texts.ts'

const NOW = new Date(2026, 8, 29, 9, 30)
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString()

describe('lastBackupText', () => {
  it('counts calendar days on the phone, not 24-hour stretches', () => {
    expect(lastBackupText(undefined, NOW)).toBe('Henüz yedek almadın')
    expect(lastBackupText(at(2026, 9, 29, 0), NOW)).toBe('Bugün · 29\u00a0Eylül')
    expect(lastBackupText(at(2026, 9, 28, 23), NOW)).toBe('Dün · 28\u00a0Eylül')
    expect(lastBackupText(at(2026, 8, 26, 21), NOW)).toBe('34 gün önce · 26\u00a0Ağustos')
    expect(lastBackupText(at(2025, 8, 26), NOW)).toBe('399 gün önce · 26\u00a0Ağustos\u00a02025')
  })
})

describe('bannerTitle', () => {
  it('says whether there was never a backup or how old the last one is', () => {
    expect(bannerTitle({ due: true, showBanner: true, reason: 'never' }, undefined, NOW)).toBe('Henüz yedeğin yok')
    expect(bannerTitle({ due: true, showBanner: true, reason: 'old' }, at(2026, 8, 26), NOW)).toBe('Son yedeğin 34 gün önce')
  })
})

describe('messages', () => {
  it('reports saving', () => {
    expect(saveMessage({ status: 'shared', fileName: 'x.json' })).toBe('Yedek gönderildi.')
    expect(saveMessage({ status: 'downloaded', fileName: 'tripkit-yedek-2026-09-29.json' })).toBe(
      "Yedek indirildi: tripkit-yedek-2026-09-29.json. İndirilenler'den Drive'a ya da e-postana gönderebilirsin.",
    )
    expect(saveMessage({ status: 'failed' })).toBe('Yedek kaydedilemedi. Tekrar dene.')
    expect(saveMessage({ status: 'cancelled' })).toBeUndefined()
  })

  it('reports a merge without its zero parts, and a replace by totals', () => {
    const counts = [
      { key: 'trips', label: 'seyahat', added: 2, updated: 1, total: 5 },
      { key: 'packs', label: 'soru paketi', added: 0, updated: 1, total: 2 },
    ]
    expect(restoreMessage(counts, 'merge')).toBe('Geri yüklendi: 2 seyahat eklendi, 1 seyahat güncellendi, 1 soru paketi güncellendi.')
    expect(restoreMessage(counts.map((c) => ({ ...c, added: 0, updated: 0 })), 'merge')).toBe('Yedekteki her şey bu cihazda zaten var.')
    expect(restoreMessage(counts, 'replace')).toBe('Geri yüklendi: 5 seyahat, 2 soru paketi.')
  })

  it("names the kits in a reading error", () => {
    expect(readErrorMessage('other-kit', 'TripKit', 'BookKit')).toBe('Bu bir BookKit yedeği. TripKit\'e yalnızca TripKit yedekleri yüklenebilir.')
    expect(readErrorMessage('too-new', 'TripKit')).toBe(
      "Bu yedek TripKit'in daha yeni bir sürümüyle alınmış. Önce uygulamayı güncelle, sonra tekrar dene.",
    )
    expect(readErrorMessage('not-backup', 'TripKit')).toBe('Bu dosya bir KitShelf yedeği değil.')
  })

  it('warns what deleting loses', () => {
    expect(wipeWarning(undefined, NOW)).toBe('Yedeğin yok; silinenler geri gelmez.')
    expect(wipeWarning(at(2026, 8, 26), NOW)).toBe('Son yedeğin 26\u00a0Ağustos; ondan sonraki değişiklikler geri gelmez.')
  })

  it('shows when a backup was taken', () => {
    expect(exportedAtText(new Date(2026, 7, 26, 21, 40).toISOString())).toBe('26 Ağustos 2026, 21:40')
  })
})

describe('reminder state', () => {
  const memory = (): KeyValueStore => {
    const map = new Map<string, string>()
    return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) }
  }

  it('starts the clock when data appears, keeps it, and drops it when the data is gone', () => {
    const store = memory()
    expect(trackDataSince('tripkit', true, NOW, store)).toBe(NOW.toISOString())
    expect(trackDataSince('tripkit', true, new Date(2026, 9, 5), store)).toBe(NOW.toISOString())
    expect(trackDataSince('tripkit', false, new Date(2026, 9, 6), store)).toBeUndefined()
    expect(readBackupState('tripkit', store).dataSince).toBeUndefined()
  })

  it('snoozes for seven days and lists the keys a wipe has to remove', () => {
    const store = memory()
    snoozeReminder('tripkit', new Date('2026-09-29T10:00:00.000Z'), store)
    expect(readBackupState('tripkit', store).snoozedUntil).toBe('2026-10-06T10:00:00.000Z')
    expect(backupKeyList('tripkit')).toEqual(['tripkit-last-backup', 'tripkit-data-since', 'tripkit-backup-snoozed-until'])
  })
})
