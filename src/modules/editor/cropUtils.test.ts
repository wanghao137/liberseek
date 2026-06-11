import { describe, expect, it } from 'vitest'

import {
  calculateCropRect,
  constrainCropRect,
  type CropRect,
} from './cropUtils'

describe('crop utilities', () => {
  describe('calculateCropRect', () => {
    it('creates a default crop rect covering the entire image', () => {
      const rect = calculateCropRect({
        imageWidth: 800,
        imageHeight: 600,
        targetWidthCm: 22,
        targetHeightCm: 30,
        dpi: 300,
      })

      expect(rect.xCm).toBe(0)
      expect(rect.yCm).toBe(0)
      expect(rect.widthCm).toBe(40)
      expect(rect.heightCm).toBe(30)
    })

    it('creates a crop rect with offset', () => {
      const rect = calculateCropRect({
        imageWidth: 800,
        imageHeight: 600,
        targetWidthCm: 22,
        targetHeightCm: 30,
        dpi: 300,
        offsetX: 100,
        offsetY: 100,
      })

      expect(rect.xCm).toBeGreaterThanOrEqual(0)
      expect(rect.yCm).toBeGreaterThanOrEqual(0)
    })
  })

  describe('constrainCropRect', () => {
    it('keeps crop rect within image bounds', () => {
      const rect: CropRect = {
        xCm: -5,
        yCm: -5,
        widthCm: 22,
        heightCm: 30,
      }

      const constrained = constrainCropRect(rect, {
        imageWidthPx: 800,
        imageHeightPx: 600,
        dpi: 300,
      })

      expect(constrained.xCm).toBeGreaterThanOrEqual(0)
      expect(constrained.yCm).toBeGreaterThanOrEqual(0)
    })

    it('prevents crop rect from exceeding image bounds', () => {
      const rect: CropRect = {
        xCm: 100,
        yCm: 100,
        widthCm: 22,
        heightCm: 30,
      }

      const constrained = constrainCropRect(rect, {
        imageWidthPx: 800,
        imageHeightPx: 600,
        dpi: 300,
      })

      expect(constrained.xCm).toBeLessThanOrEqual(5)
      expect(constrained.yCm).toBeLessThanOrEqual(1)
    })

    it('maintains minimum crop size', () => {
      const rect: CropRect = {
        xCm: 0,
        yCm: 0,
        widthCm: 1,
        heightCm: 1,
      }

      const constrained = constrainCropRect(rect, {
        imageWidthPx: 800,
        imageHeightPx: 600,
        dpi: 300,
      })

      expect(constrained.widthCm).toBeGreaterThanOrEqual(1)
      expect(constrained.heightCm).toBeGreaterThanOrEqual(1)
    })
  })
})
