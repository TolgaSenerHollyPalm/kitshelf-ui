import type { BackupAdapter } from './format.ts'

/** A pretend kit for the backup tests: notes in data version 2, `items` instead of `notes` in version 1. */
export interface Note {
  id: string
  text: string
  updatedAt?: string
}

export interface NotesData {
  notes: Note[]
}

const isNote = (value: unknown): value is Note =>
  typeof value === 'object' && value !== null && typeof (value as Note).id === 'string' && typeof (value as Note).text === 'string'

export function testKit(notes: Note[] = [{ id: 'a', text: 'Bir' }]): BackupAdapter<NotesData> {
  return {
    kit: 'testkit',
    kitName: 'TestKit',
    dataVersion: 2,
    appBuild: '2026-09-01T09:00:00.000Z',
    exportData: () => ({ notes }),
    summarize: (data) => [
      { key: 'notes', count: data.notes.length, label: 'not' },
      { key: 'photos', count: 0, label: 'fotoğraf' },
    ],
    migrate(data, from) {
      if (from === 1) return { notes: (data as { items: Note[] }).items }
      if (from === 2) return data
      throw new Error(`No migration from ${from}`)
    },
    validate(data): data is NotesData {
      if (typeof data !== 'object' || data === null || !Array.isArray((data as NotesData).notes)) return false
      const list = (data as NotesData).notes
      return list.every(isNote) && new Set(list.map((note) => note.id)).size === list.length
    },
    restore: async (data) => [{ key: 'notes', label: 'not', added: data.notes.length, updated: 0, total: data.notes.length }],
    lastChangeAt: () => undefined,
    hasUserData: () => notes.length > 0,
  }
}
