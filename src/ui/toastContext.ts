import { createContext, useContext } from 'react'

/** The one thing a notice offers to do, e.g. "Aç" after a book is added. */
export interface ToastAction {
  label: string
  to: string // an address, e.g. "#/book/abc"
}

export interface ToastItem {
  id: number
  message: string
  action?: ToastAction
  dismiss: () => void
}

export interface ToastApi {
  /** Returns the way to take the notice down before its time, e.g. once what it says is stale. */
  show(message: string, options?: { duration?: number; action?: ToastAction }): () => void
  toasts: ToastItem[]
}

export const ToastContext = createContext<ToastApi>({ show: () => () => undefined, toasts: [] })

/** Shows a short notice for 4 seconds, or as long as `duration` says; needs a ToastProvider above. */
export function useToast(): ToastApi['show'] {
  return useContext(ToastContext).show
}
