import { describe, expect, it } from 'vitest'

import {
  getErrorMessage,
  getErrorHint,
  formatError,
} from './errorUtils'

describe('error utilities', () => {
  describe('getErrorMessage', () => {
    it('returns message for upload error', () => {
      const message = getErrorMessage('upload-failed')
      expect(message).toContain('上传')
    })

    it('returns message for export error', () => {
      const message = getErrorMessage('export-failed')
      expect(message).toContain('导出')
    })

    it('returns message for save error', () => {
      const message = getErrorMessage('save-failed')
      expect(message).toContain('保存')
    })

    it('returns message for load error', () => {
      const message = getErrorMessage('load-failed')
      expect(message).toContain('加载')
    })
  })

  describe('getErrorHint', () => {
    it('returns hint for upload error', () => {
      const hint = getErrorHint('upload-failed')
      expect(hint).toContain('重试')
    })

    it('returns hint for export error', () => {
      const hint = getErrorHint('export-failed')
      expect(hint).toContain('检查')
    })
  })

  describe('formatError', () => {
    it('formats error with context', () => {
      const formatted = formatError('upload-failed', '文件过大')
      expect(formatted).toContain('上传失败')
      expect(formatted).toContain('文件过大')
    })

    it('formats error without context', () => {
      const formatted = formatError('upload-failed')
      expect(formatted).toContain('上传失败')
    })
  })
})
