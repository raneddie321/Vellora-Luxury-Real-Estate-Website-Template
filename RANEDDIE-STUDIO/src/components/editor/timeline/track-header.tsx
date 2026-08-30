'use client'

import { AudioLines, Eye, EyeOff, Lock, LockOpen, Type as TypeIcon, Video, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Hint } from '@/components/ui/tooltip'
import type { Track, TrackKind } from '@/lib/types'
import { cn } from '@/lib/utils'

const ICON: Record<TrackKind, React.ElementType> = {
  video: Video,
  audio: AudioLines,
  text: TypeIcon,
  caption: TypeIcon,
}

const DOT: Record<TrackKind, string> = {
  video: 'bg-track-video',
  audio: 'bg-track-audio',
  text: 'bg-track-text',
  caption: 'bg-track-caption',
}

export function TrackHeader({
  track,
  onUpdate,
  onRemove,
  onCloseGaps,
}: {
  track: Track
  onUpdate: (patch: Partial<Track>) => void
  onRemove: () => void
  onCloseGaps: () => void
}) {
  const Icon = ICON[track.kind]
  const audible = track.kind === 'audio' || track.kind === 'video'

  return (
    <div
      className="flex shrink-0 items-center gap-1.5 border-b border-border bg-surface-1 px-2"
      style={{ height: track.height }}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', DOT[track.kind])} aria-hidden="true" />
      <Icon className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="min-w-0 flex-1 truncate rounded px-1 py-0.5 text-left text-[11px] font-medium hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {track.name}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={onCloseGaps}>Close gaps on this track</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onUpdate({ height: Math.min(120, track.height + 14) })}>
            Taller
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onUpdate({ height: Math.max(28, track.height - 14) })}>
            Shorter
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={onRemove}>
            Delete track
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex shrink-0 items-center">
        {audible && (
          <Hint label={track.muted ? 'Unmute track' : 'Mute track'}>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onUpdate({ muted: !track.muted })}
              aria-label={track.muted ? `Unmute ${track.name}` : `Mute ${track.name}`}
              aria-pressed={track.muted}
              className={cn(track.muted && 'text-destructive')}
            >
              {track.muted ? <VolumeX /> : <Volume2 />}
            </Button>
          </Hint>
        )}
        {track.kind !== 'audio' && (
          <Hint label={track.hidden ? 'Show track' : 'Hide track'}>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onUpdate({ hidden: !track.hidden })}
              aria-label={track.hidden ? `Show ${track.name}` : `Hide ${track.name}`}
              aria-pressed={track.hidden}
              className={cn(track.hidden && 'text-warning')}
            >
              {track.hidden ? <EyeOff /> : <Eye />}
            </Button>
          </Hint>
        )}
        <Hint label={track.locked ? 'Unlock track' : 'Lock track'}>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onUpdate({ locked: !track.locked })}
            aria-label={track.locked ? `Unlock ${track.name}` : `Lock ${track.name}`}
            aria-pressed={track.locked}
            className={cn(track.locked && 'text-warning')}
          >
            {track.locked ? <Lock /> : <LockOpen />}
          </Button>
        </Hint>
      </div>
    </div>
  )
}
