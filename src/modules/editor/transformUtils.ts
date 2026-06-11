export type TransformOptions = {
  scale: number
  rotationDeg: number
  xCm: number
  yCm: number
  fitMode?: 'cover' | 'contain'
}

export const DEFAULT_TRANSFORM: TransformOptions = {
  scale: 1,
  rotationDeg: 0,
  xCm: 0,
  yCm: 0,
  fitMode: 'cover',
}

export const SCALE_LIMITS = {
  min: 0.1,
  max: 5,
  step: 0.1,
}

export const ROTATION_LIMITS = {
  min: -180,
  max: 180,
  step: 1,
}

export function constrainScale(
  scale: number,
  min: number = SCALE_LIMITS.min,
  max: number = SCALE_LIMITS.max,
): number {
  if (!Number.isFinite(scale)) {
    return 1
  }

  return Math.max(min, Math.min(max, scale))
}

export function constrainRotation(
  rotation: number,
  min: number = ROTATION_LIMITS.min,
  max: number = ROTATION_LIMITS.max,
): number {
  if (!Number.isFinite(rotation)) {
    return 0
  }

  return Math.max(min, Math.min(max, rotation))
}

export function normalizeAngle(angle: number): number {
  const normalized = angle % 360
  return normalized < 0 ? normalized + 360 : normalized
}

export function formatScale(scale: number): string {
  return `${Math.round(scale * 100)}%`
}

export function formatRotation(rotation: number): string {
  return `${Math.round(rotation)}°`
}

export function resetTransform(): TransformOptions {
  return { ...DEFAULT_TRANSFORM }
}

export function mergeTransform(
  current: TransformOptions,
  updates: Partial<TransformOptions>,
): TransformOptions {
  return {
    ...current,
    ...updates,
    scale: constrainScale(updates.scale ?? current.scale),
    rotationDeg: constrainRotation(updates.rotationDeg ?? current.rotationDeg),
  }
}

export function isTransformDefault(transform: TransformOptions): boolean {
  return (
    transform.scale === DEFAULT_TRANSFORM.scale &&
    transform.rotationDeg === DEFAULT_TRANSFORM.rotationDeg &&
    transform.xCm === DEFAULT_TRANSFORM.xCm &&
    transform.yCm === DEFAULT_TRANSFORM.yCm
  )
}
