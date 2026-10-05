import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import { containsPoint, distance, moveRect, rectFromCorners, resizeRect } from './geometry'
import type { Note, Point, Rect } from './model'

/** How far the pointer must travel before a press counts as a drag instead of a click. */
const DRAG_THRESHOLD = 4

export type EditKind = 'move' | 'resize'
export type InteractionKind = 'create' | EditKind

/**
 * - `pressed`: the button is down but the pointer has not passed the drag threshold.
 * - `dragging`: the pointer is moving with the button held.
 * - `placing`: the press ended without moving (a click), so the note follows the pointer
 *   until the next click. This is the non-dragging alternative WCAG 2.5.7 asks for.
 */
export type Phase = 'pressed' | 'dragging' | 'placing'

interface SessionBase {
  readonly phase: Phase
  /** Client coordinates of the press that started the session. */
  readonly origin: Point
  readonly pointer: Point
  /** Measured once when the session starts; the layout does not change mid-drag. */
  readonly board: Rect
  readonly trash: Rect | null
}

type Session =
  | (SessionBase & { readonly kind: 'create' })
  | (SessionBase & { readonly kind: EditKind; readonly note: Note })

/** What the session would produce if it ended now, in board coordinates. */
export type Draft =
  | { readonly kind: 'create'; readonly rect: Rect }
  | { readonly kind: 'move'; readonly note: Note; readonly rect: Rect; readonly overTrash: boolean }
  | { readonly kind: 'resize'; readonly note: Note; readonly rect: Rect }

export interface Interaction {
  readonly kind: InteractionKind
  readonly phase: Phase
  /** Null while a press on the empty board has not yet become a drag. */
  readonly draft: Draft | null
}

function draftOf(session: Session): Draft {
  // Whole pixels keep note edges sharp; the board's size and offset can be fractional.
  const bounds = { width: Math.floor(session.board.width), height: Math.floor(session.board.height) }
  const delta = {
    x: Math.round(session.pointer.x - session.origin.x),
    y: Math.round(session.pointer.y - session.origin.y),
  }
  switch (session.kind) {
    case 'create': {
      const toBoard = (point: Point): Point => ({
        x: Math.round(point.x - session.board.x),
        y: Math.round(point.y - session.board.y),
      })
      return { kind: 'create', rect: rectFromCorners(toBoard(session.origin), toBoard(session.pointer), bounds) }
    }
    case 'move':
      return {
        kind: 'move',
        note: session.note,
        rect: moveRect(session.note.rect, delta, bounds),
        overTrash: session.trash !== null && containsPoint(session.trash, session.pointer),
      }
    case 'resize':
      return { kind: 'resize', note: session.note, rect: resizeRect(session.note.rect, delta, bounds) }
  }
}

interface Options {
  readonly boardRef: RefObject<HTMLElement | null>
  readonly trashRef: RefObject<HTMLElement | null>
  readonly onCommit: (draft: Draft) => void
  readonly onPlacingStart: (draft: Draft) => void
  readonly onCancel: (draft: Draft) => void
}

/**
 * Runs one pointer gesture at a time on the board: drawing a new note, or moving or resizing
 * an existing one. Notes stay untouched until the gesture ends; until then callers render the draft.
 */
export function useBoardInteraction({ boardRef, trashRef, onCommit, onPlacingStart, onCancel }: Options) {
  const [session, setSession] = useState<Session | null>(null)
  // Window listeners read from the ref so two events inside one frame never see a stale session.
  const sessionRef = useRef<Session | null>(null)
  const update = useCallback((next: Session | null) => {
    sessionRef.current = next
    setSession(next)
  }, [])

  const begin = useCallback(
    (event: ReactPointerEvent, build: (base: SessionBase) => Session): boolean => {
      const board = boardRef.current
      if (!board || sessionRef.current || event.button !== 0 || !event.isPrimary) return false
      const origin = { x: event.clientX, y: event.clientY }
      update(
        build({
          phase: 'pressed',
          origin,
          pointer: origin,
          board: board.getBoundingClientRect(),
          trash: trashRef.current?.getBoundingClientRect() ?? null,
        }),
      )
      return true
    },
    [boardRef, trashRef, update],
  )

  const startCreate = useCallback(
    (event: ReactPointerEvent) => begin(event, (base) => ({ ...base, kind: 'create' })),
    [begin],
  )

  const startEdit = useCallback(
    (kind: EditKind, note: Note, event: ReactPointerEvent) => begin(event, (base) => ({ ...base, kind, note })),
    [begin],
  )

  const isActive = useCallback(() => sessionRef.current !== null, [])

  const commit = useEffectEvent(onCommit)
  const startPlacing = useEffectEvent(onPlacingStart)
  const cancelled = useEffectEvent(onCancel)
  const active = session !== null

  useEffect(() => {
    if (!active) return

    const pointerOf = (event: PointerEvent): Point => ({ x: event.clientX, y: event.clientY })

    function handleMove(event: PointerEvent) {
      const current = sessionRef.current
      if (!current || !event.isPrimary) return
      const pointer = pointerOf(event)
      const startsDrag = current.phase === 'pressed' && distance(pointer, current.origin) > DRAG_THRESHOLD
      update({ ...current, pointer, phase: startsDrag ? 'dragging' : current.phase })
    }

    function handleUp(event: PointerEvent) {
      const current = sessionRef.current
      if (!current || !event.isPrimary || event.button !== 0) return
      if (current.phase === 'pressed') {
        // A click on empty board space draws nothing. A click on a handle starts click-to-place.
        if (current.kind === 'create') {
          update(null)
          return
        }
        const placing = { ...current, phase: 'placing' as const }
        update(placing)
        startPlacing(draftOf(placing))
        return
      }
      update(null)
      commit(draftOf({ ...current, pointer: pointerOf(event) }))
    }

    function cancel() {
      const current = sessionRef.current
      if (!current) return
      update(null)
      cancelled(draftOf(current))
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      cancel()
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', cancel)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', cancel)
    }
  }, [active, update])

  const interaction = useMemo((): Interaction | null => {
    if (!session) return null
    const showsDraft = session.kind !== 'create' || session.phase !== 'pressed'
    return { kind: session.kind, phase: session.phase, draft: showsDraft ? draftOf(session) : null }
  }, [session])

  return { interaction, startCreate, startEdit, isActive }
}
