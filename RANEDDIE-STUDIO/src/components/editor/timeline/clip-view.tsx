'use client'

import { memo, useEffect, useMemo, useRef } from 'react'
import { AudioLines, Image as ImageIcon, Lock, Sparkles, Type as TypeIcon, Upload } from 'lucide-react'
import type { Asset, Clip, TrackKind } from '@/lib/types'
import { cn } from '@/lib/utils'

const TRACK_ACCENT: Record<TrackKind, string> = {
  video: 'border-track-video/55 bg-track-video/[0.16]',
  audio: 'border-track-audio/55 bg-track-audio/[0.16]',
  text: 'border-track-text/55 bg-track-text/[0.16]',
  caption: 'border-track-caption/55 bg-track-caption/[0.16]',
}

const SELECTED_RING: Record<TrackKind, string> = {
  video: 'ring-track-video',
  audio: 'ring-track-audio',
  text: 'ring-track-text',
  caption: 'ring-track-caption',
}

interface ClipViewProps {
  clip: Clip
  trackKind: TrackKind
  asset?: Asset
  zoom: number
  height: number
  selected: boolean
  dimmed: boolean
  onPointerDown: (event: React.PointerEvent, mode: 'move' | 'trim-start' | 'trim-end') => void
  onDoubleClick?: () => void
  onDropAsset?: (assetId: string) => void
}

/**
 * A single clip on the timeline. Kept as a memoised leaf because a 60-clip
 * sequence re-renders on every playhead tick otherwise.
 */
export const ClipView = memo(function ClipView({
  clip,
  trackKind,
  asset,
  zoom,
  height,
  selected,
  dimmed,
  onPointerDown,
  onDoubleClick,
  onDropAsset,
}: ClipViewProps) {
  const width = Math.max(6, clip.duration * zoom)
  const left = clip.start * zoom
  const compact = width < 56

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${clip.label || clip.kind} clip, ${clip.duration.toFixed(1)} seconds`}
      aria-pressed={selected}
      onPointerDown={(event) => onPointerDown(event, 'move')}
      onDoubleClick={onDoubleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onDoubleClick?.()
        }
      }}
      onDragOver={(event) => {
        if (clip.kind === 'placeholder' && event.dataTransfer.types.includes('application/x-editime-asset')) {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
        }
      }}
      onDrop={(event) => {
        if (clip.kind !== 'placeholder') return
        const assetId = event.dataTransfer.getData('application/x-editime-asset')
        if (assetId) {
          event.preventDefault()
          onDropAsset?.(assetId)
        }
      }}
      className={cn(
        'group absolute top-[2px] overflow-hidden rounded-[4px] border text-left transition-[box-shadow,opacity] duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        clip.kind === 'placeholder'
          ? 'border-dashed border-muted-foreground/40 bg-surface-3/60'
          : TRACK_ACCENT[trackKind],
        selected && `ring-2 ring-offset-1 ring-offset-surface-2 ${SELECTED_RING[trackKind]}`,
        dimmed && 'opacity-45',
        clip.locked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
      )}
      style={{ left, width, height: height - 4 }}
    >
      {clip.kind === 'media' && asset?.kind === 'video' && asset.thumbnailDataUrl && (
        <FilmStrip thumbnail={asset.thumbnailDataUrl} width={width} height={height - 4} />
      )}
      {clip.kind === 'media' && asset?.kind === 'image' && asset.thumbnailDataUrl && (
        <FilmStrip thumbnail={asset.thumbnailDataUrl} width={width} height={height - 4} />
      )}
      {clip.kind === 'media' && asset?.kind === 'audio' && asset.waveform && (
        <Waveform clip={clip} asset={asset} width={width} height={height - 4} />
      )}

      {/* Fades are drawn as real geometry so their length is readable at a glance. */}
      {clip.kind === 'media' && clip.fadeIn > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r from-black/70 to-transparent"
          style={{ width: Math.min(width, clip.fadeIn * zoom) }}
        />
      )}
      {clip.kind === 'media' && clip.fadeOut > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 bg-gradient-to-l from-black/70 to-transparent"
          style={{ width: Math.min(width, clip.fadeOut * zoom) }}
        />
      )}

      <div className="pointer-events-none relative flex h-full items-start gap-1 px-1.5 py-1">
        {!compact && <ClipIcon clip={clip} />}
        <span className="min-w-0 flex-1 truncate text-[10px] font-medium leading-tight text-foreground/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {clip.kind === 'text' ? clip.content : clip.kind === 'caption' ? clip.text || '(empty caption)' : clip.label}
        </span>
        {clip.locked && <Lock className="size-2.5 shrink-0 text-muted-foreground" />}
      </div>

      {clip.kind === 'placeholder' && !compact && (
        <span className="pointer-events-none absolute inset-x-0 bottom-1 flex items-center justify-center gap-1 text-[9px] text-muted-foreground">
          <Upload className="size-2.5" /> {clip.hint}
        </span>
      )}

      {clip.kind === 'media' && clip.effects.length > 0 && (
        <span className="pointer-events-none absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded bg-black/60 px-1 text-[9px] text-white">
          <Sparkles className="size-2" /> {clip.effects.length}
        </span>
      )}
      {clip.kind === 'media' && clip.speed !== 1 && (
        <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/60 px-1 font-mono text-[9px] text-white">
          {clip.speed}×
        </span>
      )}
      {clip.kind === 'media' && clip.transitionIn && clip.transitionIn.type !== 'cut' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 border-r border-primary/60 bg-primary/20"
          style={{ width: Math.min(width / 2, clip.transitionIn.duration * zoom) }}
        />
      )}

      {/* Trim handles */}
      {!clip.locked && (
        <>
          <span
            role="separator"
            aria-label="Trim clip start"
            onPointerDown={(event) => {
              event.stopPropagation()
              onPointerDown(event, 'trim-start')
            }}
            className="absolute inset-y-0 left-0 w-1.5 cursor-ew-resize bg-foreground/0 transition-colors hover:bg-foreground/30 group-focus-within:bg-foreground/20"
          />
          <span
            role="separator"
            aria-label="Trim clip end"
            onPointerDown={(event) => {
              event.stopPropagation()
              onPointerDown(event, 'trim-end')
            }}
            className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize bg-foreground/0 transition-colors hover:bg-foreground/30 group-focus-within:bg-foreground/20"
          />
        </>
      )}
    </div>
  )
})

function ClipIcon({ clip }: { clip: Clip }) {
  if (clip.kind === 'text') return <TypeIcon className="mt-px size-2.5 shrink-0 text-track-text" />
  if (clip.kind === 'caption') return <TypeIcon className="mt-px size-2.5 shrink-0 text-track-caption" />
  if (clip.kind === 'placeholder') return <Upload className="mt-px size-2.5 shrink-0 text-muted-foreground" />
  if (clip.assetKind === 'audio') return <AudioLines className="mt-px size-2.5 shrink-0 text-track-audio" />
  if (clip.assetKind === 'image') return <ImageIcon className="mt-px size-2.5 shrink-0 text-track-video" />
  return null
}

/** Repeats the poster frame to suggest a filmstrip without decoding N frames. */
function FilmStrip({ thumbnail, width, height }: { thumbnail: string; width: number; height: number }) {
  const tileWidth = Math.max(28, Math.round(height * (16 / 9)))
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-45"
      style={{
        backgroundImage: `url(${thumbnail})`,
        backgroundSize: `${tileWidth}px ${height}px`,
        backgroundRepeat: 'repeat-x',
        width,
      }}
    />
  )
}

/** Draws the slice of the asset's real peaks that this clip actually covers. */
function Waveform({
  clip,
  asset,
  width,
  height,
}: {
  clip: Extract<Clip, { kind: 'media' }>
  asset: Asset
  width: number
  height: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const slice = useMemo(() => {
    const peaks = asset.waveform ?? []
    if (peaks.length === 0 || asset.duration <= 0) return []
    const from = Math.floor((clip.inPoint / asset.duration) * peaks.length)
    const to = Math.ceil((clip.outPoint / asset.duration) * peaks.length)
    return peaks.slice(Math.max(0, from), Math.min(peaks.length, Math.max(from + 1, to)))
  }, [asset.waveform, asset.duration, clip.inPoint, clip.outPoint])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || slice.length === 0) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(height * dpr))
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'hsl(var(--track-audio) / 0.65)'

    const columns = Math.max(1, Math.floor(width / 2))
    const perColumn = slice.length / columns
    for (let i = 0; i < columns; i++) {
      const start = Math.floor(i * perColumn)
      const end = Math.max(start + 1, Math.floor((i + 1) * perColumn))
      let peak = 0
      for (let j = start; j < end && j < slice.length; j++) peak = Math.max(peak, slice[j])
      const barHeight = Math.max(1, peak * (height - 6))
      ctx.fillRect(i * 2, (height - barHeight) / 2, 1.4, barHeight)
    }
  }, [slice, width, height])

  if (slice.length === 0) return null
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ width, height }}
    />
  )
}
