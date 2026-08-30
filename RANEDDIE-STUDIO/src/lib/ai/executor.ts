import {
  createCaptionClip,
  createEffect,
  createTextClip,
  createTrack,
  createTransition,
} from '@/lib/timeline/factories'
import {
  MIN_CLIP_DURATION,
  addClip,
  addTrack,
  allClips,
  clipEnd,
  findClip,
  normalize,
  removeClips,
  rippleDelete,
  setClipSpeed,
  splitAt,
  updateClip,
} from '@/lib/timeline/operations'
import { detectSilences } from '@/lib/media/audio'
import { getCompositionSize } from '@/lib/media/composition'
import { getCaptionPreset, getTextPreset, resolveTextStyle } from '@/lib/text/presets'
import type {
  AIAction,
  AIOperation,
  AspectRatio,
  Asset,
  CaptionClip,
  Clip,
  EffectType,
  MediaClip,
  Project,
  SilenceRange,
  TextAnimation,
  TextClip,
  Timeline,
  Track,
  TransitionType,
} from '@/lib/types'
import { deepClone } from '@/lib/utils'
import { CapabilityUnavailableError, type AIProvider } from './provider'

/**
 * The AI action executor.
 *
 * This is the only bridge between an AI plan and the project. It uses exactly
 * the same pure timeline operations a human click uses, which means:
 *   • AI edits are undoable by the ordinary history system,
 *   • an AI cannot reach a state a person could not reach by hand,
 *   • anything it cannot genuinely do raises instead of half-applying.
 */

export interface ExecutionServices {
  provider: AIProvider
  /** Decoded audio peaks for an asset, computed on demand and cached upstream. */
  waveformFor(asset: Asset): Promise<number[] | undefined>
  /** Frame-difference samples for shot detection. */
  frameDifferencesFor(asset: Asset): Promise<number[] | undefined>
}

export interface ExecutionContext extends ExecutionServices {
  playhead: number
  selection: string[]
}

export interface ExecutionResult {
  project: Project
  /** Plain-language record of what changed, shown in the plan UI. */
  notes: string[]
}

export class ActionNotApplicableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ActionNotApplicableError'
  }
}

/* ------------------------------------------------------------------ */
/* Target resolution                                                   */
/* ------------------------------------------------------------------ */

function resolveClipIds(project: Project, action: AIAction, selection: string[]): string[] {
  const timeline = project.timeline
  switch (action.target.kind) {
    case 'clip':
      return findClip(timeline, action.target.id) ? [action.target.id] : []
    case 'track': {
      const id = action.target.id
      return timeline.tracks.find((t) => t.id === id)?.clips.map((c) => c.id) ?? []
    }
    case 'selection':
      return selection.filter((id) => findClip(timeline, id))
    case 'all-video':
      return timeline.tracks.filter((t) => t.kind === 'video').flatMap((t) => t.clips.map((c) => c.id))
    case 'all-audio': {
      const audio = timeline.tracks.filter((t) => t.kind === 'audio').flatMap((t) => t.clips.map((c) => c.id))
      // Fall back to video clips that carry their own audio.
      if (audio.length > 0) return audio
      return timeline.tracks
        .filter((t) => t.kind === 'video')
        .flatMap((t) => t.clips)
        .filter((c): c is MediaClip => c.kind === 'media' && c.assetKind === 'video')
        .map((c) => c.id)
    }
    default:
      return []
  }
}

/** Falls back to every video clip when the requested scope is empty. */
function resolveWithFallback(project: Project, action: AIAction, selection: string[]): string[] {
  const ids = resolveClipIds(project, action, selection)
  if (ids.length > 0) return ids
  if (action.target.kind === 'selection') {
    return project.timeline.tracks.filter((t) => t.kind === 'video').flatMap((t) => t.clips.map((c) => c.id))
  }
  return ids
}

const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const str = (value: unknown, fallback: string): string => (typeof value === 'string' ? value : fallback)

/* ------------------------------------------------------------------ */
/* Timeline range surgery                                              */
/* ------------------------------------------------------------------ */

/** Merges overlapping/adjacent ranges so removal never double-counts. */
function mergeRanges(ranges: SilenceRange[], gap = 0.05): SilenceRange[] {
  const sorted = [...ranges].filter((r) => r.end > r.start).sort((a, b) => a.start - b.start)
  const merged: SilenceRange[] = []
  for (const range of sorted) {
    const last = merged[merged.length - 1]
    if (last && range.start - last.end <= gap) last.end = Math.max(last.end, range.end)
    else merged.push({ ...range })
  }
  return merged
}

/**
 * Cuts ranges out of every track and closes the gap, keeping picture and sound
 * in sync — the same thing a "ripple delete across all tracks" does by hand.
 *
 * Media clips are split at the range edges so their source in/out points stay
 * exact. Text and captions are *not* split: cutting a caption in half would
 * leave two clips both reading the whole line, so they are shortened or dropped
 * instead.
 */
function removeTimelineRanges(timeline: Timeline, ranges: SilenceRange[], fps: number): Timeline {
  let next = timeline
  const mediaTrackIds = timeline.tracks
    .filter((track) => track.kind === 'video' || track.kind === 'audio')
    .map((track) => track.id)

  for (const range of mergeRanges(ranges).sort((a, b) => b.start - a.start)) {
    const length = range.end - range.start
    if (length <= 0) continue

    next = splitAt(next, range.start, fps, mediaTrackIds)
    next = splitAt(next, range.end, fps, mediaTrackIds)

    const draft = deepClone(next)
    for (const track of draft.tracks) {
      const survivors: typeof track.clips = []
      for (const clip of track.clips) {
        const start = clip.start
        const end = clipEnd(clip)

        // Entirely inside the removed range — the clip goes.
        if (start >= range.start - 1e-3 && end <= range.end + 1e-3) continue

        if (end <= range.start + 1e-3) {
          // Entirely before: untouched.
        } else if (start >= range.end - 1e-3) {
          clip.start = Math.max(0, start - length)
        } else if (start < range.start && end > range.end) {
          // Spans the range: it simply gets shorter.
          clip.duration = Math.max(MIN_CLIP_DURATION, clip.duration - length)
        } else if (start < range.start) {
          // Overlaps the head of the range: trim its tail back to the cut.
          clip.duration = Math.max(MIN_CLIP_DURATION, range.start - start)
        } else {
          // Overlaps the tail: it starts at the cut and loses the removed part.
          clip.start = range.start
          clip.duration = Math.max(MIN_CLIP_DURATION, end - range.end)
        }
        survivors.push(clip)
      }
      track.clips = survivors
    }
    next = normalize(draft)
  }
  return next
}

/** Maps a source-time range on an asset to timeline time through a clip. */
function sourceRangeToTimeline(clip: MediaClip, range: SilenceRange): SilenceRange | null {
  const start = Math.max(range.start, clip.inPoint)
  const end = Math.min(range.end, clip.outPoint)
  if (end - start <= 0.05) return null
  return {
    start: clip.start + (start - clip.inPoint) / clip.speed,
    end: clip.start + (end - clip.inPoint) / clip.speed,
  }
}

/* ------------------------------------------------------------------ */
/* Action handlers                                                     */
/* ------------------------------------------------------------------ */

async function collectSilenceRanges(
  project: Project,
  clipIds: string[],
  services: ExecutionServices,
): Promise<SilenceRange[]> {
  const assets = new Map(project.assets.map((a) => [a.id, a]))
  const ranges: SilenceRange[] = []

  for (const clipId of clipIds) {
    const found = findClip(project.timeline, clipId)
    if (!found || found.clip.kind !== 'media') continue
    const clip = found.clip
    const asset = assets.get(clip.assetId)
    if (!asset || asset.kind === 'image') continue

    // eslint-disable-next-line no-await-in-loop -- decoding is memory-bound
    const waveform = asset.waveform ?? (await services.waveformFor(asset))
    if (!waveform?.length) continue

    const silences = detectSilences(waveform, asset.duration)
    for (const silence of silences) {
      const mapped = sourceRangeToTimeline(clip, silence)
      if (mapped) ranges.push(mapped)
    }
  }
  return mergeRanges(ranges)
}

function ensureTrack(project: Project, kind: Track['kind'], name: string): { project: Project; trackId: string } {
  const existing = project.timeline.tracks.find((t) => t.kind === kind)
  if (existing) return { project, trackId: existing.id }
  const track = createTrack(kind, name)
  const anchor =
    kind === 'caption' || kind === 'text'
      ? project.timeline.tracks.find((t) => t.kind === 'video')?.id
      : undefined
  return {
    project: { ...project, timeline: addTrack(project.timeline, track, anchor ? undefined : undefined) },
    trackId: track.id,
  }
}

function applyEffectToClips(
  project: Project,
  clipIds: string[],
  effectType: EffectType,
  params: Record<string, number>,
  presetId: string | undefined,
  name: string,
): Project {
  let timeline = project.timeline
  for (const clipId of clipIds) {
    const found = findClip(timeline, clipId)
    if (!found || found.clip.kind !== 'media') continue
    const existing = found.clip.effects.filter((e) => e.type !== effectType)
    const effect = createEffect(effectType, params, name, presetId)
    timeline = updateClip<MediaClip>(timeline, clipId, { effects: [...existing, effect] })
  }
  return { ...project, timeline }
}

async function runAction(
  project: Project,
  action: AIAction,
  ctx: ExecutionContext,
  notes: string[],
): Promise<Project> {
  const fps = project.settings.fps
  const clipIds = resolveWithFallback(project, action, ctx.selection)
  const params = action.parameters ?? {}

  switch (action.type) {
    /* ---- Look ---------------------------------------------------- */
    case 'color':
    case 'effect': {
      const generative = str(params.action, '')
      if (generative === 'analyze') return analyzeAssets(project, ctx, notes)
      if (generative === 'generate-image') {
        await ctx.provider.generateImage({
          prompt: str(params.prompt, ''),
          aspectRatio: project.aspectRatio,
        })
        throw new ActionNotApplicableError('Image generation returned no asset.')
      }
      if (generative === 'generate-video') {
        await ctx.provider.generateVideo({
          prompt: str(params.prompt, ''),
          durationSeconds: num(params.durationSeconds, 4),
          aspectRatio: project.aspectRatio,
        })
        throw new ActionNotApplicableError('Video generation returned no asset.')
      }
      if (str(params.effectType, '') === 'matte') {
        const first = clipIds[0]
        const found = first ? findClip(project.timeline, first) : null
        await ctx.provider.removeBackground({
          assetId: found?.clip.kind === 'media' ? found.clip.assetId : '',
          assetName: found?.clip.label ?? 'clip',
        })
        throw new ActionNotApplicableError('Background removal returned no asset.')
      }

      const effectType = (action.type === 'color' ? 'color' : str(params.effectType, 'color')) as EffectType
      const values = (params.params as Record<string, number>) ?? {}
      if (clipIds.length === 0) throw new ActionNotApplicableError('There are no clips to apply this to.')
      notes.push(`Applied ${effectType} to ${clipIds.length} clip${clipIds.length === 1 ? '' : 's'}.`)
      return applyEffectToClips(
        project,
        clipIds,
        effectType,
        values,
        typeof params.presetId === 'string' ? params.presetId : undefined,
        effectType.charAt(0).toUpperCase() + effectType.slice(1),
      )
    }

    case 'crop': {
      if (clipIds.length === 0) throw new ActionNotApplicableError('There are no clips to crop.')
      let timeline = project.timeline
      for (const clipId of clipIds) {
        const found = findClip(timeline, clipId)
        if (!found || found.clip.kind !== 'media') continue
        timeline = updateClip<MediaClip>(timeline, clipId, (clip) => ({
          transform: {
            ...clip.transform,
            crop: {
              top: num(params.top, clip.transform.crop.top),
              right: num(params.right, clip.transform.crop.right),
              bottom: num(params.bottom, clip.transform.crop.bottom),
              left: num(params.left, clip.transform.crop.left),
            },
          },
        }))
      }
      notes.push(`Cropped ${clipIds.length} clip${clipIds.length === 1 ? '' : 's'}.`)
      return { ...project, timeline }
    }

    /* ---- Timing -------------------------------------------------- */
    case 'speed': {
      const speed = num(params.speed, num(params.factor, 1))
      if (clipIds.length === 0) throw new ActionNotApplicableError('There are no clips to retime.')
      let timeline = project.timeline
      for (const clipId of clipIds) timeline = setClipSpeed(timeline, clipId, speed)
      notes.push(`Set ${clipIds.length} clip${clipIds.length === 1 ? '' : 's'} to ${speed}×.`)
      return { ...project, timeline }
    }

    case 'split': {
      let timeline = project.timeline
      const interval = num(params.interval, 0)
      if (interval > 0.2) {
        const limit = timeline.duration
        let cuts = 0
        for (let t = interval; t < limit - 0.2; t += interval) {
          timeline = splitAt(timeline, t, fps, trackIdsFor(project, action))
          cuts++
        }
        notes.push(`Added ${cuts} cut${cuts === 1 ? '' : 's'} every ${interval}s.`)
        return { ...project, timeline }
      }
      const at = params.at === 'playhead' ? ctx.playhead : num(params.at, ctx.playhead)
      timeline = splitAt(timeline, at, fps, trackIdsFor(project, action))
      notes.push(`Split at ${at.toFixed(2)}s.`)
      return { ...project, timeline }
    }

    case 'trim': {
      const mode = str(params.mode, 'remove-silence')
      if (mode === 'to-duration') {
        const target = num(params.targetDuration, project.timeline.duration)
        if (project.timeline.duration <= target) {
          notes.push(`Already ${project.timeline.duration.toFixed(1)}s — no trim needed.`)
          return project
        }
        let timeline = splitAt(project.timeline, target, fps)
        const beyond = allClips(timeline).filter((c) => c.start >= target - 1e-3)
        timeline = removeClips(timeline, beyond.map((c) => c.id))
        notes.push(`Trimmed the timeline to ${target}s.`)
        return { ...project, timeline }
      }

      const ranges = await collectSilenceRanges(project, clipIds, ctx)
      if (ranges.length === 0) {
        notes.push('No silence long enough to remove was found.')
        return project
      }
      const removed = ranges.reduce((sum, r) => sum + (r.end - r.start), 0)
      notes.push(`Removed ${ranges.length} silent range${ranges.length === 1 ? '' : 's'} (${removed.toFixed(1)}s).`)
      return { ...project, timeline: removeTimelineRanges(project.timeline, ranges, fps) }
    }

    case 'resize': {
      const duration = num(params.duration, 0)
      if (duration <= 0 || clipIds.length === 0) {
        throw new ActionNotApplicableError('A positive duration and at least one clip are required.')
      }
      let timeline = project.timeline
      for (const clipId of clipIds) timeline = updateClip(timeline, clipId, { duration })
      notes.push(`Set ${clipIds.length} clip${clipIds.length === 1 ? '' : 's'} to ${duration}s.`)
      return { ...project, timeline }
    }

    case 'move': {
      const start = num(params.start, 0)
      if (clipIds.length === 0) throw new ActionNotApplicableError('There are no clips to move.')
      let timeline = project.timeline
      for (const clipId of clipIds) timeline = updateClip(timeline, clipId, { start })
      notes.push(`Moved ${clipIds.length} clip${clipIds.length === 1 ? '' : 's'}.`)
      return { ...project, timeline }
    }

    case 'delete': {
      if (clipIds.length === 0) throw new ActionNotApplicableError('Nothing is selected to delete.')
      const timeline = params.ripple === false
        ? removeClips(project.timeline, clipIds)
        : rippleDelete(project.timeline, clipIds)
      notes.push(`Deleted ${clipIds.length} clip${clipIds.length === 1 ? '' : 's'}.`)
      return { ...project, timeline }
    }

    /* ---- Audio --------------------------------------------------- */
    case 'volume': {
      if (clipIds.length === 0) throw new ActionNotApplicableError('There are no clips to adjust.')
      let timeline = project.timeline
      const muted = params.muted === true
      const volume = num(params.volume, 1)
      for (const clipId of clipIds) {
        const found = findClip(timeline, clipId)
        if (!found || found.clip.kind !== 'media') continue
        timeline = updateClip<MediaClip>(timeline, clipId, muted ? { muted: true } : { volume, muted: false })
      }
      notes.push(muted ? 'Muted the audio.' : `Set volume to ${Math.round(volume * 100)}%.`)
      return { ...project, timeline }
    }

    case 'fade': {
      if (clipIds.length === 0) throw new ActionNotApplicableError('There are no clips to fade.')
      let timeline = project.timeline
      for (const clipId of clipIds) {
        const found = findClip(timeline, clipId)
        if (!found || found.clip.kind !== 'media') continue
        const clip = found.clip
        const fadeIn = params.fadeIn === undefined ? clip.fadeIn : num(params.fadeIn, clip.fadeIn)
        const fadeOut = params.fadeOut === undefined ? clip.fadeOut : num(params.fadeOut, clip.fadeOut)
        timeline = updateClip<MediaClip>(timeline, clipId, {
          fadeIn: Math.min(fadeIn, clip.duration / 2),
          fadeOut: Math.min(fadeOut, clip.duration / 2),
        })
      }
      notes.push(`Added fades to ${clipIds.length} clip${clipIds.length === 1 ? '' : 's'}.`)
      return { ...project, timeline }
    }

    case 'audio': {
      const kind = str(params.action, 'normalize')
      if (kind === 'generate-music') {
        await ctx.provider.generateSound({
          prompt: str(params.prompt, 'background music'),
          durationSeconds: num(params.durationSeconds, project.duration || 30),
        })
        throw new ActionNotApplicableError('Music generation returned no asset.')
      }
      if (kind === 'generate-voice') {
        await ctx.provider.generateVoice({ text: str(params.prompt, ''), voice: 'default' })
        throw new ActionNotApplicableError('Voice generation returned no asset.')
      }
      if (kind === 'generate-sfx') {
        await ctx.provider.generateSound({
          prompt: str(params.prompt, 'sound effect'),
          durationSeconds: num(params.durationSeconds, 2),
        })
        throw new ActionNotApplicableError('Sound generation returned no asset.')
      }
      if (clipIds.length === 0) throw new ActionNotApplicableError('There is no audio to adjust.')
      const gain = num(params.gain, 0.9)
      let timeline = project.timeline
      for (const clipId of clipIds) {
        const found = findClip(timeline, clipId)
        if (!found || found.clip.kind !== 'media') continue
        timeline = updateClip<MediaClip>(timeline, clipId, { volume: gain, muted: false })
      }
      notes.push(`Normalised ${clipIds.length} audio clip${clipIds.length === 1 ? '' : 's'} to ${Math.round(gain * 100)}%.`)
      return { ...project, timeline }
    }

    /* ---- Structure ----------------------------------------------- */
    case 'transition': {
      const type = str(params.transitionType, 'dissolve') as TransitionType
      const duration = num(params.duration, 0.5)
      const position = str(params.position, 'between')
      let timeline = project.timeline
      let applied = 0

      if (position === 'first-in') {
        const track = timeline.tracks.find((t) => t.kind === 'video' && t.clips.length > 0)
        const first = track?.clips[0]
        if (first) {
          timeline = updateClip<MediaClip>(timeline, first.id, {
            transitionIn: createTransition(type, Math.min(duration, first.duration / 2)),
          })
          applied = 1
        }
      } else {
        for (const track of timeline.tracks) {
          if (track.kind !== 'video') continue
          const sorted = [...track.clips].sort((a, b) => a.start - b.start)
          for (let i = 1; i < sorted.length; i++) {
            timeline = updateClip<MediaClip>(timeline, sorted[i].id, {
              transitionIn: createTransition(type, Math.min(duration, sorted[i].duration / 2)),
            })
            applied++
          }
        }
      }
      if (applied === 0) throw new ActionNotApplicableError('There are not enough clips for a transition.')
      notes.push(`Added ${applied} ${type} transition${applied === 1 ? '' : 's'}.`)
      return { ...project, timeline }
    }

    case 'text': {
      const presetId = str(params.preset, 'heading')
      const preset = getTextPreset(presetId)
      const ensured = ensureTrack(project, 'text', 'Text')
      const clip = createTextClip(ensured.trackId, num(params.start, ctx.playhead), str(params.content, 'Title'), {
        duration: num(params.duration, 3),
        preset: presetId,
        style: resolveTextStyle(preset?.style),
        animation: (str(params.animation, preset?.animation ?? 'fade') as TextAnimation) ?? 'fade',
      })
      notes.push(`Added a text clip at ${clip.start.toFixed(1)}s.`)
      return { ...ensured.project, timeline: addClip(ensured.project.timeline, ensured.trackId, clip) }
    }

    case 'caption':
      return generateCaptions(project, str(params.preset, 'clean'), ctx, notes)

    case 'aspect': {
      const ratio = str(params.aspectRatio, project.aspectRatio) as AspectRatio
      const reframed = reframeForAspect(project, ratio, str(params.reframe, 'cover'))
      notes.push(`Converted the project to ${ratio}.`)
      return reframed
    }

    default:
      throw new ActionNotApplicableError(`The action "${action.type}" is not supported yet.`)
  }
}

function trackIdsFor(project: Project, action: AIAction): string[] | undefined {
  if (action.target.kind === 'track') return [action.target.id]
  if (action.target.kind === 'all-video') {
    return project.timeline.tracks.filter((t) => t.kind === 'video').map((t) => t.id)
  }
  return undefined
}

/* ------------------------------------------------------------------ */
/* Composite behaviours                                                */
/* ------------------------------------------------------------------ */

async function analyzeAssets(project: Project, ctx: ExecutionContext, notes: string[]): Promise<Project> {
  const assets: Asset[] = []
  let analysed = 0
  for (const asset of project.assets) {
    if (asset.kind === 'image') {
      assets.push(asset)
      continue
    }
    try {
      /* eslint-disable no-await-in-loop -- media decoding is memory-bound */
      const waveform = asset.waveform ?? (await ctx.waveformFor(asset))
      const frameDifferences = asset.kind === 'video' ? await ctx.frameDifferencesFor(asset) : undefined
      const analysis = await ctx.provider.analyzeMedia({
        assetId: asset.id,
        assetName: asset.name,
        kind: asset.kind,
        duration: asset.duration,
        waveform,
        frameDifferences,
      })
      /* eslint-enable no-await-in-loop */
      assets.push({ ...asset, waveform: waveform ?? asset.waveform, analysis })
      analysed++
    } catch {
      assets.push(asset)
    }
  }
  if (analysed === 0) throw new ActionNotApplicableError('There was no video or audio to analyse.')
  notes.push(`Analysed ${analysed} asset${analysed === 1 ? '' : 's'}.`)
  return { ...project, assets }
}

async function generateCaptions(
  project: Project,
  presetId: string,
  ctx: ExecutionContext,
  notes: string[],
): Promise<Project> {
  const assets = new Map(project.assets.map((a) => [a.id, a]))
  const candidates = project.timeline.tracks
    .filter((t) => t.kind === 'audio' || t.kind === 'video')
    .flatMap((t) => t.clips)
    .filter((c): c is MediaClip => c.kind === 'media' && c.assetKind !== 'image')

  if (candidates.length === 0) {
    throw new ActionNotApplicableError('There is no audio on the timeline to caption.')
  }

  const preset = getCaptionPreset(presetId)
  const ensured = ensureTrack(project, 'caption', 'Captions')
  let timeline = ensured.project.timeline
  const captions: CaptionClip[] = []

  for (const clip of candidates) {
    const asset = assets.get(clip.assetId)
    if (!asset) continue
    /* eslint-disable no-await-in-loop -- decoding is memory-bound */
    const waveform = asset.waveform ?? (await ctx.waveformFor(asset))
    if (!waveform?.length) continue
    const result = await ctx.provider.generateCaption({
      assetId: asset.id,
      duration: asset.duration,
      waveform,
    })
    /* eslint-enable no-await-in-loop */

    for (const segment of result.segments) {
      const mapped = sourceRangeToTimeline(clip, { start: segment.start, end: segment.end })
      if (!mapped) continue
      captions.push(
        createCaptionClip(ensured.trackId, mapped.start, mapped.end - mapped.start, segment.text, {
          preset: presetId,
          style: resolveTextStyle({ ...preset?.style }),
          confidence: segment.confidence,
        }),
      )
    }
    // One caption pass per timeline is enough; multiple sources would overlap.
    if (captions.length > 0) break
  }

  if (captions.length === 0) {
    throw new ActionNotApplicableError(
      'No speech segments were detected. The audio may be silent or continuous.',
    )
  }

  for (const caption of captions) timeline = addClip(timeline, ensured.trackId, caption)
  notes.push(
    `Added ${captions.length} caption clip${captions.length === 1 ? '' : 's'} with detected timings. The text is empty — connect a speech-to-text provider or type it in.`,
  )
  return { ...ensured.project, timeline }
}

/** Switches the project aspect ratio and rescales clips so they fill the frame. */
function reframeForAspect(project: Project, ratio: AspectRatio, mode: string): Project {
  const before = getCompositionSize(project.aspectRatio, project.settings.resolution)
  const after = getCompositionSize(ratio, project.settings.resolution)
  const assets = new Map(project.assets.map((a) => [a.id, a]))

  let timeline = project.timeline
  if (mode === 'cover') {
    for (const clip of allClips(timeline)) {
      if (clip.kind !== 'media' || clip.assetKind === 'audio') continue
      const asset = assets.get(clip.assetId)
      const width = asset?.width ?? before.width
      const height = asset?.height ?? before.height
      // Contain-fit is what the compositor does; find the extra scale that
      // turns that into a cover-fit inside the new frame.
      const contain = Math.min(after.width / width, after.height / height)
      const cover = Math.max(after.width / width, after.height / height)
      const factor = contain > 0 ? cover / contain : 1
      timeline = updateClip<MediaClip>(timeline, clip.id, (current) => ({
        transform: { ...current.transform, scale: Number(factor.toFixed(4)) },
      }))
    }
  }

  return {
    ...project,
    aspectRatio: ratio,
    settings: { ...project.settings, aspectRatio: ratio },
    timeline,
  }
}

/* ------------------------------------------------------------------ */
/* Public entry points                                                 */
/* ------------------------------------------------------------------ */

export async function executeOperation(
  project: Project,
  operation: AIOperation,
  ctx: ExecutionContext,
): Promise<ExecutionResult> {
  if (operation.availability === 'requires-api' || operation.availability === 'unavailable') {
    throw new CapabilityUnavailableError(
      operation.capability,
      operation.availabilityNote ?? 'This operation needs an external provider that is not configured.',
    )
  }

  let next = project
  const notes: string[] = []
  for (const action of operation.actions) {
    // eslint-disable-next-line no-await-in-loop -- actions are order-dependent
    next = await runAction(next, action, ctx, notes)
  }
  return { project: { ...next, duration: next.timeline.duration }, notes }
}

/** Applies a single ad-hoc action, used by the command bar and quick actions. */
export async function executeAction(
  project: Project,
  action: AIAction,
  ctx: ExecutionContext,
): Promise<ExecutionResult> {
  const notes: string[] = []
  const next = await runAction(project, action, ctx, notes)
  return { project: { ...next, duration: next.timeline.duration }, notes }
}

export type { Clip, TextClip }
