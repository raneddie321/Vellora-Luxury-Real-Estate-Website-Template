/**
 * Media + project primitives.
 *
 * These types are deliberately free of any React or storage concerns so the
 * same models can be reused by a future backend, a render worker, or a native
 * client without modification.
 */

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5'
export type ResolutionPreset = '720p' | '1080p' | '4K'
export type Fps = 24 | 25 | 30 | 60

export const ASPECT_RATIOS: Record<AspectRatio, { w: number; h: number; label: string }> = {
  '16:9': { w: 16, h: 9, label: 'Widescreen' },
  '9:16': { w: 9, h: 16, label: 'Vertical' },
  '1:1': { w: 1, h: 1, label: 'Square' },
  '4:5': { w: 4, h: 5, label: 'Portrait' },
}

export const RESOLUTION_HEIGHTS: Record<ResolutionPreset, number> = {
  '720p': 720,
  '1080p': 1080,
  '4K': 2160,
}

export interface ProjectSettings {
  aspectRatio: AspectRatio
  resolution: ResolutionPreset
  fps: Fps
  /** CSS colour used for letterboxing and gaps between clips. */
  backgroundColor: string
}

export type AssetKind = 'video' | 'audio' | 'image'

/**
 * Where an asset's bytes actually live.
 * The MVP stores uploads in IndexedDB; `remote` is the seam a future
 * S3/R2-backed storage service plugs into without touching the rest of the app.
 */
export type AssetSource =
  | { type: 'idb'; key: string }
  | { type: 'remote'; url: string }
  | { type: 'generated'; url: string; provider: string }

export interface SceneMarker {
  time: number
  confidence: number
  label: string
}

export interface SilenceRange {
  start: number
  end: number
}

export interface SceneAnalysis {
  analyzedAt: string
  provider: string
  /** Detected shot boundaries, in source seconds. */
  scenes: SceneMarker[]
  /** Ranges the analyser considered silent, in source seconds. */
  silences: SilenceRange[]
  /** Free-form summary produced by the provider. */
  summary?: string
  tags?: string[]
  /** Average loudness 0..1 sampled across the asset. */
  loudness?: number
}

export interface Asset {
  id: string
  name: string
  kind: AssetKind
  mimeType: string
  /** Bytes. */
  size: number
  /** Seconds. Images report 0. */
  duration: number
  width?: number
  height?: number
  createdAt: string
  source: AssetSource
  /** Small data URL used for library tiles and timeline clip thumbnails. */
  thumbnailDataUrl?: string
  /** Normalised 0..1 peaks for waveform rendering. */
  waveform?: number[]
  analysis?: SceneAnalysis
  /** Set when the asset is part of the bundled demo project. */
  demo?: boolean
}
