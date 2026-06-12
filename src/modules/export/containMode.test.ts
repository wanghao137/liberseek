import { describe, expect, it } from 'vitest'

import { calculateImageDrawParams } from './canvasRenderer'

describe('contain fit mode', () => {
  it('calculates contain fit for landscape image on portrait canvas', () => {
    const params = calculateImageDrawParams(
      800,
      400,
      2835,
      3543,
      'contain',
    )

    expect(params.drawWidth).toBe(2835)
    expect(params.drawHeight).toBeLessThan(3543)
    expect(params.drawX).toBe(0)
    expect(params.drawY).toBeGreaterThan(0)
  })

  it('calculates contain fit for portrait image on landscape canvas', () => {
    const params = calculateImageDrawParams(
      400,
      800,
      3543,
      2835,
      'contain',
    )

    expect(params.drawWidth).toBeLessThan(3543)
    expect(params.drawHeight).toBe(2835)
    expect(params.drawX).toBeGreaterThan(0)
    expect(params.drawY).toBe(0)
  })

  it('applies position offset in contain mode', () => {
    const params = calculateImageDrawParams(
      800,
      400,
      2835,
      3543,
      'contain',
      { xCm: 1, yCm: 1 },
    )

    const defaultParams = calculateImageDrawParams(
      800,
      400,
      2835,
      3543,
      'contain',
    )

    expect(params.drawX).toBe(defaultParams.drawX + 118)
    expect(params.drawY).toBe(defaultParams.drawY + 118)
  })
})
