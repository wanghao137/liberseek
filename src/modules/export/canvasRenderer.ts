import type { BindingSettings } from '../binding/geometry'
import { computeDerivedDimensions, cmToPx } from '../binding/geometry'

export type FitMode = 'cover' | 'contain'

export type FrameRenderOptions = {
  fitMode: FitMode
  scale?: number
  rotationDeg?: number
  xCm?: number
  yCm?: number
}

export type FrameDimensions = {
  widthPx: number
  heightPx: number
  widthCm: number
  heightCm: number
}

export function getFrameDimensions(settings: BindingSettings): FrameDimensions {
  const derived = computeDerivedDimensions(settings)

  return {
    widthPx: derived.frameWidthPx,
    heightPx: derived.frameHeightPx,
    widthCm: settings.pasteWidthCm + settings.visiblePageWidthCm,
    heightCm: settings.artworkHeightCm,
  }
}

export function calculateImageDrawParams(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  fitMode: FitMode,
  options: {
    scale?: number
    rotationDeg?: number
    xCm?: number
    yCm?: number
  } = {},
): {
  drawX: number
  drawY: number
  drawWidth: number
  drawHeight: number
  needsTransform: boolean
} {
  const { scale = 1, rotationDeg = 0, xCm = 0, yCm = 0 } = options
  const offsetX = cmToPx(xCm, 300)
  const offsetY = cmToPx(yCm, 300)

  const imageAspect = imageWidth / imageHeight
  const canvasAspect = canvasWidth / canvasHeight

  let drawWidth: number
  let drawHeight: number

  if (fitMode === 'cover') {
    if (imageAspect > canvasAspect) {
      drawHeight = canvasHeight
      drawWidth = drawHeight * imageAspect
    } else {
      drawWidth = canvasWidth
      drawHeight = drawWidth / imageAspect
    }
  } else {
    if (imageAspect > canvasAspect) {
      drawWidth = canvasWidth
      drawHeight = drawWidth / imageAspect
    } else {
      drawHeight = canvasHeight
      drawWidth = drawHeight * imageAspect
    }
  }

  const drawX = (canvasWidth - drawWidth) / 2 + offsetX
  const drawY = (canvasHeight - drawHeight) / 2 + offsetY

  const needsTransform = scale !== 1 || rotationDeg !== 0

  return {
    drawX,
    drawY,
    drawWidth,
    drawHeight,
    needsTransform,
  }
}

export function renderFrameToCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  options: FrameRenderOptions,
): void {
  const { fitMode, scale = 1, rotationDeg = 0, xCm = 0, yCm = 0 } = options

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.save()

  if (scale !== 1 || rotationDeg !== 0) {
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    ctx.translate(centerX, centerY)
    ctx.rotate((rotationDeg * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(-centerX, -centerY)
  }

  const params = calculateImageDrawParams(
    image.naturalWidth,
    image.naturalHeight,
    canvas.width,
    canvas.height,
    fitMode,
    { xCm, yCm },
  )

  ctx.drawImage(image, params.drawX, params.drawY, params.drawWidth, params.drawHeight)

  ctx.restore()
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      type,
      quality,
    )
  })
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.crossOrigin = 'anonymous'

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))

    image.src = src
  })
}
