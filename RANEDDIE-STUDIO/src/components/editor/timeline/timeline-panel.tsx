'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Magnet,
  MousePointer2,
  Plus,
  Scissors,
  SquareSplitHorizontal,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Hint } from '@/components/ui/tooltip'
import { ClipView } from './clip-view'
import { TimeRuler } from './ruler'
import { TrackHeader } from './track-header'
import { useEditorStore } from '@/lib/store/editor-store'
import { applySnap, canHostClip, findClip, getSnapPoints, splitClip } from '@/lib/timeline/operations'
import type { Clip, Track, TrackKind } from '@/lib/types'
import { cn, snapToFrame } from '@/lib/utils'

const HEADER_WIDTH = 178
const RIGHT_PADDING = 400

type DragMode = 'move' | 'trim-start' | 'trim-end'

interface DragState {
  clipId: string
  mode: DragMode
  pointerId: number
  startX: number
  startY: number
  originalStart: number
  originalDuration: number
  originalTrackId: string
  moved: boolean
}

/**
 * The timeline.
 *
 * Drag, trim and split are driven by pointer events on absolutely-positioned
 * clip elements, with snapping computed against real clip boundaries and the
 * playhead. Every committed gesture goes through the store, so it lands in the
 * undo history like any other edit.
 */
export function TimelinePanel() {
  const project = useEditorStore((s) => s.project)
  const zoom = useEditorStore((s) => s.zoom)
  const playhead = useEditorStore((s) => s.playhead)
  const selection = useEditorStore((s) => s.selection)
  const tool = useEditorStore((s) => s.tool)
  const snapEnabled = useEditorStore((s) => s.snapEnabled)

  const setZoom = useEditorStore((s) => s.setZoom)
  const setTool = useEditorStore((s) => s.setTool)
  const toggleSnap = useEditorStore((s) => s.toggleSnap)
  const scrub = useEditorStore((s) => s.scrub)
  const select = useEditorStore((s) => s.select)
  const toggleSelect = useEditorStore((s) => s.toggleSelect)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const moveClip = useEditorStore((s) => s.moveClip)
  const trimClip = useEditorStore((s) => s.trimClip)
  const splitAtPlayhead = useEditorStore((s) => s.splitAtPlayhead)
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const addTrack = useEditorStore((s) => s.addTrack)
  const removeTrack = useEditorStore((s) => s.removeTrack)
  const updateTrack = useEditorStore((s) => s.updateTrack)
  const closeTrackGaps = useEditorStore((s) => s.closeTrackGaps)
  const addAssetToTimeline = useEditorStore((s) => s.addAssetToTimeline)
  const fillPlaceholderWithAsset = useEditorStore((s) => s.fillPlaceholderWithAsset)
  const commit = useEditorStore((s) => s.commit)

  const scrollRef = useRef<HTMLDivElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [ghost, setGhost] = useState<{ clipId: string; start: number; trackId: string } | null>(null)
  const [snapLine, setSnapLine] = useState<number | null>(null)
  const [dropTrackId, setDropTrackId] = useState<string | null>(null)

  const assetsById = useMemo(
    () => new Map((project?.assets ?? []).map((asset) => [asset.id, asset])),
    [project?.assets],
  )

  const duration = project?.timeline.duration ?? 0
  const contentWidth = Math.max(600, duration * zoom + RIGHT_PADDING)

  /** Converts a pointer event to a timeline time inside the lane. */
  const timeFromEvent = useCallback(
    (clientX: number) => {
      const lane = laneRef.current
      if (!lane) return 0
      const rect = lane.getBoundingClientRect()
      return Math.max(0, (clientX - rect.left) / zoom)
    },
    [zoom],
  )

  const onScrub = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!project) return
      const time = snapToFrame(timeFromEvent(event.clientX), project.settings.fps)
      scrub(Math.min(time, duration))
      const move = (moveEvent: PointerEvent) => {
        scrub(Math.min(snapToFrame(timeFromEvent(moveEvent.clientX), project.settings.fps), duration))
      }
      const up = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    },
    [project, timeFromEvent, scrub, duration],
  )

  /* ---- Clip gestures ------------------------------------------------ */

  const onClipPointerDown = useCallback(
    (event: React.PointerEvent, clip: Clip, track: Track, mode: DragMode) => {
      if (!project) return
      if (event.button !== 0) return

      if (tool === 'razor' && mode === 'move') {
        event.preventDefault()
        const time = timeFromEvent(event.clientX)
        commit('Split clip', (draft) => ({
          ...draft,
          timeline: splitClip(draft.timeline, clip.id, time, draft.settings.fps),
        }))
        return
      }

      if (event.shiftKey && mode === 'move') {
        toggleSelect(clip.id)
        return
      }
      if (!selection.includes(clip.id)) select([clip.id])
      if (clip.locked || track.locked) return

      event.preventDefault()
      ;(event.target as Element).setPointerCapture?.(event.pointerId)
      dragRef.current = {
        clipId: clip.id,
        mode,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originalStart: clip.start,
        originalDuration: clip.duration,
        originalTrackId: track.id,
        moved: false,
      }
    },
    [project, tool, selection, select, toggleSelect, timeFromEvent, commit],
  )

  useEffect(() => {
    if (!project) return

    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      const deltaX = event.clientX - drag.startX
      if (!drag.moved && Math.abs(deltaX) < 3 && Math.abs(event.clientY - drag.startY) < 3) return
      drag.moved = true

      const fps = project.settings.fps
      const tolerance = 8 / zoom
      const points = snapEnabled ? getSnapPoints(project.timeline, [drag.clipId], playhead) : []

      if (drag.mode === 'move') {
        const raw = Math.max(0, drag.originalStart + deltaX / zoom)
        const startSnap = applySnap(raw, points, tolerance)
        const endSnap = applySnap(raw + drag.originalDuration, points, tolerance)
        let start = raw
        let line: number | null = null
        if (startSnap.snapped !== null) {
          start = startSnap.time
          line = startSnap.snapped
        } else if (endSnap.snapped !== null) {
          start = endSnap.time - drag.originalDuration
          line = endSnap.snapped
        }
        start = snapToFrame(Math.max(0, start), fps)

        // Vertical movement retargets the track when the kinds are compatible.
        const clip = findClip(project.timeline, drag.clipId)?.clip
        let trackId = drag.originalTrackId
        if (clip) {
          const target = trackAtClientY(project.timeline.tracks, event.clientY, laneRef.current)
          if (target && canHostClip(target.kind, clip) && !target.locked) trackId = target.id
        }

        setGhost({ clipId: drag.clipId, start, trackId })
        setSnapLine(line)
      } else {
        const anchor =
          drag.mode === 'trim-start'
            ? drag.originalStart + deltaX / zoom
            : drag.originalStart + drag.originalDuration + deltaX / zoom
        const snapped = applySnap(anchor, points, tolerance)
        setSnapLine(snapped.snapped)
        setGhost({
          clipId: drag.clipId,
          start: drag.mode === 'trim-start' ? snapToFrame(Math.max(0, snapped.time), fps) : drag.originalStart,
          trackId: drag.originalTrackId,
        })
      }
    }

    const onUp = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      dragRef.current = null
      setSnapLine(null)
      const finalGhost = ghost
      setGhost(null)
      if (!drag.moved) return

      const fps = project.settings.fps
      const deltaX = event.clientX - drag.startX

      if (drag.mode === 'move') {
        const start = finalGhost?.start ?? snapToFrame(Math.max(0, drag.originalStart + deltaX / zoom), fps)
        const trackId = finalGhost?.trackId ?? drag.originalTrackId
        moveClip(drag.clipId, start, trackId)
      } else {
        const points = snapEnabled ? getSnapPoints(project.timeline, [drag.clipId], playhead) : []
        const tolerance = 8 / zoom
        const raw =
          drag.mode === 'trim-start'
            ? drag.originalStart + deltaX / zoom
            : drag.originalStart + drag.originalDuration + deltaX / zoom
        const snapped = applySnap(raw, points, tolerance)
        trimClip(drag.clipId, drag.mode === 'trim-start' ? 'start' : 'end', snapped.time)
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [project, zoom, snapEnabled, playhead, moveClip, trimClip, ghost])

  /* ---- Wheel zoom --------------------------------------------------- */

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12
      useEditorStore.getState().setZoom(useEditorStore.getState().zoom * factor)
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [])

  const zoomToFit = useCallback(() => {
    const element = scrollRef.current
    if (!element || duration <= 0) return
    setZoom((element.clientWidth - HEADER_WIDTH - 32) / duration)
  }, [duration, setZoom])

  if (!project) return null

  return (
    <section aria-label="Timeline" className="flex min-h-0 flex-1 flex-col border-t border-border bg-surface-2">
      {/* Toolbar */}
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-border bg-surface-1 px-2">
        <Hint label="Selection tool" shortcut="V">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setTool('select')}
            aria-label="Selection tool"
            aria-pressed={tool === 'select'}
            className={cn(tool === 'select' && 'bg-surface-3 text-foreground')}
          >
            <MousePointer2 />
          </Button>
        </Hint>
        <Hint label="Razor tool — click a clip to cut it" shortcut="C">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setTool('razor')}
            aria-label="Razor tool"
            aria-pressed={tool === 'razor'}
            className={cn(tool === 'razor' && 'bg-surface-3 text-foreground')}
          >
            <Scissors />
          </Button>
        </Hint>

        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

        <Hint label="Split at playhead" shortcut="S">
          <Button variant="ghost" size="icon-xs" onClick={splitAtPlayhead} aria-label="Split at playhead">
            <SquareSplitHorizontal />
          </Button>
        </Hint>
        <Hint label="Delete selection" shortcut="Del">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => deleteSelected(false)}
            disabled={selection.length === 0}
            aria-label="Delete selected clips"
          >
            <Trash2 />
          </Button>
        </Hint>
        <Hint label="Toggle snapping" shortcut="N">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={toggleSnap}
            aria-label="Toggle snapping"
            aria-pressed={snapEnabled}
            className={cn(snapEnabled && 'text-primary')}
          >
            <Magnet />
          </Button>
        </Hint>

        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="xs" className="gap-1">
              <Plus /> Track
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {(['video', 'audio', 'text', 'caption'] as TrackKind[]).map((kind) => (
              <DropdownMenuItem key={kind} onSelect={() => addTrack(kind)} className="capitalize">
                {kind} track
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-1">
          <Hint label="Zoom out" shortcut="−">
            <Button variant="ghost" size="icon-xs" onClick={() => setZoom(zoom / 1.4)} aria-label="Zoom out">
              <ZoomOut />
            </Button>
          </Hint>
          <Button variant="ghost" size="xs" onClick={zoomToFit} className="font-mono tabular">
            Fit
          </Button>
          <Hint label="Zoom in" shortcut="+">
            <Button variant="ghost" size="icon-xs" onClick={() => setZoom(zoom * 1.4)} aria-label="Zoom in">
              <ZoomIn />
            </Button>
          </Hint>
        </div>
      </div>

      {/* Lanes */}
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-auto">
        <div className="flex min-w-full" style={{ width: HEADER_WIDTH + contentWidth }}>
          {/* Sticky headers */}
          <div
            className="sticky left-0 z-20 shrink-0 border-r border-border bg-surface-1"
            style={{ width: HEADER_WIDTH }}
          >
            <div className="h-7 border-b border-border bg-surface-2" />
            {project.timeline.tracks.map((track) => (
              <TrackHeader
                key={track.id}
                track={track}
                onUpdate={(patch) => updateTrack(track.id, patch)}
                onRemove={() => removeTrack(track.id)}
                onCloseGaps={() => closeTrackGaps(track.id)}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative" style={{ width: contentWidth }}>
            <TimeRuler
              duration={duration}
              zoom={zoom}
              width={contentWidth}
              fps={project.settings.fps}
              onScrub={onScrub}
            />

            <div ref={laneRef} className="relative">
              {project.timeline.tracks.map((track) => (
                <div
                  key={track.id}
                  data-track-id={track.id}
                  onPointerDown={(event) => {
                    if (event.target === event.currentTarget) {
                      clearSelection()
                      onScrub(event)
                    }
                  }}
                  onDragOver={(event) => {
                    if (event.dataTransfer.types.includes('application/x-editime-asset')) {
                      event.preventDefault()
                      event.dataTransfer.dropEffect = 'copy'
                      setDropTrackId(track.id)
                    }
                  }}
                  onDragLeave={() => setDropTrackId((id) => (id === track.id ? null : id))}
                  onDrop={(event) => {
                    const assetId = event.dataTransfer.getData('application/x-editime-asset')
                    setDropTrackId(null)
                    if (!assetId) return
                    event.preventDefault()
                    const start = snapToFrame(timeFromEvent(event.clientX), project.settings.fps)
                    addAssetToTimeline(assetId, { trackId: track.id, start })
                  }}
                  className={cn(
                    'relative border-b border-border',
                    track.hidden && 'opacity-45',
                    dropTrackId === track.id && 'bg-primary/[0.08] ring-1 ring-inset ring-primary/40',
                  )}
                  style={{ height: track.height }}
                >
                  {/* Alternating column shading gives the eye a rhythm to scan. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.35]"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(to right, hsl(var(--border)/0.5) 0 1px, transparent 1px var(--col))',
                      ['--col' as string]: `${Math.max(24, zoom)}px`,
                    }}
                  />

                  {track.clips.map((clip) => {
                    const preview = ghost?.clipId === clip.id ? ghost : null
                    const hidden = preview && preview.trackId !== track.id
                    if (hidden) return null
                    const rendered = preview ? { ...clip, start: preview.start } : clip
                    return (
                      <ClipView
                        key={clip.id}
                        clip={rendered}
                        trackKind={track.kind}
                        asset={clip.kind === 'media' ? assetsById.get(clip.assetId) : undefined}
                        zoom={zoom}
                        height={track.height}
                        selected={selection.includes(clip.id)}
                        dimmed={Boolean(preview)}
                        onPointerDown={(event, mode) => onClipPointerDown(event, clip, track, mode)}
                        onDoubleClick={() => select([clip.id])}
                        onDropAsset={(assetId) => fillPlaceholderWithAsset(clip.id, assetId)}
                      />
                    )
                  })}

                  {/* A clip dragged in from another track renders here as a ghost. */}
                  {ghost && ghost.trackId === track.id && ghost.clipId && (
                    <GhostClip ghost={ghost} zoom={zoom} height={track.height} />
                  )}
                </div>
              ))}

              {project.timeline.tracks.length === 0 && (
                <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
                  This project has no tracks. Add one from the toolbar above.
                </div>
              )}
            </div>

            {/* Playhead */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 z-30 w-px bg-primary"
              style={{ left: playhead * zoom, height: '100%' }}
            >
              <span className="absolute -left-[5px] top-0 size-0 border-x-[5px] border-t-[7px] border-x-transparent border-t-primary" />
            </div>

            {/* Snap indicator */}
            {snapLine !== null && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-7 z-20 w-px bg-ai"
                style={{ left: snapLine * zoom, height: 'calc(100% - 1.75rem)' }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function GhostClip({
  ghost,
  zoom,
  height,
}: {
  ghost: { clipId: string; start: number; trackId: string }
  zoom: number
  height: number
}) {
  const project = useEditorStore((s) => s.project)
  const found = project ? findClip(project.timeline, ghost.clipId) : null
  if (!found) return null
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-[2px] rounded-[4px] border border-primary/70 bg-primary/20"
      style={{ left: ghost.start * zoom, width: found.clip.duration * zoom, height: height - 4 }}
    />
  )
}

function trackAtClientY(tracks: Track[], clientY: number, lane: HTMLElement | null): Track | null {
  if (!lane) return null
  const rows = lane.querySelectorAll<HTMLElement>('[data-track-id]')
  for (const row of rows) {
    const rect = row.getBoundingClientRect()
    if (clientY >= rect.top && clientY <= rect.bottom) {
      return tracks.find((track) => track.id === row.dataset.trackId) ?? null
    }
  }
  return null
}
