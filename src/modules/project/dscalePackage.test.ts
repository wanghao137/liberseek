import { strToU8, zipSync } from 'fflate'
import { describe, expect, it } from 'vitest'

import { createWorkshopProject } from './project'
import {
  exportDscalePackage,
  formatDscalePackageImportError,
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

  it('rejects packages without project.json', async () => {
    const packageBlob = new Blob([zipSync({ 'assets/front.png': strToU8('x') })])

    await expect(importDscalePackage(packageBlob)).rejects.toThrow(
      '项目包缺少 project.json',
    )
  })

  it('rejects packages with unsupported schema metadata', async () => {
    const packageBlob = new Blob([
      zipSync({
        'project.json': strToU8(
          JSON.stringify({
            schemaVersion: 2,
            app: 'linjuan-workshop',
            assets: [],
          }),
        ),
      }),
    ])

    await expect(importDscalePackage(packageBlob)).rejects.toThrow(
      '项目包版本不受支持',
    )
  })

  it('rejects packages with malformed project.json', async () => {
    const packageBlob = new Blob([
      zipSync({
        'project.json': strToU8('{'),
      }),
    ])

    await expect(importDscalePackage(packageBlob)).rejects.toThrow(
      '项目包清单无法解析',
    )
  })

  it('rejects packages that reference missing asset files', async () => {
    const base = createWorkshopProject({
      id: 'project_missing_asset',
      title: '缺素材项目',
      now: '2026-06-11T00:00:00.000Z',
    })
    const packageBlob = new Blob([
      zipSync({
        'project.json': strToU8(
          JSON.stringify({
            ...base,
            assets: [
              {
                id: 'front_asset',
                role: 'front',
                name: 'front.png',
                mimeType: 'image/png',
                widthPx: 1200,
                heightPx: 800,
                path: 'assets/front.png',
              },
            ],
          }),
        ),
      }),
    ])

    await expect(importDscalePackage(packageBlob)).rejects.toThrow(
      '项目包缺少素材文件：assets/front.png',
    )
  })

  it('formats known package import errors for the editor notice', () => {
    expect(
      formatDscalePackageImportError(new Error('项目包缺少 project.json')),
    ).toBe('项目包缺少 project.json')
    expect(formatDscalePackageImportError(new Error('network failed'))).toBe(
      '项目包导入失败，请确认文件为有效的 .dscale.zip。',
    )
  })
})
