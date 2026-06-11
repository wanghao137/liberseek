import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import { computeDerivedDimensions } from '../binding/geometry'
import {
  exportImagePackage,
  exportReadme,
  type ExportInput,
} from './exportFlow'

describe('export flow', () => {
  describe('exportImagePackage', () => {
    it('exports image package as ZIP blob', async () => {
      const settings = DEFAULT_BINDING_SETTINGS
      const derived = computeDerivedDimensions(settings)
      
      const frameBlobs: Blob[] = []
      for (let i = 0; i < 3; i++) {
        frameBlobs.push(new Blob([`frame ${i + 1}`], { type: 'image/png' }))
      }

      const input: ExportInput = {
        projectTitle: '测试项目',
        settings,
        derived,
        frameBlobs,
        frontScrollBlob: new Blob(['front'], { type: 'image/png' }),
        backScrollBlob: new Blob(['back'], { type: 'image/png' }),
      }

      const result = await exportImagePackage(input)

      expect(result.success).toBe(true)
      expect(result.blob).toBeInstanceOf(Blob)
      expect(result.blob!.type).toBe('application/zip')
      expect(result.filename).toContain('图片包')
      expect(result.filename).toContain('.zip')
    })

    it('calls onProgress during export', async () => {
      const settings = DEFAULT_BINDING_SETTINGS
      const derived = computeDerivedDimensions(settings)
      
      const frameBlobs: Blob[] = []
      for (let i = 0; i < 3; i++) {
        frameBlobs.push(new Blob([`frame ${i + 1}`], { type: 'image/png' }))
      }

      const input: ExportInput = {
        projectTitle: '测试项目',
        settings,
        derived,
        frameBlobs,
        frontScrollBlob: new Blob(['front'], { type: 'image/png' }),
        backScrollBlob: new Blob(['back'], { type: 'image/png' }),
      }

      const onProgress = vi.fn()
      await exportImagePackage(input, onProgress)

      expect(onProgress).toHaveBeenCalled()
    })
  })

  describe('exportReadme', () => {
    it('exports README as text blob', async () => {
      const settings = DEFAULT_BINDING_SETTINGS
      const derived = computeDerivedDimensions(settings)

      const input: ExportInput = {
        projectTitle: '测试项目',
        settings,
        derived,
      }

      const result = await exportReadme(input)

      expect(result.success).toBe(true)
      expect(result.blob).toBeInstanceOf(Blob)
      expect(result.blob!.type).toBe('text/plain;charset=utf-8')
      expect(result.filename).toContain('README')
      expect(result.filename).toContain('.txt')
    })
  })
})
