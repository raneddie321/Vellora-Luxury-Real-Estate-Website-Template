import { clipGainAt, sourceTimeAt } from '@/lib/timeline/operations'
import type { Asset, MediaClip, Project } from '@/lib/types'
import { resolveAssetUrl } from './asset-cache'
import { loadImageElement, loadMediaElement } from './decode'

/**
 * Preview playback runtime.
 *
 * Holds one media element per *clip* (not per asset) so a file used twice on the
 * timeline plays correctly in both places. It owns nothing about rendering: the
 * compositor asks it for elements, and it keeps those elements in sync with the
 * timeline clock.
 */

interface ClipRuntime {
  clip: MediaClip
  element: HTMLVideoElement | HTMLAudioElement | HTMLImageElement | null
  loading: boolean
  playing: boolean
  error?: string
  /** Track-level gain, folded in so a muted track is actually silent. */
  trackGain: number
}

export interface PlaybackSyncOptions {
  time: number
  playing: boolean
  /** 0..1 master gain. */
  volume: number
  muted: boolean
  /** Timeline playback rate; multiplied by each clip's own speed. */
  rate: number
}

export class PlaybackRuntime {
  private runtimes = new Map<string, ClipRuntime>()
  private assets = new Map<string, Asset>()
  private disposed = false
  private onChange?: () => void

  constructor(onChange?: () => void) {
    this.onChange = onChange
  }

  /** Reconciles the runtime with the project, adding and dropping clips. */
  setProject(project: Project) {
    if (this.disposed) return
    this.assets = new Map(project.assets.map((asset) => [asset.id, asset]))

    // Track state (mute, gain) is resolved here so `sync` stays a hot-path loop.
    const mediaClips: { clip: MediaClip; trackGain: number }[] = []
    for (const track of project.timeline.tracks) {
      const trackGain = track.muted ? 0 : track.volume
      for (const clip of track.clips) {
        if (clip.kind === 'media') mediaClips.push({ clip, trackGain })
      }
    }
    const live = new Set(mediaClips.map((entry) => entry.clip.id))

    for (const [id, runtime] of this.runtimes) {
      if (!live.has(id)) {
        this.teardown(runtime)
        this.runtimes.delete(id)
      }
    }

    for (const { clip, trackGain } of mediaClips) {
      const existing = this.runtimes.get(clip.id)
      if (existing) {
        // Keep the clip reference fresh so gain/speed edits take effect live.
        existing.clip = clip
        existing.trackGain = trackGain
        continue
      }
      const runtime: ClipRuntime = { clip, element: null, loading: true, playing: false, trackGain }
      this.runtimes.set(clip.id, runtime)
      void this.load(runtime)
    }
  }

  private async load(runtime: ClipRuntime) {
    const asset = this.assets.get(runtime.clip.assetId)
    if (!asset) {
      runtime.loading = false
      runtime.error = 'Missing asset'
      return
    }
    try {
      const url = await resolveAssetUrl(asset)
      if (this.disposed) return

      if (asset.kind === 'image') {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        runtime.element = await loadImageElement(image, url, asset.name)
      } else {
        const element: HTMLVideoElement | HTMLAudioElement =
          asset.kind === 'audio' ? document.createElement('audio') : document.createElement('video')
        element.preload = 'auto'
        if (element instanceof HTMLVideoElement) element.playsInline = true
        element.crossOrigin = 'anonymous'
        runtime.element = await loadMediaElement(element, url, asset.name)
      }
      runtime.loading = false
      this.onChange?.()
    } catch (error) {
      runtime.loading = false
      runtime.error =
        error instanceof Error ? error.message : `Could not decode "${asset.name}".`
      this.onChange?.()
    }
  }

  /** The element the compositor should draw for this clip, if it is ready. */
  getElement(clip: MediaClip): HTMLVideoElement | HTMLImageElement | null {
    const runtime = this.runtimes.get(clip.id)
    const element = runtime?.element
    if (element instanceof HTMLVideoElement || element instanceof HTMLImageElement) return element
    return null
  }

  /** True while any clip under the playhead is still decoding. */
  isLoadingAt(time: number): boolean {
    for (const runtime of this.runtimes.values()) {
      const { clip } = runtime
      if (time >= clip.start && time < clip.start + clip.duration && runtime.loading) return true
    }
    return false
  }

  errors(): string[] {
    return [...new Set([...this.runtimes.values()].map((r) => r.error).filter(Boolean) as string[])]
  }

  /** Aligns every element with the timeline clock and applies audio gain. */
  sync({ time, playing, volume, muted, rate }: PlaybackSyncOptions) {
    for (const runtime of this.runtimes.values()) {
      const { clip, element } = runtime
      if (!element || element instanceof HTMLImageElement) continue

      const active = time >= clip.start && time < clip.start + clip.duration
      if (!active) {
        if (runtime.playing) {
          element.pause()
          runtime.playing = false
        }
        continue
      }

      const target = sourceTimeAt(clip, time)
      const gain = clipGainAt(clip, time) * runtime.trackGain * volume
      element.volume = muted ? 0 : Math.min(1, Math.max(0, gain))
      element.muted = muted || element.volume === 0

      if (playing) {
        element.playbackRate = Math.max(0.0625, Math.min(16, clip.speed * rate))
        if (!runtime.playing) {
          try {
            element.currentTime = target
          } catch {
            // Not seekable yet — the next tick retries.
          }
          void element.play().catch(() => undefined)
          runtime.playing = true
        } else if (Math.abs(element.currentTime - target) > 0.32) {
          try {
            element.currentTime = target
          } catch {
            /* ignore */
          }
        }
      } else {
        if (runtime.playing) {
          element.pause()
          runtime.playing = false
        }
        if (Math.abs(element.currentTime - target) > 0.04 && element.readyState >= 1) {
          try {
            element.currentTime = target
          } catch {
            /* ignore */
          }
        }
      }
    }
  }

  pauseAll() {
    for (const runtime of this.runtimes.values()) {
      if (runtime.element && !(runtime.element instanceof HTMLImageElement)) {
        runtime.element.pause()
        runtime.playing = false
      }
    }
  }

  private teardown(runtime: ClipRuntime) {
    const element = runtime.element
    if (element && !(element instanceof HTMLImageElement)) {
      element.pause()
      element.removeAttribute('src')
      element.load()
    }
    runtime.element = null
  }

  dispose() {
    this.disposed = true
    for (const runtime of this.runtimes.values()) this.teardown(runtime)
    this.runtimes.clear()
  }
}
