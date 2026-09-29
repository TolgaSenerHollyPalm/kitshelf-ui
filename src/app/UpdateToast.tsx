import { Button } from '../ui/Button.tsx'
import toast from './toast.module.css'

interface UpdateToastProps {
  needRefresh: boolean // a new version is waiting; otherwise the app has just become usable offline
  onRefresh: () => void
  onClose: () => void
}

/** The service worker's news. The kit keeps the useRegisterSW call, which belongs to its own Vite plugin. */
export default function UpdateToast({ needRefresh, onRefresh, onClose }: UpdateToastProps) {
  return (
    <div className={toast.toast} role="status">
      <p>{needRefresh ? 'Güncelleme hazır.' : 'Uygulama artık internetsiz de çalışır.'}</p>
      <div className={toast.actions}>
        {needRefresh && (
          <Button variant="primary" onClick={onRefresh}>
            Yenile
          </Button>
        )}
        <Button onClick={onClose}>{needRefresh ? 'Sonra' : 'Tamam'}</Button>
      </div>
    </div>
  )
}
