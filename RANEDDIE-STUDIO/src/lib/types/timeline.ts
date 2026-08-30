import type { AssetKind } from './media'

export type TrackKind = 'video' | 'audio' | 'text' | 'caption'

export type EffectType =
  | 'color'
  | 'blur'
  | 'glow'
  | 'vignette'
  | 'grain'
  | 'sharpen'
  | 'distortion'

export interface Effect {
  id: string
  type: EffectType
  /** Id of the preset this effect was created from, when applicable. */
  presetId?: string
  name: string
  enabled: boolean
  /** Numeric parameters, normalised where possible. See `lib/effects`. */
  params: Record<string, number>
}

export type TransitionType = 'cut' | 'fade' | 'dissolve' | 'slide' | 'zoom'

export interface Transition {
  id: string
  type: TransitionType
  /** Seconds. */
  duration: number
  direction?: 'left' | 'right' | 'up' | 'down'
}

export interface ClipTransform {
  /** -1..1 relative to composition width/height. */
  x: number
  y: number
  scale: number
  rotation: number
  /** Normalised crop insets, 0..0.49 each. */
  crop: { top: number; right: number; bottom: number; left: number }
}

export interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: number
  color: string
  align: 'left' | 'center' | 'right'
  letterSpacing: number
  lineHeight: number
  uppercase: boolean
  backgroundColor: string
  backgroundOpacity: number
  paddingX: number
  paddingY: number
  strokeColor: string
  strokeWidth: number
  shadow: number
  /** -1..1, relative to composition. */
  x: number
  y: number
  maxWidth: number
}

export type TextAnimation = 'none' | 'fade' | 'slide-up' | 'pop' | 'typewriter' | 'blur-in'

interface ClipBase {
  id: string
  trackId: string
  /** Timeline position, seconds. */
  start: number
  /** Timeline length, seconds. */
  duration: number
  locked: boolean
  label: string
}

export interface MediaClip extends ClipBase {
  kind: 'media'
  assetId: string
  assetKind: AssetKind
  /** Source in/out points, seconds. `outPoint - inPoint` equals duration × speed. */
  inPoint: number
  outPoint: number
  speed: number
  volume: number
  muted: boolean
  fadeIn: number
  fadeOut: number
  opacity: number
  transform: ClipTransform
  effects: Effect[]
  transitionIn?: Transition
  transitionOut?: Transition
}

export interface TextClip extends ClipBase {
  kind: 'text'
  content: string
  preset: string
  style: TextStyle
  animation: TextAnimation
}

export interface CaptionClip extends ClipBase {
  kind: 'caption'
  text: string
  preset: string
  style: TextStyle
  /** 0..1 recogniser confidence, when the source provides one. */
  confidence?: number
  /** Id of the AI job that produced this caption, for provenance. */
  jobId?: string
}

/**
 * A slot created by a template for media the user has not supplied yet.
 * It renders as a labelled slate rather than pretending footage exists, and is
 * replaced by a real `MediaClip` the moment an asset is dropped on it.
 */
export interface PlaceholderClip extends ClipBase {
  kind: 'placeholder'
  accepts: 'video' | 'image' | 'audio'
  hint: string
  /** Carried onto the media clip that replaces this slot. */
  effects: Effect[]
  transitionIn?: Transition
  volume: number
}

export type Clip = MediaClip | TextClip | CaptionClip | PlaceholderClip
export type ClipKind = Clip['kind']

export interface Track {
  id: string
  kind: TrackKind
  name: string
  clips: Clip[]
  muted: boolean
  hidden: boolean
  locked: boolean
  /** 0..1 track-level gain, applied on top of clip volume. */
  volume: number
  /** Row height in px at 100% zoom. */
  height: number
}

export interface Timeline {
  tracks: Track[]
  /** Cached content duration in seconds; recomputed on every mutation. */
  duration: number
}

export const isMediaClip = (clip: Clip): clip is MediaClip => clip.kind === 'media'
export const isTextClip = (clip: Clip): clip is TextClip => clip.kind === 'text'
export const isCaptionClip = (clip: Clip): clip is CaptionClip => clip.kind === 'caption'
export const isPlaceholderClip = (clip: Clip): clip is PlaceholderClip => clip.kind === 'placeholder'
export const hasText = (clip: Clip): clip is TextClip | CaptionClip =>
  clip.kind === 'text' || clip.kind === 'caption'
