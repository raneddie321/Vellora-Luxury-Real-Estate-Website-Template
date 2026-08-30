import { renderFrame } from '@/lib/media/compositor'
import { getCompositionSize } from '@/lib/media/composition'
import { resolveAssetUrl } from '@/lib/media/asset-cache'
import { loadImageElement, loadMediaElement } from '@/lib/media/decode'
import { clipGainAt } from '@/lib/timeline/operations'
import { sourceTimeAt } from '@/lib/timeline/operations'
import { getFFmpegService } from '@/lib/media/ffmpeg'
import type { Asset, ExportOptions, MediaClip, Project } from '@/lib/types'
import { ExportError, QUALITY_BITRATE, QUALITY_CRF, type ExportProgress, type ExportResult, type Exporter } from './types'

/**
 * Real, in-browser export.
 *
 * The timeline is composited into an offscreen canvas and captured with
 * MediaRecorder while audio is mixed through WebAudio into the same stream.
 * This is a genuine render — it produces a real file you can play — and it runs
 * in real time, which is why the UI says "renders in real time" up front.
 *
 * MP4: Chromium can record H.264 directly. Where it cannot, the WebM result is
 * transcoded with ffmpeg.wasm. If neither is possible, the WebM file is still
 * delivered and the UI states plainly that the container differs.
 */

const MP4_CANDIDATES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4;codecs=avc1.4D401F,mp4a.40.2',
  'video/mp4',
]
const WEBM_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
]

/**
 * MediaRecorder writes WebM as a live stream, so the file carries no duration in
 * its header. It plays fine, but many players show the length as unknown and
 * scrubbing can be unreliable. Saying so is better than letting someone discover
 * it in an edit suite later — and the MP4 path does not have the problem.
 */
const WEBM_DURATION_NOTICE =
  'This WebM was written as a stream, so some players report its length as unknown and may not scrub smoothly. Export MP4 for a fully seekable file.'

function pickMimeType(candidates: string[]): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? null
}

interface ClipRuntime {
  clip: MediaClip
  element: HTMLVideoElement | HTMLAudioElement | HTMLImageElement
  gain?: GainNode
  playing: boolean
  /** Track-level gain, so a muted track is silent in the exported file too. */
  trackGain: number
}

export class BrowserExporter implements Exporter {
  readonly id = 'browser-canvas'
  readonly label = 'Browser render'

  async availability() {
    if (typeof MediaRecorder === 'undefined') {
      return { available: false, reason: 'This browser has no MediaRecorder support.' }
    }
    if (!pickMimeType([...MP4_CANDIDATES, ...WEBM_CANDIDATES])) {
      return { available: false, reason: 'This browser cannot record any supported video codec.' }
    }
    return { available: true }
  }

  async export(
    project: Project,
    options: ExportOptions,
    handlers: { onProgress: (progress: ExportProgress) => void; signal: AbortSignal },
  ): Promise<ExportResult> {
    const { onProgress, signal } = handlers
    const duration = project.timeline.duration
    if (duration <= 0) {
      throw new ExportError('There is nothing on the timeline to export yet.', false)
    }

    onProgress({ stage: 'preparing', progress: 0.02, message: 'Preparing composition…' })

    const size = getCompositionSize(project.settings.aspectRatio, options.resolution)
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true })
    if (!ctx) throw new ExportError('Could not create a rendering surface.', false)

    const assetsById = new Map(project.assets.map((a) => [a.id, a]))
    const runtimes: ClipRuntime[] = []
    let audioContext: AudioContext | null = null
    let audioDestination: MediaStreamAudioDestinationNode | null = null

    try {
      // ---- 1. Prepare a dedicated element per clip -------------------------
      const mediaClips: { clip: MediaClip; trackGain: number }[] = []
      for (const track of project.timeline.tracks) {
        // A hidden video track contributes no picture; a muted one no sound.
        if (track.hidden && track.kind !== 'audio') continue
        const trackGain = track.muted ? 0 : track.volume
        for (const clip of track.clips) {
          if (clip.kind === 'media') mediaClips.push({ clip, trackGain })
        }
      }

      if (options.includeAudio && mediaClips.some(({ clip }) => clip.assetKind !== 'image')) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioContext = new Ctor()
        audioDestination = audioContext.createMediaStreamDestination()
      }

      let prepared = 0
      for (const { clip, trackGain } of mediaClips) {
        if (signal.aborted) throw new ExportError('Export cancelled.', false)
        const asset = assetsById.get(clip.assetId)
        if (!asset) continue
        // eslint-disable-next-line no-await-in-loop -- decoders must be primed serially
        const runtime = await this.prepareClip(clip, asset, trackGain, audioContext, audioDestination)
        if (runtime) runtimes.push(runtime)
        prepared++
        onProgress({
          stage: 'preparing',
          progress: 0.02 + (prepared / Math.max(1, mediaClips.length)) * 0.13,
          message: `Decoding media (${prepared}/${mediaClips.length})…`,
        })
      }

      // ---- 2. Build the recording stream -----------------------------------
      const wantsMp4 = options.container === 'mp4'
      const directMp4 = wantsMp4 ? pickMimeType(MP4_CANDIDATES) : null
      const mimeType = directMp4 ?? pickMimeType(WEBM_CANDIDATES)
      if (!mimeType) throw new ExportError('This browser cannot record video.', false)

      const stream = canvas.captureStream(options.fps)
      if (audioDestination) {
        for (const track of audioDestination.stream.getAudioTracks()) stream.addTrack(track)
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: QUALITY_BITRATE[options.quality],
        audioBitsPerSecond: 192_000,
      })
      const chunks: Blob[] = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      const finished = new Promise<void>((resolve, reject) => {
        recorder.onstop = () => resolve()
        recorder.onerror = () => reject(new ExportError('The recorder stopped unexpectedly.'))
      })

      onProgress({ stage: 'processing', progress: 0.16, message: 'Starting render…' })
      if (audioContext?.state === 'suspended') await audioContext.resume()
      recorder.start(250)

      // ---- 3. Drive the timeline in real time ------------------------------
      const startedAt = performance.now()
      await new Promise<void>((resolve, reject) => {
        const tick = () => {
          if (signal.aborted) {
            reject(new ExportError('Export cancelled.', false))
            return
          }
          const elapsed = (performance.now() - startedAt) / 1000
          const time = Math.min(elapsed, duration)

          this.syncRuntimes(runtimes, time, audioContext)
          renderFrame(ctx, {
            project,
            time,
            size,
            quality: 'full',
            sources: {
              get: (clip) => {
                const runtime = runtimes.find((r) => r.clip.id === clip.id)
                const element = runtime?.element
                return element instanceof HTMLVideoElement || element instanceof HTMLImageElement
                  ? element
                  : null
              },
            },
          })

          onProgress({
            stage: 'rendering',
            progress: 0.16 + (time / duration) * (directMp4 || !wantsMp4 ? 0.8 : 0.54),
            message: `Rendering ${time.toFixed(1)}s of ${duration.toFixed(1)}s…`,
          })

          if (elapsed >= duration) {
            resolve()
            return
          }
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })

      // Give the recorder a beat to flush the tail of the stream.
      await new Promise((resolve) => setTimeout(resolve, 320))
      recorder.stop()
      await finished
      stream.getTracks().forEach((track) => track.stop())

      const recorded = new Blob(chunks, { type: mimeType })
      if (recorded.size === 0) throw new ExportError('The render produced an empty file. Try again.')

      // ---- 4. Transcode when MP4 was asked for but not recorded directly ---
      if (wantsMp4 && !directMp4) {
        const ffmpeg = getFFmpegService()
        if (ffmpeg.isSupported()) {
          try {
            onProgress({ stage: 'transcoding', progress: 0.72, message: 'Loading the FFmpeg core…' })
            await ffmpeg.load((ratio) =>
              onProgress({
                stage: 'transcoding',
                progress: 0.72 + ratio * 0.08,
                message: 'Loading the FFmpeg core…',
              }),
            )
            const mp4 = await ffmpeg.transcode(recorded, {
              container: 'mp4',
              crf: QUALITY_CRF[options.quality],
              fps: options.fps,
              onProgress: (ratio) =>
                onProgress({
                  stage: 'transcoding',
                  progress: 0.8 + ratio * 0.19,
                  message: `Transcoding to MP4 (${Math.round(ratio * 100)}%)…`,
                }),
            })
            onProgress({ stage: 'complete', progress: 1, message: 'Export complete.' })
            return {
              blob: mp4,
              mimeType: 'video/mp4',
              engine: 'ffmpeg-wasm',
              durationSeconds: duration,
            }
          } catch (error) {
            // Transcoding failed — hand over the WebM and say exactly why.
            onProgress({ stage: 'complete', progress: 1, message: 'Export complete (WebM).' })
            return {
              blob: recorded,
              mimeType,
              engine: 'browser-canvas',
              durationSeconds: duration,
              containerNotice: `${
                error instanceof Error
                  ? `MP4 conversion was unavailable (${error.message}) so the file was delivered as WebM.`
                  : 'MP4 conversion failed, so the file was delivered as WebM.'
              } ${WEBM_DURATION_NOTICE}`,
            }
          }
        }
        onProgress({ stage: 'complete', progress: 1, message: 'Export complete (WebM).' })
        return {
          blob: recorded,
          mimeType,
          engine: 'browser-canvas',
          durationSeconds: duration,
          containerNotice: `This browser cannot record MP4 and cannot run the FFmpeg core, so the file was delivered as WebM. ${WEBM_DURATION_NOTICE}`,
        }
      }

      onProgress({ stage: 'complete', progress: 1, message: 'Export complete.' })
      return {
        blob: recorded,
        mimeType,
        engine: 'browser-canvas',
        durationSeconds: duration,
        containerNotice: directMp4 ? undefined : WEBM_DURATION_NOTICE,
      }
    } finally {
      for (const runtime of runtimes) {
        if ('pause' in runtime.element) {
          runtime.element.pause()
          runtime.element.removeAttribute('src')
          runtime.element.load()
        }
      }
      await audioContext?.close().catch(() => undefined)
    }
  }

  private async prepareClip(
    clip: MediaClip,
    asset: Asset,
    trackGain: number,
    audioContext: AudioContext | null,
    audioDestination: MediaStreamAudioDestinationNode | null,
  ): Promise<ClipRuntime | null> {
    const url = await resolveAssetUrl(asset)

    if (asset.kind === 'image') {
      const img = await loadImageElement(new Image(), url, asset.name)
      return { clip, element: img, playing: false, trackGain }
    }

    const source: HTMLVideoElement | HTMLAudioElement =
      asset.kind === 'audio' ? document.createElement('audio') : document.createElement('video')
    source.preload = 'auto'
    if (source instanceof HTMLVideoElement) source.playsInline = true
    const element = await loadMediaElement(source, url, asset.name)

    let gain: GainNode | undefined
    if (audioContext && audioDestination) {
      try {
        const source = audioContext.createMediaElementSource(element)
        gain = audioContext.createGain()
        gain.gain.value = 0
        source.connect(gain)
        gain.connect(audioDestination)
      } catch {
        // Element already routed (shouldn't happen with fresh elements) — the
        // clip still renders, it just contributes no audio.
        element.muted = true
      }
    } else {
      element.muted = true
    }

    return { clip, element, gain, playing: false, trackGain }
  }

  /** Keeps every element in sync with the timeline clock. */
  private syncRuntimes(runtimes: ClipRuntime[], time: number, audioContext: AudioContext | null) {
    for (const runtime of runtimes) {
      const { clip, element } = runtime
      if (element instanceof HTMLImageElement) continue
      const active = time >= clip.start && time < clip.start + clip.duration

      if (!active) {
        if (runtime.playing) {
          element.pause()
          runtime.playing = false
        }
        if (runtime.gain) runtime.gain.gain.value = 0
        continue
      }

      const target = sourceTimeAt(clip, time)
      if (!runtime.playing) {
        element.currentTime = target
        element.playbackRate = clip.speed
        void element.play().catch(() => undefined)
        runtime.playing = true
      } else if (Math.abs(element.currentTime - target) > 0.35) {
        element.currentTime = target
      }

      if (runtime.gain && audioContext) {
        runtime.gain.gain.setTargetAtTime(
          clipGainAt(clip, time) * runtime.trackGain,
          audioContext.currentTime,
          0.02,
        )
      }
    }
  }
}
