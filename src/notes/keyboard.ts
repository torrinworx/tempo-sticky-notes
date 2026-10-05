import type { Point } from './model'

const STEP = 10
const LARGE_STEP = 50

const DIRECTIONS: ReadonlyMap<string, Point> = new Map([
  ['ArrowUp', { x: 0, y: -1 }],
  ['ArrowDown', { x: 0, y: 1 }],
  ['ArrowLeft', { x: -1, y: 0 }],
  ['ArrowRight', { x: 1, y: 0 }],
])

type KeyInput = Pick<KeyboardEvent, 'key' | 'shiftKey' | 'altKey' | 'ctrlKey' | 'metaKey'>

/**
 * The nudge an arrow key asks for, or null for any other key. Shift takes bigger steps.
 * Other modifiers return null so browser and screen reader shortcuts keep working.
 */
export function arrowKeyDelta(event: KeyInput): Point | null {
  const direction = DIRECTIONS.get(event.key)
  if (!direction || event.altKey || event.ctrlKey || event.metaKey) return null
  const step = event.shiftKey ? LARGE_STEP : STEP
  return { x: direction.x * step, y: direction.y * step }
}

export function isDeleteKey(event: KeyInput): boolean {
  // Mac keyboards label Backspace as "delete".
  return event.key === 'Delete' || event.key === 'Backspace'
}
