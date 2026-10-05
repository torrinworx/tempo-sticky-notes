import { describe, expect, it } from 'vitest'
import { NOTE_COLORS } from './model'
import { NOTE_PALETTE } from './palette'

// WCAG 2.2 relative luminance and contrast ratio.
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
  const [r = 0, g = 0, b = 0] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05)
}

const BOARD = '#f2efe8'
const FOCUS = '#1d4ed8'

describe.each(NOTE_COLORS)('%s note', (color) => {
  const swatch = NOTE_PALETTE[color]

  it('has readable text and placeholder (4.5:1)', () => {
    expect(contrast(swatch.ink, swatch.background)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(swatch.ink, swatch.header)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(swatch.placeholder, swatch.background)).toBeGreaterThanOrEqual(4.5)
  })

  it('has a visible outline and focus ring (3:1)', () => {
    expect(contrast(swatch.border, BOARD)).toBeGreaterThanOrEqual(3)
    expect(contrast(swatch.border, swatch.background)).toBeGreaterThanOrEqual(3)
    expect(contrast(FOCUS, swatch.background)).toBeGreaterThanOrEqual(3)
    expect(contrast(FOCUS, swatch.header)).toBeGreaterThanOrEqual(3)
  })
})
