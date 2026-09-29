import { describe, expect, it } from 'vitest'
import { backupDue } from './reminder.ts'

const START = Date.parse('2026-09-01T12:00:00.000Z')
const day = (n: number, hours = 0) => new Date(START + n * 24 * 3600_000 + hours * 3600_000)
const iso = (n: number, hours = 0) => day(n, hours).toISOString()

describe('backupDue', () => {
  it.each([
    ['no backup yet, 6 days of data', { now: day(6), dataSince: iso(0) }, false, false],
    ['no backup yet, one hour short of 7 days', { now: day(7, -1), dataSince: iso(0) }, false, false],
    ['no backup yet, 7 days of data', { now: day(7), dataSince: iso(0) }, true, true],
    ['backup 29 days old, changed since', { now: day(29), lastBackupAt: iso(0), lastChangeAt: iso(10) }, false, false],
    ['backup 30 days old, changed since', { now: day(30), lastBackupAt: iso(0), lastChangeAt: iso(10) }, true, true],
    ['backup 60 days old, nothing changed since', { now: day(60), lastBackupAt: iso(0), lastChangeAt: iso(-3) }, false, false],
    ['backup 60 days old, no change recorded', { now: day(60), lastBackupAt: iso(0) }, false, false],
    ['due but snoozed', { now: day(8), dataSince: iso(0), snoozedUntil: iso(9) }, true, false],
    ['due and the snooze is over', { now: day(9), dataSince: iso(0), snoozedUntil: iso(9) }, true, true],
  ])('%s', (_, input, due, showBanner) => {
    expect(backupDue({ hasUserData: true, ...input })).toMatchObject({ due, showBanner })
  })

  it('never nags a device without user data', () => {
    expect(backupDue({ now: day(90), hasUserData: false, dataSince: iso(0) })).toMatchObject({ due: false, showBanner: false })
  })

  it('says why', () => {
    expect(backupDue({ now: day(7), hasUserData: true, dataSince: iso(0) }).reason).toBe('never')
    expect(backupDue({ now: day(30), hasUserData: true, lastBackupAt: iso(0), lastChangeAt: iso(1) }).reason).toBe('old')
  })
})
