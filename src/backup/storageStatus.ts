export type StorageStatusValue = 'granted' | 'not-granted' | 'unknown'

/** Whether the browser promised to keep the kit's data when space runs low; 'unknown' where it cannot say. */
export async function storageStatus(): Promise<StorageStatusValue> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persisted) return 'unknown'
    return (await navigator.storage.persisted()) ? 'granted' : 'not-granted'
  } catch {
    return 'unknown'
  }
}
