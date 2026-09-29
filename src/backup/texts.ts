import type { BackupError, RestoreCount, RestoreMode } from './format.ts'
import type { Reminder } from './reminder.ts'
import type { SaveResult } from './save.ts'

/** Local calendar days between two moments: 0 for today, 1 for yesterday; a clock running behind gives 0. */
export function calendarDaysAgo(then: Date, now: Date): number {
  const midnight = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  return Math.max(0, Math.round((midnight(now) - midnight(then)) / (24 * 60 * 60 * 1000)))
}

/** "26 Ağustos", or "26 Ağustos 2025" in another year. */
export function dayMonth(date: Date, now = new Date()): string {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  })
}

function ago(then: Date, now: Date): string {
  const days = calendarDaysAgo(then, now)
  return days === 0 ? 'Bugün' : days === 1 ? 'Dün' : `${days} gün önce`
}

/** The value on the "Son yedek" row. */
export function lastBackupText(lastBackupAt: string | undefined, now = new Date()): string {
  if (!lastBackupAt) return 'Henüz yedek almadın'
  const then = new Date(lastBackupAt)
  return `${ago(then, now)} · ${dayMonth(then, now)}`
}

export function bannerTitle(reminder: Reminder, lastBackupAt: string | undefined, now = new Date()): string {
  if (reminder.reason === 'never' || !lastBackupAt) return 'Henüz yedeğin yok'
  return `Son yedeğin ${ago(new Date(lastBackupAt), now).toLocaleLowerCase('tr')}`
}

/** "26 Ağustos 2026, 21:40" on the restore sheet's file card. */
export function exportedAtText(exportedAt: string): string {
  const date = new Date(exportedAt)
  const day = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${day}, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
}

export function saveMessage(result: SaveResult): string | undefined {
  switch (result.status) {
    case 'shared':
      return 'Yedek gönderildi.'
    case 'downloaded':
      return `Yedek indirildi: ${result.fileName}. İndirilenler'den Drive'a ya da e-postana gönderebilirsin.`
    case 'failed':
      return 'Yedek kaydedilemedi. Tekrar dene.'
    case 'cancelled':
      return undefined
  }
}

export function restoreMessage(counts: RestoreCount[], mode: RestoreMode): string {
  if (mode === 'replace') return `Geri yüklendi: ${counts.map((c) => `${c.total} ${c.label}`).join(', ')}.`
  const parts = counts.flatMap((c) => [
    ...(c.added > 0 ? [`${c.added} ${c.label} eklendi`] : []),
    ...(c.updated > 0 ? [`${c.updated} ${c.label} güncellendi`] : []),
  ])
  return parts.length === 0 ? 'Yedekteki her şey bu cihazda zaten var.' : `Geri yüklendi: ${parts.join(', ')}.`
}

// Every kit name ends in "Kit", so the Turkish endings are always the same.
export function readErrorMessage(error: BackupError, kitName: string, otherKitName?: string): string {
  switch (error) {
    case 'not-backup':
      return 'Bu dosya bir KitShelf yedeği değil.'
    case 'other-kit':
      return `Bu bir ${otherKitName ?? 'başka kit'} yedeği. ${kitName}'e yalnızca ${kitName} yedekleri yüklenebilir.`
    case 'too-new':
      return `Bu yedek ${kitName}'in daha yeni bir sürümüyle alınmış. Önce uygulamayı güncelle, sonra tekrar dene.`
    case 'damaged':
      return 'Yedek dosyası bozuk görünüyor. Hiçbir şey değiştirilmedi.'
  }
}

export const RESTORE_FAILED_MESSAGE = 'Geri yükleme tamamlanamadı. Hiçbir şey değiştirilmedi.'

/** The last sentence of the "delete everything" question. */
export function wipeWarning(lastBackupAt: string | undefined, now = new Date()): string {
  if (!lastBackupAt) return 'Yedeğin yok; silinenler geri gelmez.'
  return `Son yedeğin ${dayMonth(new Date(lastBackupAt), now)}; ondan sonraki değişiklikler geri gelmez.`
}
