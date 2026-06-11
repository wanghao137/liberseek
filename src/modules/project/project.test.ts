import { describe, expect, it } from 'vitest'

import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'
import { createWorkshopProject, updateProjectSettings } from './project'

describe('workshop project model', () => {
  it('creates a local workshop project with stable empty leaf slots', () => {
    const project = createWorkshopProject({
      id: 'project_test',
      now: '2026-06-11T00:00:00.000Z',
    })

    expect(project).toMatchObject({
      schemaVersion: 1,
      app: 'linjuan-workshop',
      id: 'project_test',
      title: '未命名项目',
      createdAt: '2026-06-11T00:00:00.000Z',
      updatedAt: '2026-06-11T00:00:00.000Z',
      settings: DEFAULT_BINDING_SETTINGS,
      assets: [],
      transforms: {},
    })
    expect(project.leaves).toHaveLength(DEFAULT_BINDING_SETTINGS.leafCount)
    expect(project.leaves[0]).toEqual({
      id: 'leaf_001',
      assetId: null,
    })
    expect(project.leaves[22]).toEqual({
      id: 'leaf_023',
      assetId: null,
    })
  })

  it('resizes leaf slots when leaf count changes while preserving existing assets', () => {
    const project = createWorkshopProject({
      id: 'project_test',
      now: '2026-06-11T00:00:00.000Z',
    })
    const withAsset = {
      ...project,
      leaves: project.leaves.map((leaf, index) =>
        index === 1 ? { ...leaf, assetId: 'asset_leaf_002' } : leaf,
      ),
    }

    const reduced = updateProjectSettings(
      withAsset,
      {
        leafCount: 3,
      },
      '2026-06-11T01:00:00.000Z',
    )
    const expanded = updateProjectSettings(
      reduced,
      {
        leafCount: 5,
      },
      '2026-06-11T02:00:00.000Z',
    )

    expect(reduced.leaves).toEqual([
      { id: 'leaf_001', assetId: null },
      { id: 'leaf_002', assetId: 'asset_leaf_002' },
      { id: 'leaf_003', assetId: null },
    ])
    expect(expanded.leaves).toEqual([
      { id: 'leaf_001', assetId: null },
      { id: 'leaf_002', assetId: 'asset_leaf_002' },
      { id: 'leaf_003', assetId: null },
      { id: 'leaf_004', assetId: null },
      { id: 'leaf_005', assetId: null },
    ])
    expect(expanded.settings.leafCount).toBe(5)
    expect(expanded.updatedAt).toBe('2026-06-11T02:00:00.000Z')
  })

  it('keeps invalid temporary leaf counts from crashing the editor state', () => {
    const project = createWorkshopProject({
      id: 'project_test',
      now: '2026-06-11T00:00:00.000Z',
    })

    const updated = updateProjectSettings(
      project,
      {
        leafCount: -1,
      },
      '2026-06-11T01:00:00.000Z',
    )

    expect(updated.settings.leafCount).toBe(-1)
    expect(updated.leaves).toEqual([])
  })
})
