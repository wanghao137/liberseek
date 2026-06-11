import { describe, expect, it, beforeEach } from 'vitest'

import {
  createCanvasPool,
  type CanvasLike,
  type CanvasPool,
} from './canvasPool'

function createMockCanvas(): CanvasLike {
  let _width = 0
  let _height = 0

  return {
    get width() { return _width },
    set width(v) { _width = v },
    get height() { return _height },
    set height(v) { _height = v },
    getContext: () => ({
      clearRect: () => {},
    } as unknown as CanvasRenderingContext2D),
  }
}

describe('canvas pool', () => {
  let pool: CanvasPool<CanvasLike>

  beforeEach(() => {
    pool = createCanvasPool<CanvasLike>(2, () => createMockCanvas())
  })

  describe('createCanvasPool', () => {
    it('creates a pool with specified max size', () => {
      expect(pool.maxSize).toBe(2)
      expect(pool.size).toBe(0)
    })
  })

  describe('acquire', () => {
    it('creates a new canvas when pool is empty', () => {
      const canvas = pool.acquire(100, 200)

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(100)
      expect(canvas.height).toBe(200)
      expect(pool.size).toBe(1)
    })

    it('reuses canvas from pool when available', () => {
      const canvas1 = pool.acquire(100, 200)
      pool.release(canvas1)

      const canvas2 = pool.acquire(100, 200)

      expect(canvas2).toBe(canvas1)
      expect(pool.size).toBe(1)
    })

    it('creates new canvas when pool is full', () => {
      const canvas1 = pool.acquire(100, 200)
      const canvas2 = pool.acquire(100, 200)

      expect(pool.size).toBe(2)

      const canvas3 = pool.acquire(100, 200)

      expect(canvas3).toBeDefined()
      expect(canvas3).not.toBe(canvas1)
      expect(canvas3).not.toBe(canvas2)
    })
  })

  describe('release', () => {
    it('returns canvas to pool', () => {
      const canvas = pool.acquire(100, 200)
      expect(pool.size).toBe(1)

      pool.release(canvas)
      expect(pool.size).toBe(1)
    })

    it('clears canvas content on release', () => {
      const canvas = pool.acquire(100, 200)
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, 100, 200)

      pool.release(canvas)

      expect(pool.size).toBe(1)
    })
  })

  describe('destroy', () => {
    it('clears all canvases from pool', () => {
      pool.acquire(100, 200)
      pool.acquire(100, 200)
      expect(pool.size).toBe(2)

      pool.destroy()
      expect(pool.size).toBe(0)
    })
  })
})
