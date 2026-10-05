import type { NoteColor } from './model'

export interface Swatch {
  readonly background: string
  readonly header: string
  /** Note outline; at least 3:1 against both the board and the note. */
  readonly border: string
  /** Text and icons; at least 4.5:1 against the background and the header. */
  readonly ink: string
  readonly placeholder: string
}

// Keyed by NoteColor, so adding a color to the model without a swatch fails to compile.
export const NOTE_PALETTE: Readonly<Record<NoteColor, Swatch>> = {
  yellow: { background: '#fff1a6', header: '#fbe78a', border: '#8a7300', ink: '#4a3f00', placeholder: '#6f6200' },
  pink: { background: '#ffdbe8', header: '#ffc7db', border: '#a3365f', ink: '#5c1a33', placeholder: '#8a3355' },
  blue: { background: '#d9ebff', header: '#c2dcfc', border: '#2f6aa8', ink: '#123a63', placeholder: '#2c5d8f' },
  green: { background: '#d7f5da', header: '#bfebc4', border: '#2e7d3a', ink: '#164a1d', placeholder: '#2b6b35' },
  purple: { background: '#e8dfff', header: '#d9ccff', border: '#6a4bb5', ink: '#34206b', placeholder: '#5a3f9e' },
  orange: { background: '#ffe2c6', header: '#ffd2a8', border: '#a8561a', ink: '#5c2c06', placeholder: '#8a4512' },
}

/** CSS custom properties that NoteCard.module.css reads. */
export function swatchStyle(color: NoteColor): Record<`--note-${string}`, string> {
  const swatch = NOTE_PALETTE[color]
  return {
    '--note-background': swatch.background,
    '--note-header': swatch.header,
    '--note-border': swatch.border,
    '--note-ink': swatch.ink,
    '--note-placeholder': swatch.placeholder,
  }
}
