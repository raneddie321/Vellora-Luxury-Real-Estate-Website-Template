import { ASPECT_RATIOS, RESOLUTION_HEIGHTS } from '@/lib/types'
import type { AspectRatio, ProjectSettings, ResolutionPreset } from '@/lib/types'

export interface CompositionSize {
  width: number
  height: number
}

/**
 * The resolution preset names the SHORT side, which is how creators actually
 * talk about it: "1080p vertical" means 1080×1920, not 607×1080.
 * Both dimensions are forced even because H.264 requires it.
 */
export function getCompositionSize(
  aspectRatio: AspectRatio,
  resolution: ResolutionPreset,
): CompositionSize {
  const { w, h } = ASPECT_RATIOS[aspectRatio]
  const shortSide = RESOLUTION_HEIGHTS[resolution]
  const width = w >= h ? Math.round((shortSide * w) / h) : shortSide
  const height = w >= h ? shortSide : Math.round((shortSide * h) / w)
  return { width: even(width), height: even(height) }
}

export const compositionSizeFor = (settings: ProjectSettings) =>
  getCompositionSize(settings.aspectRatio, settings.resolution)

const even = (n: number) => (n % 2 === 0 ? n : n + 1)

/** Letterbox/pillarbox fit of a source into a destination box. */
export function fitContain(
  sourceW: number,
  sourceH: number,
  boxW: number,
  boxH: number,
): { x: number; y: number; width: number; height: number } {
  if (!sourceW || !sourceH) return { x: 0, y: 0, width: boxW, height: boxH }
  const scale = Math.min(boxW / sourceW, boxH / sourceH)
  const width = sourceW * scale
  const height = sourceH * scale
  return { x: (boxW - width) / 2, y: (boxH - height) / 2, width, height }
}

/** Fill the destination box, cropping the overflow. Used for aspect conversion. */
export function fitCover(
  sourceW: number,
  sourceH: number,
  boxW: number,
  boxH: number,
): { x: number; y: number; width: number; height: number } {
  if (!sourceW || !sourceH) return { x: 0, y: 0, width: boxW, height: boxH }
  const scale = Math.max(boxW / sourceW, boxH / sourceH)
  const width = sourceW * scale
  const height = sourceH * scale
  return { x: (boxW - width) / 2, y: (boxH - height) / 2, width, height }
}
