import { describe, expect, it } from 'vitest'

import {
  generateProjectQrData,
  formatQrData,
  type QrData,
} from './qrUtils'

describe('QR code utilities', () => {
  describe('generateProjectQrData', () => {
    it('generates QR data from project settings', () => {
      const data = generateProjectQrData({
        title: '测试项目',
        artworkHeightCm: 30,
        visiblePageWidthCm: 22,
        leafCount: 23,
      })

      expect(data).toBeDefined()
      expect(data.title).toBe('测试项目')
      expect(data.settings.artworkHeightCm).toBe(30)
      expect(data.settings.visiblePageWidthCm).toBe(22)
      expect(data.settings.leafCount).toBe(23)
    })
  })

  describe('formatQrData', () => {
    it('formats QR data as JSON string', () => {
      const data: QrData = {
        title: '测试项目',
        settings: {
          artworkHeightCm: 30,
          visiblePageWidthCm: 22,
          leafCount: 23,
        },
      }

      const formatted = formatQrData(data)

      expect(typeof formatted).toBe('string')
      expect(formatted).toContain('测试项目')
      expect(formatted).toContain('30')
    })
  })
})
