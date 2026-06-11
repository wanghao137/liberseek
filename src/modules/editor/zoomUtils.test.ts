import { describe, expect, it } from 'vitest'

import {
  constrainZoom,
  zoomAtPoint,
  formatZoom,
  type ViewState,
} from './zoomUtils'

describe('zoom utilities', () => {
  describe('constrainZoom', () => {
    it('constrains zoom to min/max bounds', () => {
      expect(constrainZoom(1, 0.1, 5)).toBe(1)
      expect(constrainZoom(0.05, 0.1, 5)).toBe(0.1)
      expect(constrainZoom(6, 0.1, 5)).toBe(5)
    })

    it('returns default zoom for invalid input', () => {
      expect(constrainZoom(NaN, 0.1, 5)).toBe(1)
      expect(constrainZoom(Infinity, 0.1, 5)).toBe(1)
    })
  })

  describe('zoomAtPoint', () => {
    it('zooms at center point', () => {
      const result = zoomAtPoint(
        { scale: 1, offsetX: 0, offsetY: 0 },
        2,
        { x: 400, y: 300 },
        { width: 800, height: 600 },
      )

      expect(result.scale).toBe(2)
    })

    it('zooms at corner point', () => {
      const result = zoomAtPoint(
        { scale: 1, offsetX: 0, offsetY: 0 },
        2,
        { x: 0, y: 0 },
        { width: 800, height: 600 },
      )

      expect(result.scale).toBe(2)
      expect(result.offsetX).toBe(0)
      expect(result.offsetY).toBe(0)
    })
  })

  describe('formatZoom', () => {
    it('formats zoom as percentage', () => {
      expect(formatZoom(1)).toBe('100%')
      expect(formatZoom(0.5)).toBe('50%')
      expect(formatZoom(2)).toBe('200%')
    })
  })

  describe('ViewState', () => {
    it('creates initial view state', () => {
      const state: ViewState = {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      }

      expect(state.scale).toBe(1)
      expect(state.offsetX).toBe(0)
      expect(state.offsetY).toBe(0)
    })
  })
})
