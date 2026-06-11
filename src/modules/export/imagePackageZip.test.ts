import { describe, expect, it } from 'vitest'
import { strFromU8 } from 'fflate'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import { computeDerivedDimensions } from '../binding/geometry'
import {
  createImagePackageZip,
  type ImagePackageZipInput,
} from './imagePackageZip'

describe('image package ZIP export', () => {
  describe('createImagePackageZip', () => {
    it('creates a ZIP with frame files, manifest, and README', async () => {
      const settings = DEFAULT_BINDING_SETTINGS
      const derived = computeDerivedDimensions(settings)
      
      const frameBlobs: Blob[] = []
      for (let i = 0; i < 3; i++) {
        frameBlobs.push(new Blob([`frame ${i + 1}`], { type: 'image/png' }))
      }

      const input: ImagePackageZipInput = {
        projectTitle: '测试项目',
        settings,
        derived,
        frameBlobs,
        frontScrollBlob: new Blob(['front scroll'], { type: 'image/png' }),
        backScrollBlob: new Blob(['back scroll'], { type: 'image/png' }),
      }

      const zipBlob = await createImagePackageZip(input)

      expect(zipBlob).toBeInstanceOf(Blob)
      expect(zipBlob.type).toBe('application/zip')
      expect(zipBlob.size).toBeGreaterThan(0)
    })

    it('ZIP contains correct file structure', async () => {
      const settings = DEFAULT_BINDING_SETTINGS
      const derived = computeDerivedDimensions(settings)
      
      const frameBlobs: Blob[] = []
      for (let i = 0; i < 3; i++) {
        frameBlobs.push(new Blob([`frame ${i + 1}`], { type: 'image/png' }))
      }

      const input: ImagePackageZipInput = {
        projectTitle: '测试项目',
        settings,
        derived,
        frameBlobs,
        frontScrollBlob: new Blob(['front scroll'], { type: 'image/png' }),
        backScrollBlob: new Blob(['back scroll'], { type: 'image/png' }),
      }

      const zipBlob = await createImagePackageZip(input)
      const zipData = new Uint8Array(await zipBlob.arrayBuffer())
      
      const { unzipSync } = await import('fflate')
      const files = unzipSync(zipData)

      expect(files['manifest.json']).toBeDefined()
      expect(files['README.txt']).toBeDefined()
      expect(files['frames/frame_001.png']).toBeDefined()
      expect(files['frames/frame_002.png']).toBeDefined()
      expect(files['frames/frame_003.png']).toBeDefined()
      expect(files['scroll/front_full.png']).toBeDefined()
      expect(files['scroll/back_full.png']).toBeDefined()
    })

    it('manifest contains correct metadata', async () => {
      const settings = DEFAULT_BINDING_SETTINGS
      const derived = computeDerivedDimensions(settings)
      
      const frameBlobs: Blob[] = []
      for (let i = 0; i < 3; i++) {
        frameBlobs.push(new Blob([`frame ${i + 1}`], { type: 'image/png' }))
      }

      const input: ImagePackageZipInput = {
        projectTitle: '测试项目',
        settings,
        derived,
        frameBlobs,
        frontScrollBlob: new Blob(['front scroll'], { type: 'image/png' }),
        backScrollBlob: new Blob(['back scroll'], { type: 'image/png' }),
      }

      const zipBlob = await createImagePackageZip(input)
      const zipData = new Uint8Array(await zipBlob.arrayBuffer())
      
      const { unzipSync } = await import('fflate')
      const files = unzipSync(zipData)

      const manifest = JSON.parse(strFromU8(files['manifest.json']))
      
      expect(manifest.schemaVersion).toBe(1)
      expect(manifest.exportType).toBe('images')
      expect(manifest.projectTitle).toBe('测试项目')
      expect(manifest.settings).toEqual(settings)
      expect(manifest.derived).toEqual(derived)
      expect(manifest.files.length).toBe(5)
    })

    it('README contains Chinese assembly instructions', async () => {
      const settings = DEFAULT_BINDING_SETTINGS
      const derived = computeDerivedDimensions(settings)
      
      const frameBlobs: Blob[] = []
      for (let i = 0; i < 3; i++) {
        frameBlobs.push(new Blob([`frame ${i + 1}`], { type: 'image/png' }))
      }

      const input: ImagePackageZipInput = {
        projectTitle: '测试项目',
        settings,
        derived,
        frameBlobs,
        frontScrollBlob: new Blob(['front scroll'], { type: 'image/png' }),
        backScrollBlob: new Blob(['back scroll'], { type: 'image/png' }),
      }

      const zipBlob = await createImagePackageZip(input)
      const zipData = new Uint8Array(await zipBlob.arrayBuffer())
      
      const { unzipSync } = await import('fflate')
      const files = unzipSync(zipData)

      const readme = strFromU8(files['README.txt'])
      
      expect(readme).toContain('项目名称：测试项目')
      expect(readme).toContain('画心高度：30 厘米')
      expect(readme).toContain('组装顺序')
      expect(readme).toContain('frame_001.png')
    })

    it('handles missing scroll blobs gracefully', async () => {
      const settings = DEFAULT_BINDING_SETTINGS
      const derived = computeDerivedDimensions(settings)
      
      const frameBlobs: Blob[] = []
      for (let i = 0; i < 3; i++) {
        frameBlobs.push(new Blob([`frame ${i + 1}`], { type: 'image/png' }))
      }

      const input: ImagePackageZipInput = {
        projectTitle: '测试项目',
        settings,
        derived,
        frameBlobs,
        frontScrollBlob: null,
        backScrollBlob: null,
      }

      const zipBlob = await createImagePackageZip(input)
      const zipData = new Uint8Array(await zipBlob.arrayBuffer())
      
      const { unzipSync } = await import('fflate')
      const files = unzipSync(zipData)

      expect(files['manifest.json']).toBeDefined()
      expect(files['frames/frame_001.png']).toBeDefined()
      expect(files['scroll/front_full.png']).toBeUndefined()
      expect(files['scroll/back_full.png']).toBeUndefined()
    })
  })
})
