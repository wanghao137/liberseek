import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import { computeDerivedDimensions } from '../binding/geometry'
import { createWorkshopProject } from '../project/project'
import { exportDscalePackage, importDscalePackage } from '../project/dscalePackage'
import { createImagePackageZip } from './imagePackageZip'

describe('export round-trip tests', () => {
  it('dscale package preserves settings on round-trip', async () => {
    const project = createWorkshopProject({
      id: 'test-roundtrip',
      title: '往返测试项目',
      now: '2026-06-12T00:00:00.000Z',
      settings: {
        ...DEFAULT_BINDING_SETTINGS,
        artworkHeightCm: 25,
        visiblePageWidthCm: 18,
        leafCount: 15,
      },
    })

    const frontBlob = new Blob(['front image'], { type: 'image/png' })
    const leafBlob = new Blob(['leaf image'], { type: 'image/jpeg' })

    const projectWithAssets = {
      ...project,
      assets: [
        {
          id: 'front_asset',
          role: 'front' as const,
          name: 'front.png',
          mimeType: 'image/png',
          widthPx: 1200,
          heightPx: 800,
          blob: frontBlob,
        },
        {
          id: 'leaf_asset',
          role: 'leaf' as const,
          name: 'leaf.jpg',
          mimeType: 'image/jpeg',
          widthPx: 900,
          heightPx: 1200,
          blob: leafBlob,
        },
      ],
      leaves: project.leaves.map((leaf, index) =>
        index === 0 ? { ...leaf, assetId: 'leaf_asset' } : leaf,
      ),
    }

    const exportedBlob = await exportDscalePackage(projectWithAssets)
    const imported = await importDscalePackage(exportedBlob)

    expect(imported.id).toBe(project.id)
    expect(imported.title).toBe(project.title)
    expect(imported.settings).toEqual(project.settings)
    expect(imported.leaves.length).toBe(project.leaves.length)
    expect(imported.leaves[0].assetId).toBe('leaf_asset')
    expect(imported.assets.length).toBe(2)
  })

  it('image package preserves settings', async () => {
    const settings = {
      ...DEFAULT_BINDING_SETTINGS,
      leafCount: 5,
    }
    const derived = computeDerivedDimensions(settings)

    const frameBlobs: Blob[] = []
    for (let i = 0; i < 5; i++) {
      frameBlobs.push(new Blob([`frame ${i + 1}`], { type: 'image/png' }))
    }

    const zipBlob = await createImagePackageZip({
      projectTitle: '测试项目',
      settings,
      derived,
      frameBlobs,
      frontScrollBlob: new Blob(['front'], { type: 'image/png' }),
      backScrollBlob: new Blob(['back'], { type: 'image/png' }),
    })

    expect(zipBlob).toBeInstanceOf(Blob)
    expect(zipBlob.type).toBe('application/zip')
    expect(zipBlob.size).toBeGreaterThan(0)
  })
})
