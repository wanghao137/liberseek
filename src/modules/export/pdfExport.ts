import type { BindingSettings } from '../binding/geometry'
import { computeDerivedDimensions } from '../binding/geometry'

export type PdfExportOptions = {
  projectTitle: string
  settings: BindingSettings
  exportedAt?: string
}

export type PdfPageInfo = {
  widthCm: number
  heightCm: number
  orientation: 'portrait' | 'landscape'
}

export function calculatePdfPageSize(
  settings: BindingSettings,
): PdfPageInfo {
  const widthCm = settings.pasteWidthCm + settings.visiblePageWidthCm
  const heightCm = settings.artworkHeightCm

  return {
    widthCm,
    heightCm,
    orientation: widthCm >= heightCm ? 'landscape' : 'portrait',
  }
}

export function cmToPdfPoints(cm: number): number {
  return cm / 2.54 * 72
}

export function generatePdfMetadata(options: PdfExportOptions) {
  const { projectTitle, settings } = options
  const exportedAt = options.exportedAt ?? new Date().toISOString()
  const derived = computeDerivedDimensions(settings)
  const pageSize = calculatePdfPageSize(settings)

  return {
    projectTitle,
    exportedAt,
    settings,
    derived,
    pageSize,
    pageCount: settings.leafCount + 2,
    files: [
      {
        name: 'print_pages.pdf',
        description: '打印页面（每叶一页）',
        pageCount: settings.leafCount,
      },
      {
        name: 'scroll_artwork.pdf',
        description: '长卷画心（正面和背面）',
        pageCount: 2,
      },
      {
        name: 'calibration.pdf',
        description: '校准页',
        pageCount: 1,
      },
    ],
  }
}

export function validatePdfExport(
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

  if (derived.scrollArtworkLengthCm > 200) {
    warnings.push('长卷画心长度超过 200cm，可能不适合家用打印机')
  }

  return warnings
}
