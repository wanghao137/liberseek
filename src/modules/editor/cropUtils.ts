import { cmToPx } from '../binding/geometry'

export type CropRect = {
  xCm: number
  yCm: number
  widthCm: number
  heightCm: number
}

export type CalculateCropRectInput = {
  imageWidth: number
  imageHeight: number
  targetWidthCm: number
  targetHeightCm: number
  dpi: number
  offsetX?: number
  offsetY?: number
}

export type ConstrainCropRectInput = {
  imageWidthPx: number
  imageHeightPx: number
  dpi: number
  minSizeCm?: number
}

export function calculateCropRect(input: CalculateCropRectInput): CropRect {
  const {
    imageWidth,
    imageHeight,
    targetWidthCm,
    targetHeightCm,
    dpi,
    offsetX = 0,
    offsetY = 0,
  } = input

  const imageAspect = imageWidth / imageHeight
  const targetAspect = targetWidthCm / targetHeightCm

  let widthCm: number
  let heightCm: number

  if (imageAspect > targetAspect) {
    heightCm = targetHeightCm
    widthCm = heightCm * imageAspect
  } else {
    widthCm = targetWidthCm
    heightCm = widthCm / imageAspect
  }

  const maxOffsetXCm = Math.max(0, (widthCm - targetWidthCm) / 2)
  const maxOffsetYCm = Math.max(0, (heightCm - targetHeightCm) / 2)

  const offsetXcm = Math.max(-maxOffsetXCm, Math.min(maxOffsetXCm, offsetX / dpi * 2.54))
  const offsetYCm = Math.max(-maxOffsetYCm, Math.min(maxOffsetYCm, offsetY / dpi * 2.54))

  return {
    xCm: offsetXcm,
    yCm: offsetYCm,
    widthCm,
    heightCm,
  }
}

export function constrainCropRect(
  rect: CropRect,
  input: ConstrainCropRectInput,
): CropRect {
  const { imageWidthPx, imageHeightPx, dpi, minSizeCm = 1 } = input

  const imageWidthCm = imageWidthPx / dpi * 2.54
  const imageHeightCm = imageHeightPx / dpi * 2.54

  const minX = Math.max(0, Math.min(imageWidthCm - rect.widthCm, rect.xCm))
  const minY = Math.max(0, Math.min(imageHeightCm - rect.heightCm, rect.yCm))

  const width = Math.max(minSizeCm, Math.min(imageWidthCm, rect.widthCm))
  const height = Math.max(minSizeCm, Math.min(imageHeightCm, rect.heightCm))

  return {
    xCm: minX,
    yCm: minY,
    widthCm: width,
    heightCm: height,
  }
}

export function cropRectToPixels(
  rect: CropRect,
  dpi: number,
): { x: number; y: number; width: number; height: number } {
  return {
    x: cmToPx(rect.xCm, dpi),
    y: cmToPx(rect.yCm, dpi),
    width: cmToPx(rect.widthCm, dpi),
    height: cmToPx(rect.heightCm, dpi),
  }
}

export function applyCrop(
  ctx: CanvasRenderingContext2D,
  cropRect: CropRect,
  canvasWidth: number,
  canvasHeight: number,
  dpi: number,
): void {
  const pixels = cropRectToPixels(cropRect, dpi)

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.rect(pixels.x, pixels.y, pixels.width, pixels.height)
  ctx.fill('evenodd')
  ctx.restore()
}
