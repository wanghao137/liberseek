import { zipSync, strToU8 } from 'fflate'
import type { BindingSettings } from '../binding/geometry'
import { generateReadmeContent } from './readmeExport'
import { generateImagePackageManifest, type ImagePackageFile } from './imagePackage'

export type ImagePackageZipInput = {
  projectTitle: string
  settings: BindingSettings
  derived: {
    leafPhysicalWidthCm: number
    scrollArtworkLengthCm: number
    pageStructureCount: number
    frameWidthPx: number
    frameHeightPx: number
    scrollWidthPx: number
    scrollHeightPx: number
  }
  frameBlobs: Blob[]
  frontScrollBlob: Blob | null
  backScrollBlob: Blob | null
}

export async function createImagePackageZip(
  input: ImagePackageZipInput,
): Promise<Blob> {
  const { projectTitle, settings, derived, frameBlobs, frontScrollBlob, backScrollBlob } = input

  const files: Record<string, Uint8Array> = {}
  const manifestFiles: ImagePackageFile[] = []

  for (let i = 0; i < frameBlobs.length; i++) {
    const path = `frames/frame_${String(i + 1).padStart(3, '0')}.png`
    files[path] = new Uint8Array(await frameBlobs[i].arrayBuffer())
    manifestFiles.push({
      path,
      role: 'leaf-frame',
      widthCm: derived.leafPhysicalWidthCm,
      heightCm: settings.artworkHeightCm,
      widthPx: derived.frameWidthPx,
      heightPx: derived.frameHeightPx,
    })
  }

  if (frontScrollBlob) {
    const path = 'scroll/front_full.png'
    files[path] = new Uint8Array(await frontScrollBlob.arrayBuffer())
    manifestFiles.push({
      path,
      role: 'scroll-front',
      widthCm: derived.scrollArtworkLengthCm,
      heightCm: settings.artworkHeightCm,
      widthPx: derived.scrollWidthPx,
      heightPx: derived.scrollHeightPx,
    })
  }

  if (backScrollBlob) {
    const path = 'scroll/back_full.png'
    files[path] = new Uint8Array(await backScrollBlob.arrayBuffer())
    manifestFiles.push({
      path,
      role: 'scroll-back',
      widthCm: derived.scrollArtworkLengthCm,
      heightCm: settings.artworkHeightCm,
      widthPx: derived.scrollWidthPx,
      heightPx: derived.scrollHeightPx,
    })
  }

  const manifest = generateImagePackageManifest(
    projectTitle,
    settings,
    derived,
    manifestFiles,
    [],
  )

  files['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2))

  const readme = generateReadmeContent({
    projectTitle,
    settings,
  })

  files['README.txt'] = strToU8(readme)

  return new Blob([zipSync(files)], { type: 'application/zip' })
}
