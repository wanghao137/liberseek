import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import {
  calculatePdfPageSize,
  cmToPdfPoints,
  generatePdfMetadata,
  validatePdfExport,
} from './pdfExport'

describe('pdf export', () => {
  describe('calculatePdfPageSize', () => {
    it('calculates correct page size for default settings', () => {
      const pageSize = calculatePdfPageSize(DEFAULT_BINDING_SETTINGS)

      expect(pageSize.widthCm).toBe(24)
      expect(pageSize.heightCm).toBe(30)
      expect(pageSize.orientation).toBe('portrait')
    })

    it('returns landscape when width exceeds height', () => {
      const pageSize = calculatePdfPageSize({
        ...DEFAULT_BINDING_SETTINGS,
        visiblePageWidthCm: 40,
      })

      expect(pageSize.widthCm).toBe(42)
      expect(pageSize.heightCm).toBe(30)
      expect(pageSize.orientation).toBe('landscape')
    })

    it('returns portrait when height exceeds width', () => {
      const pageSize = calculatePdfPageSize({
        ...DEFAULT_BINDING_SETTINGS,
        visiblePageWidthCm: 10,
      })

      expect(pageSize.widthCm).toBe(12)
      expect(pageSize.heightCm).toBe(30)
      expect(pageSize.orientation).toBe('portrait')
    })
  })

  describe('cmToPdfPoints', () => {
    it('converts centimeters to PDF points correctly', () => {
      expect(cmToPdfPoints(2.54)).toBe(72)
      expect(cmToPdfPoints(1)).toBeCloseTo(28.346, 2)
      expect(cmToPdfPoints(30)).toBeCloseTo(850.394, 2)
    })
  })

  describe('generatePdfMetadata', () => {
    it('generates metadata with all required fields', () => {
      const metadata = generatePdfMetadata({
        projectTitle: '测试项目',
        settings: DEFAULT_BINDING_SETTINGS,
        exportedAt: '2026-06-11T00:00:00.000Z',
      })

      expect(metadata.projectTitle).toBe('测试项目')
      expect(metadata.exportedAt).toBe('2026-06-11T00:00:00.000Z')
      expect(metadata.settings).toEqual(DEFAULT_BINDING_SETTINGS)
      expect(metadata.derived).toBeDefined()
      expect(metadata.pageSize).toEqual({
        widthCm: 24,
        heightCm: 30,
        orientation: 'portrait',
      })
      expect(metadata.pageCount).toBe(25)
      expect(metadata.files).toHaveLength(3)
    })

    it('includes correct page counts for each PDF file', () => {
      const metadata = generatePdfMetadata({
        projectTitle: '测试项目',
        settings: DEFAULT_BINDING_SETTINGS,
      })

      expect(metadata.files[0].name).toBe('print_pages.pdf')
      expect(metadata.files[0].pageCount).toBe(23)

      expect(metadata.files[1].name).toBe('scroll_artwork.pdf')
      expect(metadata.files[1].pageCount).toBe(2)

      expect(metadata.files[2].name).toBe('calibration.pdf')
      expect(metadata.files[2].pageCount).toBe(1)
    })
  })

  describe('validatePdfExport', () => {
    it('returns no warnings when all assets are present', () => {
      const warnings = validatePdfExport(DEFAULT_BINDING_SETTINGS, {
        front: true,
        back: true,
        leaves: 23,
      })

      expect(warnings).toEqual([])
    })

    it('warns when front scroll is missing', () => {
      const warnings = validatePdfExport(DEFAULT_BINDING_SETTINGS, {
        front: false,
        back: true,
        leaves: 23,
      })

      expect(warnings).toContain('正面长卷尚未上传')
    })

    it('warns when back scroll is missing', () => {
      const warnings = validatePdfExport(DEFAULT_BINDING_SETTINGS, {
        front: true,
        back: false,
        leaves: 23,
      })

      expect(warnings).toContain('背面长卷尚未上传')
    })

    it('warns when leaf count is insufficient', () => {
      const warnings = validatePdfExport(DEFAULT_BINDING_SETTINGS, {
        front: true,
        back: true,
        leaves: 10,
      })

      expect(warnings).toContain('内页素材不足：已上传 10 张，需要 23 张')
    })

    it('warns when scroll is too long for home printer', () => {
      const warnings = validatePdfExport(
        {
          ...DEFAULT_BINDING_SETTINGS,
          leafCount: 100,
        },
        {
          front: true,
          back: true,
          leaves: 100,
        },
      )

      expect(warnings).toContain('长卷画心长度超过 200cm，可能不适合家用打印机')
    })
  })
})
