import type { Point, Rect, Size } from './model'

export const MIN_NOTE_SIZE: Size = { width: 120, height: 96 }
export const DEFAULT_NOTE_SIZE: Size = { width: 200, height: 180 }

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function containsPoint(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

/** Shifts the rect back inside the bounds without changing its size. */
export function keepInside(rect: Rect, bounds: Size): Rect {
  return {
    ...rect,
    x: clamp(rect.x, 0, bounds.width - rect.width),
    y: clamp(rect.y, 0, bounds.height - rect.height),
  }
}

export function moveRect(rect: Rect, delta: Point, bounds: Size): Rect {
  return keepInside({ ...rect, x: rect.x + delta.x, y: rect.y + delta.y }, bounds)
}

/** Resizes from the bottom-right corner; the top-left corner stays put. */
export function resizeRect(rect: Rect, delta: Point, bounds: Size): Rect {
  return {
    ...rect,
    width: clamp(rect.width + delta.x, MIN_NOTE_SIZE.width, bounds.width - rect.x),
    height: clamp(rect.height + delta.y, MIN_NOTE_SIZE.height, bounds.height - rect.y),
  }
}

/** The rect drawn between two corners, grown to the minimum note size and kept inside the bounds. */
export function rectFromCorners(start: Point, end: Point, bounds: Size): Rect {
  const endX = clamp(end.x, 0, bounds.width)
  const endY = clamp(end.y, 0, bounds.height)
  return keepInside(
    {
      x: Math.min(start.x, endX),
      y: Math.min(start.y, endY),
      width: Math.max(Math.abs(endX - start.x), MIN_NOTE_SIZE.width),
      height: Math.max(Math.abs(endY - start.y), MIN_NOTE_SIZE.height),
    },
    bounds,
  )
}

/** Where the "New note" button puts a note: near the board's centre, stepped so new notes don't stack exactly. */
export function defaultNoteRect(bounds: Size, existingCount: number): Rect {
  const step = (existingCount % 8) * 24
  return keepInside(
    {
      x: Math.round((bounds.width - DEFAULT_NOTE_SIZE.width) / 2) + step,
      y: Math.round((bounds.height - DEFAULT_NOTE_SIZE.height) / 2) + step,
      ...DEFAULT_NOTE_SIZE,
    },
    bounds,
  )
}
