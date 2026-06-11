import type { BindingSettings } from '../binding/geometry'
import { DEFAULT_BINDING_SETTINGS } from '../binding/presets'

export type ProjectAssetRole = 'front' | 'back' | 'leaf'

export type ProjectAsset = {
  id: string
  role: ProjectAssetRole
  name: string
  mimeType: string
  widthPx: number | null
  heightPx: number | null
}

export type LeafSlot = {
  id: string
  assetId: string | null
}

export type FitMode = 'cover' | 'contain'

export type ImageTransform = {
  xCm: number
  yCm: number
  scale: number
  rotationDeg: number
  fitMode: FitMode
  cropRect: null
}

export type WorkshopProject = {
  schemaVersion: 1
  app: 'linjuan-workshop'
  id: string
  title: string
  createdAt: string
  updatedAt: string
  settings: BindingSettings
  assets: ProjectAsset[]
  leaves: LeafSlot[]
  transforms: Record<string, ImageTransform>
}

export type CreateWorkshopProjectOptions = {
  id?: string
  title?: string
  now?: string
  settings?: BindingSettings
}

function createLeafId(index: number): string {
  return `leaf_${String(index + 1).padStart(3, '0')}`
}

function createLeafSlots(
  leafCount: number,
  currentLeaves: LeafSlot[] = [],
): LeafSlot[] {
  return Array.from({ length: leafCount }, (_, index) => {
    const existing = currentLeaves[index]

    return {
      id: existing?.id ?? createLeafId(index),
      assetId: existing?.assetId ?? null,
    }
  })
}

export function createWorkshopProject(
  options: CreateWorkshopProjectOptions = {},
): WorkshopProject {
  const now = options.now ?? new Date().toISOString()
  const settings = options.settings ?? DEFAULT_BINDING_SETTINGS

  return {
    schemaVersion: 1,
    app: 'linjuan-workshop',
    id: options.id ?? `project_${Date.now()}`,
    title: options.title ?? '未命名项目',
    createdAt: now,
    updatedAt: now,
    settings,
    assets: [],
    leaves: createLeafSlots(settings.leafCount),
    transforms: {},
  }
}

export function updateProjectSettings(
  project: WorkshopProject,
  updates: Partial<BindingSettings>,
  now = new Date().toISOString(),
): WorkshopProject {
  const settings = {
    ...project.settings,
    ...updates,
  }

  return {
    ...project,
    updatedAt: now,
    settings,
    leaves: createLeafSlots(settings.leafCount, project.leaves),
  }
}
