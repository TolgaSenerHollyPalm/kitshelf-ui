import { useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import toast from '../app/toast.module.css'
import { ToastContext, type ToastApi, type ToastItem } from './toastContext.ts'

const DEFAULT_MS = 4000

/** Keeps the short notices of every screen below it; `Toasts` shows them. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const show = useCallback<ToastApi['show']>((message, { duration = DEFAULT_MS, action } = {}) => {
    const id = nextId.current++
    const dismiss = () => {
      clearTimeout(timer)
      timers.current.delete(timer)
      setToasts((list) => list.filter((item) => item.id !== id))
    }
    const timer = setTimeout(dismiss, duration)
    timers.current.add(timer)
    setToasts((list) => [...list, action ? { id, message, action, dismiss } : { id, message, dismiss }])
    return dismiss
  }, [])

  const api = useMemo(() => ({ show, toasts }), [show, toasts])
  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>
}

/** Where the notices appear: inside the kit's toast stack, beside the update and connection notices. */
export function Toasts() {
  const { toasts } = useContext(ToastContext)
  return toasts.map((item) => (
    <div key={item.id} className={item.action ? `${toast.toast} ${toast.withAction}` : toast.toast} role="status">
      <p>{item.message}</p>
      {/* Following the link is the notice's whole purpose, so it leaves with the tap. */}
      {item.action && (
        <a className={toast.action} href={item.action.to} onClick={item.dismiss}>
          {item.action.label}
        </a>
      )}
    </div>
  ))
}
