import type { EffectType } from '@/lib/types'

export interface EffectParamSpec {
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
  /** How the value is rendered next to the slider. */
  format?: 'percent' | 'signed' | 'px' | 'raw'
}

export interface EffectDefinition {
  type: EffectType
  label: string
  description: string
  /** Where the effect is applied in the render pipeline. */
  stage: 'filter' | 'composite' | 'pixel'
  /** `pixel` effects run a per-pixel pass and are skipped at Draft quality. */
  cost: 'low' | 'medium' | 'high'
  params: EffectParamSpec[]
}

export const EFFECT_DEFINITIONS: Record<EffectType, EffectDefinition> = {
  color: {
    type: 'color',
    label: 'Color',
    description: 'Exposure, contrast, saturation and white balance.',
    stage: 'filter',
    cost: 'low',
    params: [
      { key: 'exposure', label: 'Exposure', min: -1, max: 1, step: 0.01, default: 0, format: 'signed' },
      { key: 'contrast', label: 'Contrast', min: -1, max: 1, step: 0.01, default: 0, format: 'signed' },
      { key: 'saturation', label: 'Saturation', min: -1, max: 1, step: 0.01, default: 0, format: 'signed' },
      { key: 'temperature', label: 'Temperature', min: -1, max: 1, step: 0.01, default: 0, format: 'signed' },
    ],
  },
  blur: {
    type: 'blur',
    label: 'Blur',
    description: 'Gaussian blur applied to the whole frame.',
    stage: 'filter',
    cost: 'low',
    params: [{ key: 'radius', label: 'Radius', min: 0, max: 40, step: 0.5, default: 6, format: 'px' }],
  },
  glow: {
    type: 'glow',
    label: 'Glow',
    description: 'Blooms the brightest areas by compositing a blurred copy.',
    stage: 'composite',
    cost: 'medium',
    params: [
      { key: 'intensity', label: 'Intensity', min: 0, max: 1, step: 0.01, default: 0.4, format: 'percent' },
      { key: 'radius', label: 'Radius', min: 1, max: 60, step: 1, default: 20, format: 'px' },
      { key: 'threshold', label: 'Threshold', min: 0, max: 1, step: 0.01, default: 0.55, format: 'percent' },
    ],
  },
  vignette: {
    type: 'vignette',
    label: 'Vignette',
    description: 'Darkens the frame edges with a radial falloff.',
    stage: 'composite',
    cost: 'low',
    params: [
      { key: 'amount', label: 'Amount', min: 0, max: 1, step: 0.01, default: 0.45, format: 'percent' },
      { key: 'softness', label: 'Softness', min: 0.05, max: 1, step: 0.01, default: 0.5, format: 'percent' },
    ],
  },
  grain: {
    type: 'grain',
    label: 'Grain',
    description: 'Animated film grain composited over the frame.',
    stage: 'composite',
    cost: 'low',
    params: [
      { key: 'amount', label: 'Amount', min: 0, max: 1, step: 0.01, default: 0.25, format: 'percent' },
      { key: 'size', label: 'Size', min: 1, max: 4, step: 1, default: 1, format: 'raw' },
    ],
  },
  sharpen: {
    type: 'sharpen',
    label: 'Sharpen',
    description: 'True 3×3 unsharp convolution. Skipped at Draft preview quality.',
    stage: 'pixel',
    cost: 'high',
    params: [{ key: 'amount', label: 'Amount', min: 0, max: 1, step: 0.01, default: 0.4, format: 'percent' }],
  },
  distortion: {
    type: 'distortion',
    label: 'Distortion',
    description: 'RGB channel split and horizontal wave warp. Skipped at Draft quality.',
    stage: 'pixel',
    cost: 'high',
    params: [
      { key: 'chroma', label: 'RGB split', min: 0, max: 1, step: 0.01, default: 0.3, format: 'percent' },
      { key: 'wave', label: 'Wave', min: 0, max: 1, step: 0.01, default: 0, format: 'percent' },
    ],
  },
}

export interface EffectPreset {
  id: string
  name: string
  type: EffectType
  description: string
  params: Record<string, number>
}

/** Curated starting points, grouped by effect type in the Effects panel. */
export const EFFECT_PRESETS: EffectPreset[] = [
  {
    id: 'color-cinematic',
    name: 'Cinematic',
    type: 'color',
    description: 'Lifted contrast, gently desaturated, cool shadows.',
    params: { exposure: -0.04, contrast: 0.28, saturation: -0.12, temperature: -0.12 },
  },
  {
    id: 'color-warm',
    name: 'Warm Sun',
    type: 'color',
    description: 'Golden-hour warmth with a small exposure lift.',
    params: { exposure: 0.08, contrast: 0.12, saturation: 0.16, temperature: 0.45 },
  },
  {
    id: 'color-cool',
    name: 'Cold Steel',
    type: 'color',
    description: 'Blue-leaning grade for night and tech footage.',
    params: { exposure: -0.05, contrast: 0.22, saturation: -0.08, temperature: -0.5 },
  },
  {
    id: 'color-punch',
    name: 'Punch',
    type: 'color',
    description: 'High-contrast, saturated look for social video.',
    params: { exposure: 0.05, contrast: 0.45, saturation: 0.4, temperature: 0.05 },
  },
  {
    id: 'color-mono',
    name: 'Monochrome',
    type: 'color',
    description: 'Full desaturation with contrast to hold shape.',
    params: { exposure: 0, contrast: 0.3, saturation: -1, temperature: 0 },
  },
  {
    id: 'blur-soft',
    name: 'Soft Focus',
    type: 'blur',
    description: 'Light diffusion, keeps the subject readable.',
    params: { radius: 3 },
  },
  {
    id: 'blur-background',
    name: 'Heavy Blur',
    type: 'blur',
    description: 'Strong blur for backgrounds and transitions.',
    params: { radius: 24 },
  },
  {
    id: 'glow-bloom',
    name: 'Bloom',
    type: 'glow',
    description: 'Highlight bloom, the anamorphic-lens look.',
    params: { intensity: 0.5, radius: 26, threshold: 0.6 },
  },
  {
    id: 'glow-dream',
    name: 'Dreamy',
    type: 'glow',
    description: 'Wide, low-threshold glow across the whole frame.',
    params: { intensity: 0.35, radius: 45, threshold: 0.3 },
  },
  {
    id: 'vignette-classic',
    name: 'Classic Vignette',
    type: 'vignette',
    description: 'Subtle edge darkening that focuses the centre.',
    params: { amount: 0.4, softness: 0.55 },
  },
  {
    id: 'vignette-heavy',
    name: 'Deep Vignette',
    type: 'vignette',
    description: 'Strong falloff for dramatic, theatrical shots.',
    params: { amount: 0.8, softness: 0.35 },
  },
  {
    id: 'grain-16mm',
    name: '16mm Grain',
    type: 'grain',
    description: 'Coarse, visible film grain.',
    params: { amount: 0.42, size: 2 },
  },
  {
    id: 'grain-fine',
    name: 'Fine Grain',
    type: 'grain',
    description: 'Barely-there texture that kills digital flatness.',
    params: { amount: 0.16, size: 1 },
  },
  {
    id: 'sharpen-crisp',
    name: 'Crisp',
    type: 'sharpen',
    description: 'Moderate unsharp mask for soft source footage.',
    params: { amount: 0.4 },
  },
  {
    id: 'distortion-vhs',
    name: 'VHS Split',
    type: 'distortion',
    description: 'RGB fringing with a slow horizontal wave.',
    params: { chroma: 0.5, wave: 0.35 },
  },
  {
    id: 'distortion-glitch',
    name: 'Glitch',
    type: 'distortion',
    description: 'Aggressive channel separation, no warp.',
    params: { chroma: 1, wave: 0 },
  },
]

export const defaultParamsFor = (type: EffectType): Record<string, number> =>
  Object.fromEntries(EFFECT_DEFINITIONS[type].params.map((p) => [p.key, p.default]))

export const formatEffectParam = (spec: EffectParamSpec, value: number): string => {
  switch (spec.format) {
    case 'percent':
      return `${Math.round(value * 100)}%`
    case 'signed':
      return `${value > 0 ? '+' : ''}${Math.round(value * 100)}`
    case 'px':
      return `${value}px`
    default:
      return String(value)
  }
}
