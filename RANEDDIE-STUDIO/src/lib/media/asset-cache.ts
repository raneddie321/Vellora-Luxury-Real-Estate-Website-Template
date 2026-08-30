import { getBlobStore } from '@/lib/persistence'
import type { Asset } from '@/lib/types'

/**
 * Resolves assets to playable object URLs and keeps a small pool of media
 * elements alive, so scrubbing the timeline doesn't re-create a <video> on
 * every frame.
 */

const urlCache = new Map<string, string>()
const pendingUrls = new Map<string, Promise<string>>()
const elementCache = new Map<string, HTMLVideoElement | HTMLImageElement | HTMLAudioElement>()

export async function resolveAssetUrl(asset: Asset): Promise<string> {
  const cached = urlCache.get(asset.id)
  if (cached) return cached
  const pending = pendingUrls.get(asset.id)
  if (pending) return pending

  const promise = (async () => {
    if (asset.source.type !== 'idb') return asset.source.url
    const blob = await getBlobStore().get(asset.source.key)
    if (!blob) {
      throw new Error(
        `The media for "${asset.name}" is missing from local storage. Re-import the file to restore it.`,
      )
    }
    return URL.createObjectURL(blob)
  })()
    .then((url) => {
      urlCache.set(asset.id, url)
      pendingUrls.delete(asset.id)
      return url
    })
    .catch((error) => {
      pendingUrls.delete(asset.id)
      throw error
    })

  pendingUrls.set(asset.id, promise)
  return promise
}

export function peekAssetUrl(assetId: string): string | undefined {
  return urlCache.get(assetId)
}

/** Returns a ready media element for an asset, creating and priming it once. */
export async function getMediaElement(
  asset: Asset,
): Promise<HTMLVideoElement | HTMLImageElement | HTMLAudioElement> {
  const existing = elementCache.get(asset.id)
  if (existing) return existing

  const url = await resolveAssetUrl(asset)

  if (asset.kind === 'image') {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Could not decode "${asset.name}".`))
      img.src = url
    })
    elementCache.set(asset.id, img)
    return img
  }

  const element: HTMLVideoElement | HTMLAudioElement =
    asset.kind === 'audio' ? document.createElement('audio') : document.createElement('video')
  element.preload = 'auto'
  if (element instanceof HTMLVideoElement) element.playsInline = true
  element.crossOrigin = 'anonymous'
  element.muted = true
  await new Promise<void>((resolve, reject) => {
    element.onloadeddata = () => resolve()
    element.oncanplay = () => resolve()
    element.onerror = () => reject(new Error(`Could not decode "${asset.name}".`))
    element.src = url
  })
  elementCache.set(asset.id, element)
  return element
}

export function releaseAsset(assetId: string) {
  const element = elementCache.get(assetId)
  if (element && 'pause' in element) {
    element.pause()
    element.removeAttribute('src')
    element.load()
  }
  elementCache.delete(assetId)
  const url = urlCache.get(assetId)
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
  urlCache.delete(assetId)
}

export function releaseAll() {
  for (const id of [...urlCache.keys()]) releaseAsset(id)
  elementCache.clear()
}
