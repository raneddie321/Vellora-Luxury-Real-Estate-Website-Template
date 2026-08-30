import {
  createCaptionClip,
  createEffect,
  createPlaceholderClip,
  createTextClip,
  createTrack,
  createTransition,
  fillPlaceholder,
} from '@/lib/timeline/factories'
import { normalize } from '@/lib/timeline/operations'
import { EFFECT_PRESETS } from '@/lib/effects'
import { getTextPreset, resolveTextStyle } from '@/lib/text/presets'
import type {
  Asset,
  BlueprintClip,
  Clip,
  EffectType,
  Project,
  Template,
  TextAnimation,
  Timeline,
  Track,
} from '@/lib/types'

/**
 * Applies a template to a project.
 *
 * Media slots are filled from the project's own library where the kinds match,
 * in timeline order. Anything left over becomes a labelled placeholder rather
 * than a broken or invented clip, so the result is always honest about what is
 * still missing.
 */
export function applyTemplate(project: Project, template: Template): Project {
  const blueprint = template.blueprint
  const pools = {
    video: project.assets.filter((a) => a.kind === 'video'),
    image: project.assets.filter((a) => a.kind === 'image'),
    audio: project.assets.filter((a) => a.kind === 'audio'),
  }
  const cursors = { video: 0, image: 0, audio: 0 }

  const takeAsset = (accepts: 'video' | 'image' | 'audio'): Asset | null => {
    const pool = pools[accepts]
    if (cursors[accepts] < pool.length) return pool[cursors[accepts]++]
    // A video slot happily takes a still if that is all the user has.
    if (accepts === 'video' && cursors.image < pools.image.length) return pools.image[cursors.image++]
    return null
  }

  const tracks: Track[] = blueprint.tracks.map((blueprintTrack) => {
    const track = createTrack(blueprintTrack.kind, blueprintTrack.name, {
      volume: blueprintTrack.volume ?? 1,
    })
    track.clips = blueprintTrack.clips
      .map((clip) => buildClip(clip, track.id, takeAsset))
      .filter((clip): clip is Clip => clip !== null)
    return track
  })

  const timeline: Timeline = normalize({ tracks, duration: 0 })

  return {
    ...project,
    aspectRatio: blueprint.aspectRatio,
    settings: {
      ...project.settings,
      aspectRatio: blueprint.aspectRatio,
      resolution: blueprint.resolution,
      fps: blueprint.fps,
    },
    templateId: template.id,
    timeline,
    duration: timeline.duration,
  }
}

function buildClip(
  blueprint: BlueprintClip,
  trackId: string,
  takeAsset: (accepts: 'video' | 'image' | 'audio') => Asset | null,
): Clip | null {
  if (blueprint.kind === 'text') {
    const preset = getTextPreset(blueprint.preset)
    return createTextClip(trackId, blueprint.start, blueprint.content, {
      duration: blueprint.duration,
      preset: blueprint.preset,
      style: resolveTextStyle({ ...preset?.style, ...blueprint.style }),
      animation: (blueprint.animation ?? preset?.animation ?? 'fade') as TextAnimation,
    })
  }

  const effects = (blueprint.effects ?? []).flatMap((spec) => {
    const preset = EFFECT_PRESETS.find((p) => p.id === spec.presetId)
    if (!preset) return []
    return [createEffect(spec.type as EffectType, preset.params, preset.name, preset.id)]
  })
  const transitionIn = blueprint.transitionIn
    ? createTransition(blueprint.transitionIn.type, blueprint.transitionIn.duration)
    : undefined

  const placeholder = createPlaceholderClip(
    trackId,
    blueprint.start,
    blueprint.duration,
    blueprint.accepts,
    blueprint.label,
    { effects, transitionIn, volume: blueprint.volume ?? 1 },
  )

  const asset = takeAsset(blueprint.accepts)
  if (!asset) return placeholder

  const filled = fillPlaceholder(placeholder, asset)
  // Keep the template's rhythm: a slot's length wins over the source length.
  filled.duration = blueprint.duration
  if (asset.kind !== 'image') {
    filled.outPoint = Math.min(asset.duration, filled.inPoint + blueprint.duration * filled.speed)
    filled.duration = Math.min(blueprint.duration, (filled.outPoint - filled.inPoint) / filled.speed)
  }
  return filled
}

/** Used by the caption panel to seed a caption track from a template. */
export const emptyCaptionTrack = (trackId: string) => createCaptionClip(trackId, 0, 2, '')
