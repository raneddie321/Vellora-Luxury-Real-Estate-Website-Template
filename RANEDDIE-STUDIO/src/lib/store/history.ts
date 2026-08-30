import type { Project } from '@/lib/types'
import { deepClone } from '@/lib/utils'

/**
 * Undo history.
 *
 * Every mutation — typed by a person or applied from an AI plan — goes through
 * `push`, so the two are indistinguishable to the history and an AI edit is
 * exactly as undoable as a drag.
 */

export interface HistoryEntry {
  label: string
  project: Project
  at: number
}

export const HISTORY_LIMIT = 60

export interface HistoryState {
  past: HistoryEntry[]
  future: HistoryEntry[]
}

export const emptyHistory = (): HistoryState => ({ past: [], future: [] })

export function pushHistory(state: HistoryState, label: string, previous: Project): HistoryState {
  const past = [...state.past, { label, project: deepClone(previous), at: Date.now() }]
  return {
    past: past.length > HISTORY_LIMIT ? past.slice(past.length - HISTORY_LIMIT) : past,
    // Any new edit invalidates the redo branch, as in every editor.
    future: [],
  }
}

export function undo(
  state: HistoryState,
  current: Project,
): { history: HistoryState; project: Project; label: string } | null {
  const entry = state.past[state.past.length - 1]
  if (!entry) return null
  return {
    history: {
      past: state.past.slice(0, -1),
      future: [{ label: entry.label, project: deepClone(current), at: Date.now() }, ...state.future],
    },
    project: entry.project,
    label: entry.label,
  }
}

export function redo(
  state: HistoryState,
  current: Project,
): { history: HistoryState; project: Project; label: string } | null {
  const entry = state.future[0]
  if (!entry) return null
  return {
    history: {
      past: [...state.past, { label: entry.label, project: deepClone(current), at: Date.now() }],
      future: state.future.slice(1),
    },
    project: entry.project,
    label: entry.label,
  }
}
