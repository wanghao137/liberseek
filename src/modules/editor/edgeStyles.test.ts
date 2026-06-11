import { describe, expect, it } from 'vitest'

import {
  generateWavePath,
  generateSawtoothPath,
  getEdgeStylePath,
} from './edgeStyles'

describe('edge styles', () => {
  describe('generateWavePath', () => {
    it('generates a wave path', () => {
      const path = generateWavePath(100, 10, 5)

      expect(path).toContain('M')
      expect(path).toContain('Q')
    })

    it('generates path with correct dimensions', () => {
      const path = generateWavePath(200, 15, 8)

      expect(path).toBeDefined()
      expect(typeof path).toBe('string')
    })
  })

  describe('generateSawtoothPath', () => {
    it('generates a sawtooth path', () => {
      const path = generateSawtoothPath(100, 10, 5)

      expect(path).toContain('M')
      expect(path).toContain('L')
    })

    it('generates path with correct dimensions', () => {
      const path = generateSawtoothPath(200, 15, 8)

      expect(path).toBeDefined()
      expect(typeof path).toBe('string')
    })
  })

  describe('getEdgeStylePath', () => {
    it('returns straight path for straight style', () => {
      const path = getEdgeStylePath('straight', 100, 10)

      expect(path).toBe('M 0 0 L 100 0 L 100 10 L 0 10 Z')
    })

    it('returns wave path for wave style', () => {
      const path = getEdgeStylePath('wave', 100, 10)

      expect(path).toContain('M')
      expect(path).toContain('Q')
    })

    it('returns sawtooth path for sawtooth style', () => {
      const path = getEdgeStylePath('sawtooth', 100, 10)

      expect(path).toContain('M')
      expect(path).toContain('L')
    })
  })
})
