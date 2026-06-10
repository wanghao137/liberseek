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

  return Array.from({ length: settings.leafCount }, (_, index) => ({
    index,
    xCm: index * settings.sliceWidthCm,
    yCm: 0,
    widthCm: leafPhysicalWidthCm,
    heightCm: settings.artworkHeightCm,
    pasteRect: {
      xCm: 0,
      yCm: 0,
      widthCm: settings.pasteWidthCm,
      heightCm: settings.artworkHeightCm,
    },
    visibleRect: {
      xCm: settings.pasteWidthCm,
      yCm: 0,
      widthCm: settings.visiblePageWidthCm,
      heightCm: settings.artworkHeightCm,
    },
  }))
}

export function validateBindingSettings(
  settings: BindingSettings,
): BindingValidation {
  const errors: string[] = []
  const warnings: string[] = []

  if (settings.artworkHeightCm <= 0) {
    errors.push('artworkHeightCm must be greater than 0')
  }

  if (settings.visiblePageWidthCm <= 0) {
    errors.push('visiblePageWidthCm must be greater than 0')
  }

  if (settings.pasteWidthCm <= 0) {
    errors.push('pasteWidthCm must be greater than 0')
  }

  if (settings.sliceWidthCm <= 0) {
    errors.push('sliceWidthCm must be greater than 0')
  }

  if (settings.leafCount < 1) {
    errors.push('leafCount must be at least 1')
  }

  if (settings.dpi <= 0) {
    errors.push('dpi must be greater than 0')
  }

  if (
    settings.sliceWidthCm > settings.pasteWidthCm &&
    settings.sliceWidthCm > 0 &&
    settings.pasteWidthCm > 0
  ) {
    warnings.push('sliceWidthCm is greater than pasteWidthCm')
  }

  return {
    errors,
    warnings,
  }
}
