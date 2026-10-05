import { memo, useCallback, type KeyboardEvent, type PointerEvent } from 'react'
import { CloseIcon, GripIcon, ResizeIcon } from '../ui/icons'
import { arrowKeyDelta, isDeleteKey } from './keyboard'
import { noteLabel, type Note, type NoteId, type Point } from './model'
import { swatchStyle } from './palette'
import { rectStyle } from './rectStyle'
import type { Draft, EditKind } from './useBoardInteraction'
import styles from './NoteCard.module.css'

export type NoteCommand =
  | { readonly type: 'move'; readonly delta: Point }
  | { readonly type: 'resize'; readonly delta: Point }
  | { readonly type: 'delete' }

export type NoteDraft = Extract<Draft, { kind: EditKind }>

const ARROW_KEYS = 'ArrowUp ArrowDown ArrowLeft ArrowRight'

interface NoteCardProps {
  readonly note: Note
  /** Set only while this note is being moved or resized with the pointer. */
  readonly draft: NoteDraft | undefined
  readonly moveHelpId: string
  readonly resizeHelpId: string
  readonly onPointerStart: (note: Note, kind: EditKind, event: PointerEvent<HTMLButtonElement>) => void
  readonly onCommand: (note: Note, command: NoteCommand) => void
  readonly registerMoveHandle: (id: NoteId, element: HTMLButtonElement) => () => void
  /** Focuses the text field when the note mounts. */
  readonly autoFocusText: boolean
  readonly onTextChange: (id: NoteId, text: string) => void
}

export const NoteCard = memo(function NoteCard({
  note,
  draft,
  moveHelpId,
  resizeHelpId,
  onPointerStart,
  onCommand,
  registerMoveHandle,
  autoFocusText,
  onTextChange,
}: NoteCardProps) {
  const label = noteLabel(note.id)
  const rect = draft?.rect ?? note.rect
  const state = !draft ? 'idle' : draft.kind === 'move' && draft.overTrash ? 'deleting' : 'active'

  const moveHandleRef = useCallback(
    (element: HTMLButtonElement | null) => (element ? registerMoveHandle(note.id, element) : undefined),
    [note.id, registerMoveHandle],
  )

  function handleMoveKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (isDeleteKey(event)) {
      event.preventDefault()
      onCommand(note, { type: 'delete' })
      return
    }
    const delta = arrowKeyDelta(event)
    if (!delta) return
    event.preventDefault()
    onCommand(note, { type: 'move', delta })
  }

  function handleResizeKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const delta = arrowKeyDelta(event)
    if (!delta) return
    event.preventDefault()
    onCommand(note, { type: 'resize', delta })
  }

  return (
    <li className={styles.note} data-state={state} style={{ ...rectStyle(rect), ...swatchStyle(note.color) }}>
      <div className={styles.header}>
        <button
          ref={moveHandleRef}
          type="button"
          className={styles.moveHandle}
          aria-label={`Move ${label}`}
          aria-describedby={moveHelpId}
          aria-keyshortcuts={`${ARROW_KEYS} Delete`}
          onPointerDown={(event) => {
            onPointerStart(note, 'move', event)
          }}
          onKeyDown={handleMoveKeyDown}
        >
          <GripIcon />
          <span>{label}</span>
        </button>
        <button
          type="button"
          className={styles.deleteButton}
          aria-label={`Delete ${label}`}
          title="Delete note"
          onClick={() => {
            onCommand(note, { type: 'delete' })
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <textarea
        className={styles.text}
        value={note.text}
        aria-label={`${label} text`}
        placeholder="Write something"
        autoFocus={autoFocusText}
        onChange={(event) => {
          onTextChange(note.id, event.target.value)
        }}
      />
      <button
        type="button"
        className={styles.resizeHandle}
        aria-label={`Resize ${label}`}
        aria-describedby={resizeHelpId}
        aria-keyshortcuts={ARROW_KEYS}
        title="Resize note"
        onPointerDown={(event) => {
          onPointerStart(note, 'resize', event)
        }}
        onKeyDown={handleResizeKeyDown}
      >
        <ResizeIcon />
      </button>
    </li>
  )
})
