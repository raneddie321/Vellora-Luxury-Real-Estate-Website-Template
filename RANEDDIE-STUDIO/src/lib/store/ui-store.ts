'use client'

import { create } from 'zustand'

/**
 * Cross-cutting UI preferences. Persisted to localStorage directly (rather than
 * through the repository) because these are per-device, not per-account.
 */

export type ThemeMode = 'dark' | 'light' | 'system'

interface UIStore {
  theme: ThemeMode
  reduceMotion: boolean
  commandBarOpen: boolean
  assistantOpen: boolean
  leftPanelTab: string
  hydrated: boolean

  hydrate: () => void
  setTheme: (theme: ThemeMode) => void
  setReduceMotion: (value: boolean) => void
  setCommandBarOpen: (open: boolean) => void
  toggleCommandBar: () => void
  setAssistantOpen: (open: boolean) => void
  setLeftPanelTab: (tab: string) => void
}

const KEY = 'rs:ui'

interface StoredUI {
  theme: ThemeMode
  reduceMotion: boolean
  leftPanelTab: string
  assistantOpen: boolean
}

function read(): Partial<StoredUI> {
  if (typeof localStorage === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<StoredUI>
  } catch {
    return {}
  }
}

function write(value: StoredUI) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // Storage full or blocked — preferences simply do not persist.
  }
}

export const useUIStore = create<UIStore>((set, get) => ({
  theme: 'dark',
  reduceMotion: false,
  commandBarOpen: false,
  assistantOpen: true,
  leftPanelTab: 'media',
  hydrated: false,

  hydrate() {
    if (get().hydrated) return
    const stored = read()
    set({
      theme: stored.theme ?? 'dark',
      reduceMotion: stored.reduceMotion ?? false,
      leftPanelTab: stored.leftPanelTab ?? 'media',
      assistantOpen: stored.assistantOpen ?? true,
      hydrated: true,
    })
    applyTheme(stored.theme ?? 'dark')
  },

  setTheme(theme) {
    set({ theme })
    applyTheme(theme)
    persist(get())
  },
  setReduceMotion(reduceMotion) {
    set({ reduceMotion })
    persist(get())
  },
  setCommandBarOpen(commandBarOpen) {
    set({ commandBarOpen })
  },
  toggleCommandBar() {
    set({ commandBarOpen: !get().commandBarOpen })
  },
  setAssistantOpen(assistantOpen) {
    set({ assistantOpen })
    persist(get())
  },
  setLeftPanelTab(leftPanelTab) {
    set({ leftPanelTab })
    persist(get())
  },
}))

function persist(state: UIStore) {
  write({
    theme: state.theme,
    reduceMotion: state.reduceMotion,
    leftPanelTab: state.leftPanelTab,
    assistantOpen: state.assistantOpen,
  })
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'system') {
    const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches
    root.setAttribute('data-theme', prefersLight ? 'light' : 'dark')
  } else {
    root.setAttribute('data-theme', theme)
  }
}
