import type { BindingSettings } from '../binding/geometry'
import { createImagePackageZip } from './imagePackageZip'
import { createPrintPagesPdf, createCalibrationPdf } from './pdfGenerator'
import { generateReadmeContent } from './readmeExport'
import { createExportProgress, updateExportProgress, completeExportProgress, cancelExportProgress } from './exportProgress'
import type { ExportProgress } from './exportProgress'

export type ExportType = 'image-package' | 'pdf-package' | 'readme'

export type DerivedDimensions = {
  leafPhysicalWidthCm: number
  scrollArtworkLengthCm: number
  pageStructureCount: number
  frameWidthPx: number
  frameHeightPx: number
  scrollWidthPx: number
  scrollHeightPx: number
}

export type ExportInput = {
  projectTitle: string
  settings: BindingSettings
  derived: DerivedDimensions
  frameBlobs?: Blob[]
  frameImages?: Blob[]
  frontScrollBlob?: Blob | null
  backScrollBlob?: Blob | null
  onProgress?: (progress: ExportProgress) => void
}

export type ExportResult = {
  success: boolean
  blob: Blob | null
  filename: string
  error: string | null
}

function sanitizeFilename(title: string): string {
  return title.trim().replace(/[\\/:*?"<>|]/g, '-') || '未命名项目'
}

export async function exportImagePackage(
  input: ExportInput,
  onProgress?: (progress: ExportProgress) => void,
): Promise<ExportResult> {
  const { projectTitle, settings, derived, frameBlobs = [], frontScrollBlob, backScrollBlob } = input

  let progress = createExportProgress('image-package', frameBlobs.length + 2, onProgress)

  try {
    progress = updateExportProgress(progress, 1, '正在准备图片包...')
    
    const zipBlob = await createImagePackageZip({
      projectTitle,
      settings,
      derived,
      frameBlobs,
      frontScrollBlob: frontScrollBlob ?? null,
      backScrollBlob: backScrollBlob ?? null,
    })

    progress = completeExportProgress(progress, '图片包导出完成')

    return {
      success: true,
      blob: zipBlob,
      filename: `${sanitizeFilename(projectTitle)}-图片包.zip`,
      error: null,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误'
    progress = cancelExportProgress(progress)

    return {
      success: false,
      blob: null,
      filename: '',
      error: `图片包导出失败：${message}`,
    }
  }
}

export async function exportPdfPackage(
  input: ExportInput,
  onProgress?: (progress: ExportProgress) => void,
): Promise<ExportResult> {
  const { projectTitle, settings, derived, frameImages = [] } = input

  let progress = createExportProgress('pdf-package', frameImages.length + 2, onProgress)

  try {
    progress = updateExportProgress(progress, 1, '正在生成打印页面 PDF...')

    const printPdf = await createPrintPagesPdf({
      projectTitle,
      settings,
      derived,
      frameImages,
    })

    progress = updateExportProgress(progress, frameImages.length + 1, '正在生成校准页 PDF...')

    const calibrationPdf = await createCalibrationPdf(settings, derived)

    progress = updateExportProgress(progress, frameImages.length + 2, '正在打包 PDF...')

    const { zipSync, strToU8 } = await import('fflate')
    const files: Record<string, Uint8Array> = {
      'print_pages.pdf': new Uint8Array(await printPdf.arrayBuffer()),
      'calibration.pdf': new Uint8Array(await calibrationPdf.arrayBuffer()),
    }

    const readme = generateReadmeContent({ projectTitle, settings })
    files['README.txt'] = strToU8(readme)

    const zipBlob = new Blob([zipSync(files)], { type: 'application/zip' })

    progress = completeExportProgress(progress, 'PDF 包导出完成')

    return {
      success: true,
      blob: zipBlob,
      filename: `${sanitizeFilename(projectTitle)}-PDF包.zip`,
      error: null,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误'
    progress = cancelExportProgress(progress)

    return {
      success: false,
      blob: null,
      filename: '',
      error: `PDF 导出失败：${message}`,
    }
  }
}

export async function exportReadme(
  input: ExportInput,
  onProgress?: (progress: ExportProgress) => void,
): Promise<ExportResult> {
  const { projectTitle, settings } = input

  let progress = createExportProgress('readme', 1, onProgress)

  try {
    progress = updateExportProgress(progress, 1, '正在生成 README...')

    const readme = generateReadmeContent({ projectTitle, settings })
    const blob = new Blob([readme], { type: 'text/plain;charset=utf-8' })

    progress = completeExportProgress(progress, 'README 导出完成')

    return {
      success: true,
      blob,
      filename: `${sanitizeFilename(projectTitle)}-README.txt`,
      error: null,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误'
    progress = cancelExportProgress(progress)

    return {
      success: false,
      blob: null,
      filename: '',
      error: `README 导出失败：${message}`,
    }
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 0)
}
