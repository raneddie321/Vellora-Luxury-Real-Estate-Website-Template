'use client'

import { memo, useMemo } from 'react'
import { formatTimecode } from '@/lib/utils'

/** Chooses a tick interval that keeps labels at least ~72px apart. */
function chooseInterval(zoom: number): { major: number; minor: number } {
  const candidates = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600]
  const major = candidates.find((value) => value * zoom >= 72) ?? candidates[candidates.length - 1]
  return { major, minor: major / (major >= 5 ? 5 : 4) }
}

export const TimeRuler = memo(function TimeRuler({
  duration,
  zoom,
  width,
  fps,
  onScrub,
}: {
  duration: number
  zoom: number
  width: number
  fps: number
  onScrub: (event: React.PointerEvent<HTMLDivElement>) => void
}) {
  const { major, minor } = useMemo(() => chooseInterval(zoom), [zoom])

  const ticks = useMemo(() => {
    const span = Math.max(duration, width / zoom)
    const result: { time: number; major: boolean }[] = []
    // Cap the tick count so an extreme zoom-out cannot lock the main thread.
    const total = Math.min(2000, Math.ceil(span / minor) + 1)
    for (let i = 0; i < total; i++) {
      const time = i * minor
      result.push({ time, major: Math.abs(time % major) < 1e-6 })
    }
    return result
  }, [duration, width, zoom, minor, major])

  return (
    <div
      className="relative h-7 cursor-text select-none border-b border-border bg-surface-2"
      style={{ width }}
      onPointerDown={onScrub}
      role="slider"
      aria-label="Timeline position"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={0}
      tabIndex={-1}
    >
      {ticks.map(({ time, major: isMajor }) => (
        <span
          key={time}
          aria-hidden="true"
          className={isMajor ? 'absolute bottom-0 w-px bg-border' : 'absolute bottom-0 w-px bg-border/60'}
          style={{ left: time * zoom, height: isMajor ? 10 : 5 }}
        />
      ))}
      {ticks
        .filter((tick) => tick.major)
        .map(({ time }) => (
          <span
            key={`label-${time}`}
            className="absolute top-1 select-none pl-1 font-mono text-[10px] tabular text-muted-foreground"
            style={{ left: time * zoom }}
          >
            {formatTimecode(time, time % 1 !== 0 ? fps : undefined)}
          </span>
        ))}
    </div>
  )
})
