import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** `12.5` → `00:12:15` (frames) when fps is given, otherwise `00:12.5`. */
export function formatTimecode(seconds: number, fps?: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  const total = Math.floor(safe)
  const hrs = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const pad = (n: number, l = 2) => String(n).padStart(l, '0')

  if (fps) {
    const frames = Math.floor((safe - total) * fps)
    const head = hrs > 0 ? `${pad(hrs)}:` : ''
    return `${head}${pad(mins)}:${pad(secs)}:${pad(frames)}`
  }
  const head = hrs > 0 ? `${pad(hrs)}:` : ''
  return `${head}${pad(mins)}:${pad(secs)}`
}

/** Compact duration for cards and lists: `1:04`, `12:03`, `1:02:11`. */
export function formatDuration(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0
  const hrs = Math.floor(safe / 3600)
  const mins = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / 1024 ** i
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return 'unknown'
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/** Rounds a time to the nearest frame boundary so edits stay frame-accurate. */
export const snapToFrame = (seconds: number, fps: number) =>
  Math.round(seconds * fps) / fps

export function throttle<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: A | null = null
  return (...args: A) => {
    const now = Date.now()
    if (now - last >= ms) {
      last = now
      fn(...args)
    } else {
      pending = args
      if (!timer) {
        timer = setTimeout(
          () => {
            timer = null
            last = Date.now()
            if (pending) fn(...pending)
            pending = null
          },
          ms - (now - last),
        )
      }
    }
  }
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: A) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

/** Deterministic, dependency-free deep clone for plain project data. */
export function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

export const isBrowser = () => typeof window !== 'undefined'

export const isMac = () =>
  isBrowser() && /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)

/** Renders `Cmd` on Apple platforms and `Ctrl` everywhere else. */
export const modKey = () => (isMac() ? '⌘' : 'Ctrl')

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function titleCase(input: string) {
  return input.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Non-cryptographic hash used for stable colour/poster selection. */
export function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}
