import type { BindingSettings } from '../binding/geometry'
import { computeDerivedDimensions } from '../binding/geometry'

export type ImagePackageFileRole =
  | 'leaf-frame'
  | 'scroll-front'
  | 'scroll-back'
  | 'calibration'
  | 'guide'

export type ImagePackageFile = {
  path: string
  role: ImagePackageFileRole
  widthCm: number
  heightCm: number
  widthPx: number
  heightPx: number
}

export type ImagePackageManifest = {
  schemaVersion: 1
  exportType: 'images'
  projectTitle: string
  exportedAt: string
  settings: BindingSettings
  derived: ReturnType<typeof computeDerivedDimensions>
  files: ImagePackageFile[]
  warnings: string[]
}

export function generateFrameFilename(index: number): string {
  return `frame_${String(index + 1).padStart(3, '0')}.png`
}

export function generateImagePackageManifest(
  projectTitle: string,
  settings: BindingSettings,
  derived: ReturnType<typeof computeDerivedDimensions>,
  files: ImagePackageFile[],
  warnings: string[],
): ImagePackageManifest {
  return {
    schemaVersion: 1,
    exportType: 'images',
    projectTitle,
    exportedAt: new Date().toISOString(),
    settings,
    derived,
    files,
    warnings,
  }
}

export function createImagePackageFiles(
  settings: BindingSettings,
): ImagePackageFile[] {
  const derived = computeDerivedDimensions(settings)
  const files: ImagePackageFile[] = []

  for (let i = 0; i < settings.leafCount; i++) {
    files.push({
      path: `frames/${generateFrameFilename(i)}`,
      role: 'leaf-frame',
      widthCm: derived.leafPhysicalWidthCm,
      heightCm: settings.artworkHeightCm,
      widthPx: derived.frameWidthPx,
      heightPx: derived.frameHeightPx,
    })
  }

  files.push({
    path: 'scroll/front_full.png',
    role: 'scroll-front',
    widthCm: derived.scrollArtworkLengthCm,
    heightCm: settings.artworkHeightCm,
    widthPx: derived.scrollWidthPx,
    heightPx: derived.scrollHeightPx,
  })

  files.push({
    path: 'scroll/back_full.png',
    role: 'scroll-back',
    widthCm: derived.scrollArtworkLengthCm,
    heightCm: settings.artworkHeightCm,
    widthPx: derived.scrollWidthPx,
    heightPx: derived.scrollHeightPx,
  })

  return files
}

export function validateImagePackageExport(
  settings: BindingSettings,
  assetCount: { front: boolean; back: boolean; leaves: number },
): string[] {
  const warnings: string[] = []
  const derived = computeDerivedDimensions(settings)

  if (!assetCount.front) {
    warnings.push('正面长卷尚未上传')
  }

  if (!assetCount.back) {
    warnings.push('背面长卷尚未上传')
  }

  if (assetCount.leaves < settings.leafCount) {
    warnings.push(
      `内页素材不足：已上传 ${assetCount.leaves} 张，需要 ${settings.leafCount} 张`,
    )
  }

  if (derived.scrollWidthPx > 10000) {
    warnings.push('长卷像素超过 10000px，可能导致浏览器内存不足')
  }

  if (derived.frameWidthPx > 5000 || derived.frameHeightPx > 5000) {
    warnings.push('单张叶片像素超过 5000px，可能导致浏览器内存不足')
  }

  return warnings
}
