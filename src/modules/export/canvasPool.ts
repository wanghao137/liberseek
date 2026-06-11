export type CanvasLike = {
  width: number
  height: number
  getContext: (contextId: '2d') => CanvasRenderingContext2D | null
}

export type CanvasPool<T extends CanvasLike = CanvasLike> = {
  maxSize: number
  size: number
  available: number
  acquire: (width: number, height: number) => T
  release: (canvas: T) => void
  destroy: () => void
}

export function createCanvasPool<T extends CanvasLike = CanvasLike>(
  maxSize: number,
  factory: (width: number, height: number) => T = defaultFactory as (width: number, height: number) => T,
): CanvasPool<T> {
  const pool: T[] = []
  const inUse = new Set<T>()

  return {
    maxSize,
    get size() {
      return inUse.size + pool.length
    },
    get available() {
      return pool.length
    },
    acquire(width: number, height: number): T {
      let canvas: T

      if (pool.length > 0) {
        canvas = pool.pop()!
      } else {
        canvas = factory(width, height)
      }

      canvas.width = width
      canvas.height = height
      inUse.add(canvas)

      return canvas
    },
    release(canvas: T): void {
      inUse.delete(canvas)

      if (pool.length < maxSize) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        pool.push(canvas)
      }
    },
    destroy(): void {
      pool.length = 0
      inUse.clear()
    },
  }
}

function defaultFactory(width: number, height: number): any {
  return { width, height, getContext: () => null }
}

export function releaseCanvas<T extends CanvasLike>(pool: CanvasPool<T>, canvas: T): void {
  pool.release(canvas)
}
