import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'tonal' | 'text' | 'danger'

const className = (variant: Variant, big = false, inline = false) =>
  [styles.button, styles[variant], big && styles.big, inline && styles.inline].filter(Boolean).join(' ')

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  big?: boolean
  inline?: boolean // as wide as its text, e.g. a quiet action centred under a list
}

export function Button({ variant = 'secondary', big, inline, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={className(variant, big, inline)} {...props} />
}

interface LinkButtonProps {
  to: string // an address, e.g. "#/settings"
  variant?: Variant
  big?: boolean
  children: ReactNode
}

/** Looks like a button but navigates, so the back button and long-press work as on any link. */
export function LinkButton({ to, variant = 'secondary', big, children }: LinkButtonProps) {
  return (
    <a href={to} className={className(variant, big)}>
      {children}
    </a>
  )
}
