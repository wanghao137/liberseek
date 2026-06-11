import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'

import type {
  ProjectAsset,
  ProjectAssetRole,
  WorkshopProject,
} from './project'

export const DSCALE_PACKAGE_MIME = 'application/zip'
export const DSCALE_PROJECT_PATH = 'project.json'

export type PackageableAsset = ProjectAsset & {
  blob: Blob
}

export type PackageableProject = Omit<WorkshopProject, 'assets'> & {
  assets: PackageableAsset[]
}

type PackagedAsset = ProjectAsset & {
  path: string
}

type DscaleProjectJson = Omit<WorkshopProject, 'assets'> & {
  assets: PackagedAsset[]
}

const PACKAGE_IMPORT_FALLBACK =
  '项目包导入失败，请确认文件为有效的 .dscale.zip。'
const KNOWN_PACKAGE_ERROR_PREFIX = '项目包'

function extensionFromAsset(asset: PackageableAsset): string {
  const nameExtension = asset.name.match(/\.([a-zA-Z0-9]+)$/)?.[1]

  if (nameExtension) {
    return nameExtension.toLowerCase()
  }

  if (asset.mimeType === 'image/png') {
    return 'png'
  }

  if (asset.mimeType === 'image/jpeg') {
    return 'jpg'
  }

  if (asset.mimeType === 'image/webp') {
    return 'webp'
  }

  if (asset.mimeType === 'image/gif') {
    return 'gif'
  }

  return 'bin'
}

function assetPath(asset: PackageableAsset): string {
  const extension = extensionFromAsset(asset)

  if (asset.role === 'front') {
    return `assets/front.${extension}`
  }

  if (asset.role === 'back') {
    return `assets/back.${extension}`
  }

  return `assets/leaves/${asset.id}.${extension}`
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer())
}

function uint8ArrayToBlob(data: Uint8Array, type: string): Blob {
  const buffer = new ArrayBuffer(data.byteLength)

  new Uint8Array(buffer).set(data)

  return new Blob([buffer], {
    type,
  })
}

function readProjectJson(files: Record<string, Uint8Array>): DscaleProjectJson {
  const projectFile = files[DSCALE_PROJECT_PATH]

  if (!projectFile) {
    throw new Error('项目包缺少 project.json')
  }

  let parsed: DscaleProjectJson

  try {
    parsed = JSON.parse(strFromU8(projectFile)) as DscaleProjectJson
  } catch {
    throw new Error('项目包清单无法解析')
  }

  if (parsed.schemaVersion !== 1 || parsed.app !== 'linjuan-workshop') {
    throw new Error('项目包版本不受支持')
  }

  return parsed
}

export function formatDscalePackageImportError(error: unknown): string {
  if (
    error instanceof Error &&
    error.message.startsWith(KNOWN_PACKAGE_ERROR_PREFIX)
  ) {
    return error.message
  }

  return PACKAGE_IMPORT_FALLBACK
}

export async function exportDscalePackage(
  project: PackageableProject,
): Promise<Blob> {
  const files: Record<string, Uint8Array> = {}
  const assets: PackagedAsset[] = []

  for (const asset of project.assets) {
    const path = assetPath(asset)

    assets.push({
      id: asset.id,
      role: asset.role,
      name: asset.name,
      mimeType: asset.mimeType,
      widthPx: asset.widthPx,
      heightPx: asset.heightPx,
      path,
    })
    files[path] = await blobToUint8Array(asset.blob)
  }

  const projectJson: DscaleProjectJson = {
    schemaVersion: project.schemaVersion,
    app: project.app,
    id: project.id,
    title: project.title,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    settings: project.settings,
    assets,
    leaves: project.leaves,
    transforms: project.transforms,
  }

  files[DSCALE_PROJECT_PATH] = strToU8(JSON.stringify(projectJson, null, 2))

  return new Blob([zipSync(files)], {
    type: DSCALE_PACKAGE_MIME,
  })
}

export async function importDscalePackage(
  packageBlob: Blob,
): Promise<PackageableProject> {
  let files: Record<string, Uint8Array>

  try {
    files = unzipSync(await blobToUint8Array(packageBlob))
  } catch {
    throw new Error('项目包无法读取')
  }

  const projectJson = readProjectJson(files)
  const assets: PackageableAsset[] = projectJson.assets.map((asset) => {
    const file = files[asset.path]

    if (!file) {
      throw new Error(`项目包缺少素材文件：${asset.path}`)
    }

    return {
      id: asset.id,
      role: asset.role as ProjectAssetRole,
      name: asset.name,
      mimeType: asset.mimeType,
      widthPx: asset.widthPx,
      heightPx: asset.heightPx,
      blob: uint8ArrayToBlob(file, asset.mimeType),
    }
  })

  return {
    schemaVersion: projectJson.schemaVersion,
    app: projectJson.app,
    id: projectJson.id,
    title: projectJson.title,
    createdAt: projectJson.createdAt,
    updatedAt: projectJson.updatedAt,
    settings: projectJson.settings,
    assets,
    leaves: projectJson.leaves,
    transforms: projectJson.transforms,
  }
}
