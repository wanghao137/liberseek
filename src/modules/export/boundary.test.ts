import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import { computeDerivedDimensions, validateBindingSettings } from '../binding/geometry'
import { validateExportReady } from './validation'
import { constrainScale, constrainRotation } from '../editor/transformUtils'
import { constrainZoom } from '../editor/zoomUtils'

describe('boundary parameter tests', () => {
  describe('geometry boundary tests', () => {
    it('handles minimum valid settings', () => {
      const settings = {
        ...DEFAULT_BINDING_SETTINGS,
        artworkHeightCm: 1,
        visiblePageWidthCm: 1,
        pasteWidthCm: 0.5,
        sliceWidthCm: 0.5,
        leafCount: 1,
        dpi: 72,
      }

      const derived = computeDerivedDimensions(settings)

      expect(derived.leafPhysicalWidthCm).toBe(1.5)
      expect(derived.scrollArtworkLengthCm).toBe(1.5)
      expect(derived.pageStructureCount).toBe(2)
    })

    it('handles maximum reasonable settings', () => {
      const settings = {
        ...DEFAULT_BINDING_SETTINGS,
        artworkHeightCm: 80,
        visiblePageWidthCm: 60,
        pasteWidthCm: 5,
        sliceWidthCm: 5,
        leafCount: 80,
        dpi: 600,
      }

      const derived = computeDerivedDimensions(settings)

      expect(derived.leafPhysicalWidthCm).toBe(65)
      expect(derived.scrollArtworkLengthCm).toBe(460)
      expect(derived.frameWidthPx).toBeGreaterThan(0)
      expect(derived.frameHeightPx).toBeGreaterThan(0)
    })

    it('rejects invalid settings', () => {
      const settings = {
        ...DEFAULT_BINDING_SETTINGS,
        artworkHeightCm: 0,
        visiblePageWidthCm: -1,
        pasteWidthCm: 0,
        sliceWidthCm: 0,
        leafCount: 0,
        dpi: 0,
      }

      const validation = validateBindingSettings(settings)

      expect(validation.errors.length).toBeGreaterThan(0)
    })
  })

  describe('export validation boundary tests', () => {
    it('validates with missing assets', () => {
      const result = validateExportReady(DEFAULT_BINDING_SETTINGS, {
        front: false,
        back: false,
        leaves: 0,
      })

      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('validates with partial assets', () => {
      const result = validateExportReady(DEFAULT_BINDING_SETTINGS, {
        front: true,
        back: false,
        leaves: 10,
      })

      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('transform boundary tests', () => {
    it('constrains scale to valid range', () => {
      expect(constrainScale(-1)).toBe(0.1)
      expect(constrainScale(0)).toBe(0.1)
      expect(constrainScale(100)).toBe(5)
      expect(constrainScale(1)).toBe(1)
    })

    it('constrains rotation to valid range', () => {
      expect(constrainRotation(-200)).toBe(-180)
      expect(constrainRotation(200)).toBe(180)
      expect(constrainRotation(0)).toBe(0)
      expect(constrainRotation(90)).toBe(90)
    })

    it('constrains zoom to valid range', () => {
      expect(constrainZoom(0.01)).toBe(0.1)
      expect(constrainZoom(10)).toBe(5)
      expect(constrainZoom(1)).toBe(1)
    })
  })
})
