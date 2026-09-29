import { describe, expect, it } from 'vitest'
import { mergeById } from './merge.ts'

const note = (id: string, updatedAt?: string, text = id) => ({ id, text, ...(updatedAt && { updatedAt }) })

describe('mergeById', () => {
  it('adds what the device lacks, after its own records', () => {
    const result = mergeById([note('a', '2026-09-01T10:00:00Z')], [note('b', '2026-08-01T10:00:00Z')])
    expect(result).toEqual({ items: [note('a', '2026-09-01T10:00:00Z'), note('b', '2026-08-01T10:00:00Z')], added: 1, updated: 0, unchanged: 0 })
  })

  it("keeps the newer copy where both have the record, in the device's order", () => {
    const local = [note('a', '2026-09-01T10:00:00Z', 'old a'), note('b', '2026-09-20T10:00:00Z', 'new b')]
    const incoming = [note('b', '2026-09-10T10:00:00Z', 'old b'), note('a', '2026-09-05T10:00:00Z', 'new a')]
    const result = mergeById(local, incoming)
    expect(result.items.map((item) => item.text)).toEqual(['new a', 'new b'])
    expect(result).toMatchObject({ added: 0, updated: 1, unchanged: 1 })
  })

  it("keeps the device's copy on a tie", () => {
    const result = mergeById([note('a', '2026-09-01T10:00:00Z', 'here')], [note('a', '2026-09-01T10:00:00Z', 'there')])
    expect(result).toMatchObject({ items: [{ text: 'here' }], updated: 0, unchanged: 1 })
  })

  it('counts a record without updatedAt as the oldest', () => {
    expect(mergeById([note('a', undefined, 'here')], [note('a', '2026-01-01T00:00:00Z', 'there')]).items[0].text).toBe('there')
    expect(mergeById([note('a', '2026-01-01T00:00:00Z', 'here')], [note('a', undefined, 'there')]).items[0].text).toBe('here')
    expect(mergeById([note('a', undefined, 'here')], [note('a', undefined, 'there')]).items[0].text).toBe('here')
  })

  it('lets the kit decide what newer means, e.g. a higher pack version', () => {
    const pack = (id: string, version: number) => ({ id, version })
    const result = mergeById([pack('eg', 4), pack('tr', 3)], [pack('eg', 5), pack('tr', 2)], {
      newer: (candidate, current) => candidate.version > current.version,
    })
    expect(result).toEqual({ items: [pack('eg', 5), pack('tr', 3)], added: 0, updated: 1, unchanged: 1 })
  })
})
