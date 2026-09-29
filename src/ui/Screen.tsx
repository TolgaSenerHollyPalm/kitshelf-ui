import type { ReactNode } from 'react'
import { IconLink } from './IconButton.tsx'
import { BackIcon } from './icons.tsx'
import styles from './Screen.module.css'

interface ScreenProps {
  title: string
  eyebrow?: ReactNode // a short line right over the title, e.g. a count
  subtitle?: ReactNode // the quiet line under the title
  above?: ReactNode // chips or a count shown over the title
  mark?: ReactNode // a tile beside the title, e.g. on a list's own page
  icon?: ReactNode // left of the top bar when there is no way back, e.g. the app's own mark on the home screen
  back?: string // the address of the screen before, e.g. "#/"
  aside?: ReactNode // right of the top bar: at most two actions
  footer?: ReactNode // the screen's one main action, which stays at the bottom while a long screen scrolls
  theme?: string // a class that sets the --accent-* colours for the whole screen
  children: ReactNode
}

export default function Screen({ title, eyebrow, subtitle, above, mark, icon, back, aside, footer, theme, children }: ScreenProps) {
  const classes = [styles.screen, theme].filter(Boolean).join(' ')
  return (
    <div className={classes}>
      <header className={styles.bar}>
        {back ? (
          <IconLink to={back} label="Geri">
            <BackIcon />
          </IconLink>
        ) : (
          icon
        )}
        {aside && <div className={styles.actions}>{aside}</div>}
      </header>
      <main className={styles.content}>
        <div className={mark ? `${styles.heading} ${styles.marked}` : styles.heading}>
          {above}
          {mark}
          <div className={styles.titles}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
        {children}
      </main>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
