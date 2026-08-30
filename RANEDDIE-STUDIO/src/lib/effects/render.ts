import type { Effect } from '@/lib/types'

/**
 * Effect rendering.
 *
 * Effects are applied in three stages so the cheap ones stay free:
 *   1. `filter`    — folded into a single CSS/canvas `filter` string.
 *   2. `composite` — extra draw passes (glow, vignette, grain).
 *   3. `pixel`     — real per-pixel work (unsharp mask, RGB split, wave warp).
 *
 * Stage 3 is genuinely expensive, so it is skipped at Draft preview quality and
 * the UI says so rather than quietly producing a different image.
 */

export type RenderQuality = 'draft' | 'balanced' | 'full'

const enabled = (effects: Effect[] | undefined) => (effects ?? []).filter((e) => e.enabled)

/* ------------------------------------------------------------------ */
/* Stage 1 — filter string                                             */
/* ------------------------------------------------------------------ */

/**
 * Builds a `filter` value valid for both `ctx.filter` and CSS.
 * Temperature is approximated with sepia + hue rotation: it is a perceptual
 * warm/cool shift, not a colour-science-accurate white-balance conversion.
 */
export function buildFilterString(effects: Effect[] | undefined): string {
  const parts: string[] = []
  for (const effect of enabled(effects)) {
    if (effect.type === 'color') {
      const { exposure = 0, contrast = 0, saturation = 0, temperature = 0 } = effect.params
      if (exposure !== 0) parts.push(`brightness(${(1 + exposure * 0.6).toFixed(3)})`)
      if (contrast !== 0) parts.push(`contrast(${(1 + contrast * 0.6).toFixed(3)})`)
      if (saturation !== 0) parts.push(`saturate(${Math.max(0, 1 + saturation).toFixed(3)})`)
      if (temperature > 0) {
        parts.push(`sepia(${(temperature * 0.45).toFixed(3)})`)
        parts.push(`saturate(${(1 + temperature * 0.25).toFixed(3)})`)
      } else if (temperature < 0) {
        parts.push(`hue-rotate(${(temperature * 18).toFixed(1)}deg)`)
        parts.push(`saturate(${(1 - temperature * 0.1).toFixed(3)})`)
      }
    } else if (effect.type === 'blur') {
      const radius = effect.params.radius ?? 0
      if (radius > 0) parts.push(`blur(${radius.toFixed(2)}px)`)
    }
  }
  return parts.length ? parts.join(' ') : 'none'
}

/* ------------------------------------------------------------------ */
/* Stage 2 — composite passes                                          */
/* ------------------------------------------------------------------ */

let grainTile: HTMLCanvasElement | null = null
let grainTileSize = 0

function getGrainTile(size: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  if (grainTile && grainTileSize === size) return grainTile
  const dimension = 128
  const canvas = document.createElement('canvas')
  canvas.width = dimension
  canvas.height = dimension
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const image = ctx.createImageData(dimension, dimension)
  const data = image.data
  for (let y = 0; y < dimension; y += size) {
    for (let x = 0; x < dimension; x += size) {
      const value = 110 + Math.random() * 90
      for (let dy = 0; dy < size && y + dy < dimension; dy++) {
        for (let dx = 0; dx < size && x + dx < dimension; dx++) {
          const i = ((y + dy) * dimension + (x + dx)) * 4
          data[i] = data[i + 1] = data[i + 2] = value
          data[i + 3] = 255
        }
      }
    }
  }
  ctx.putImageData(image, 0, 0)
  grainTile = canvas
  grainTileSize = size
  return canvas
}

/**
 * Applies glow, vignette and grain to the region already drawn on `ctx`.
 * `source` is the canvas holding the frame, needed for the glow pass.
 */
export function applyCompositeEffects(
  ctx: CanvasRenderingContext2D,
  effects: Effect[] | undefined,
  region: { x: number; y: number; width: number; height: number },
  options: { time: number; scale: number },
) {
  const list = enabled(effects)
  const { x, y, width, height } = region
  if (width <= 0 || height <= 0) return

  const glow = list.find((e) => e.type === 'glow')
  if (glow) {
    const intensity = glow.params.intensity ?? 0.4
    const radius = (glow.params.radius ?? 20) * options.scale
    const threshold = glow.params.threshold ?? 0.55
    if (intensity > 0 && radius > 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = intensity * 0.75
      // Raising contrast + brightness before the blur isolates the highlights,
      // which is what makes this read as bloom rather than a flat haze.
      ctx.filter = `blur(${radius.toFixed(1)}px) brightness(${(1 + threshold).toFixed(2)}) contrast(${(1 + threshold * 1.6).toFixed(2)})`
      ctx.drawImage(ctx.canvas, x, y, width, height, x, y, width, height)
      ctx.restore()
    }
  }

  const vignette = list.find((e) => e.type === 'vignette')
  if (vignette) {
    const amount = vignette.params.amount ?? 0
    const softness = vignette.params.softness ?? 0.5
    if (amount > 0) {
      const cx = x + width / 2
      const cy = y + height / 2
      const outer = Math.hypot(width, height) / 2
      const gradient = ctx.createRadialGradient(cx, cy, outer * (1 - softness) * 0.85, cx, cy, outer)
      gradient.addColorStop(0, 'rgba(0,0,0,0)')
      gradient.addColorStop(1, `rgba(0,0,0,${amount.toFixed(3)})`)
      ctx.save()
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, width, height)
      ctx.restore()
    }
  }

  const grain = list.find((e) => e.type === 'grain')
  if (grain) {
    const amount = grain.params.amount ?? 0
    const size = Math.max(1, Math.round(grain.params.size ?? 1))
    const tile = amount > 0 ? getGrainTile(size) : null
    if (tile) {
      const pattern = ctx.createPattern(tile, 'repeat')
      if (pattern) {
        // Re-seeding the offset each frame is what makes grain move like film.
        const offsetX = Math.floor((options.time * 733) % 128)
        const offsetY = Math.floor((options.time * 971) % 128)
        ctx.save()
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = amount * 0.5
        ctx.translate(-offsetX, -offsetY)
        ctx.fillStyle = pattern
        ctx.fillRect(x + offsetX, y + offsetY, width, height)
        ctx.restore()
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Stage 3 — per-pixel passes                                          */
/* ------------------------------------------------------------------ */

export const hasPixelEffects = (effects: Effect[] | undefined) =>
  enabled(effects).some((e) => e.type === 'sharpen' || e.type === 'distortion')

/**
 * Runs the genuine per-pixel effects over a region of the canvas.
 * Returns false when the pass was skipped (draft quality or empty region), so
 * callers can surface that instead of implying the effect was applied.
 */
export function applyPixelEffects(
  ctx: CanvasRenderingContext2D,
  effects: Effect[] | undefined,
  region: { x: number; y: number; width: number; height: number },
  options: { time: number; quality: RenderQuality },
): boolean {
  const list = enabled(effects).filter((e) => e.type === 'sharpen' || e.type === 'distortion')
  if (list.length === 0) return false
  if (options.quality === 'draft') return false

  const x = Math.max(0, Math.floor(region.x))
  const y = Math.max(0, Math.floor(region.y))
  const width = Math.min(ctx.canvas.width - x, Math.floor(region.width))
  const height = Math.min(ctx.canvas.height - y, Math.floor(region.height))
  if (width <= 2 || height <= 2) return false

  let image: ImageData
  try {
    image = ctx.getImageData(x, y, width, height)
  } catch {
    // Tainted canvas (a cross-origin frame) — refuse rather than half-apply.
    return false
  }

  for (const effect of list) {
    if (effect.type === 'sharpen') {
      const amount = effect.params.amount ?? 0
      if (amount > 0) image = unsharpMask(image, amount)
    } else {
      const chroma = effect.params.chroma ?? 0
      const wave = effect.params.wave ?? 0
      if (chroma > 0 || wave > 0) image = distort(image, chroma, wave, options.time)
    }
  }

  ctx.putImageData(image, x, y)
  return true
}

/** 3×3 unsharp mask: out = src + amount × (src − blur(src)). */
function unsharpMask(image: ImageData, amount: number): ImageData {
  const { width, height, data } = image
  const out = new Uint8ClampedArray(data)
  const strength = amount * 1.6
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4
      for (let c = 0; c < 3; c++) {
        const p = i + c
        // Box blur of the 3×3 neighbourhood.
        const sum =
          data[p - width * 4 - 4] + data[p - width * 4] + data[p - width * 4 + 4] +
          data[p - 4] + data[p] + data[p + 4] +
          data[p + width * 4 - 4] + data[p + width * 4] + data[p + width * 4 + 4]
        const blurred = sum / 9
        out[p] = data[p] + strength * (data[p] - blurred)
      }
    }
  }
  return new ImageData(out, width, height)
}

/** RGB channel offset plus an optional sine warp along X. */
function distort(image: ImageData, chroma: number, wave: number, time: number): ImageData {
  const { width, height, data } = image
  const out = new Uint8ClampedArray(data.length)
  const shift = Math.round(chroma * Math.max(2, width * 0.006))
  const amplitude = wave * Math.max(1, width * 0.01)
  const frequency = (Math.PI * 2 * 3) / height

  for (let y = 0; y < height; y++) {
    const warp = amplitude > 0 ? Math.round(Math.sin(y * frequency + time * 3) * amplitude) : 0
    for (let x = 0; x < width; x++) {
      const target = (y * width + x) * 4
      const base = clampIndex(x + warp, width)
      const red = clampIndex(x + warp + shift, width)
      const blue = clampIndex(x + warp - shift, width)
      out[target] = data[(y * width + red) * 4]
      out[target + 1] = data[(y * width + base) * 4 + 1]
      out[target + 2] = data[(y * width + blue) * 4 + 2]
      out[target + 3] = data[(y * width + base) * 4 + 3]
    }
  }
  return new ImageData(out, width, height)
}

const clampIndex = (value: number, max: number) => (value < 0 ? 0 : value >= max ? max - 1 : value)
