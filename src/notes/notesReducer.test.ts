import { describe, expect, it } from 'vitest'
import { nextNoteId, randomNoteColor, NOTE_COLORS, type Note, type NoteId } from './model'
import { notesReducer } from './notesReducer'

const note = (id: number): Note => ({
  id: id as NoteId,
  rect: { x: 0, y: 0, width: 200, height: 150 },
  text: '',
  color: 'yellow',
})

describe('notesReducer', () => {
  it('adds a note on top of the others', () => {
    const notes = notesReducer([note(1)], { type: 'add', note: note(2) })
    expect(notes.map((n) => n.id)).toEqual([1, 2])
  })

  it('changes only the targeted note and keeps the others as the same objects', () => {
    const first = note(1)
    const second = note(2)
    const rect = { x: 50, y: 60, width: 300, height: 200 }
    const notes = notesReducer([first, second], { type: 'setRect', id: second.id, rect })
    expect(notes[0]).toBe(first)
    expect(notes[1]).toEqual({ ...second, rect })
  })

  it('changes the text of the targeted note only', () => {
    const first = note(1)
    const notes = notesReducer([first, note(2)], { type: 'setText', id: 2 as NoteId, text: 'Buy milk' })
    expect(notes[0]).toBe(first)
    expect(notes[1]?.text).toBe('Buy milk')
  })

  it('removes a note', () => {
    const notes = notesReducer([note(1), note(2), note(3)], { type: 'remove', id: 2 as NoteId })
    expect(notes.map((n) => n.id)).toEqual([1, 3])
  })
})

describe('nextNoteId', () => {
  it('starts at 1 and follows the highest id in use', () => {
    expect(nextNoteId([])).toBe(1)
    expect(nextNoteId([note(4), note(2)])).toBe(5)
  })
})

describe('randomNoteColor', () => {
  it('never repeats the previous color', () => {
    for (const previous of NOTE_COLORS) {
      for (const roll of [0, 0.5, 0.999]) {
        expect(randomNoteColor(previous, () => roll)).not.toBe(previous)
      }
    }
  })

  it('can pick every color', () => {
    const picks = new Set([0, 0.2, 0.4, 0.6, 0.8, 0.99].map((roll) => randomNoteColor(undefined, () => roll)))
    expect(picks).toEqual(new Set(NOTE_COLORS))
  })
})
