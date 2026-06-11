import { describe, expect, it } from 'vitest'

import { computeDerivedDimensions, type BindingSettings } from '../binding/geometry'
import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import {
  generateFrameFilename,
  generateImagePackageManifest,
  type ImagePackageFile,
  type ImagePackageManifest,
} from './imagePackage'

const defaultSettings: BindingSettings = DEFAULT_BINDING_SETTINGS

describe('image package export', () => {
  describe('generateFrameFilename', () => {
    it('generates zero-padded frame filenames starting from 001', () => {
      expect(generateFrameFilename(0)).toBe('frame_001.png')
      expect(generateFrameFilename(1)).toBe('frame_002.png')
      expect(generateFrameFilename(22)).toBe('frame_023.png')
    })

    it('pads to three digits for leaf counts under 1000', () => {
      expect(generateFrameFilename(99)).toBe('frame_100.png')
      expect(generateFrameFilename(999)).toBe('frame_1000.png')
    })
  })

  describe('generateImagePackageManifest', () => {
    it('generates a manifest with correct derived dimensions', () => {
      const derived = computeDerivedDimensions(defaultSettings)
      const files: ImagePackageFile[] = [
        {
          path: 'frames/frame_001.png',
          role: 'leaf-frame',
          widthCm: derived.leafPhysicalWidthCm,
          heightCm: defaultSettings.artworkHeightCm,
          widthPx: derived.frameWidthPx,
          heightPx: derived.frameHeightPx,
        },
        {
          path: 'scroll/front_full.png',
          role: 'scroll-front',
          widthCm: derived.scrollArtworkLengthCm,
          heightCm: defaultSettings.artworkHeightCm,
          widthPx: derived.scrollWidthPx,
          heightPx: derived.scrollHeightPx,
        },
      ]

      const manifest: ImagePackageManifest = generateImagePackageManifest(
        '测试项目',
        defaultSettings,
        derived,
        files,
        [],
      )

      expect(manifest.schemaVersion).toBe(1)
      expect(manifest.exportType).toBe('images')
      expect(manifest.projectTitle).toBe('测试项目')
      expect(manifest.settings).toEqual(defaultSettings)
      expect(manifest.derived).toEqual(derived)
      expect(manifest.files).toEqual(files)
      expect(manifest.warnings).toEqual([])
      expect(manifest.exportedAt).toBeDefined()
    })

    it('includes warnings when provided', () => {
      const derived = computeDerivedDimensions(defaultSettings)
      const warnings = ['源图分辨率低于导出目标', '长卷尺寸不适合家用打印机']

      const manifest = generateImagePackageManifest(
        '测试项目',
        defaultSettings,
        derived,
        [],
        warnings,
      )

      expect(manifest.warnings).toEqual(warnings)
    })
  })

  describe('manifest file structure', () => {
    it('includes all required frame files for default leaf count', () => {
      const derived = computeDerivedDimensions(defaultSettings)
      const files: ImagePackageFile[] = []

      for (let i = 0; i < defaultSettings.leafCount; i++) {
        files.push({
          path: `frames/${generateFrameFilename(i)}`,
          role: 'leaf-frame',
          widthCm: derived.leafPhysicalWidthCm,
          heightCm: defaultSettings.artworkHeightCm,
          widthPx: derived.frameWidthPx,
          heightPx: derived.frameHeightPx,
        })
      }

      files.push({
        path: 'scroll/front_full.png',
        role: 'scroll-front',
        widthCm: derived.scrollArtworkLengthCm,
        heightCm: defaultSettings.artworkHeightCm,
        widthPx: derived.scrollWidthPx,
        heightPx: derived.scrollHeightPx,
      })

      files.push({
        path: 'scroll/back_full.png',
        role: 'scroll-back',
        widthCm: derived.scrollArtworkLengthCm,
        heightCm: defaultSettings.artworkHeightCm,
        widthPx: derived.scrollWidthPx,
        heightPx: derived.scrollHeightPx,
      })

      const manifest = generateImagePackageManifest(
        '默认项目',
        defaultSettings,
        derived,
        files,
        [],
      )

      expect(manifest.files).toHaveLength(25)
      expect(manifest.files[0].path).toBe('frames/frame_001.png')
      expect(manifest.files[22].path).toBe('frames/frame_023.png')
      expect(manifest.files[23].path).toBe('scroll/front_full.png')
      expect(manifest.files[24].path).toBe('scroll/back_full.png')
    })
  })
})
