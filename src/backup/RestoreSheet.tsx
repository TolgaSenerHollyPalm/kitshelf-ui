import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../ui/Button.tsx'
import Chip from '../ui/Chip.tsx'
import ConfirmDialog from '../ui/ConfirmDialog.tsx'
import { FileIcon } from '../ui/icons.tsx'
import type { BackupPreview, RestoreMode } from './format.ts'
import styles from './RestoreSheet.module.css'
import { exportedAtText } from './texts.ts'

interface RestoreSheetProps {
  open: boolean
  preview?: BackupPreview
  mergeText: string // the kit's words for what merging does
  replaceText: string // and for what replacing does
  replaceWarning?: { title: string; text: string } // asked first when replacing would delete data on this device
  busy?: boolean
  onRestore: (mode: RestoreMode) => void
  onCancel: () => void
}

/** Slides up once a backup file is picked; nothing is written before "Geri yükle". */
export default function RestoreSheet(props: RestoreSheetProps) {
  const { open, busy, onCancel } = props
  const sheet = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const element = sheet.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={sheet}
      className={styles.sheet}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape or the Android back gesture: React state decides, and a running restore is not interrupted.
        event.preventDefault()
        if (!busy) onCancel()
      }}
    >
      {/* Remounted on every opening, so each file starts on the recommended choice. */}
      <SheetContent key={open ? 'open' : 'closed'} {...props} titleId={titleId} />
    </dialog>
  )
}

function SheetContent({ preview, mergeText, replaceText, replaceWarning, busy, onRestore, onCancel, titleId }: RestoreSheetProps & { titleId: string }) {
  const group = useId()
  const [mode, setMode] = useState<RestoreMode>('merge')
  const [confirming, setConfirming] = useState(false)

  const restore = () => {
    if (mode === 'replace' && replaceWarning) setConfirming(true)
    else onRestore(mode)
  }

  const option = (value: RestoreMode, title: string, text: string, recommended = false) => (
    <label className={mode === value ? `${styles.option} ${styles.chosen}` : styles.option}>
      <input type="radio" name={group} checked={mode === value} onChange={() => setMode(value)} disabled={busy} />
      <span className={styles.lines}>
        <span className={styles.optionTitle}>
          {title}
          {recommended && <span className={styles.recommended}>Önerilen</span>}
        </span>
        <span className={styles.optionText}>{text}</span>
      </span>
    </label>
  )

  return (
    <>
      <span className={styles.handle} aria-hidden="true" />
      <h2 id={titleId} className={styles.title}>
        Yedekten geri yükle
      </h2>
      {preview && (
        <div className={styles.file}>
          <div className={styles.fileRow}>
            <span className={styles.fileTile}>
              <FileIcon />
            </span>
            <span className={styles.lines}>
              <span className={styles.fileName}>{preview.fileName}</span>
              <span className={styles.fileDate}>{exportedAtText(preview.exportedAt)}</span>
            </span>
          </div>
          {preview.counts.length > 0 && (
            <div className={styles.counts}>
              {preview.counts.map((line) => (
                <Chip key={line.key}>
                  {line.count} {line.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}
      <fieldset className={styles.options}>
        <legend className={styles.legend}>Nasıl yüklensin?</legend>
        {option('merge', 'Birleştir', mergeText, true)}
        {option('replace', 'Değiştir', replaceText)}
      </fieldset>
      <div className={styles.actions}>
        <Button variant="primary" disabled={busy} onClick={restore}>
          {busy ? 'Yükleniyor…' : 'Geri yükle'}
        </Button>
        <Button variant="text" disabled={busy} onClick={onCancel}>
          Vazgeç
        </Button>
      </div>
      {replaceWarning && (
        <ConfirmDialog
          open={confirming}
          title={replaceWarning.title}
          confirmLabel="Evet, değiştir"
          onConfirm={() => {
            setConfirming(false)
            onRestore('replace')
          }}
          onCancel={() => setConfirming(false)}
        >
          {replaceWarning.text}
        </ConfirmDialog>
      )}
    </>
  )
}
