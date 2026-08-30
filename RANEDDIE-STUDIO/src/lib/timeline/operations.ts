import { clamp, deepClone, snapToFrame } from '@/lib/utils'
import type { Clip, MediaClip, Timeline, Track, TrackKind } from '@/lib/types'
import { isMediaClip } from '@/lib/types'
import { createId } from '@/lib/id'

/**
 * Pure timeline operations.
 *
 * Every function takes a timeline and returns a NEW timeline; nothing here
 * touches React, storage or the DOM. The editor store is the only place that
 * decides when to run one and how it enters the undo history — which is what
 * makes AI-driven edits and human edits behave identically.
 */

export const MIN_CLIP_DURATION = 0.1

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export interface ClipLocation {
  track: Track
  clip: Clip
  trackIndex: number
  clipIndex: number
}

export function findClip(timeline: Timeline, clipId: string): ClipLocation | null {
  for (let t = 0; t < timeline.tracks.length; t++) {
    const track = timeline.tracks[t]
    const c = track.clips.findIndex((clip) => clip.id === clipId)
    if (c >= 0) return { track, clip: track.clips[c], trackIndex: t, clipIndex: c }
  }
  return null
}

export const findTrack = (timeline: Timeline, trackId: string) =>
  timeline.tracks.find((t) => t.id === trackId) ?? null

export const allClips = (timeline: Timeline): Clip[] => timeline.tracks.flatMap((t) => t.clips)

export const clipEnd = (clip: Clip) => clip.start + clip.duration

/** Clips whose time range covers `time`, ordered by the track order. */
export function clipsAt(timeline: Timeline, time: number): { track: Track; clip: Clip }[] {
  const out: { track: Track; clip: Clip }[] = []
  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      if (time >= clip.start && time < clipEnd(clip)) out.push({ track, clip })
    }
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Invariants                                                          */
/* ------------------------------------------------------------------ */

/** Sorts clips and refreshes the cached duration. Run after every mutation. */
export function normalize(timeline: Timeline): Timeline {
  let duration = 0
  for (const track of timeline.tracks) {
    track.clips.sort((a, b) => a.start - b.start)
    for (const clip of track.clips) {
      clip.start = Math.max(0, clip.start)
      clip.duration = Math.max(MIN_CLIP_DURATION, clip.duration)
      duration = Math.max(duration, clipEnd(clip))
    }
  }
  timeline.duration = Number(duration.toFixed(3))
  return timeline
}

const edit = (timeline: Timeline, fn: (draft: Timeline) => void): Timeline => {
  const draft = deepClone(timeline)
  fn(draft)
  return normalize(draft)
}

/* ------------------------------------------------------------------ */
/* Placement                                                           */
/* ------------------------------------------------------------------ */

interface Span {
  start: number
  end: number
}

const overlaps = (a: Span, b: Span) => a.start < b.end - 1e-6 && b.start < a.end - 1e-6

/**
 * Finds the closest start position at or after/before `desiredStart` where a
 * clip of `duration` fits without overlapping. Tracks behave like real NLE
 * tracks: one clip at a time, and dropping onto an occupied region slides the
 * clip to the nearest gap instead of silently destroying media.
 */
export function resolvePlacement(
  track: Track,
  duration: number,
  desiredStart: number,
  ignoreClipId?: string,
): number {
  const others = track.clips
    .filter((c) => c.id !== ignoreClipId)
    .map((c) => ({ start: c.start, end: clipEnd(c) }))
    .sort((a, b) => a.start - b.start)

  const fits = (start: number) => !others.some((o) => overlaps({ start, end: start + duration }, o))

  let start = Math.max(0, desiredStart)
  if (fits(start)) return start

  // Candidate gaps: before the first clip, between clips, and after the last.
  const candidates: number[] = [0]
  for (let i = 0; i < others.length; i++) {
    candidates.push(others[i].end)
    const gapStart = others[i].end
    const gapEnd = i + 1 < others.length ? others[i + 1].start : Infinity
    if (gapEnd - gapStart >= duration) candidates.push(gapStart)
  }
  const viable = candidates.filter(fits)
  if (viable.length === 0) {
    const last = others[others.length - 1]
    return last ? last.end : 0
  }
  viable.sort((a, b) => Math.abs(a - start) - Math.abs(b - start))
  start = viable[0]
  return start
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

export function addClip(timeline: Timeline, trackId: string, clip: Clip, snapPlacement = true): Timeline {
  return edit(timeline, (draft) => {
    const track = findTrack(draft, trackId)
    if (!track) return
    const placed = { ...clip, trackId: track.id }
    if (snapPlacement) placed.start = resolvePlacement(track, placed.duration, placed.start, placed.id)
    track.clips.push(placed)
  })
}

export function addTrack(timeline: Timeline, track: Track, afterTrackId?: string): Timeline {
  return edit(timeline, (draft) => {
    if (!afterTrackId) {
      draft.tracks.push(track)
      return
    }
    const index = draft.tracks.findIndex((t) => t.id === afterTrackId)
    draft.tracks.splice(index < 0 ? draft.tracks.length : index + 1, 0, track)
  })
}

export function removeTrack(timeline: Timeline, trackId: string): Timeline {
  return edit(timeline, (draft) => {
    draft.tracks = draft.tracks.filter((t) => t.id !== trackId)
  })
}

export function removeClips(timeline: Timeline, clipIds: string[]): Timeline {
  const ids = new Set(clipIds)
  return edit(timeline, (draft) => {
    for (const track of draft.tracks) track.clips = track.clips.filter((c) => !ids.has(c.id))
  })
}

/** Deletes clips and closes the gaps they leave on their own tracks. */
export function rippleDelete(timeline: Timeline, clipIds: string[]): Timeline {
  const ids = new Set(clipIds)
  return edit(timeline, (draft) => {
    for (const track of draft.tracks) {
      const removed = track.clips.filter((c) => ids.has(c.id))
      if (removed.length === 0) continue
      track.clips = track.clips.filter((c) => !ids.has(c.id))
      // Shift everything after each removed span left by that span's length.
      for (const gap of removed.sort((a, b) => b.start - a.start)) {
        for (const clip of track.clips) {
          if (clip.start >= gap.start) clip.start = Math.max(0, clip.start - gap.duration)
        }
      }
    }
  })
}

export function moveClip(
  timeline: Timeline,
  clipId: string,
  target: { start: number; trackId?: string },
): Timeline {
  return edit(timeline, (draft) => {
    const found = findClip(draft, clipId)
    if (!found || found.clip.locked) return
    const { clip, track } = found
    const destination = target.trackId ? findTrack(draft, target.trackId) : track
    if (!destination) return
    if (!canHostClip(destination.kind, clip)) return

    if (destination.id !== track.id) {
      track.clips = track.clips.filter((c) => c.id !== clipId)
      clip.trackId = destination.id
      destination.clips.push(clip)
    }
    clip.start = resolvePlacement(destination, clip.duration, Math.max(0, target.start), clip.id)
  })
}

/** Which clip kinds a track will accept — enforced for drags and AI actions alike. */
export function canHostClip(trackKind: TrackKind, clip: Clip): boolean {
  if (clip.kind === 'text') return trackKind === 'text'
  if (clip.kind === 'caption') return trackKind === 'caption'
  if (clip.kind === 'placeholder') {
    return clip.accepts === 'audio' ? trackKind === 'audio' : trackKind === 'video'
  }
  if (clip.assetKind === 'audio') return trackKind === 'audio'
  return trackKind === 'video'
}

export interface TrimArgs {
  edge: 'start' | 'end'
  /** New absolute timeline position for that edge. */
  time: number
  fps?: number
  /**
   * Length of the underlying source media in seconds. Supplied by the caller
   * (which owns the asset table) so this module stays free of asset lookups.
   * Omit for stills, which can be stretched indefinitely.
   */
  sourceDuration?: number
}

export function trimClip(timeline: Timeline, clipId: string, args: TrimArgs): Timeline {
  return edit(timeline, (draft) => {
    const found = findClip(draft, clipId)
    if (!found || found.clip.locked) return
    const { clip, track } = found
    const neighbours = track.clips.filter((c) => c.id !== clipId)
    const fps = args.fps ?? 30
    const time = snapToFrame(args.time, fps)

    if (args.edge === 'start') {
      const prevEnd = neighbours
        .filter((c) => clipEnd(c) <= clip.start + 1e-6)
        .reduce((max, c) => Math.max(max, clipEnd(c)), 0)
      const maxStart = clipEnd(clip) - MIN_CLIP_DURATION
      // A media clip can only be extended back to the head of its source.
      const sourceLimit = isMediaClip(clip) ? clip.start - clip.inPoint / clip.speed : 0
      const newStart = clamp(time, Math.max(prevEnd, sourceLimit, 0), maxStart)
      const delta = newStart - clip.start
      if (isMediaClip(clip)) clip.inPoint = Math.max(0, clip.inPoint + delta * clip.speed)
      clip.start = newStart
      clip.duration = Math.max(MIN_CLIP_DURATION, clip.duration - delta)
    } else {
      const nextStart = neighbours
        .filter((c) => c.start >= clipEnd(clip) - 1e-6)
        .reduce((min, c) => Math.min(min, c.start), Infinity)
      const minEnd = clip.start + MIN_CLIP_DURATION
      let maxEnd = Number.isFinite(nextStart) ? nextStart : Infinity
      if (isMediaClip(clip) && clip.assetKind !== 'image' && args.sourceDuration) {
        // Cannot pull past the tail of the source media.
        const remaining = (args.sourceDuration - clip.inPoint) / clip.speed
        maxEnd = Math.min(maxEnd, clip.start + Math.max(MIN_CLIP_DURATION, remaining))
      }
      const newEnd = clamp(time, minEnd, maxEnd)
      clip.duration = newEnd - clip.start
      if (isMediaClip(clip)) clip.outPoint = clip.inPoint + clip.duration * clip.speed
    }
  })
}

export function splitClip(timeline: Timeline, clipId: string, time: number, fps = 30): Timeline {
  return edit(timeline, (draft) => {
    const found = findClip(draft, clipId)
    if (!found || found.clip.locked) return
    const { clip, track } = found
    const at = snapToFrame(time, fps)
    const local = at - clip.start
    if (local <= MIN_CLIP_DURATION || local >= clip.duration - MIN_CLIP_DURATION) return

    const right = deepClone(clip)
    right.id = createId('clip')
    right.start = at
    right.duration = clip.duration - local
    if (isMediaClip(right) && isMediaClip(clip)) {
      right.inPoint = clip.inPoint + local * clip.speed
      right.transitionIn = undefined
      clip.transitionOut = undefined
    }
    clip.duration = local
    if (isMediaClip(clip)) clip.outPoint = clip.inPoint + local * clip.speed
    track.clips.push(right)
  })
}

/** Splits every clip that straddles `time` on the given tracks (or all tracks). */
export function splitAt(timeline: Timeline, time: number, fps = 30, trackIds?: string[]): Timeline {
  let next = timeline
  const targets = clipsAt(timeline, time).filter(
    ({ track }) => !trackIds || trackIds.includes(track.id),
  )
  for (const { clip } of targets) next = splitClip(next, clip.id, time, fps)
  return next
}

export function updateClip<T extends Clip>(
  timeline: Timeline,
  clipId: string,
  patch: Partial<T> | ((clip: T) => Partial<T>),
): Timeline {
  return edit(timeline, (draft) => {
    const found = findClip(draft, clipId)
    if (!found) return
    const target = found.clip as T
    const changes = typeof patch === 'function' ? patch(target) : patch
    Object.assign(target, changes)
  })
}

export function updateTrack(timeline: Timeline, trackId: string, patch: Partial<Track>): Timeline {
  return edit(timeline, (draft) => {
    const track = findTrack(draft, trackId)
    if (track) Object.assign(track, patch)
  })
}

/**
 * Changes playback rate while keeping the source range intact, so the clip's
 * timeline length changes but the media it references does not.
 */
export function setClipSpeed(timeline: Timeline, clipId: string, speed: number): Timeline {
  const safe = clamp(speed, 0.1, 8)
  return edit(timeline, (draft) => {
    const found = findClip(draft, clipId)
    if (!found || !isMediaClip(found.clip)) return
    const clip = found.clip
    clip.speed = safe
    clip.duration = Math.max(MIN_CLIP_DURATION, (clip.outPoint - clip.inPoint) / safe)
  })
}

/** Sets a clip's timeline length directly, re-deriving the source out point. */
export function setClipDuration(timeline: Timeline, clipId: string, duration: number): Timeline {
  return edit(timeline, (draft) => {
    const found = findClip(draft, clipId)
    if (!found) return
    const clip = found.clip
    clip.duration = Math.max(MIN_CLIP_DURATION, duration)
    if (isMediaClip(clip)) clip.outPoint = clip.inPoint + clip.duration * clip.speed
  })
}

/** Removes any gaps on a track so clips play back-to-back. */
export function closeGaps(timeline: Timeline, trackId: string): Timeline {
  return edit(timeline, (draft) => {
    const track = findTrack(draft, trackId)
    if (!track) return
    let cursor = 0
    for (const clip of [...track.clips].sort((a, b) => a.start - b.start)) {
      clip.start = cursor
      cursor += clip.duration
    }
  })
}

export function duplicateClip(timeline: Timeline, clipId: string): { timeline: Timeline; newId: string | null } {
  const found = findClip(timeline, clipId)
  if (!found) return { timeline, newId: null }
  const copy = deepClone(found.clip)
  copy.id = createId('clip')
  copy.start = clipEnd(found.clip)
  return { timeline: addClip(timeline, found.track.id, copy), newId: copy.id }
}

/* ------------------------------------------------------------------ */
/* Snapping                                                            */
/* ------------------------------------------------------------------ */

export const SNAP_THRESHOLD_PX = 8

/** Every meaningful time a dragged edge should stick to. */
export function getSnapPoints(timeline: Timeline, excludeClipIds: string[] = [], playhead?: number): number[] {
  const exclude = new Set(excludeClipIds)
  const points = new Set<number>([0])
  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      if (exclude.has(clip.id)) continue
      points.add(Number(clip.start.toFixed(4)))
      points.add(Number(clipEnd(clip).toFixed(4)))
    }
  }
  if (typeof playhead === 'number') points.add(Number(playhead.toFixed(4)))
  return [...points].sort((a, b) => a - b)
}

/** Returns the snapped time, or the original when nothing is within tolerance. */
export function applySnap(time: number, points: number[], toleranceSeconds: number): { time: number; snapped: number | null } {
  let best: number | null = null
  let bestDistance = toleranceSeconds
  for (const point of points) {
    const distance = Math.abs(point - time)
    if (distance <= bestDistance) {
      bestDistance = distance
      best = point
    }
  }
  return best === null ? { time, snapped: null } : { time: best, snapped: best }
}

/* ------------------------------------------------------------------ */
/* Derived helpers used by the preview + export renderers               */
/* ------------------------------------------------------------------ */

/** Maps a timeline time to the source time inside a media clip. */
export function sourceTimeAt(clip: MediaClip, timelineTime: number): number {
  const local = clamp(timelineTime - clip.start, 0, clip.duration)
  return clip.inPoint + local * clip.speed
}

/** Combined fade/transition opacity multiplier for a clip at a given time. */
export function clipOpacityAt(clip: Clip, timelineTime: number): number {
  const local = timelineTime - clip.start
  if (local < 0 || local > clip.duration) return 0
  let opacity = clip.kind === 'media' ? clip.opacity : 1

  const fadeIn = clip.kind === 'media' ? clip.fadeIn : 0
  const fadeOut = clip.kind === 'media' ? clip.fadeOut : 0
  if (fadeIn > 0 && local < fadeIn) opacity *= local / fadeIn
  if (fadeOut > 0 && local > clip.duration - fadeOut) opacity *= (clip.duration - local) / fadeOut

  if (clip.kind === 'media') {
    const tIn = clip.transitionIn
    if (tIn && tIn.type !== 'cut' && local < tIn.duration) {
      opacity *= easeInOut(local / tIn.duration)
    }
    const tOut = clip.transitionOut
    if (tOut && tOut.type !== 'cut' && local > clip.duration - tOut.duration) {
      opacity *= easeInOut((clip.duration - local) / tOut.duration)
    }
  }
  return clamp(opacity, 0, 1)
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/** Audio gain for a clip at a given time, including its fades. */
export function clipGainAt(clip: MediaClip, timelineTime: number): number {
  if (clip.muted) return 0
  const local = timelineTime - clip.start
  if (local < 0 || local > clip.duration) return 0
  let gain = clip.volume
  if (clip.fadeIn > 0 && local < clip.fadeIn) gain *= local / clip.fadeIn
  if (clip.fadeOut > 0 && local > clip.duration - clip.fadeOut) {
    gain *= (clip.duration - local) / clip.fadeOut
  }
  return clamp(gain, 0, 2)
}
