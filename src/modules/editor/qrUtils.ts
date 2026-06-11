export type QrData = {
  title: string
  settings: {
    artworkHeightCm: number
    visiblePageWidthCm: number
    leafCount: number
  }
}

export function generateProjectQrData(project: {
  title: string
  artworkHeightCm: number
  visiblePageWidthCm: number
  leafCount: number
}): QrData {
  return {
    title: project.title,
    settings: {
      artworkHeightCm: project.artworkHeightCm,
      visiblePageWidthCm: project.visiblePageWidthCm,
      leafCount: project.leafCount,
    },
  }
}

export function formatQrData(data: QrData): string {
  return JSON.stringify(data)
}

export function parseQrData(qrString: string): QrData | null {
  try {
    const data = JSON.parse(qrString)
    if (
      data.title &&
      data.settings &&
      typeof data.settings.artworkHeightCm === 'number' &&
      typeof data.settings.visiblePageWidthCm === 'number' &&
      typeof data.settings.leafCount === 'number'
    ) {
      return data as QrData
    }
    return null
  } catch {
    return null
  }
}
