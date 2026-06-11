import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import {
  formatExportValidationResult,
  validateExportReady,
} from './validation'

describe('export validation', () => {
  describe('validateExportReady', () => {
    it('returns no errors when all assets are present and settings are valid', () => {
      const result = validateExportReady(DEFAULT_BINDING_SETTINGS, {
        front: true,
        back: true,
        leaves: 23,
      })

      expect(result.errors).toEqual([])
      expect(result.warnings).toEqual([])
    })

    it('returns error when front scroll is missing', () => {
      const result = validateExportReady(DEFAULT_BINDING_SETTINGS, {
        front: false,
        back: true,
        leaves: 23,
      })

      expect(result.errors).toContain('正面长卷尚未上传')
    })

    it('returns error when back scroll is missing', () => {
      const result = validateExportReady(DEFAULT_BINDING_SETTINGS, {
        front: true,
        back: false,
        leaves: 23,
      })

      expect(result.errors).toContain('背面长卷尚未上传')
    })

    it('returns error when leaf count is insufficient', () => {
      const result = validateExportReady(DEFAULT_BINDING_SETTINGS, {
        front: true,
        back: true,
        leaves: 10,
      })

      expect(result.errors).toContain('内页素材不足：已上传 10 张，需要 23 张')
    })

    it('returns error for invalid settings', () => {
      const result = validateExportReady(
        {
          ...DEFAULT_BINDING_SETTINGS,
          artworkHeightCm: 0,
        },
        {
          front: true,
          back: true,
          leaves: 23,
        },
      )

      expect(result.errors).toContain('画心高度必须大于 0')
    })

    it('warns when slice width exceeds paste width', () => {
      const result = validateExportReady(
        {
          ...DEFAULT_BINDING_SETTINGS,
          pasteWidthCm: 1,
          sliceWidthCm: 2,
        },
        {
          front: true,
          back: true,
          leaves: 23,
        },
      )

      expect(result.warnings).toContain('鳞片露出宽度大于粘贴宽度')
    })

    it('warns when scroll is too long for home printer', () => {
      const result = validateExportReady(
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

      expect(result.warnings).toContain('长卷画心长度超过 200cm，可能不适合家用打印机')
    })

    it('warns when pixel dimensions are too large', () => {
      const result = validateExportReady(
        {
          ...DEFAULT_BINDING_SETTINGS,
          dpi: 600,
        },
        {
          front: true,
          back: true,
          leaves: 23,
        },
      )

      expect(result.warnings).toContain('单张叶片像素超过 5000px，可能导致浏览器内存不足')
    })
  })

  describe('formatExportValidationResult', () => {
    it('formats errors with error prefix', () => {
      const result = {
        errors: ['正面长卷尚未上传', '内页素材不足'],
        warnings: [],
      }

      const formatted = formatExportValidationResult(result)

      expect(formatted).toEqual([
        '错误：正面长卷尚未上传',
        '错误：内页素材不足',
      ])
    })

    it('formats warnings with warning prefix', () => {
      const result = {
        errors: [],
        warnings: ['鳞片露出宽度大于粘贴宽度'],
      }

      const formatted = formatExportValidationResult(result)

      expect(formatted).toEqual(['警告：鳞片露出宽度大于粘贴宽度'])
    })

    it('formats mixed errors and warnings', () => {
      const result = {
        errors: ['正面长卷尚未上传'],
        warnings: ['鳞片露出宽度大于粘贴宽度'],
      }

      const formatted = formatExportValidationResult(result)

      expect(formatted).toEqual([
        '错误：正面长卷尚未上传',
        '警告：鳞片露出宽度大于粘贴宽度',
      ])
    })
  })
})
