import { createId } from '@/lib/id'
import {
  averageLoudness,
  detectSceneCuts,
  detectSilences,
  invertRanges,
} from '@/lib/media/audio'
import type { AnalyzeMediaRequest, CaptionSegment, SceneAnalysis } from '@/lib/types'

/**
 * Local analysis engine.
 *
 * Everything here is real signal processing over data the client already
 * decoded — no network, no key, no simulation. It backs the "Ready" capabilities
 * of the mock provider and stays useful even after a cloud provider is added.
 */

export function analyzeLocally(request: AnalyzeMediaRequest, providerId: string): SceneAnalysis {
  const waveform = request.waveform ?? []
  const silences = waveform.length ? detectSilences(waveform, request.duration) : []
  const cuts = request.frameDifferences?.length
    ? detectSceneCuts(request.frameDifferences, request.duration)
    : []

  const loudness = averageLoudness(waveform)
  const speech = invertRanges(silences, request.duration)
  const tags: string[] = []
  if (cuts.length > 4) tags.push('multi-shot')
  else if (cuts.length > 0) tags.push('few-cuts')
  if (silences.length > 2) tags.push('pauses')
  if (loudness > 0.28) tags.push('loud')
  else if (waveform.length && loudness < 0.08) tags.push('quiet')
  if (request.kind === 'image') tags.push('still')

  const parts: string[] = []
  if (cuts.length) parts.push(`${cuts.length} shot ${cuts.length === 1 ? 'change' : 'changes'} detected`)
  if (silences.length) {
    const total = silences.reduce((sum, s) => sum + (s.end - s.start), 0)
    parts.push(`${total.toFixed(1)}s of silence across ${silences.length} ranges`)
  }
  if (speech.length) parts.push(`${speech.length} active audio ${speech.length === 1 ? 'segment' : 'segments'}`)
  if (parts.length === 0) parts.push('No shot changes or silences stood out')

  return {
    analyzedAt: new Date().toISOString(),
    provider: providerId,
    scenes: cuts.map((time, index) => ({
      time,
      confidence: 0.7,
      label: `Shot ${index + 2}`,
    })),
    silences,
    summary: `${parts.join('. ')}.`,
    tags,
    loudness,
  }
}

/**
 * Derives caption timings from real speech-activity detection.
 *
 * The timings are genuine. The TEXT is not transcribed — that needs a
 * speech-to-text provider — so each segment is returned with an empty string and
 * `transcribed: false`, and the UI labels the result accordingly rather than
 * inventing words the speaker never said.
 */
export function deriveCaptionTimings(waveform: number[], duration: number): {
  segments: CaptionSegment[]
  transcribed: boolean
} {
  if (!waveform.length || duration <= 0) return { segments: [], transcribed: false }

  const silences = detectSilences(waveform, duration, { minDuration: 0.35, threshold: 0.07, padding: 0.05 })
  const speech = invertRanges(silences, duration)

  // Split very long stretches so no single caption outlives its readability.
  const MAX = 4.5
  const segments: CaptionSegment[] = []
  for (const range of speech) {
    const length = range.end - range.start
    const pieces = Math.max(1, Math.ceil(length / MAX))
    const step = length / pieces
    for (let i = 0; i < pieces; i++) {
      segments.push({
        start: Number((range.start + i * step).toFixed(2)),
        end: Number((range.start + (i + 1) * step).toFixed(2)),
        text: '',
      })
    }
  }
  return { segments, transcribed: false }
}

/**
 * Samples a video for frame-to-frame luma difference, which feeds shot
 * detection. Runs entirely in a canvas on the user's machine.
 */
export async function sampleFrameDifferences(
  url: string,
  duration: number,
  samples = 48,
): Promise<number[]> {
  if (typeof document === 'undefined' || duration <= 0) return []
  const video = document.createElement('video')
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve()
    video.onerror = () => reject(new Error('Could not open this video for analysis.'))
    video.src = url
  })

  const width = 64
  const height = 36
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []

  const differences: number[] = []
  let previous: Float32Array | null = null

  for (let i = 0; i < samples; i++) {
    const time = (duration * i) / samples
    // eslint-disable-next-line no-await-in-loop -- seeks must be serialised
    await new Promise<void>((resolve) => {
      const done = () => {
        video.removeEventListener('seeked', done)
        resolve()
      }
      video.addEventListener('seeked', done)
      video.currentTime = Math.min(time, Math.max(0, duration - 0.05))
    })

    ctx.drawImage(video, 0, 0, width, height)
    const { data } = ctx.getImageData(0, 0, width, height)
    const luma = new Float32Array(width * height)
    for (let p = 0; p < luma.length; p++) {
      const o = p * 4
      luma[p] = (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255
    }
    if (previous) {
      let sum = 0
      for (let p = 0; p < luma.length; p++) sum += Math.abs(luma[p] - previous[p])
      differences.push(sum / luma.length)
    } else {
      differences.push(0)
    }
    previous = luma
  }

  video.removeAttribute('src')
  video.load()
  return differences
}

/** Stable id helper so analysis results can be referenced by jobs. */
export const analysisJobId = () => createId('job')
