import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseAppearance, resolveScheme, saveAppearance, watchAppearance } from './appearance.ts'

afterEach(() => vi.unstubAllGlobals())

describe('parseAppearance', () => {
  it('keeps a fixed choice and follows the phone otherwise', () => {
    expect(parseAppearance('light')).toBe('light')
    expect(parseAppearance('dark')).toBe('dark')
    expect(parseAppearance(null)).toBe('system')
    expect(parseAppearance('sepia')).toBe('system')
  })
})

describe('resolveScheme', () => {
  it('uses the phone setting only when asked to', () => {
    expect(resolveScheme('system', true)).toBe('dark')
    expect(resolveScheme('system', false)).toBe('light')
    expect(resolveScheme('light', true)).toBe('light')
    expect(resolveScheme('dark', false)).toBe('dark')
  })
})

describe('watchAppearance and saveAppearance', () => {
  it("keep a fixed choice under the kit's key and set the page and the browser bars to it", () => {
    const stored = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
      removeItem: (key: string) => stored.delete(key),
    })
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => undefined }))
    const metas = [
      { media: '(prefers-color-scheme: light)', content: '' },
      { media: '(prefers-color-scheme: dark)', content: '' },
    ]
    const root = { dataset: {} as Record<string, string> }
    vi.stubGlobal('document', { documentElement: root, querySelectorAll: () => metas })

    watchAppearance({ key: 'bookkit-appearance', themeColors: { light: '#f7f5f0', dark: '#111615' } })
    expect(root.dataset.scheme).toBe('light')
    expect(metas.map((meta) => meta.content)).toEqual(['#f7f5f0', '#111615'])

    saveAppearance('dark')
    expect(stored.get('bookkit-appearance')).toBe('dark')
    expect(root.dataset.scheme).toBe('dark')
    expect(metas.map((meta) => meta.content)).toEqual(['#111615', '#111615'])

    saveAppearance('system')
    expect(stored.has('bookkit-appearance')).toBe(false)
    expect(root.dataset.scheme).toBe('light')
    expect(metas.map((meta) => meta.content)).toEqual(['#f7f5f0', '#111615'])
  })
})
