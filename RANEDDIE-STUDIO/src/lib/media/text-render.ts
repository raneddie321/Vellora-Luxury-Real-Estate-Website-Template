import type { CaptionClip, TextAnimation, TextClip, TextStyle } from '@/lib/types'
import { clamp } from '@/lib/utils'

/**
 * Canvas text rendering shared by the live preview and the exporter, so what a
 * user sees on screen is literally the same code path that writes the file.
 */

const FALLBACK_SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
const FALLBACK_MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

/** CSS custom properties don't exist inside canvas — resolve them here. */
function resolveFontFamily(family: string): string {
  if (family === 'var(--font-sans)') return FALLBACK_SANS
  if (family === 'var(--font-mono)') return FALLBACK_MONO
  return family
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n')
  const lines: string[] = []
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push('')
      continue
    }
    let current = words[0]
    for (let i = 1; i < words.length; i++) {
      const candidate = `${current} ${words[i]}`
      if (ctx.measureText(candidate).width <= maxWidth) current = candidate
      else {
        lines.push(current)
        current = words[i]
      }
    }
    lines.push(current)
  }
  return lines
}

interface AnimationState {
  opacity: number
  offsetY: number
  scale: number
  blur: number
  /** 0..1 — fraction of characters revealed, for typewriter. */
  reveal: number
}

function animationAt(animation: TextAnimation, local: number, duration: number): AnimationState {
  const base: AnimationState = { opacity: 1, offsetY: 0, scale: 1, blur: 0, reveal: 1 }
  if (animation === 'none') return base

  const window = Math.min(0.6, duration / 3)
  if (window <= 0) return base
  const inProgress = clamp(local / window, 0, 1)
  const outProgress = clamp((duration - local) / window, 0, 1)
  const eased = 1 - (1 - inProgress) ** 3

  switch (animation) {
    case 'fade':
      return { ...base, opacity: Math.min(inProgress, outProgress) }
    case 'slide-up':
      return { ...base, opacity: Math.min(eased, outProgress), offsetY: (1 - eased) * 0.06 }
    case 'pop':
      return {
        ...base,
        opacity: Math.min(eased, outProgress),
        scale: 0.86 + eased * 0.14 + Math.sin(eased * Math.PI) * 0.03,
      }
    case 'blur-in':
      return { ...base, opacity: Math.min(eased, outProgress), blur: (1 - eased) * 14 }
    case 'typewriter': {
      const typing = clamp(local / Math.max(0.4, duration * 0.55), 0, 1)
      return { ...base, opacity: Math.min(1, outProgress), reveal: typing }
    }
    default:
      return base
  }
}

export function drawTextClip(
  ctx: CanvasRenderingContext2D,
  clip: TextClip | CaptionClip,
  style: TextStyle,
  time: number,
  size: { width: number; height: number },
) {
  const local = time - clip.start
  if (local < 0 || local > clip.duration) return

  const animation: TextAnimation = clip.kind === 'text' ? clip.animation : 'fade'
  const state = animationAt(animation, local, clip.duration)
  if (state.opacity <= 0.001) return

  const raw = clip.kind === 'text' ? clip.content : clip.text
  const content = style.uppercase ? raw.toUpperCase() : raw
  const visible =
    state.reveal >= 1 ? content : content.slice(0, Math.max(0, Math.round(content.length * state.reveal)))
  if (!visible.trim()) return

  // Font sizes are authored against a 1080-tall composition and scale from there,
  // so the same text clip looks right at 720p, 1080p and 4K.
  const scaleFactor = (size.height / 1080) * state.scale
  const fontSize = style.fontSize * scaleFactor
  const family = resolveFontFamily(style.fontFamily)

  ctx.save()
  ctx.globalAlpha = state.opacity
  if (state.blur > 0) ctx.filter = `blur(${state.blur.toFixed(2)}px)`
  ctx.font = `${style.fontWeight} ${fontSize}px ${family}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = style.align
  ctx.letterSpacing = `${(style.letterSpacing * fontSize).toFixed(2)}px`

  const maxWidth = size.width * clamp(style.maxWidth, 0.1, 1)
  const lines = wrapLines(ctx, visible, maxWidth)
  const lineHeight = fontSize * style.lineHeight
  const blockHeight = lines.length * lineHeight

  const centerX = size.width / 2 + style.x * size.width
  const centerY = size.height / 2 + (style.y + state.offsetY) * size.height
  const firstBaseline = centerY - blockHeight / 2 + lineHeight / 2

  const anchorX =
    style.align === 'left'
      ? centerX - maxWidth / 2
      : style.align === 'right'
        ? centerX + maxWidth / 2
        : centerX

  if (style.backgroundOpacity > 0) {
    const padX = style.paddingX * scaleFactor
    const padY = style.paddingY * scaleFactor
    const widest = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0)
    const boxWidth = widest + padX * 2
    const boxX =
      style.align === 'left' ? anchorX - padX : style.align === 'right' ? anchorX - boxWidth + padX : centerX - boxWidth / 2
    ctx.save()
    ctx.globalAlpha = state.opacity * style.backgroundOpacity
    ctx.fillStyle = style.backgroundColor
    roundRect(ctx, boxX, centerY - blockHeight / 2 - padY, boxWidth, blockHeight + padY * 2, 6 * scaleFactor)
    ctx.fill()
    ctx.restore()
  }

  if (style.shadow > 0) {
    ctx.shadowColor = `rgba(0,0,0,${clamp(style.shadow, 0, 1)})`
    ctx.shadowBlur = 18 * scaleFactor
    ctx.shadowOffsetY = 2 * scaleFactor
  }

  lines.forEach((line, index) => {
    const y = firstBaseline + index * lineHeight
    if (style.strokeWidth > 0) {
      ctx.lineJoin = 'round'
      ctx.miterLimit = 2
      ctx.strokeStyle = style.strokeColor
      ctx.lineWidth = style.strokeWidth * scaleFactor
      ctx.strokeText(line, anchorX, y)
    }
    ctx.fillStyle = style.color
    ctx.fillText(line, anchorX, y)
  })

  ctx.restore()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}
