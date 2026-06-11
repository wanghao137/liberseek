export type RecordingState = {
  isRecording: boolean
  isPaused: boolean
  duration: number
  mimeType: string | null
}

export type RecordingOptions = {
  mimeType?: string
  videoBitsPerSecond?: number
  audioBitsPerSecond?: number
}

export function isMediaRecorderSupported(): boolean {
  return typeof MediaRecorder !== 'undefined'
}

export function getSupportedMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') {
    return null
  }

  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ]

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }

  return null
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function createRecordingState(): RecordingState {
  return {
    isRecording: false,
    isPaused: false,
    duration: 0,
    mimeType: getSupportedMimeType(),
  }
}

export function startRecording(
  stream: MediaStream,
  options: RecordingOptions = {},
): { recorder: MediaRecorder; state: RecordingState } {
  const mimeType = options.mimeType ?? getSupportedMimeType()

  if (!mimeType) {
    throw new Error('不支持的视频格式')
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: options.videoBitsPerSecond ?? 2500000,
  })

  const state: RecordingState = {
    isRecording: true,
    isPaused: false,
    duration: 0,
    mimeType,
  }

  return { recorder, state }
}

export function addWatermark(
  canvas: HTMLCanvasElement,
  text: string = '鳞卷工坊',
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.save()
  ctx.font = '14px "KaiTi", "STKaiti", serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(text, canvas.width - 10, canvas.height - 10)
  ctx.restore()
}

export function downloadRecording(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 0)
}
