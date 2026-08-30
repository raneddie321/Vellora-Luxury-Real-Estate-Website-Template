import type { AssetKind } from '@/lib/types'

export interface MediaMetadata {
  duration: number
  width?: number
  height?: number
}

const withTimeout = <T>(promise: Promise<T>, ms: number, message: string) =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])

/**
 * Reads intrinsic metadata by letting the browser's own demuxer do the work.
 * No ffmpeg needed for the common path, which keeps import instant.
 */
export async function probeMedia(url: string, kind: AssetKind): Promise<MediaMetadata> {
  if (kind === 'image') return probeImage(url)
  return withTimeout(probeAV(url, kind), 20000, 'Timed out while reading this file. It may be corrupt or use an unsupported codec.')
}

function probeImage(url: string): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ duration: 0, width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('This image could not be decoded.'))
    img.src = url
  })
}

function probeAV(url: string, kind: AssetKind): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    const element = document.createElement(kind === 'audio' ? 'audio' : 'video')
    element.preload = 'metadata'
    element.muted = true

    const cleanup = () => {
      element.removeAttribute('src')
      element.load()
    }

    element.onloadedmetadata = () => {
      // Some WEBM files report Infinity until a seek forces the duration out.
      if (!Number.isFinite(element.duration)) {
        element.currentTime = 1e101
        element.ontimeupdate = () => {
          element.ontimeupdate = null
          const duration = Number.isFinite(element.duration) ? element.duration : 0
          const media = element as HTMLVideoElement
          resolve({ duration, width: media.videoWidth || undefined, height: media.videoHeight || undefined })
          cleanup()
        }
        return
      }
      const media = element as HTMLVideoElement
      resolve({
        duration: element.duration,
        width: media.videoWidth || undefined,
        height: media.videoHeight || undefined,
      })
      cleanup()
    }

    element.onerror = () => {
      cleanup()
      reject(new Error('This file could not be decoded by your browser. Try re-encoding it as H.264 MP4.'))
    }
    element.src = url
  })
}
