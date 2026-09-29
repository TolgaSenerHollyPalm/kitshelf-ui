export interface WipeOptions {
  databaseNames: string[] // the kit's IndexedDB databases
  ownKeys: string[] // the kit's localStorage keys only: another app on the origin keeps its own
  beforeDelete?: () => void | Promise<void> // closes the kit's open connection, which would block the deletion
  appShell?: boolean // also drop the offline copy; by default only online, so the app can still open afterwards
  scope?: string // the app's base path, e.g. import.meta.env.BASE_URL; caches and workers outside it stay
}

/** Removes everything the kit keeps on the device; the offline copy too when `appShell` is on. */
export async function wipeDevice({
  databaseNames,
  ownKeys,
  beforeDelete,
  appShell = navigator.onLine,
  scope = '/',
}: WipeOptions): Promise<void> {
  await beforeDelete?.()
  for (const name of databaseNames) {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(name)
      // Blocked means another tab still holds it; that tab's copy goes as soon as it lets go.
      request.onsuccess = request.onerror = request.onblocked = () => resolve()
    })
  }

  for (const key of ownKeys) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Storage blocked; there was nothing we could have written either.
    }
  }

  if (!appShell) return
  try {
    const names = await caches.keys()
    await Promise.all(names.filter((name) => name.includes(scope)).map((name) => caches.delete(name)))
  } catch {
    // No cache storage; nothing to clear.
  }
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(
      registrations.filter((registration) => registration.scope.includes(scope)).map((r) => r.unregister()),
    )
  } catch {
    // No service worker; nothing to unregister.
  }
}
