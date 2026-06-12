import { describe, expect, it } from 'vitest'

import { generateGuideLines } from './guideLines'

describe('guide lines', () => {
  describe('generateGuideLines', () => {
    it('generates paste area boundary lines', () => {
      const lines = generateGuideLines({
        leafWidthCm: 24,
        leafHeightCm: 30,
        pasteWidthCm: 2,
        sliceWidthCm: 2,
        leafCount: 3,
        includePasteArea: true,
        includeCutLines: false,
        includeCalibration: false,
      })

      expect(lines.length).toBeGreaterThan(0)
      expect(lines.some(l => l.type === 'paste-area')).toBe(true)
    })

    it('generates cut lines', () => {
      const lines = generateGuideLines({
        leafWidthCm: 24,
        leafHeightCm: 30,
        pasteWidthCm: 2,
        sliceWidthCm: 2,
        leafCount: 3,
        includePasteArea: false,
        includeCutLines: true,
        includeCalibration: false,
      })

      expect(lines.length).toBeGreaterThan(0)
      expect(lines.some(l => l.type === 'cut-line')).toBe(true)
    })

    it('generates calibration lines', () => {
      const lines = generateGuideLines({
        leafWidthCm: 24,
        leafHeightCm: 30,
        pasteWidthCm: 2,
        sliceWidthCm: 2,
        leafCount: 3,
        includePasteArea: false,
        includeCutLines: false,
        includeCalibration: true,
      })

      expect(lines.length).toBeGreaterThan(0)
      expect(lines.some(l => l.type === 'calibration')).toBe(true)
    })
  })
})
