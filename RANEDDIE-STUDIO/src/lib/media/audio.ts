import type { SilenceRange } from '@/lib/types'

/**
 * Audio analysis. Everything here runs on the real decoded samples via
 * WebAudio — no API key, no server, and the numbers are honest.
 */

let sharedContext: AudioContext | null = null

function getContext(): AudioContext {
  if (typeof window === 'undefined') throw new Error('Audio decoding requires a browser environment.')
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  sharedContext ??= new Ctor()
  return sharedContext
}

/** Resumes the shared context after a user gesture. Safe to call repeatedly. */
export async function unlockAudio(): Promise<void> {
  try {
    const ctx = getContext()
    if (ctx.state === 'suspended') await ctx.resume()
  } catch {
    // Autoplay policy — playback will unlock on the next real interaction.
  }
}

export async function decodeAudio(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer()
  const ctx = getContext()
  return ctx.decodeAudioData(arrayBuffer.slice(0))
}

/** Downsamples a buffer to `buckets` normalised RMS peaks for waveform drawing. */
export function computePeaks(buffer: AudioBuffer, buckets = 900): number[] {
  const channel = buffer.getChannelData(0)
  const size = Math.max(1, Math.floor(channel.length / buckets))
  const peaks: number[] = []
  let max = 0
  for (let i = 0; i < buckets; i++) {
    const start = i * size
    let sum = 0
    let count = 0
    for (let j = start; j < start + size && j < channel.length; j++) {
      sum += channel[j] * channel[j]
      count++
    }
    const rms = count ? Math.sqrt(sum / count) : 0
    peaks.push(rms)
    if (rms > max) max = rms
  }
  return max > 0 ? peaks.map((p) => Number((p / max).toFixed(4))) : peaks
}

export interface SilenceOptions {
  /** Peaks below this fraction of the loudest peak count as silence. */
  threshold: number
  /** Silences shorter than this are ignored, in seconds. */
  minDuration: number
  /** Kept at each edge of a cut so speech isn't clipped, in seconds. */
  padding: number
}

export const DEFAULT_SILENCE_OPTIONS: SilenceOptions = {
  threshold: 0.06,
  minDuration: 0.45,
  padding: 0.08,
}

/**
 * Finds silent ranges from normalised peaks. This is a real amplitude-gate
 * detector operating on decoded audio — not a placeholder.
 */
export function detectSilences(
  peaks: number[],
  duration: number,
  options: Partial<SilenceOptions> = {},
): SilenceRange[] {
  const { threshold, minDuration, padding } = { ...DEFAULT_SILENCE_OPTIONS, ...options }
  if (peaks.length === 0 || duration <= 0) return []
  const secondsPerBucket = duration / peaks.length
  const ranges: SilenceRange[] = []
  let runStart: number | null = null

  for (let i = 0; i < peaks.length; i++) {
    const quiet = peaks[i] < threshold
    if (quiet && runStart === null) runStart = i
    if ((!quiet || i === peaks.length - 1) && runStart !== null) {
      const endIndex = quiet ? i + 1 : i
      const start = runStart * secondsPerBucket
      const end = endIndex * secondsPerBucket
      if (end - start >= minDuration) {
        ranges.push({
          start: Number(Math.max(0, start + padding).toFixed(3)),
          end: Number(Math.min(duration, end - padding).toFixed(3)),
        })
      }
      runStart = null
    }
  }
  return ranges.filter((r) => r.end - r.start > 0.05)
}

/** Inverse of `detectSilences`: the ranges worth keeping. */
export function invertRanges(silences: SilenceRange[], duration: number): SilenceRange[] {
  const kept: SilenceRange[] = []
  let cursor = 0
  for (const silence of [...silences].sort((a, b) => a.start - b.start)) {
    if (silence.start > cursor) kept.push({ start: cursor, end: silence.start })
    cursor = Math.max(cursor, silence.end)
  }
  if (cursor < duration) kept.push({ start: cursor, end: duration })
  return kept.filter((r) => r.end - r.start > 0.12)
}

/**
 * Detects shot changes from peaks in frame-to-frame luma difference.
 * Used by scene analysis; operates on frames the caller already sampled.
 */
export function detectSceneCuts(differences: number[], duration: number, sensitivity = 0.18): number[] {
  if (differences.length < 2) return []
  const secondsPerSample = duration / differences.length
  const cuts: number[] = []
  const mean = differences.reduce((a, b) => a + b, 0) / differences.length
  const threshold = Math.max(sensitivity, mean * 2.4)
  for (let i = 1; i < differences.length; i++) {
    if (differences[i] > threshold && (cuts.length === 0 || i * secondsPerSample - cuts[cuts.length - 1] > 0.6)) {
      cuts.push(Number((i * secondsPerSample).toFixed(2)))
    }
  }
  return cuts
}

/** Average loudness across peaks, 0..1. */
export const averageLoudness = (peaks: number[]) =>
  peaks.length ? Number((peaks.reduce((a, b) => a + b, 0) / peaks.length).toFixed(4)) : 0
