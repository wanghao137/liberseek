import { describe, expect, it, vi } from 'vitest'

import {
  createExportProgress,
  updateExportProgress,
  completeExportProgress,
  cancelExportProgress,
} from './exportProgress'

describe('export progress', () => {
  describe('createExportProgress', () => {
    it('creates initial progress state', () => {
      const progress = createExportProgress('image-package', 10)

      expect(progress.type).toBe('image-package')
      expect(progress.totalSteps).toBe(10)
      expect(progress.currentStep).toBe(0)
      expect(progress.status).toBe('preparing')
      expect(progress.message).toBe('准备导出...')
      expect(progress.startTime).toBeGreaterThan(0)
      expect(progress.cancelled).toBe(false)
    })
  })

  describe('updateExportProgress', () => {
    it('updates current step and message', () => {
      const progress = createExportProgress('image-package', 10)

      const updated = updateExportProgress(progress, 3, '正在生成 frame 3...')

      expect(updated.currentStep).toBe(3)
      expect(updated.message).toBe('正在生成 frame 3...')
      expect(updated.status).toBe('exporting')
    })

    it('calculates percentage correctly', () => {
      const progress = createExportProgress('image-package', 10)

      const updated = updateExportProgress(progress, 5, '处理中...')

      expect(updated.percentage).toBe(50)
    })

    it('marks as complete when step equals total', () => {
      const progress = createExportProgress('image-package', 10)

      const updated = updateExportProgress(progress, 10, '完成')

      expect(updated.status).toBe('complete')
      expect(updated.percentage).toBe(100)
    })
  })

  describe('completeExportProgress', () => {
    it('marks progress as complete', () => {
      const progress = createExportProgress('image-package', 10)

      const completed = completeExportProgress(progress, '导出完成')

      expect(completed.status).toBe('complete')
      expect(completed.currentStep).toBe(completed.totalSteps)
      expect(completed.message).toBe('导出完成')
      expect(completed.endTime).toBeGreaterThan(0)
    })
  })

  describe('cancelExportProgress', () => {
    it('marks progress as cancelled', () => {
      const progress = createExportProgress('image-package', 10)

      const cancelled = cancelExportProgress(progress)

      expect(cancelled.status).toBe('cancelled')
      expect(cancelled.cancelled).toBe(true)
      expect(cancelled.endTime).toBeGreaterThan(0)
    })
  })

  describe('progress callback', () => {
    it('calls onProgress callback during updates', () => {
      const onProgress = vi.fn()
      const progress = createExportProgress('image-package', 10, onProgress)

      updateExportProgress(progress, 1, '步骤 1')

      expect(onProgress).toHaveBeenCalledTimes(1)
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ currentStep: 1 }),
      )
    })
  })
})
