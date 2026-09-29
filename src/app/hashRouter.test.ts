import { afterEach, describe, expect, it, vi } from 'vitest'
import { go } from './hashRouter.ts'

afterEach(() => vi.unstubAllGlobals())

describe('go', () => {
  it('sets the hash, or swaps the history entry when asked to replace it', () => {
    const location = { hash: '', replace: vi.fn() }
    vi.stubGlobal('location', location)
    go('#/settings')
    expect(location.hash).toBe('#/settings')
    go('#/', { replace: true })
    expect(location.replace).toHaveBeenCalledWith('#/')
    expect(location.hash).toBe('#/settings')
  })
})
