/** Small line icons drawn here rather than loaded, so they work offline and follow the text colour. */
import { iconBox as box, lineIcon, type IconProps } from './iconBase.ts'

export function PlusIcon({ size = 22, strokeWidth = 2.4 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg {...box} strokeWidth={strokeWidth} width={size} height={size}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function CheckIcon({ size = 22, strokeWidth = 2.4 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg {...box} strokeWidth={strokeWidth} width={size} height={size}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

export function GearIcon({ size = 24 }: { size?: number }) {
  return (
    <svg {...box} strokeWidth={1.9} width={size} height={size}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M4.5 4.5l1.7 1.7M17.8 17.8l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.5 19.5l1.7-1.7M17.8 6.2l1.7-1.7" />
    </svg>
  )
}

export function BackIcon({ size = 20, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 18, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export function ChevronDownIcon({ size = 16, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function DotsIcon({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  )
}

export function CloseIcon({ size = 18, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function ArrowRightIcon({ size = 18, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function RefreshIcon({ size = 17, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4.5V11h-6.5" />
    </svg>
  )
}

export function SlidersIcon({ size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </svg>
  )
}

/** Appearance: automatic, light or dark as the phone is set. */
export function AutoIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Appearance: always light. */
export function SunIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <circle cx="12" cy="12" r="3.8" />
      <path d="M12 2.8V5M12 19v2.2M2.8 12H5M19 12h2.2M5.5 5.5L7 7M17 17l1.5 1.5M5.5 18.5L7 17M17 7l1.5-1.5" />
    </svg>
  )
}

/** Appearance: always dark. */
export function MoonIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a7 7 0 0 0 9.5 9.5z" />
    </svg>
  )
}

/** Sending a file out, e.g. saving a backup through the share sheet. */
export function ShareIcon({ size = 19, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M12 15V3M7 8l5-5 5 5" />
      <path d="M5 13v5.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V13" />
    </svg>
  )
}

/** Bringing a file in, e.g. restoring from a backup. */
export function DownloadIcon({ size = 18, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M5 16v2.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V16" />
    </svg>
  )
}

/** Time since something last happened, e.g. the last backup. */
export function HistoryIcon({ size = 22, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 4.5V9h4.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

/** A file, e.g. the backup about to be restored. */
export function FileIcon({ size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  )
}
