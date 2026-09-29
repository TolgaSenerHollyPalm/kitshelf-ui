/** The kit's colours: the phone's own light or dark setting, or always one of them. */
export type Appearance = 'system' | 'light' | 'dark'

export interface AppearanceSettings {
  key: string // localStorage key; the kit's inline script in index.html reads the same one before the first paint
  themeColors: { light: string; dark: string } // the page colour of each scheme, for the browser's bars
}

const SYSTEM_DARK = '(prefers-color-scheme: dark)'

let settings: AppearanceSettings | undefined
let current: Appearance = 'system'

export function parseAppearance(stored: string | null): Appearance {
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

export function resolveScheme(appearance: Appearance, systemDark: boolean): 'light' | 'dark' {
  if (appearance !== 'system') return appearance
  return systemDark ? 'dark' : 'light'
}

export function currentAppearance(): Appearance {
  return current
}

function apply(appearance: Appearance) {
  current = appearance
  const scheme = resolveScheme(appearance, matchMedia(SYSTEM_DARK).matches)
  document.documentElement.dataset.scheme = scheme
  if (!settings) return
  const colors = settings.themeColors
  // Each theme-color tag answers to its own media query, so a fixed choice has to overwrite both.
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = colors[appearance === 'system' ? (meta.media.includes('dark') ? 'dark' : 'light') : scheme]
  }
}

export function saveAppearance(appearance: Appearance) {
  try {
    if (settings && appearance === 'system') localStorage.removeItem(settings.key)
    else if (settings) localStorage.setItem(settings.key, appearance)
  } catch {
    // Storage blocked: the choice still holds until the app is closed.
  }
  apply(appearance)
}

/** Call once at start-up: applies the saved choice and, while the phone decides, follows the phone's changes. */
export function watchAppearance(options: AppearanceSettings) {
  settings = options
  let stored = null
  try {
    stored = localStorage.getItem(options.key)
  } catch {
    // Storage blocked: follow the phone.
  }
  apply(parseAppearance(stored))
  matchMedia(SYSTEM_DARK).addEventListener('change', () => apply(current))
}
