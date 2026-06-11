import type { BindingSettings } from '../binding/geometry'
import { computeDerivedDimensions } from '../binding/geometry'

export type ExportValidationResult = {
  errors: string[]
  warnings: string[]
}

export type ExportAssetCount = {
  front: boolean
  back: boolean
  leaves: number
}

export function validateExportReady(
  settings: BindingSettings,
  assetCount: ExportAssetCount,
): ExportValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const derived = computeDerivedDimensions(settings)

  if (!assetCount.front) {
    errors.push('正面长卷尚未上传')
  }

  if (!assetCount.back) {
    errors.push('背面长卷尚未上传')
  }

  if (assetCount.leaves < settings.leafCount) {
    errors.push(
      `内页素材不足：已上传 ${assetCount.leaves} 张，需要 ${settings.leafCount} 张`,
    )
  }

  if (settings.artworkHeightCm <= 0) {
    errors.push('画心高度必须大于 0')
  }

  if (settings.visiblePageWidthCm <= 0) {
    errors.push('页面可视宽度必须大于 0')
  }

  if (settings.pasteWidthCm <= 0) {
    errors.push('粘贴宽度必须大于 0')
  }

  if (settings.sliceWidthCm <= 0) {
    errors.push('鳞片露出宽度必须大于 0')
  }

  if (settings.leafCount < 1) {
    errors.push('叶片数量至少为 1')
  }

  if (settings.dpi <= 0) {
    errors.push('导出 DPI 必须大于 0')
  }

  if (
    settings.sliceWidthCm > settings.pasteWidthCm &&
    settings.sliceWidthCm > 0 &&
    settings.pasteWidthCm > 0
  ) {
    warnings.push('鳞片露出宽度大于粘贴宽度')
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

  return { errors, warnings }
}

export function formatExportValidationResult(
  result: ExportValidationResult,
): string[] {
  const messages: string[] = []

  for (const error of result.errors) {
    messages.push(`错误：${error}`)
  }

  for (const warning of result.warnings) {
    messages.push(`警告：${warning}`)
  }

  return messages
}
