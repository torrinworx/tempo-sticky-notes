import type { Note, NoteId, Rect } from './model'

export type NotesAction =
  | { readonly type: 'add'; readonly note: Note }
  | { readonly type: 'setRect'; readonly id: NoteId; readonly rect: Rect }
  | { readonly type: 'setText'; readonly id: NoteId; readonly text: string }
  | { readonly type: 'remove'; readonly id: NoteId }

/** Array order is paint order: later notes draw on top of earlier ones. */
export function notesReducer(notes: readonly Note[], action: NotesAction): readonly Note[] {
  switch (action.type) {
    case 'add':
      return [...notes, action.note]
    case 'setRect':
      // Untouched notes keep their identity so memoized note components skip re-rendering.
      return notes.map((note) => (note.id === action.id ? { ...note, rect: action.rect } : note))
    case 'setText':
      return notes.map((note) => (note.id === action.id ? { ...note, text: action.text } : note))
    case 'remove':
      return notes.filter((note) => note.id !== action.id)
  }
}
