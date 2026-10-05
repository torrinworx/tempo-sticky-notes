import { describe, expect, it } from 'vitest'
import { arrowKeyDelta, isDeleteKey } from './keyboard'

const key = (name: string, modifiers: Partial<Record<'shiftKey' | 'altKey' | 'ctrlKey' | 'metaKey', boolean>> = {}) => ({
  key: name,
  shiftKey: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  ...modifiers,
})

describe('arrowKeyDelta', () => {
  it('maps each arrow to a small step', () => {
    expect(arrowKeyDelta(key('ArrowUp'))).toEqual({ x: 0, y: -10 })
    expect(arrowKeyDelta(key('ArrowDown'))).toEqual({ x: 0, y: 10 })
    expect(arrowKeyDelta(key('ArrowLeft'))).toEqual({ x: -10, y: 0 })
    expect(arrowKeyDelta(key('ArrowRight'))).toEqual({ x: 10, y: 0 })
  })

  it('takes bigger steps with Shift', () => {
    expect(arrowKeyDelta(key('ArrowRight', { shiftKey: true }))).toEqual({ x: 50, y: 0 })
  })

  it('leaves other modifiers to the browser and assistive tech', () => {
    expect(arrowKeyDelta(key('ArrowRight', { ctrlKey: true }))).toBeNull()
    expect(arrowKeyDelta(key('ArrowRight', { altKey: true }))).toBeNull()
    expect(arrowKeyDelta(key('ArrowRight', { metaKey: true }))).toBeNull()
  })

  it('ignores keys that are not arrows', () => {
    expect(arrowKeyDelta(key('a'))).toBeNull()
    expect(arrowKeyDelta(key('toString'))).toBeNull()
  })
})

describe('isDeleteKey', () => {
  it('accepts Delete and Backspace only', () => {
    expect(isDeleteKey(key('Delete'))).toBe(true)
    expect(isDeleteKey(key('Backspace'))).toBe(true)
    expect(isDeleteKey(key('d'))).toBe(false)
  })
})
