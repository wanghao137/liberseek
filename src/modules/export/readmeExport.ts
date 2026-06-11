import type { BindingSettings } from '../binding/geometry'
import { computeDerivedDimensions } from '../binding/geometry'

export type ReadmeExportOptions = {
  projectTitle: string
  settings: BindingSettings
  exportedAt?: string
}

export function generateReadmeContent(options: ReadmeExportOptions): string {
  const { projectTitle, settings } = options
  const exportedAt = options.exportedAt ?? new Date().toISOString()
  const derived = computeDerivedDimensions(settings)

  const lines: string[] = []

  lines.push(`项目`)
  lines.push(``)
  lines.push(`项目名称：${projectTitle}`)
  lines.push(`导出日期：${exportedAt}`)
  lines.push(``)
  lines.push(`参数`)
  lines.push(``)
  lines.push(`画心高度：${settings.artworkHeightCm} 厘米`)
  lines.push(`页面可视宽度：${settings.visiblePageWidthCm} 厘米`)
  lines.push(`粘贴宽度：${settings.pasteWidthCm} 厘米`)
  lines.push(`鳞片露出宽度：${settings.sliceWidthCm} 厘米`)
  lines.push(`叶片数量：${settings.leafCount} 张`)
  lines.push(`页面结构数：${derived.pageStructureCount}`)
  lines.push(`边缘样式：${settings.edgeStyle === 'straight' ? '直边' : settings.edgeStyle === 'wave' ? '波浪' : '锯齿'}`)
  lines.push(`导出精度：${settings.dpi} DPI`)
  lines.push(``)
  lines.push(`派生尺寸`)
  lines.push(``)
  lines.push(`叶片物理宽度：${derived.leafPhysicalWidthCm} 厘米`)
  lines.push(`长卷画心长度：${derived.scrollArtworkLengthCm} 厘米`)
  lines.push(`单张叶片像素：${derived.frameWidthPx} x ${derived.frameHeightPx}`)
  lines.push(`长卷像素：${derived.scrollWidthPx} x ${derived.scrollHeightPx}`)
  lines.push(``)
  lines.push(`生成文件`)
  lines.push(``)
  lines.push(`frames/`)
  for (let i = 0; i < settings.leafCount; i++) {
    lines.push(`  frame_${String(i + 1).padStart(3, '0')}.png`)
  }
  lines.push(`scroll/`)
  lines.push(`  front_full.png`)
  lines.push(`  back_full.png`)
  lines.push(``)
  lines.push(`打印设置`)
  lines.push(``)
  lines.push(`- 打印缩放保持 100%，不要选择"适合页面"`)
  lines.push(`- 纸张大小：根据叶片尺寸选择，建议 A3 或更大`)
  lines.push(`- 打印质量：最高质量`)
  lines.push(`- 色彩模式：彩色`)
  lines.push(``)
  lines.push(`组装顺序`)
  lines.push(``)
  lines.push(`1. 按文件名顺序打印 frame 文件（frame_001 到 frame_${String(settings.leafCount).padStart(3, '0')}）`)
  lines.push(`2. 先校验 10cm 标尺（如有）`)
  lines.push(`3. 准备底卷纸张`)
  lines.push(`4. 先贴 frame_001，粘贴区对齐底卷左侧`)
  lines.push(`5. 每张后续叶片按鳞片露出宽度（${settings.sliceWidthCm} 厘米）向右错位`)
  lines.push(`6. 只在粘贴区（宽度 ${settings.pasteWidthCm} 厘米）上胶或固定`)
  lines.push(`7. 最终压平前检查露出边缘是否整齐`)
  lines.push(``)
  lines.push(`警告`)
  lines.push(``)
  lines.push(`- 请勿使用缩放打印，否则尺寸会不准确`)
  lines.push(`- 长卷打印可能需要专业打印机或分片打印`)
  lines.push(`- 建议先用普通纸张打印测试页确认尺寸`)
  lines.push(``)
  lines.push(`支持链接`)
  lines.push(``)
  lines.push(`鳞卷工坊 - LiberSeek Dragon Scale Studio`)
  lines.push(`https://omnia.liberseek.com`)

  return lines.join('\n')
}

export function validateReadmeExport(
  settings: BindingSettings,
  assetCount: { front: boolean; back: boolean; leaves: number },
): string[] {
  const warnings: string[] = []

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

  return warnings
}
