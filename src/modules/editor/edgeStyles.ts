export type EdgeStyle = 'straight' | 'wave' | 'sawtooth'

export function generateWavePath(
  width: number,
  height: number,
  waveCount: number,
): string {
  const waveWidth = width / waveCount

  let path = `M 0 ${height}`

  for (let i = 0; i < waveCount; i++) {
    const x1 = i * waveWidth + waveWidth / 4
    const x2 = i * waveWidth + waveWidth / 2
    const x3 = i * waveWidth + (waveWidth * 3) / 4
    const x4 = (i + 1) * waveWidth

    path += ` Q ${x1} ${0}, ${x2} ${height / 2}`
    path += ` Q ${x3} ${height}, ${x4} ${height}`
  }

  path += ` L ${width} 0 L 0 0 Z`

  return path
}

export function generateSawtoothPath(
  width: number,
  height: number,
  toothCount: number,
): string {
  const toothWidth = width / toothCount
  const toothHeight = height * 0.8

  let path = `M 0 ${height}`

  for (let i = 0; i < toothCount; i++) {
    const x2 = i * toothWidth + toothWidth / 2
    const x3 = (i + 1) * toothWidth

    path += ` L ${x2} ${height - toothHeight}`
    path += ` L ${x3} ${height}`
  }

  path += ` L ${width} 0 L 0 0 Z`

  return path
}

export function getEdgeStylePath(
  style: EdgeStyle,
  width: number,
  height: number,
): string {
  switch (style) {
    case 'wave':
      return generateWavePath(width, height, Math.ceil(width / 20))
    case 'sawtooth':
      return generateSawtoothPath(width, height, Math.ceil(width / 15))
    case 'straight':
    default:
      return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`
  }
}

export function getEdgeStyleName(style: EdgeStyle): string {
  switch (style) {
    case 'wave':
      return '波浪'
    case 'sawtooth':
      return '锯齿'
    case 'straight':
    default:
      return '直边'
  }
}
