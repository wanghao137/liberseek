import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'

import { createWorkshopProject } from '../project/project'
import {
  ACTIVE_DRAFT_KEY,
  DRAFT_DB_NAME,
  clearActiveDraft,
  createDraftRecord,
  loadActiveDraft,
  saveActiveDraft,
  toRuntimeDraftProject,
  type RuntimeDraftProject,
} from './draft'

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

describe('draft persistence model', () => {
  it('creates a persistable active draft record without runtime preview URLs', () => {
    const frontBlob = new Blob(['front image'], { type: 'image/png' })
    const project: RuntimeDraftProject = {
      ...createWorkshopProject({
        id: 'project_test',
        now: '2026-06-11T00:00:00.000Z',
      }),
      assets: [
        {
          id: 'front_asset',
          role: 'front',
          name: 'front.png',
          mimeType: 'image/png',
          widthPx: 1200,
          heightPx: 800,
          blob: frontBlob,
          previewUrl: 'blob:http://localhost/front',
        },
      ],
    }

    const record = createDraftRecord(
      project,
      '2026-06-11T01:00:00.000Z',
    )

    expect(record.key).toBe(ACTIVE_DRAFT_KEY)
    expect(record.savedAt).toBe('2026-06-11T01:00:00.000Z')
    expect(record.project.assets).toEqual([
      {
        id: 'front_asset',
        role: 'front',
        name: 'front.png',
        mimeType: 'image/png',
        widthPx: 1200,
        heightPx: 800,
        blob: frontBlob,
      },
    ])
    expect('previewUrl' in record.project.assets[0]).toBe(false)
  })

  it('revives a stored draft with fresh object URLs for editing', () => {
    const leafBlob = new Blob(['leaf image'], { type: 'image/png' })
    const record = createDraftRecord(
      {
        ...createWorkshopProject({
          id: 'project_test',
          now: '2026-06-11T00:00:00.000Z',
        }),
        assets: [
          {
            id: 'leaf_asset',
            role: 'leaf',
            name: 'leaf.png',
            mimeType: 'image/png',
            widthPx: 900,
            heightPx: 1200,
            blob: leafBlob,
            previewUrl: 'blob:http://localhost/old-leaf',
          },
        ],
      },
      '2026-06-11T01:00:00.000Z',
    )
    const createdUrls: string[] = []

    const revived = toRuntimeDraftProject(record.project, (blob) => {
      createdUrls.push(blob.type)
      return `blob:fresh-${createdUrls.length}`
    })

    expect(revived.assets).toEqual([
      {
        id: 'leaf_asset',
        role: 'leaf',
        name: 'leaf.png',
        mimeType: 'image/png',
        widthPx: 900,
        heightPx: 1200,
        blob: leafBlob,
        previewUrl: 'blob:fresh-1',
      },
    ])
    expect(createdUrls).toEqual(['image/png'])
  })

  it('saves, loads, and clears the active draft in IndexedDB', async () => {
    await deleteDatabase(DRAFT_DB_NAME)
    const frontBlob = new Blob(['front image'], { type: 'image/png' })
    const project: RuntimeDraftProject = {
      ...createWorkshopProject({
        id: 'project_test',
        now: '2026-06-11T00:00:00.000Z',
      }),
      assets: [
        {
          id: 'front_asset',
          role: 'front',
          name: 'front.png',
          mimeType: 'image/png',
          widthPx: 1200,
          heightPx: 800,
          blob: frontBlob,
          previewUrl: 'blob:http://localhost/front',
        },
      ],
    }

    await saveActiveDraft(project)
    const loaded = await loadActiveDraft()

    expect(loaded?.id).toBe('project_test')
    expect(loaded?.assets[0]).toMatchObject({
      id: 'front_asset',
      role: 'front',
      name: 'front.png',
      mimeType: 'image/png',
      widthPx: 1200,
      heightPx: 800,
    })
    expect(await loaded?.assets[0].blob.text()).toBe('front image')

    await clearActiveDraft()

    expect(await loadActiveDraft()).toBeNull()
  })
})
