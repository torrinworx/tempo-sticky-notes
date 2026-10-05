import type { CSSProperties } from 'react'
import type { Rect } from './model'

/** Positions with a transform so moving a note skips layout. */
export function rectStyle(rect: Rect): CSSProperties {
  return {
    transform: `translate(${rect.x}px, ${rect.y}px)`,
    width: rect.width,
    height: rect.height,
  }
}
