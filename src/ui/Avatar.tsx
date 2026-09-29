import styles from './Avatar.module.css'

/** A person's initial in a circle of the kit colour. Decorative: the name is always written next to it. */
export default function Avatar({ name }: { name?: string }) {
  const initial = (name?.trim().charAt(0) || '?').toLocaleUpperCase('tr')
  return (
    <span className={styles.avatar} aria-hidden="true">
      {initial}
    </span>
  )
}
