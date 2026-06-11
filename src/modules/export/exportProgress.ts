export type ExportType = 'image-package' | 'pdf-package' | 'readme' | 'dscale'

export type ExportStatus = 'preparing' | 'exporting' | 'complete' | 'cancelled' | 'error'

export type ExportProgress = {
  type: ExportType
  status: ExportStatus
  totalSteps: number
  currentStep: number
  percentage: number
  message: string
  startTime: number
  endTime: number | null
  cancelled: boolean
  error: string | null
  onProgress: ((progress: ExportProgress) => void) | null
}

export function createExportProgress(
  type: ExportType,
  totalSteps: number,
  onProgress?: (progress: ExportProgress) => void,
): ExportProgress {
  return {
    type,
    status: 'preparing',
    totalSteps,
    currentStep: 0,
    percentage: 0,
    message: '准备导出...',
    startTime: Date.now(),
    endTime: null,
    cancelled: false,
    error: null,
    onProgress: onProgress ?? null,
  }
}

export function updateExportProgress(
  progress: ExportProgress,
  currentStep: number,
  message: string,
): ExportProgress {
  if (progress.cancelled) {
    return progress
  }

  const updated: ExportProgress = {
    ...progress,
    currentStep,
    message,
    status: currentStep >= progress.totalSteps ? 'complete' : 'exporting',
    percentage: Math.round((currentStep / progress.totalSteps) * 100),
    endTime: currentStep >= progress.totalSteps ? Date.now() : null,
  }

  if (updated.onProgress) {
    updated.onProgress(updated)
  }

  return updated
}

export function completeExportProgress(
  progress: ExportProgress,
  message: string = '导出完成',
): ExportProgress {
  const completed: ExportProgress = {
    ...progress,
    status: 'complete',
    currentStep: progress.totalSteps,
    percentage: 100,
    message,
    endTime: Date.now(),
  }

  if (completed.onProgress) {
    completed.onProgress(completed)
  }

  return completed
}

export function cancelExportProgress(
  progress: ExportProgress,
): ExportProgress {
  const cancelled: ExportProgress = {
    ...progress,
    status: 'cancelled',
    cancelled: true,
    message: '导出已取消',
    endTime: Date.now(),
  }

  if (cancelled.onProgress) {
    cancelled.onProgress(cancelled)
  }

  return cancelled
}

export function errorExportProgress(
  progress: ExportProgress,
  error: string,
): ExportProgress {
  const errored: ExportProgress = {
    ...progress,
    status: 'error',
    message: `导出失败：${error}`,
    error,
    endTime: Date.now(),
  }

  if (errored.onProgress) {
    errored.onProgress(errored)
  }

  return errored
}

export function getExportDuration(progress: ExportProgress): number {
  const endTime = progress.endTime ?? Date.now()
  return endTime - progress.startTime
}
