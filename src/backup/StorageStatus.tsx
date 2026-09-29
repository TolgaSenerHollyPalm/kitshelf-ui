import { useEffect, useState } from 'react'
import { AlertIcon, CheckIcon } from '../ui/icons.tsx'
import styles from './StorageStatus.module.css'
import { storageStatus, type StorageStatusValue } from './storageStatus.ts'

/** The first row of the "Bu cihazda" card; nothing at all where the browser cannot tell. */
export default function StorageStatus() {
  const [status, setStatus] = useState<StorageStatusValue>('unknown')

  useEffect(() => {
    let active = true
    void storageStatus().then((value) => {
      if (active) setStatus(value)
    })
    return () => {
      active = false
    }
  }, [])

  if (status === 'unknown') return null
  const kept = status === 'granted'
  return (
    <div className={styles.row}>
      <span className={kept ? `${styles.icon} ${styles.kept}` : `${styles.icon} ${styles.atRisk}`}>
        {kept ? <CheckIcon size={14} strokeWidth={3} /> : <AlertIcon />}
      </span>
      <span className={styles.lines}>
        <strong className={styles.title}>{kept ? 'Kalıcı depolama açık' : 'Kalıcı depolama kapalı'}</strong>
        <span className={styles.text}>
          {kept
            ? 'Tarayıcı yer açmak için bu verileri kendiliğinden silmez.'
            : 'Telefonda yer azalırsa tarayıcı bu verileri silebilir. Düzenli yedek al.'}
        </span>
      </span>
    </div>
  )
}
