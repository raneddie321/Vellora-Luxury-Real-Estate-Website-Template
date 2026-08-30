import {
  applyCompositeEffects,
  applyPixelEffects,
  buildFilterString,
  hasPixelEffects,
  type RenderQuality,
} from '@/lib/effects'
import { clipOpacityAt, sourceTimeAt } from '@/lib/timeline/operations'
import { transitionGeometry } from '@/lib/timeline/transitions'
import { resolveTextStyle } from '@/lib/text/presets'
import type { MediaClip, Project, Track } from '@/lib/types'
import { clamp } from '@/lib/utils'
import { fitContain } from './composition'
import { drawTextClip } from './text-render'

/**
 * The compositor.
 *
 * `renderFrame` is the single source of visual truth: the editor preview calls
 * it on every animation frame, and the exporter calls it for every exported
 * frame. There is no second "render path" that could disagree with the preview.
 */

export interface FrameSources {
  /**
   * Returns the decoded element backing a specific clip, or null if it is not
   * ready yet. Keyed by clip rather than by asset so the same file can appear in
   * two overlapping clips without the two playheads fighting over one element.
   */
  get(clip: MediaClip): HTMLVideoElement | HTMLImageElement | null
}

export interface RenderFrameOptions {
  project: Project
  time: number
  size: { width: number; height: number }
  sources: FrameSources
  quality: RenderQuality
  /** Draw the safe-area / title-safe guides over the frame. */
  guides?: boolean
}

export interface RenderFrameResult {
  /** Clips whose media element wasn't decoded yet — the caller shows a spinner. */
  missing: string[]
  /** True when at least one pixel-stage effect was skipped for quality reasons. */
  skippedPixelEffects: boolean
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  options: RenderFrameOptions,
): RenderFrameResult {
  const { project, time, size } = options
  const result: RenderFrameResult = { missing: [], skippedPixelEffects: false }

  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.filter = 'none'
  ctx.fillStyle = project.settings.backgroundColor || '#000000'
  ctx.fillRect(0, 0, size.width, size.height)

  // Later tracks in the array sit lower in the UI, so draw them first and let
  // the upper tracks composite on top — the convention every NLE uses.
  const ordered = [...project.timeline.tracks].reverse()

  for (const track of ordered) {
    if (track.hidden || track.kind === 'audio') continue
    if (track.kind === 'video') drawVideoTrack(ctx, track, options, result)
  }

  for (const track of ordered) {
    if (track.hidden || (track.kind !== 'text' && track.kind !== 'caption')) continue
    for (const clip of track.clips) {
      if (clip.kind !== 'text' && clip.kind !== 'caption') continue
      drawTextClip(ctx, clip, resolveTextStyle(clip.style), time, size)
    }
  }

  if (options.guides) drawGuides(ctx, size)

  ctx.restore()
  return result
}

function drawVideoTrack(
  ctx: CanvasRenderingContext2D,
  track: Track,
  options: RenderFrameOptions,
  result: RenderFrameResult,
) {
  const { time, size, sources, quality } = options
  for (const clip of track.clips) {
    if (time < clip.start || time >= clip.start + clip.duration) continue

    if (clip.kind === 'placeholder') {
      drawPlaceholder(ctx, clip.label, clip.hint, size)
      continue
    }
    if (clip.kind !== 'media') continue

    const element = sources.get(clip)
    if (!element) {
      result.missing.push(clip.assetId)
      continue
    }

    const opacity = clipOpacityAt(clip, time) * (track.volume >= 0 ? 1 : 1)
    if (opacity <= 0.001) continue

    const drawn = drawMediaClip(ctx, clip, element, time, size, opacity)
    if (!drawn) continue

    applyCompositeEffects(ctx, clip.effects, drawn, { time, scale: size.height / 1080 })
    if (hasPixelEffects(clip.effects)) {
      const applied = applyPixelEffects(ctx, clip.effects, drawn, { time, quality })
      if (!applied) result.skippedPixelEffects = true
    }
  }
}

function drawMediaClip(
  ctx: CanvasRenderingContext2D,
  clip: MediaClip,
  element: HTMLVideoElement | HTMLImageElement,
  time: number,
  size: { width: number; height: number },
  opacity: number,
): { x: number; y: number; width: number; height: number } | null {
  const naturalWidth = element instanceof HTMLVideoElement ? element.videoWidth : element.naturalWidth
  const naturalHeight = element instanceof HTMLVideoElement ? element.videoHeight : element.naturalHeight
  if (!naturalWidth || !naturalHeight) return null

  const crop = clip.transform.crop
  const sx = naturalWidth * clamp(crop.left, 0, 0.49)
  const sy = naturalHeight * clamp(crop.top, 0, 0.49)
  const sw = naturalWidth * (1 - clamp(crop.left, 0, 0.49) - clamp(crop.right, 0, 0.49))
  const sh = naturalHeight * (1 - clamp(crop.top, 0, 0.49) - clamp(crop.bottom, 0, 0.49))
  if (sw <= 0 || sh <= 0) return null

  const box = fitContain(sw, sh, size.width, size.height)

  // Transitions contribute geometry; opacity is already folded into `opacity`.
  let offsetX = 0
  let offsetY = 0
  let transitionScale = 1
  const local = time - clip.start
  if (clip.transitionIn && clip.transitionIn.type !== 'cut' && local < clip.transitionIn.duration) {
    const geo = transitionGeometry(
      clip.transitionIn.type,
      local / clip.transitionIn.duration,
      clip.transitionIn.direction,
    )
    offsetX += geo.offsetX
    offsetY += geo.offsetY
    transitionScale *= geo.scale
  }

  const scale = clip.transform.scale * transitionScale
  const width = box.width * scale
  const height = box.height * scale
  const x = box.x + (box.width - width) / 2 + (clip.transform.x + offsetX) * size.width
  const y = box.y + (box.height - height) / 2 + (clip.transform.y + offsetY) * size.height

  if (element instanceof HTMLVideoElement) {
    const target = sourceTimeAt(clip, time)
    // Only seek when we're meaningfully off — seeking every frame stalls playback.
    if (Math.abs(element.currentTime - target) > 0.34 && element.readyState >= 2) {
      try {
        element.currentTime = target
      } catch {
        // Element not seekable yet; the next frame will retry.
      }
    }
  }

  ctx.save()
  ctx.globalAlpha = clamp(opacity, 0, 1)
  ctx.filter = buildFilterString(clip.effects)
  if (clip.transform.rotation !== 0) {
    ctx.translate(x + width / 2, y + height / 2)
    ctx.rotate((clip.transform.rotation * Math.PI) / 180)
    ctx.translate(-(x + width / 2), -(y + height / 2))
  }
  try {
    ctx.drawImage(element, sx, sy, sw, sh, x, y, width, height)
  } catch {
    ctx.restore()
    return null
  }
  ctx.restore()

  return { x, y, width, height }
}

/**
 * Template slots render as an explicit slate. Nothing is faked: the frame says
 * exactly what media it is waiting for.
 */
function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  label: string,
  hint: string,
  size: { width: number; height: number },
) {
  const scale = size.height / 1080
  ctx.save()
  ctx.fillStyle = '#111318'
  ctx.fillRect(0, 0, size.width, size.height)

  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = Math.max(1, 2 * scale)
  ctx.setLineDash([14 * scale, 10 * scale])
  const inset = size.width * 0.06
  ctx.strokeRect(inset, inset, size.width - inset * 2, size.height - inset * 2)
  ctx.setLineDash([])

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.font = `600 ${Math.round(48 * scale)}px ui-sans-serif, system-ui, sans-serif`
  ctx.fillText(label, size.width / 2, size.height / 2 - 26 * scale)
  ctx.fillStyle = 'rgba(255,255,255,0.44)'
  ctx.font = `400 ${Math.round(26 * scale)}px ui-sans-serif, system-ui, sans-serif`
  ctx.fillText(hint, size.width / 2, size.height / 2 + 26 * scale)
  ctx.restore()
}

function drawGuides(ctx: CanvasRenderingContext2D, size: { width: number; height: number }) {
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'
  ctx.lineWidth = Math.max(1, size.width / 1000)
  ctx.setLineDash([6, 6])
  const inset = 0.05
  ctx.strokeRect(size.width * inset, size.height * inset, size.width * (1 - inset * 2), size.height * (1 - inset * 2))
  ctx.setLineDash([])
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.beginPath()
  ctx.moveTo(size.width / 3, 0)
  ctx.lineTo(size.width / 3, size.height)
  ctx.moveTo((size.width * 2) / 3, 0)
  ctx.lineTo((size.width * 2) / 3, size.height)
  ctx.moveTo(0, size.height / 3)
  ctx.lineTo(size.width, size.height / 3)
  ctx.moveTo(0, (size.height * 2) / 3)
  ctx.lineTo(size.width, (size.height * 2) / 3)
  ctx.stroke()
  ctx.restore()
}
