import { createId } from '@/lib/id'
import type {
  Asset,
  AspectRatio,
  CaptionClip,
  ClipTransform,
  Effect,
  EffectType,
  Fps,
  MediaClip,
  PlaceholderClip,
  Project,
  ProjectSettings,
  ResolutionPreset,
  TextClip,
  TextStyle,
  Timeline,
  Track,
  TrackKind,
  Transition,
  TransitionType,
} from '@/lib/types'
import { PROJECT_SCHEMA_VERSION } from '@/lib/types'

export const DEFAULT_SETTINGS: ProjectSettings = {
  aspectRatio: '16:9',
  resolution: '1080p',
  fps: 30,
  backgroundColor: '#000000',
}

export const IDENTITY_TRANSFORM: ClipTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  crop: { top: 0, right: 0, bottom: 0, left: 0 },
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'var(--font-sans)',
  fontSize: 64,
  fontWeight: 700,
  color: '#FFFFFF',
  align: 'center',
  letterSpacing: 0,
  lineHeight: 1.15,
  uppercase: false,
  backgroundColor: '#000000',
  backgroundOpacity: 0,
  paddingX: 24,
  paddingY: 12,
  strokeColor: '#000000',
  strokeWidth: 0,
  shadow: 0.35,
  x: 0,
  y: 0,
  maxWidth: 0.82,
}

const TRACK_HEIGHTS: Record<TrackKind, number> = {
  video: 62,
  audio: 46,
  text: 34,
  caption: 34,
}

export function createTrack(kind: TrackKind, name?: string, overrides: Partial<Track> = {}): Track {
  return {
    id: createId('track'),
    kind,
    name: name ?? defaultTrackName(kind),
    clips: [],
    muted: false,
    hidden: false,
    locked: false,
    volume: 1,
    height: TRACK_HEIGHTS[kind],
    ...overrides,
  }
}

function defaultTrackName(kind: TrackKind) {
  switch (kind) {
    case 'video':
      return 'Video'
    case 'audio':
      return 'Audio'
    case 'text':
      return 'Text'
    case 'caption':
      return 'Captions'
  }
}

export function createEffect(type: EffectType, params: Record<string, number>, name: string, presetId?: string): Effect {
  return { id: createId('fx'), type, name, presetId, enabled: true, params }
}

export function createTransition(type: TransitionType, duration = 0.5, direction?: Transition['direction']): Transition {
  return { id: createId('tr'), type, duration, direction }
}

export function createMediaClip(
  asset: Asset,
  trackId: string,
  start: number,
  overrides: Partial<MediaClip> = {},
): MediaClip {
  // Images have no intrinsic duration — 4s is a sensible default still length.
  const sourceDuration = asset.kind === 'image' ? 4 : Math.max(0.1, asset.duration)
  return {
    id: createId('clip'),
    kind: 'media',
    trackId,
    assetId: asset.id,
    assetKind: asset.kind,
    start,
    duration: sourceDuration,
    inPoint: 0,
    outPoint: sourceDuration,
    speed: 1,
    volume: 1,
    muted: false,
    fadeIn: 0,
    fadeOut: 0,
    opacity: 1,
    locked: false,
    label: asset.name,
    transform: structuredClone(IDENTITY_TRANSFORM),
    effects: [],
    ...overrides,
  }
}

export function createTextClip(
  trackId: string,
  start: number,
  content: string,
  overrides: Partial<TextClip> = {},
): TextClip {
  return {
    id: createId('clip'),
    kind: 'text',
    trackId,
    start,
    duration: 3,
    locked: false,
    label: content.slice(0, 32) || 'Text',
    content,
    preset: 'heading',
    style: { ...DEFAULT_TEXT_STYLE },
    animation: 'fade',
    ...overrides,
  }
}

export function createCaptionClip(
  trackId: string,
  start: number,
  duration: number,
  text: string,
  overrides: Partial<CaptionClip> = {},
): CaptionClip {
  return {
    id: createId('clip'),
    kind: 'caption',
    trackId,
    start,
    duration,
    locked: false,
    label: text.slice(0, 32),
    text,
    preset: 'clean',
    style: { ...DEFAULT_TEXT_STYLE, fontSize: 40, y: 0.66, maxWidth: 0.7 },
    ...overrides,
  }
}

export function createTimeline(): Timeline {
  return {
    tracks: [createTrack('video', 'Video 1'), createTrack('audio', 'Audio 1')],
    duration: 0,
  }
}

export function createProject(input: {
  name: string
  aspectRatio?: AspectRatio
  resolution?: ResolutionPreset
  fps?: Fps
  timeline?: Timeline
  assets?: Asset[]
  templateId?: string
  isDemo?: boolean
}): Project {
  const now = new Date().toISOString()
  const timeline = input.timeline ?? createTimeline()
  const settings: ProjectSettings = {
    ...DEFAULT_SETTINGS,
    aspectRatio: input.aspectRatio ?? DEFAULT_SETTINGS.aspectRatio,
    resolution: input.resolution ?? DEFAULT_SETTINGS.resolution,
    fps: input.fps ?? DEFAULT_SETTINGS.fps,
  }
  return {
    id: createId('proj'),
    name: input.name,
    createdAt: now,
    updatedAt: now,
    duration: timeline.duration,
    aspectRatio: settings.aspectRatio,
    settings,
    assets: input.assets ?? [],
    timeline,
    templateId: input.templateId,
    isDemo: input.isDemo,
    schemaVersion: PROJECT_SCHEMA_VERSION,
  }
}

export function createPlaceholderClip(
  trackId: string,
  start: number,
  duration: number,
  accepts: 'video' | 'image' | 'audio',
  label: string,
  overrides: Partial<PlaceholderClip> = {},
): PlaceholderClip {
  return {
    id: createId('clip'),
    kind: 'placeholder',
    trackId,
    start,
    duration,
    locked: false,
    label,
    accepts,
    hint: accepts === 'audio' ? 'Drop audio here' : accepts === 'image' ? 'Drop an image here' : 'Drop video here',
    effects: [],
    volume: 1,
    ...overrides,
  }
}

/** Swaps a template slot for a real clip, carrying the slot's look across. */
export function fillPlaceholder(placeholder: PlaceholderClip, asset: Asset): MediaClip {
  const sourceDuration = asset.kind === 'image' ? placeholder.duration : Math.max(0.1, asset.duration)
  return {
    ...createMediaClip(asset, placeholder.trackId, placeholder.start),
    id: placeholder.id,
    duration: Math.min(placeholder.duration, sourceDuration),
    outPoint: Math.min(placeholder.duration, sourceDuration),
    effects: placeholder.effects,
    transitionIn: placeholder.transitionIn,
    volume: placeholder.volume,
    label: asset.name,
  }
}
