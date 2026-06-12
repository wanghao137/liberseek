export type GuideLineType = 'paste-area' | 'cut-line' | 'calibration'

export type GuideLine = {
  type: GuideLineType
  x1: number
  y1: number
  x2: number
  y2: number
  label?: string
}

export type GenerateGuideLinesInput = {
  leafWidthCm: number
  leafHeightCm: number
  pasteWidthCm: number
  sliceWidthCm: number
  leafCount: number
  includePasteArea: boolean
  includeCutLines: boolean
  includeCalibration: boolean
}

export function generateGuideLines(input: GenerateGuideLinesInput): GuideLine[] {
  const {
    leafWidthCm,
    leafHeightCm,
    pasteWidthCm,
    sliceWidthCm,
    leafCount,
    includePasteArea,
    includeCutLines,
    includeCalibration,
  } = input

  const lines: GuideLine[] = []

  if (includePasteArea) {
    for (let i = 0; i < leafCount; i++) {
      const x = i * sliceWidthCm

      lines.push({
        type: 'paste-area',
        x1: x,
        y1: 0,
        x2: x + pasteWidthCm,
        y2: leafHeightCm,
        label: `粘贴区 ${i + 1}`,
      })
    }
  }

  if (includeCutLines) {
    for (let i = 0; i <= leafCount; i++) {
      const x = i * sliceWidthCm

      lines.push({
        type: 'cut-line',
        x1: x,
        y1: 0,
        x2: x,
        y2: leafHeightCm,
        label: i === 0 ? '起始线' : i === leafCount ? '结束线' : undefined,
      })
    }
  }

  if (includeCalibration) {
    const calWidth = 10

    lines.push({
      type: 'calibration',
      x1: 0,
      y1: leafHeightCm + 1,
      x2: calWidth,
      y2: leafHeightCm + 1,
      label: '10cm 横向标尺',
    })

    lines.push({
      type: 'calibration',
      x1: leafWidthCm + 1,
      y1: 0,
      x2: leafWidthCm + 1,
      y2: calWidth,
      label: '10cm 纵向标尺',
    })
  }

  return lines
}
