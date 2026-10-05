import {
  useCallback,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { LiveRegion } from '../ui/LiveRegion'
import { PlusIcon } from '../ui/icons'
import { useAnnouncer } from '../ui/useAnnouncer'
import { defaultNoteRect, moveRect, resizeRect } from './geometry'
import { nextNoteId, noteLabel, randomNoteColor, type Note, type NoteId, type Rect, type Size } from './model'
import { NoteCard, type NoteCommand, type NoteDraft } from './NoteCard'
import { notesReducer } from './notesReducer'
import { rectStyle } from './rectStyle'
import { TrashZone, type TrashState } from './TrashZone'
import { useBoardInteraction, type Draft, type EditKind, type Interaction } from './useBoardInteraction'
import styles from './NotesBoard.module.css'

function trashStateOf(interaction: Interaction | null): TrashState {
  const draft = interaction?.draft
  if (draft?.kind !== 'move' || interaction?.phase === 'pressed') return 'idle'
  return draft.overTrash ? 'over' : 'ready'
}

function noteDraftFor(note: Note, draft: Draft | null | undefined): NoteDraft | undefined {
  return draft && draft.kind !== 'create' && draft.note.id === note.id ? draft : undefined
}

export function NotesBoard() {
  const [notes, dispatch] = useReducer(notesReducer, [])
  const boardRef = useRef<HTMLElement>(null)
  const trashRef = useRef<HTMLDivElement>(null)
  const newNoteButtonRef = useRef<HTMLButtonElement>(null)
  const moveHandles = useRef(new Map<NoteId, HTMLButtonElement>())
  // The newest note opens with its text field focused, ready to type into.
  const [autoFocusId, setAutoFocusId] = useState<NoteId | null>(null)
  const moveHelpId = useId()
  const resizeHelpId = useId()
  const { message, announce } = useAnnouncer()

  // Lets the stable callbacks handed to memoized notes read the current list.
  const notesRef = useRef(notes)
  useLayoutEffect(() => {
    notesRef.current = notes
  })

  const boardSize = useCallback((): Size => {
    const rect = boardRef.current?.getBoundingClientRect()
    return { width: Math.floor(rect?.width ?? 0), height: Math.floor(rect?.height ?? 0) }
  }, [])

  const registerMoveHandle = useCallback((id: NoteId, element: HTMLButtonElement) => {
    moveHandles.current.set(id, element)
    return () => {
      moveHandles.current.delete(id)
    }
  }, [])

  const addNote = useCallback(
    (rect: Rect) => {
      const current = notesRef.current
      const note: Note = {
        id: nextNoteId(current),
        rect,
        text: '',
        color: randomNoteColor(current.at(-1)?.color),
      }
      setAutoFocusId(note.id)
      dispatch({ type: 'add', note })
      announce(`${noteLabel(note.id)} added.`)
    },
    [announce],
  )

  const removeNote = useCallback(
    (id: NoteId) => {
      const current = notesRef.current
      const index = current.findIndex((note) => note.id === id)
      const neighbour = current[index + 1] ?? current[index - 1]
      dispatch({ type: 'remove', id })
      announce(`${noteLabel(id)} deleted.`)
      // Keep focus on the board instead of dropping it to the page.
      const nextFocus = neighbour ? moveHandles.current.get(neighbour.id) : newNoteButtonRef.current
      nextFocus?.focus()
    },
    [announce],
  )

  const handleTextChange = useCallback((id: NoteId, text: string) => {
    dispatch({ type: 'setText', id, text })
  }, [])

  const { interaction, startCreate, startEdit, isActive } = useBoardInteraction({
    boardRef,
    trashRef,
    onCommit: (draft) => {
      switch (draft.kind) {
        case 'create':
          addNote(draft.rect)
          return
        case 'move':
          if (draft.overTrash) {
            removeNote(draft.note.id)
            return
          }
          dispatch({ type: 'setRect', id: draft.note.id, rect: draft.rect })
          announce(`${noteLabel(draft.note.id)} moved.`)
          return
        case 'resize':
          dispatch({ type: 'setRect', id: draft.note.id, rect: draft.rect })
          announce(`${noteLabel(draft.note.id)} resized.`)
      }
    },
    onPlacingStart: (draft) => {
      if (draft.kind === 'create') return
      const label = noteLabel(draft.note.id)
      announce(
        draft.kind === 'move'
          ? `Moving ${label}. Click where it should go, or press Escape to cancel.`
          : `Resizing ${label}. Click to set the size, or press Escape to cancel.`,
      )
    },
    onCancel: () => {
      announce('Cancelled.')
    },
  })

  const handleNotePointerDown = useCallback(
    (note: Note, kind: EditKind, event: ReactPointerEvent<HTMLButtonElement>) => {
      if (startEdit(kind, note, event)) event.currentTarget.focus()
    },
    [startEdit],
  )

  const handleCommand = useCallback(
    (note: Note, command: NoteCommand) => {
      // A pointer gesture owns the note until it ends.
      if (isActive()) return
      const label = noteLabel(note.id)
      switch (command.type) {
        case 'move': {
          const rect = moveRect(note.rect, command.delta, boardSize())
          dispatch({ type: 'setRect', id: note.id, rect })
          announce(`${label} at ${Math.round(rect.x)}, ${Math.round(rect.y)}.`)
          return
        }
        case 'resize': {
          const rect = resizeRect(note.rect, command.delta, boardSize())
          dispatch({ type: 'setRect', id: note.id, rect })
          announce(`${label} is ${Math.round(rect.width)} by ${Math.round(rect.height)}.`)
          return
        }
        case 'delete':
          removeNote(note.id)
      }
    },
    [announce, boardSize, isActive, removeNote],
  )

  function handleBoardPointerDown(event: ReactPointerEvent<HTMLUListElement>) {
    // Presses on a note bubble up here too; only empty board space starts a drawing.
    if (event.target === event.currentTarget) startCreate(event)
  }

  const draft = interaction?.draft
  const showsOverlay = interaction !== null && interaction.phase !== 'pressed'

  return (
    <div className={styles.app}>
      <header className={styles.toolbar}>
        <h1 className={styles.title}>Sticky notes</h1>
        <button
          ref={newNoteButtonRef}
          type="button"
          className={styles.newNote}
          onClick={() => {
            addNote(defaultNoteRect(boardSize(), notes.length))
          }}
        >
          <PlusIcon />
          New note
        </button>
        <p className={styles.hint}>or drag on an empty spot to draw one</p>
        <TrashZone ref={trashRef} state={trashStateOf(interaction)} />
      </header>

      <main ref={boardRef} className={styles.board}>
        <ul className={styles.notes} aria-label="Notes" onPointerDown={handleBoardPointerDown}>
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              draft={noteDraftFor(note, draft)}
              moveHelpId={moveHelpId}
              resizeHelpId={resizeHelpId}
              onPointerStart={handleNotePointerDown}
              onCommand={handleCommand}
              registerMoveHandle={registerMoveHandle}
              autoFocusText={note.id === autoFocusId}
              onTextChange={handleTextChange}
            />
          ))}
        </ul>
        {draft?.kind === 'create' && (
          <div className={styles.drawPreview} style={rectStyle(draft.rect)} aria-hidden="true">
            {Math.round(draft.rect.width)} × {Math.round(draft.rect.height)}
          </div>
        )}
        {notes.length === 0 && !draft && (
          <p className={styles.empty}>No notes yet. Drag anywhere on the board to draw one.</p>
        )}
      </main>

      {showsOverlay && (
        // Covers the page during a gesture: keeps the cursor steady and catches the click that ends
        // click-to-place, so that click cannot land on another control.
        <div
          className={styles.overlay}
          data-kind={interaction.kind}
          onMouseDown={(event) => {
            event.preventDefault()
          }}
        >
          {interaction.phase === 'placing' && (
            <p className={styles.placingHint}>
              {interaction.kind === 'resize' ? 'Click to set the size.' : 'Click where the note should go.'} Press
              Esc to cancel.
            </p>
          )}
        </div>
      )}

      <p id={moveHelpId} hidden>
        Arrow keys move the note. Hold Shift to move further. Delete removes it.
      </p>
      <p id={resizeHelpId} hidden>
        Arrow keys resize the note. Hold Shift to resize faster.
      </p>
      <LiveRegion message={message} />
    </div>
  )
}
