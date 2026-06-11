import { jsPDF } from 'jspdf'
import type { BindingSettings } from '../binding/geometry'
import { cmToPdfPoints, calculatePdfPageSize } from './pdfExport'

export type PdfPrintInput = {
  projectTitle: string
  settings: BindingSettings
  derived: {
    leafPhysicalWidthCm: number
    scrollArtworkLengthCm: number
    pageStructureCount: number
    frameWidthPx: number
    frameHeightPx: number
    scrollWidthPx: number
    scrollHeightPx: number
  }
  frameImages: Blob[]
}

export async function createPrintPagesPdf(
  input: PdfPrintInput,
): Promise<Blob> {
  const { projectTitle, settings, frameImages } = input
  const pageSize = calculatePdfPageSize(settings)

  const pdf = new jsPDF({
    orientation: pageSize.orientation,
    unit: 'pt',
    format: [cmToPdfPoints(pageSize.widthCm), cmToPdfPoints(pageSize.heightCm)],
  })

  pdf.setProperties({
    title: `${projectTitle} - 打印页面`,
    creator: '鳞卷工坊',
  })

  for (let i = 0; i < frameImages.length; i++) {
    if (i > 0) {
      pdf.addPage()
    }

    const imgData = await blobToBase64(frameImages[i])
    
    const pageWidthPt = cmToPdfPoints(pageSize.widthCm)
    const pageHeightPt = cmToPdfPoints(pageSize.heightCm)

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidthPt, pageHeightPt)

    pdf.setFontSize(8)
    pdf.setTextColor(150)
    pdf.text(`frame_${String(i + 1).padStart(3, '0')}`, 10, pageHeightPt - 10)
  }

  return new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' })
}

export async function createCalibrationPdf(
  settings: BindingSettings,
  derived: {
    leafPhysicalWidthCm: number
    scrollArtworkLengthCm: number
    pageStructureCount: number
    frameWidthPx: number
    frameHeightPx: number
    scrollWidthPx: number
    scrollHeightPx: number
  },
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  })

  pdf.setProperties({
    title: '校准页',
    creator: '鳞卷工坊',
  })

  const pageHeightPt = cmToPdfPoints(29.7)

  pdf.setFontSize(14)
  pdf.setTextColor(0)
  pdf.text('校准页', 20, 30)

  pdf.setFontSize(10)
  pdf.text(`画心高度：${settings.artworkHeightCm} 厘米`, 20, 50)
  pdf.text(`页面可视宽度：${settings.visiblePageWidthCm} 厘米`, 20, 65)
  pdf.text(`粘贴宽度：${settings.pasteWidthCm} 厘米`, 20, 80)
  pdf.text(`鳞片露出宽度：${settings.sliceWidthCm} 厘米`, 20, 95)
  pdf.text(`叶片数量：${settings.leafCount} 张`, 20, 110)
  pdf.text(`叶片物理宽度：${derived.leafPhysicalWidthCm} 厘米`, 20, 125)
  pdf.text(`导出精度：${settings.dpi} DPI`, 20, 140)

  pdf.setDrawColor(0)
  pdf.setLineWidth(1)

  const ruler10cmPt = cmToPdfPoints(10)

  pdf.line(20, 180, 20 + ruler10cmPt, 180)
  pdf.setFontSize(8)
  pdf.text('10cm', 20, 195)

  for (let i = 0; i <= 10; i++) {
    const x = 20 + cmToPdfPoints(i)
    const tickHeight = i % 5 === 0 ? 8 : 4
    pdf.line(x, 180 - tickHeight, x, 180 + tickHeight)
  }

  pdf.line(20, 220, 20, 220 + ruler10cmPt)
  pdf.text('10cm', 30, 220 + ruler10cmPt + 15)

  for (let i = 0; i <= 10; i++) {
    const y = 220 + cmToPdfPoints(i)
    const tickWidth = i % 5 === 0 ? 8 : 4
    pdf.line(20 - tickWidth, y, 20 + tickWidth, y)
  }

  const pasteWidthPt = cmToPdfPoints(settings.pasteWidthCm)
  pdf.setFillColor(200, 200, 200)
  pdf.rect(20, 280, pasteWidthPt, 30, 'F')
  pdf.setDrawColor(0)
  pdf.rect(20, 280, pasteWidthPt, 30, 'S')
  pdf.setFontSize(8)
  pdf.text(`粘贴宽度 ${settings.pasteWidthCm}cm`, 20, 325)

  const sliceWidthPt = cmToPdfPoints(settings.sliceWidthCm)
  pdf.setFillColor(180, 180, 180)
  pdf.rect(20 + pasteWidthPt + 10, 280, sliceWidthPt, 30, 'F')
  pdf.setDrawColor(0)
  pdf.rect(20 + pasteWidthPt + 10, 280, sliceWidthPt, 30, 'S')
  pdf.text(`鳞片露出宽度 ${settings.sliceWidthCm}cm`, 20 + pasteWidthPt + 10, 325)

  pdf.setFontSize(8)
  pdf.setTextColor(100)
  pdf.text(`导出日期：${new Date().toISOString()}`, 20, pageHeightPt - 20)

  return new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' })
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}
