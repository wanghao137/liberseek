import { describe, expect, it } from 'vitest'

import { createWorkshopProject } from './project'
import {
  exportDscalePackage,
  importDscalePackage,
  type PackageableProject,
} from './dscalePackage'

describe('dscale project package', () => {
  it('exports and imports an editable project package with image blobs', async () => {
    const frontBlob = new Blob(['front image'], { type: 'image/png' })
    const leafBlob = new Blob(['leaf image'], { type: 'image/jpeg' })
    const base = createWorkshopProject({
      id: 'project_test',
      title: '测试项目',
      now: '2026-06-11T00:00:00.000Z',
    })
    const project: PackageableProject = {
      ...base,
      assets: [
        {
          id: 'front_asset',
          role: 'front',
          name: 'front.png',
          mimeType: 'image/png',
          widthPx: 1200,
          heightPx: 800,
          blob: frontBlob,
        },
        {
          id: 'leaf_asset',
          role: 'leaf',
          name: 'leaf.jpg',
          mimeType: 'image/jpeg',
          widthPx: 900,
          heightPx: 1200,
          blob: leafBlob,
        },
      ],
      leaves: base.leaves.map((leaf, index) =>
        index === 0 ? { ...leaf, assetId: 'leaf_asset' } : leaf,
      ),
    }

    const blob = await exportDscalePackage(project)
    const imported = await importDscalePackage(blob)

    expect(blob.type).toBe('application/zip')
    expect(imported).toMatchObject({
      schemaVersion: 1,
      app: 'linjuan-workshop',
      id: 'project_test',
      title: '测试项目',
      settings: base.settings,
      leaves: project.leaves,
      transforms: {},
    })
    expect(imported.assets).toHaveLength(2)
    expect(imported.assets.map((asset) => asset.role)).toEqual([
      'front',
      'leaf',
    ])
    expect(await imported.assets[0].blob.text()).toBe('front image')
    expect(await imported.assets[1].blob.text()).toBe('leaf image')
  })

  it('rejects packages without a supported project manifest', async () => {
    await expect(importDscalePackage(new Blob(['not zip']))).rejects.toThrow(
      '项目包无法读取',
    )
  })
})
