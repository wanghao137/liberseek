import type { ProjectAsset, WorkshopProject } from '../project/project'

export const DRAFT_DB_NAME = 'linjuan-workshop-drafts'
export const DRAFT_DB_VERSION = 1
export const DRAFT_STORE_NAME = 'drafts'
export const ACTIVE_DRAFT_KEY = 'active'

export type PersistedDraftAsset = ProjectAsset & {
  blob: Blob
}

export type RuntimeDraftAsset = PersistedDraftAsset & {
  previewUrl: string
}

export type PersistedDraftProject = Omit<WorkshopProject, 'assets'> & {
  assets: PersistedDraftAsset[]
}

export type RuntimeDraftProject = Omit<WorkshopProject, 'assets'> & {
  assets: RuntimeDraftAsset[]
}

export type DraftRecord = {
  key: typeof ACTIVE_DRAFT_KEY
  savedAt: string
  project: PersistedDraftProject
}

export function createDraftRecord(
  project: RuntimeDraftProject,
  savedAt = new Date().toISOString(),
): DraftRecord {
  return {
    key: ACTIVE_DRAFT_KEY,
    savedAt,
    project: {
      ...project,
      assets: project.assets.map((asset) => ({
        id: asset.id,
        role: asset.role,
        name: asset.name,
        mimeType: asset.mimeType,
        widthPx: asset.widthPx,
        heightPx: asset.heightPx,
        blob: asset.blob,
      })),
    },
  }
}

export function toRuntimeDraftProject(
  project: PersistedDraftProject,
  createPreviewUrl: (blob: Blob) => string,
): RuntimeDraftProject {
  return {
    ...project,
    assets: project.assets.map((asset) => ({
      ...asset,
      previewUrl: createPreviewUrl(asset.blob),
    })),
  }
}

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DRAFT_DB_NAME, DRAFT_DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) {
        db.createObjectStore(DRAFT_STORE_NAME, {
          keyPath: 'key',
        })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function runDraftTransaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDraftDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(DRAFT_STORE_NAME, mode)
        const store = transaction.objectStore(DRAFT_STORE_NAME)
        const request = run(store)

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
        transaction.oncomplete = () => db.close()
        transaction.onerror = () => {
          db.close()
          reject(transaction.error)
        }
        transaction.onabort = () => {
          db.close()
          reject(transaction.error)
        }
      }),
  )
}

export function saveActiveDraft(project: RuntimeDraftProject): Promise<void> {
  const record = createDraftRecord(project)

  return runDraftTransaction('readwrite', (store) => store.put(record)).then(
    () => undefined,
  )
}

export function loadActiveDraft(): Promise<PersistedDraftProject | null> {
  return runDraftTransaction<DraftRecord | undefined>('readonly', (store) =>
    store.get(ACTIVE_DRAFT_KEY),
  ).then((record) => record?.project ?? null)
}

export function clearActiveDraft(): Promise<void> {
  return runDraftTransaction('readwrite', (store) =>
    store.delete(ACTIVE_DRAFT_KEY),
  ).then(() => undefined)
}
