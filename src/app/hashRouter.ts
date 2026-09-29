import { useSyncExternalStore } from 'react'

// Addresses live in the URL hash, so GitHub Pages only ever serves index.html.
function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** The current address, e.g. "#/settings"; the caller re-renders when it changes. */
export function useHash(): string {
  return useSyncExternalStore(subscribe, () => location.hash)
}

/** Goes to an address. `replace` swaps the current history entry, so the back button skips it. */
export function go(href: string, { replace = false } = {}): void {
  if (replace) location.replace(href)
  else location.hash = href
}
