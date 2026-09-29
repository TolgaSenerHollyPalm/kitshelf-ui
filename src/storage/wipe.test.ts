import { afterEach, describe, expect, it, vi } from 'vitest'
import { wipeDevice } from './wipe.ts'

afterEach(() => vi.unstubAllGlobals())

// deleteDatabase answers later, through the handler the caller sets on the request.
const fakeIndexedDB = (steps: string[]) => ({
  deleteDatabase(name: string) {
    steps.push(`delete ${name}`)
    const request: { onsuccess?: () => void } = {}
    queueMicrotask(() => request.onsuccess?.())
    return request
  },
})

describe('wipeDevice', () => {
  it("closes the kit's connection first, then removes only its own databases and keys", async () => {
    const steps: string[] = []
    vi.stubGlobal('indexedDB', fakeIndexedDB(steps))
    vi.stubGlobal('localStorage', { removeItem: (key: string) => steps.push(`remove ${key}`) })
    await wipeDevice({
      databaseNames: ['quiz-trip'],
      ownKeys: ['tripkit-appearance', 'offline-ready-shown'],
      beforeDelete: () => {
        steps.push('close')
      },
      appShell: false,
    })
    expect(steps).toEqual(['close', 'delete quiz-trip', 'remove tripkit-appearance', 'remove offline-ready-shown'])
  })

  it('drops the offline copy only within its own scope, and only when asked', async () => {
    const dropped: string[] = []
    vi.stubGlobal('indexedDB', fakeIndexedDB([]))
    vi.stubGlobal('localStorage', { removeItem: () => undefined })
    vi.stubGlobal('caches', {
      keys: async () => ['workbox-precache-v2-https://trip.test/app/', 'workbox-precache-v2-https://trip.test/other/'],
      delete: async (name: string) => dropped.push(name),
    })
    const worker = (scope: string) => ({ scope, unregister: async () => dropped.push(`worker ${scope}`) })
    vi.stubGlobal('navigator', {
      serviceWorker: { getRegistrations: async () => [worker('https://trip.test/app/'), worker('https://trip.test/other/')] },
    })

    await wipeDevice({ databaseNames: [], ownKeys: [], appShell: false, scope: '/app/' })
    expect(dropped).toEqual([])

    await wipeDevice({ databaseNames: [], ownKeys: [], appShell: true, scope: '/app/' })
    expect(dropped).toEqual(['workbox-precache-v2-https://trip.test/app/', 'worker https://trip.test/app/'])
  })
})
