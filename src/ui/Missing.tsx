import { LinkButton } from './Button.tsx'
import Screen from './Screen.tsx'

interface MissingProps {
  message: string
  back: string // an address, e.g. "#/"
}

/** Shown when an address points at something that no longer exists, e.g. a deleted item. */
export default function Missing({ message, back }: MissingProps) {
  return (
    <Screen title="Bulunamadı" back={back}>
      <p>{message}</p>
      <LinkButton to={back}>Geri dön</LinkButton>
    </Screen>
  )
}
