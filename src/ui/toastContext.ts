import { createContext, useContext } from 'react'

export interface ToastItem {
  id: number
  message: string
}

export interface ToastApi {
  show(message: string, options?: { duration?: number }): void
  toasts: ToastItem[]
}

export const ToastContext = createContext<ToastApi>({ show: () => undefined, toasts: [] })

/** Shows a short notice for 4 seconds, or as long as `duration` says; needs a ToastProvider above. */
export function useToast(): ToastApi['show'] {
  return useContext(ToastContext).show
}
