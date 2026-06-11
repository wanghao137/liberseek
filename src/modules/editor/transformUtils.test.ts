import { describe, expect, it } from 'vitest'

import {
  constrainScale,
  constrainRotation,
  normalizeAngle,
  formatScale,
  formatRotation,
  type TransformOptions,
} from './transformUtils'

describe('transform utilities', () => {
  describe('constrainScale', () => {
    it('constrains scale to min/max bounds', () => {
      expect(constrainScale(0.1, 0.1, 5)).toBe(0.1)
      expect(constrainScale(5, 0.1, 5)).toBe(5)
      expect(constrainScale(0.05, 0.1, 5)).toBe(0.1)
      expect(constrainScale(6, 0.1, 5)).toBe(5)
    })

    it('returns default scale for invalid input', () => {
      expect(constrainScale(NaN, 0.1, 5)).toBe(1)
      expect(constrainScale(Infinity, 0.1, 5)).toBe(1)
    })
  })

  describe('constrainRotation', () => {
    it('constrains rotation to min/max bounds', () => {
      expect(constrainRotation(0, -180, 180)).toBe(0)
      expect(constrainRotation(90, -180, 180)).toBe(90)
      expect(constrainRotation(-200, -180, 180)).toBe(-180)
      expect(constrainRotation(200, -180, 180)).toBe(180)
    })

    it('returns default rotation for invalid input', () => {
      expect(constrainRotation(NaN, -180, 180)).toBe(0)
      expect(constrainRotation(Infinity, -180, 180)).toBe(0)
    })
  })

  describe('normalizeAngle', () => {
    it('normalizes angle to 0-360 range', () => {
      expect(normalizeAngle(0)).toBe(0)
      expect(normalizeAngle(360)).toBe(0)
      expect(normalizeAngle(45)).toBe(45)
      expect(normalizeAngle(-45)).toBe(315)
      expect(normalizeAngle(405)).toBe(45)
    })
  })

  describe('formatScale', () => {
    it('formats scale as percentage', () => {
      expect(formatScale(1)).toBe('100%')
      expect(formatScale(0.5)).toBe('50%')
      expect(formatScale(2)).toBe('200%')
    })
  })

  describe('formatRotation', () => {
    it('formats rotation in degrees', () => {
      expect(formatRotation(0)).toBe('0°')
      expect(formatRotation(45)).toBe('45°')
      expect(formatRotation(-90)).toBe('-90°')
    })
  })

  describe('TransformOptions', () => {
    it('creates default transform options', () => {
      const options: TransformOptions = {
        scale: 1,
        rotationDeg: 0,
        xCm: 0,
        yCm: 0,
      }

      expect(options.scale).toBe(1)
      expect(options.rotationDeg).toBe(0)
      expect(options.xCm).toBe(0)
      expect(options.yCm).toBe(0)
    })
  })
})
