import { describe, expect, it } from 'vitest'
import {
  containsPoint,
  defaultNoteRect,
  DEFAULT_NOTE_SIZE,
  MIN_NOTE_SIZE,
  moveRect,
  rectFromCorners,
  resizeRect,
} from './geometry'

const bounds = { width: 1000, height: 700 }
const rect = { x: 100, y: 100, width: 200, height: 150 }

describe('moveRect', () => {
  it('moves by the delta', () => {
    expect(moveRect(rect, { x: 30, y: -20 }, bounds)).toEqual({ x: 130, y: 80, width: 200, height: 150 })
  })

  it('stops at every board edge without changing size', () => {
    expect(moveRect(rect, { x: -500, y: -500 }, bounds)).toEqual({ x: 0, y: 0, width: 200, height: 150 })
    expect(moveRect(rect, { x: 5000, y: 5000 }, bounds)).toEqual({ x: 800, y: 550, width: 200, height: 150 })
  })
})

describe('resizeRect', () => {
  it('grows from the bottom-right corner and keeps the top-left corner', () => {
    expect(resizeRect(rect, { x: 40, y: 10 }, bounds)).toEqual({ x: 100, y: 100, width: 240, height: 160 })
  })

  it('never shrinks below the minimum size', () => {
    expect(resizeRect(rect, { x: -1000, y: -1000 }, bounds)).toEqual({ x: 100, y: 100, ...MIN_NOTE_SIZE })
  })

  it('never grows past the board edge', () => {
    expect(resizeRect(rect, { x: 5000, y: 5000 }, bounds)).toEqual({ x: 100, y: 100, width: 900, height: 600 })
  })
})

describe('rectFromCorners', () => {
  it('accepts the corners in either order', () => {
    const expected = { x: 100, y: 100, width: 300, height: 200 }
    expect(rectFromCorners({ x: 100, y: 100 }, { x: 400, y: 300 }, bounds)).toEqual(expected)
    expect(rectFromCorners({ x: 400, y: 300 }, { x: 100, y: 100 }, bounds)).toEqual(expected)
  })

  it('grows a small drawing to the minimum size', () => {
    expect(rectFromCorners({ x: 100, y: 100 }, { x: 110, y: 105 }, bounds)).toEqual({ x: 100, y: 100, ...MIN_NOTE_SIZE })
  })

  it('keeps a drawing that leaves the board inside it', () => {
    expect(rectFromCorners({ x: 800, y: 500 }, { x: 2000, y: 2000 }, bounds)).toEqual({
      x: 800,
      y: 500,
      width: 200,
      height: 200,
    })
  })

  it('keeps a minimum-size note inside the board when drawn at the edge', () => {
    const drawn = rectFromCorners({ x: 990, y: 690 }, { x: 995, y: 695 }, bounds)
    expect(drawn.x + drawn.width).toBeLessThanOrEqual(bounds.width)
    expect(drawn.y + drawn.height).toBeLessThanOrEqual(bounds.height)
  })
})

describe('defaultNoteRect', () => {
  it('centres the first note and steps the next ones', () => {
    const first = defaultNoteRect(bounds, 0)
    const second = defaultNoteRect(bounds, 1)
    expect(first).toEqual({ x: 400, y: 260, ...DEFAULT_NOTE_SIZE })
    expect(second).toEqual({ x: 424, y: 284, ...DEFAULT_NOTE_SIZE })
  })
})

describe('containsPoint', () => {
  it('includes the edges and excludes points outside', () => {
    expect(containsPoint(rect, { x: 100, y: 100 })).toBe(true)
    expect(containsPoint(rect, { x: 300, y: 250 })).toBe(true)
    expect(containsPoint(rect, { x: 301, y: 200 })).toBe(false)
    expect(containsPoint(rect, { x: 200, y: 99 })).toBe(false)
  })
})
