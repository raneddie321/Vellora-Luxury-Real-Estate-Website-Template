import { createId } from '@/lib/id'
import { getBlobStore } from '@/lib/persistence'
import type { Asset, AssetKind } from '@/lib/types'
import { computePeaks, decodeAudio } from './audio'
import { MAX_FILE_SIZE, UnsupportedMediaError, MediaTooLargeError, detectKind } from './constants'
import { probeMedia } from './probe'
import { captureVideoFrame, generateImageThumbnail } from './thumbnails'

/**
 * The single import pipeline, shared by drag-and-drop upload and the demo
 * project generator: store the bytes, read real metadata, make a poster and,
 * for anything with sound, decode a waveform.
 *
 * Each stage that can fail without invalidating the asset (poster, waveform)
 * fails soft — a video with no thumbnail is still a usable video.
 */

export interface ImportProgress {
  stage: 'reading' | 'storing' | 'probing' | 'thumbnail' | 'waveform' | 'done'
  /** 0..1 */
  progress: number
}

export interface ImportOptions {
  onProgress?: (progress: ImportProgress) => void
  /** Marks the asset as part of the bundled demo project. */
  demo?: boolean
  /** Overrides the filename, used when importing a generated blob. */
  name?: string
}

export async function importMedia(file: Blob & { name?: string }, options: ImportOptions = {}): Promise<Asset> {
  const name = options.name ?? file.name ?? 'Untitled'
  const report = (stage: ImportProgress['stage'], progress: number) =>
    options.onProgress?.({ stage, progress })

  report('reading', 0.05)
  const kind: AssetKind | null = detectKind({ type: file.type, name })
  if (!kind) throw new UnsupportedMediaError(name)
  if (file.size > MAX_FILE_SIZE) throw new MediaTooLargeError(name)

  report('storing', 0.15)
  const key = createId('blob')
  await getBlobStore().put(key, file)

  const url = URL.createObjectURL(file)
  try {
    report('probing', 0.35)
    const metadata = await probeMedia(url, kind)

    report('thumbnail', 0.6)
    let thumbnailDataUrl: string | undefined
    try {
      if (kind === 'image') thumbnailDataUrl = await generateImageThumbnail(url)
      else if (kind === 'video') thumbnailDataUrl = await captureVideoFrame(url, Math.min(0.5, metadata.duration / 4))
    } catch {
      // A missing poster is cosmetic; the asset is still fully usable.
    }

    report('waveform', 0.8)
    let waveform: number[] | undefined
    if (kind !== 'image') {
      try {
        waveform = computePeaks(await decodeAudio(file))
      } catch {
        // Video with no audio track, or a codec WebAudio cannot decode.
      }
    }

    report('done', 1)
    return {
      id: createId('asset'),
      name,
      kind,
      mimeType: file.type || fallbackMime(kind),
      size: file.size,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      createdAt: new Date().toISOString(),
      source: { type: 'idb', key },
      thumbnailDataUrl,
      waveform,
      demo: options.demo,
    }
  } catch (error) {
    // Do not leave an orphaned blob behind when import fails.
    await getBlobStore().delete(key).catch(() => undefined)
    throw error
  } finally {
    URL.revokeObjectURL(url)
  }
}

const fallbackMime = (kind: AssetKind) =>
  kind === 'video' ? 'video/mp4' : kind === 'audio' ? 'audio/mpeg' : 'image/png'

/** Ensures an asset has decoded peaks, computing and caching them on demand. */
export async function ensureWaveform(asset: Asset): Promise<number[] | undefined> {
  if (asset.waveform?.length) return asset.waveform
  if (asset.kind === 'image' || asset.source.type !== 'idb') return undefined
  const blob = await getBlobStore().get(asset.source.key)
  if (!blob) return undefined
  try {
    return computePeaks(await decodeAudio(blob))
  } catch {
    return undefined
  }
}
