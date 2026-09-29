import tones from './tones.module.css'

export type Tone = 'teal' | 'coral' | 'amber' | 'neutral' | 'accent'

export function toneClass(tone: Tone): string {
  return tones[tone]
}
