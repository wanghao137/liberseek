import { describe, expect, it } from 'vitest'

import {
  constrainPosition,
  calculateDragDelta,
  positionToCm,
  cmToPosition,
  type DragState,
} from './dragUtils'

describe('drag utilities', () => {
  describe('constrainPosition', () => {
    it('keeps position within bounds', () => {
      const result = constrainPosition(
        { x: 100, y: 100 },
        { minX: 0, minY: 0, maxX: 200, maxY: 200 },
      )

      expect(result.x).toBe(100)
      expect(result.y).toBe(100)
    })

    it('clamps position to min bounds', () => {
      const result = constrainPosition(
        { x: -10, y: -10 },
        { minX: 0, minY: 0, maxX: 200, maxY: 200 },
      )

      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })

    it('clamps position to max bounds', () => {
      const result = constrainPosition(
        { x: 250, y: 250 },
        { minX: 0, minY: 0, maxX: 200, maxY: 200 },
      )

      expect(result.x).toBe(200)
      expect(result.y).toBe(200)
    })
  })

  describe('calculateDragDelta', () => {
    it('calculates delta from start to current position', () => {
      const delta = calculateDragDelta(
        { x: 100, y: 100 },
        { x: 150, y: 120 },
      )

      expect(delta.dx).toBe(50)
      expect(delta.dy).toBe(20)
    })

    it('handles negative delta', () => {
      const delta = calculateDragDelta(
        { x: 150, y: 120 },
        { x: 100, y: 100 },
      )

      expect(delta.dx).toBe(-50)
      expect(delta.dy).toBe(-20)
    })
  })

  describe('positionToCm', () => {
    it('converts pixel position to cm', () => {
      const result = positionToCm(118, 300)

      expect(result).toBeCloseTo(1, 1)
    })

    it('handles zero position', () => {
      const result = positionToCm(0, 300)

      expect(result).toBe(0)
    })
  })

  describe('cmToPosition', () => {
    it('converts cm to pixel position', () => {
      const result = cmToPosition(1, 300)

      expect(result).toBeCloseTo(118, 0)
    })

    it('handles zero cm', () => {
      const result = cmToPosition(0, 300)

      expect(result).toBe(0)
    })
  })

  describe('DragState', () => {
    it('creates initial drag state', () => {
      const state: DragState = {
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      }

      expect(state.isDragging).toBe(false)
    })
  })
})
