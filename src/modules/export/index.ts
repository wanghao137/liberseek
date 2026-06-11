import type { WorkshopProject } from '../project/project'
import { computeDerivedDimensions } from '../binding/geometry'
import { generateReadmeContent } from './readmeExport'
import {
  generateImagePackageManifest,
  createImagePackageFiles,
  validateImagePackageExport,
} from './imagePackage'
import {
  generatePdfMetadata,
  validatePdfExport,
} from './pdfExport'
import { validateExportReady } from './validation'

export type ExportType = 'image-package' | 'pdf-package' | 'readme'

export type ExportOptions = {
  type: ExportType
  project: WorkshopProject
}

export type ExportResult = {
  success: boolean
  errors: string[]
  warnings: string[]
  files?: Array<{
    name: string
    content: string | Blob
    mimeType: string
  }>
}

export async function exportProject(
  options: ExportOptions,
): Promise<ExportResult> {
  const { type, project } = options
  const assetCount = {
    front: project.assets.some((a) => a.role === 'front'),
    back: project.assets.some((a) => a.role === 'back'),
    leaves: project.assets.filter((a) => a.role === 'leaf').length,
  }

  const validation = validateExportReady(project.settings, assetCount)

  if (validation.errors.length > 0) {
    return {
      success: false,
      errors: validation.errors,
      warnings: validation.warnings,
    }
  }

  switch (type) {
    case 'image-package':
      return exportImagePackage(project, assetCount)
    case 'pdf-package':
      return exportPdfPackage(project, assetCount)
    case 'readme':
      return exportReadme(project, assetCount)
    default:
      return {
        success: false,
        errors: [`不支持的导出类型：${type}`],
        warnings: [],
      }
  }
}

function exportImagePackage(
  project: WorkshopProject,
  assetCount: { front: boolean; back: boolean; leaves: number },
): ExportResult {
  const derived = computeDerivedDimensions(project.settings)
  const files = createImagePackageFiles(project.settings)
  const warnings = validateImagePackageExport(project.settings, assetCount)

  const manifest = generateImagePackageManifest(
    project.title,
    project.settings,
    derived,
    files,
    warnings,
  )

  return {
    success: true,
    errors: [],
    warnings,
    files: [
      {
        name: 'manifest.json',
        content: JSON.stringify(manifest, null, 2),
        mimeType: 'application/json',
      },
    ],
  }
}

function exportPdfPackage(
  project: WorkshopProject,
  assetCount: { front: boolean; back: boolean; leaves: number },
): ExportResult {
  const metadata = generatePdfMetadata({
    projectTitle: project.title,
    settings: project.settings,
  })

  const warnings = validatePdfExport(project.settings, assetCount)

  return {
    success: true,
    errors: [],
    warnings,
    files: [
      {
        name: 'pdf-metadata.json',
        content: JSON.stringify(metadata, null, 2),
        mimeType: 'application/json',
      },
    ],
  }
}

function exportReadme(
  project: WorkshopProject,
  _assetCount: { front: boolean; back: boolean; leaves: number },
): ExportResult {
  const content = generateReadmeContent({
    projectTitle: project.title,
    settings: project.settings,
  })

  return {
    success: true,
    errors: [],
    warnings: [],
    files: [
      {
        name: 'README.txt',
        content,
        mimeType: 'text/plain',
      },
    ],
  }
}
