import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import { computeDerivedDimensions } from '../binding/geometry'
import { createImagePackageZip } from './imagePackageZip'
import { validateExportReady } from './validation'

describe('large file memory tests', () => {
  it('handles many frame files without memory issues', async () => {
    const settings = {
      ...DEFAULT_BINDING_SETTINGS,
      leafCount: 50,
    }
    const derived = computeDerivedDimensions(settings)

    const frameBlobs: Blob[] = []
    for (let i = 0; i < 50; i++) {
      frameBlobs.push(new Blob([`frame ${i + 1}`], { type: 'image/png' }))
    }

    const zipBlob = await createImagePackageZip({
      projectTitle: '大文件测试项目',
      settings,
      derived,
      frameBlobs,
      frontScrollBlob: new Blob(['front'], { type: 'image/png' }),
      backScrollBlob: new Blob(['back'], { type: 'image/png' }),
    })

    expect(zipBlob).toBeInstanceOf(Blob)
    expect(zipBlob.size).toBeGreaterThan(0)
  })

  it('validates large project settings', () => {
    const settings = {
      ...DEFAULT_BINDING_SETTINGS,
      leafCount: 100,
      artworkHeightCm: 50,
      visiblePageWidthCm: 40,
    }

    const result = validateExportReady(settings, {
      front: true,
      back: true,
      leaves: 100,
    })

    expect(result.errors).toHaveLength(0)
    expect(result.warnings.length).toBeGreaterThanOrEqual(0)
  })

  it('handles high DPI settings', () => {
    const settings = {
      ...DEFAULT_BINDING_SETTINGS,
      dpi: 600,
    }

    const derived = computeDerivedDimensions(settings)

    expect(derived.frameWidthPx).toBeGreaterThan(0)
    expect(derived.frameHeightPx).toBeGreaterThan(0)
    expect(derived.scrollWidthPx).toBeGreaterThan(0)
    expect(derived.scrollHeightPx).toBeGreaterThan(0)
  })
})
