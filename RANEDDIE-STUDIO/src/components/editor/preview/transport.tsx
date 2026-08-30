'use client'

import {
  ChevronFirst,
  ChevronLast,
  Gauge,
  Grid3x3,
  Maximize2,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import { Hint } from '@/components/ui/tooltip'
import { useEditorStore, type PreviewQuality } from '@/lib/store/editor-store'
import { cn, formatTimecode, modKey } from '@/lib/utils'

const RATES = [0.25, 0.5, 1, 1.5, 2, 4]

const QUALITY_LABEL: Record<PreviewQuality, string> = {
  draft: 'Draft · 40%',
  balanced: 'Balanced · 66%',
  full: 'Full · 100%',
}

export function Transport({ onFullscreen }: { onFullscreen?: () => void }) {
  const project = useEditorStore((s) => s.project)
  const playhead = useEditorStore((s) => s.playhead)
  const playing = useEditorStore((s) => s.playing)
  const volume = useEditorStore((s) => s.volume)
  const muted = useEditorStore((s) => s.muted)
  const rate = useEditorStore((s) => s.playbackRate)
  const quality = useEditorStore((s) => s.previewQuality)
  const guides = useEditorStore((s) => s.showGuides)
  const loop = useEditorStore((s) => s.loop)

  const togglePlay = useEditorStore((s) => s.togglePlay)
  const stepFrames = useEditorStore((s) => s.stepFrames)
  const setPlayhead = useEditorStore((s) => s.setPlayhead)
  const setVolume = useEditorStore((s) => s.setVolume)
  const toggleMute = useEditorStore((s) => s.toggleMute)
  const setPlaybackRate = useEditorStore((s) => s.setPlaybackRate)
  const setPreviewQuality = useEditorStore((s) => s.setPreviewQuality)
  const toggleGuides = useEditorStore((s) => s.toggleGuides)
  const toggleLoop = useEditorStore((s) => s.toggleLoop)

  if (!project) return null
  const fps = project.settings.fps
  const duration = project.timeline.duration
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div className="flex h-11 shrink-0 items-center gap-1 border-t border-border bg-surface-1 px-2">
      <Hint label="Jump to start" shortcut="Home">
        <Button variant="ghost" size="icon-sm" onClick={() => setPlayhead(0)} aria-label="Jump to start">
          <ChevronFirst />
        </Button>
      </Hint>
      <Hint label="Previous frame" shortcut="←">
        <Button variant="ghost" size="icon-sm" onClick={() => stepFrames(-1)} aria-label="Previous frame">
          <SkipBack />
        </Button>
      </Hint>

      <Hint label={playing ? 'Pause' : 'Play'} shortcut="Space">
        <Button
          variant={playing ? 'secondary' : 'default'}
          size="icon-sm"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          aria-pressed={playing}
        >
          {playing ? <Pause /> : <Play />}
        </Button>
      </Hint>

      <Hint label="Next frame" shortcut="→">
        <Button variant="ghost" size="icon-sm" onClick={() => stepFrames(1)} aria-label="Next frame">
          <SkipForward />
        </Button>
      </Hint>
      <Hint label="Jump to end" shortcut="End">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setPlayhead(duration)}
          aria-label="Jump to end"
        >
          <ChevronLast />
        </Button>
      </Hint>

      <Hint label={loop ? 'Looping is on' : 'Loop playback'}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleLoop}
          aria-label="Loop playback"
          aria-pressed={loop}
          className={cn(loop && 'text-primary')}
        >
          <Repeat />
        </Button>
      </Hint>

      <div className="mx-2 flex items-baseline gap-1 font-mono text-xs tabular">
        <span className="text-foreground">{formatTimecode(playhead, fps)}</span>
        <span className="text-muted-foreground/60">/</span>
        <span className="text-muted-foreground">{formatTimecode(duration, fps)}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <div className="hidden items-center gap-1.5 sm:flex">
          <Hint label={muted ? 'Unmute' : 'Mute'}>
            <Button variant="ghost" size="icon-sm" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              <VolumeIcon />
            </Button>
          </Hint>
          <Slider
            value={[muted ? 0 : volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={([value]) => setVolume(value)}
            className="w-20"
            aria-label="Preview volume"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="xs" className="gap-1 font-mono tabular">
              <Gauge /> {rate}×
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Playback speed</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={String(rate)} onValueChange={(v) => setPlaybackRate(Number(v))}>
              {RATES.map((value) => (
                <DropdownMenuRadioItem key={value} value={String(value)}>
                  {value}×
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="xs" className="hidden gap-1 md:inline-flex">
              {QUALITY_LABEL[quality].split(' · ')[0]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Preview quality</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={quality}
              onValueChange={(value) => setPreviewQuality(value as PreviewQuality)}
            >
              {(Object.keys(QUALITY_LABEL) as PreviewQuality[]).map((value) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {QUALITY_LABEL[value]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <p className="px-2 py-1.5 text-[10px] leading-relaxed text-muted-foreground">
              Draft skips the per-pixel effects (sharpen, distortion). Export always renders at full
              quality regardless of this setting.
            </p>
          </DropdownMenuContent>
        </DropdownMenu>

        <Hint label="Safe-area guides">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleGuides}
            aria-label="Toggle safe-area guides"
            aria-pressed={guides}
            className={cn(guides && 'text-primary')}
          >
            <Grid3x3 />
          </Button>
        </Hint>

        {onFullscreen && (
          <Hint label="Fullscreen preview" shortcut={`${modKey()} ⇧ F`}>
            <Button variant="ghost" size="icon-sm" onClick={onFullscreen} aria-label="Fullscreen preview">
              <Maximize2 />
            </Button>
          </Hint>
        )}
      </div>
    </div>
  )
}
