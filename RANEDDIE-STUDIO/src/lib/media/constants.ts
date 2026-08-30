import type { AssetKind } from '@/lib/types'

/** Container/codec combinations the media library accepts on upload. */
export const ACCEPTED_TYPES: Record<AssetKind, string[]> = {
  video: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/ogg', 'audio/aac', 'audio/mp4'],
  image: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
}

export const ACCEPTED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.m4v', '.mp3', '.wav', '.ogg', '.aac', '.m4a', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif']

export const ACCEPT_ATTRIBUTE = [
  ...ACCEPTED_TYPES.video,
  ...ACCEPTED_TYPES.audio,
  ...ACCEPTED_TYPES.image,
  ...ACCEPTED_EXTENSIONS,
].join(',')

/** 512 MB — beyond this, IndexedDB and in-tab decoding stop being reasonable. */
export const MAX_FILE_SIZE = 512 * 1024 * 1024

export function detectKind(file: { type: string; name: string }): AssetKind | null {
  const type = file.type.toLowerCase()
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  if (type.startsWith('image/')) return 'image'

  // Some systems hand over an empty MIME type for .mov / .m4a — fall back to the extension.
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (['.mp4', '.mov', '.webm', '.m4v'].includes(ext)) return 'video'
  if (['.mp3', '.wav', '.ogg', '.aac', '.m4a'].includes(ext)) return 'audio'
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'].includes(ext)) return 'image'
  return null
}

export class UnsupportedMediaError extends Error {
  constructor(public readonly filename: string) {
    super(`"${filename}" isn't a media type Editime can read. Supported: MP4, MOV, WEBM, MP3, WAV, PNG, JPG, WEBP.`)
    this.name = 'UnsupportedMediaError'
  }
}

export class MediaTooLargeError extends Error {
  constructor(public readonly filename: string) {
    super(`"${filename}" is larger than 512 MB. Trim or compress it before importing.`)
    this.name = 'MediaTooLargeError'
  }
}
