import Dexie, { type EntityTable } from 'dexie'

export type DraftProject = {
  id: string
  title: string
  settings: any
  assets: any[]
  leaves: any[]
  transforms: any
  createdAt: string
  updatedAt: string
}

export type DraftAsset = {
  id: string
  projectId: string
  role: string
  name: string
  mimeType: string
  widthPx: number | null
  heightPx: number | null
  blob: Blob
}

const db = new Dexie('LinjuanWorkshopDB') as Dexie & {
  projects: EntityTable<DraftProject, 'id'>
  assets: EntityTable<DraftAsset, 'id'>
}

db.version(1).stores({
  projects: 'id, title, createdAt, updatedAt',
  assets: 'id, projectId, role',
})

export async function saveProject(project: DraftProject): Promise<void> {
  await db.projects.put(project)
}

export async function loadProject(id: string): Promise<DraftProject | undefined> {
  return await db.projects.get(id)
}

export async function loadAllProjects(): Promise<DraftProject[]> {
  return await db.projects.toArray()
}

export async function deleteProject(id: string): Promise<void> {
  await db.assets.where('projectId').equals(id).delete()
  await db.projects.delete(id)
}

export async function saveAsset(asset: DraftAsset): Promise<void> {
  await db.assets.put(asset)
}

export async function loadAssetsByProject(projectId: string): Promise<DraftAsset[]> {
  return await db.assets.where('projectId').equals(projectId).toArray()
}

export async function deleteAsset(id: string): Promise<void> {
  await db.assets.delete(id)
}

export async function clearAllData(): Promise<void> {
  await db.projects.clear()
  await db.assets.clear()
}

export { db }
