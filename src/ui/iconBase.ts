/** Line icons share one look: a 24px grid, round ends, 1.7–2.4px lines. A kit draws its own icons with it too. */
export const iconBox = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export interface IconProps {
  size?: number
  strokeWidth?: number
}

export function lineIcon(size: number, strokeWidth: number) {
  return { ...iconBox, width: size, height: size, strokeWidth }
}
