export interface MergeResult<T> {
  items: T[] // the device's records in their order, replaced where the backup's is newer, then the new ones
  added: number
  updated: number
  unchanged: number // in both, the device's copy kept
}

/** The later `updatedAt` wins; a record without one counts as the oldest. */
export function newerByUpdatedAt(candidate: { updatedAt?: string }, current: { updatedAt?: string }): boolean {
  return (Date.parse(candidate.updatedAt ?? '') || 0) > (Date.parse(current.updatedAt ?? '') || 0)
}

/** Adds what the device lacks and keeps the newer of what both have; on a tie the device's copy stays. */
export function mergeById<T extends { id: string; updatedAt?: string }>(
  local: readonly T[],
  incoming: readonly T[],
  { newer = newerByUpdatedAt }: { newer?: (candidate: T, current: T) => boolean } = {},
): MergeResult<T> {
  const waiting = new Map(incoming.map((item) => [item.id, item]))
  let updated = 0
  let unchanged = 0
  const kept = local.map((item) => {
    const other = waiting.get(item.id)
    if (!other) return item
    waiting.delete(item.id)
    if (newer(other, item)) {
      updated += 1
      return other
    }
    unchanged += 1
    return item
  })
  const added = [...waiting.values()]
  return { items: [...kept, ...added], added: added.length, updated, unchanged }
}
