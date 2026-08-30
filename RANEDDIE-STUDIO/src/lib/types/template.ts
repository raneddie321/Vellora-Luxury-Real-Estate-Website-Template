import type { AspectRatio, Fps, ResolutionPreset } from './media'
import type { TextAnimation, TextStyle, TrackKind, TransitionType } from './timeline'

export type TemplateCategory =
  | 'YouTube'
  | 'TikTok'
  | 'Instagram'
  | 'Ads'
  | 'Corporate'
  | 'Cinematic'
  | 'Product'
  | 'Real Estate'
  | 'Social Media'

/**
 * Templates are pure data. `TemplateBlueprint` describes a timeline in terms of
 * *slots* rather than concrete assets, so a template can be applied to a project
 * whose media the template author never saw. Slots with no matching asset become
 * clearly-marked placeholder clips instead of failing.
 */
export interface BlueprintTextClip {
  kind: 'text'
  start: number
  duration: number
  content: string
  preset: string
  style?: Partial<TextStyle>
  animation?: TextAnimation
}

export interface BlueprintMediaSlot {
  kind: 'media'
  start: number
  duration: number
  /** Which kind of asset should fill this slot. */
  accepts: 'video' | 'image' | 'audio'
  label: string
  transitionIn?: { type: TransitionType; duration: number }
  effects?: { type: string; presetId: string }[]
  volume?: number
}

export type BlueprintClip = BlueprintTextClip | BlueprintMediaSlot

export interface BlueprintTrack {
  kind: TrackKind
  name: string
  clips: BlueprintClip[]
  volume?: number
}

export interface TemplateBlueprint {
  aspectRatio: AspectRatio
  resolution: ResolutionPreset
  fps: Fps
  tracks: BlueprintTrack[]
}

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  description: string
  /** Approximate finished length in seconds. */
  duration: number
  aspectRatio: AspectRatio
  tags: string[]
  /** Two CSS colours used to render the template's poster gradient. */
  gradient: [string, string]
  blueprint: TemplateBlueprint
}
