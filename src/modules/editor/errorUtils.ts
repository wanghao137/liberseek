export type ErrorType =
  | 'upload-failed'
  | 'export-failed'
  | 'save-failed'
  | 'load-failed'
  | 'network-error'
  | 'unknown-error'

export function getErrorMessage(type: ErrorType): string {
  switch (type) {
    case 'upload-failed':
      return '图片上传失败'
    case 'export-failed':
      return '导出失败'
    case 'save-failed':
      return '保存失败'
    case 'load-failed':
      return '加载失败'
    case 'network-error':
      return '网络连接错误'
    case 'unknown-error':
      return '发生未知错误'
    default:
      return '发生错误'
  }
}

export function getErrorHint(type: ErrorType): string {
  switch (type) {
    case 'upload-failed':
      return '请检查文件格式和大小，然后重试'
    case 'export-failed':
      return '请检查浏览器权限，然后重试'
    case 'save-failed':
      return '请检查浏览器存储权限，然后重试'
    case 'load-failed':
      return '请刷新页面重试'
    case 'network-error':
      return '请检查网络连接'
    case 'unknown-error':
      return '请刷新页面重试'
    default:
      return '请重试'
  }
}

export function formatError(type: ErrorType, context?: string): string {
  const message = getErrorMessage(type)
  return context ? `${message}：${context}` : message
}

export function getErrorIcon(type: ErrorType): string {
  switch (type) {
    case 'upload-failed':
      return '📤'
    case 'export-failed':
      return '📥'
    case 'save-failed':
      return '💾'
    case 'load-failed':
      return '📂'
    case 'network-error':
      return '🌐'
    case 'unknown-error':
      return '❓'
    default:
      return '⚠️'
  }
}
