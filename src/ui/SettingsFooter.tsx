import styles from './SettingsFooter.module.css'

/** The last lines of a kit's settings screen: which build this is, and where the other kits are. */
export default function SettingsFooter({ version }: { version: string }) {
  return (
    <footer className={styles.footer}>
      <span>Sürüm: {version}</span>
      <a className={styles.link} href="https://kitshelf.app" target="_blank" rel="noreferrer">
        KitShelf ailesinden
      </a>
    </footer>
  )
}
