export type EdgeStyle = 'straight' | 'wave' | 'sawtooth'

export type Orientation = 'horizontal' | 'vertical'

export type BindingSettings = {
  artworkHeightCm: number
  visiblePageWidthCm: number
  pasteWidthCm: number
  sliceWidthCm: number
  leafCount: number
  edgeStyle: EdgeStyle
  orientation: Orientation
  dpi: number
}

export type RectCm = {
  xCm: number
  yCm: number
  widthCm: number
  heightCm: number
}

export type LeafLayout = {
  index: number
  xCm: number
  yCm: number
  widthCm: number
  heightCm: number
  pasteRect: RectCm
  visibleRect: RectCm
}

export type DerivedDimensions = {
  leafPhysicalWidthCm: number
  scrollArtworkLengthCm: number
  pageStructureCount: number
  frameWidthPx: number
  frameHeightPx: number
  scrollWidthPx: number
  scrollHeightPx: number
}

export type BindingValidation = {
  errors: string[]
  warnings: string[]
}

export function cmToPx(cm: number, dpi: number): number {
  return Math.round((cm / 2.54) * dpi)
}

export function computeDerivedDimensions(
  settings: BindingSettings,
): DerivedDimensions {
  const leafPhysicalWidthCm =
    settings.pasteWidthCm + settings.visiblePageWidthCm
  const scrollArtworkLengthCm =
    settings.visiblePageWidthCm + settings.leafCount * settings.sliceWidthCm

  return {
    leafPhysicalWidthCm,
    scrollArtworkLengthCm,
    pageStructureCount: settings.leafCount + 1,
    frameWidthPx: cmToPx(leafPhysicalWidthCm, settings.dpi),
    frameHeightPx: cmToPx(settings.artworkHeightCm, settings.dpi),
    scrollWidthPx: cmToPx(scrollArtworkLengthCm, settings.dpi),
    scrollHeightPx: cmToPx(settings.artworkHeightCm, settings.dpi),
  }
}

export function computeLeafLayout(settings: BindingSettings): LeafLayout[] {
  const { leafPhysicalWidthCm } = computeDerivedDimensions(settings)
  const isVertical = settings.orientation === 'vertical'

  return Array.from({ length: settings.leafCount }, (_, index) => ({
    index,
    xCm: isVertical ? 0 : index * settings.sliceWidthCm,
    yCm: isVertical ? index * settings.sliceWidthCm : 0,
    widthCm: isVertical ? settings.artworkHeightCm : leafPhysicalWidthCm,
    heightCm: isVertical ? leafPhysicalWidthCm : settings.artworkHeightCm,
    pasteRect: {
      xCm: 0,
      yCm: 0,
      widthCm: isVertical ? settings.artworkHeightCm : settings.pasteWidthCm,
      heightCm: isVertical ? settings.pasteWidthCm : settings.artworkHeightCm,
    },
    visibleRect: {
      xCm: isVertical ? 0 : settings.pasteWidthCm,
      yCm: isVertical ? settings.pasteWidthCm : 0,
      widthCm: isVertical ? settings.artworkHeightCm : settings.visiblePageWidthCm,
      heightCm: isVertical ? settings.visiblePageWidthCm : settings.artworkHeightCm,
    },
  }))
}

export function validateBindingSettings(
  settings: BindingSettings,
): BindingValidation {
  const errors: string[] = []
  const warnings: string[] = []

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

  return {
    errors,
    warnings,
  }
}
