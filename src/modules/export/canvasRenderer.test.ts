import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import { computeDerivedDimensions, type BindingSettings } from '../binding/geometry'
import {
  getFrameDimensions,
  calculateImageDrawParams,
} from './canvasRenderer'

describe('canvas renderer', () => {
  describe('getFrameDimensions', () => {
    it('returns correct dimensions for default settings', () => {
      const dims = getFrameDimensions(DEFAULT_BINDING_SETTINGS)
      const derived = computeDerivedDimensions(DEFAULT_BINDING_SETTINGS)

      expect(dims.widthPx).toBe(derived.frameWidthPx)
      expect(dims.heightPx).toBe(derived.frameHeightPx)
      expect(dims.widthCm).toBe(24)
      expect(dims.heightCm).toBe(30)
    })

    it('returns correct dimensions for custom settings', () => {
      const customSettings: BindingSettings = {
        ...DEFAULT_BINDING_SETTINGS,
        artworkHeightCm: 20,
        dpi: 150,
      }
      const dims = getFrameDimensions(customSettings)
      const derived = computeDerivedDimensions(customSettings)

      expect(dims.widthPx).toBe(derived.frameWidthPx)
      expect(dims.heightPx).toBe(derived.frameHeightPx)
      expect(dims.widthCm).toBe(24)
      expect(dims.heightCm).toBe(20)
    })
  })

  describe('calculateImageDrawParams', () => {
    it('calculates cover fit for landscape image on portrait canvas', () => {
      const params = calculateImageDrawParams(
        800,
        400,
        2835,
        3543,
        'cover',
      )

      expect(params.drawWidth).toBeGreaterThan(2835)
      expect(params.drawHeight).toBe(3543)
      expect(params.drawX).toBeLessThan(0)
      expect(params.drawY).toBe(0)
    })

    it('calculates cover fit for portrait image on landscape canvas', () => {
      const params = calculateImageDrawParams(
        400,
        800,
        3543,
        2835,
        'cover',
      )

      expect(params.drawWidth).toBe(3543)
      expect(params.drawHeight).toBeGreaterThan(2835)
      expect(params.drawX).toBe(0)
      expect(params.drawY).toBeLessThan(0)
    })

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

    it('applies position offset', () => {
      const params = calculateImageDrawParams(
        800,
        400,
        2835,
        3543,
        'cover',
        { xCm: 1, yCm: 1 },
      )

      const defaultParams = calculateImageDrawParams(
        800,
        400,
        2835,
        3543,
        'cover',
      )

      expect(params.drawX).toBe(defaultParams.drawX + 118)
      expect(params.drawY).toBe(defaultParams.drawY + 118)
    })

    it('indicates transform needed when scale or rotation present', () => {
      const noTransform = calculateImageDrawParams(800, 400, 2835, 3543, 'cover')
      const withScale = calculateImageDrawParams(800, 400, 2835, 3543, 'cover', { scale: 1.5 })
      const withRotation = calculateImageDrawParams(800, 400, 2835, 3543, 'cover', { rotationDeg: 45 })

      expect(noTransform.needsTransform).toBe(false)
      expect(withScale.needsTransform).toBe(true)
      expect(withRotation.needsTransform).toBe(true)
    })
  })
})
