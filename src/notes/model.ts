export interface Point {
  readonly x: number
  readonly y: number
}

export interface Size {
  readonly width: number
  readonly height: number
}

export interface Rect extends Point, Size {}

declare const noteIdBrand: unique symbol

/** A plain number at runtime; the brand stops any other number from being passed as an id. */
export type NoteId = number & { readonly [noteIdBrand]: true }

export const NOTE_COLORS = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'] as const
export type NoteColor = (typeof NOTE_COLORS)[number]

export interface Note {
  readonly id: NoteId
  /** Position and size in board pixels, measured from the board's top-left corner. */
  readonly rect: Rect
  readonly text: string
  readonly color: NoteColor
}

export function nextNoteId(notes: readonly Note[]): NoteId {
  return (Math.max(0, ...notes.map((note) => note.id)) + 1) as NoteId
}

/** A random color that differs from `previous`, so two new notes in a row never match. */
export function randomNoteColor(previous: NoteColor | undefined, random: () => number = Math.random): NoteColor {
  const choices = NOTE_COLORS.filter((color) => color !== previous)
  return choices[Math.floor(random() * choices.length)] ?? 'yellow'
}

export function noteLabel(id: NoteId): string {
  return `Note ${id}`
}
