/**
 * The single registry of keyboard shortcuts.
 *
 * The editor binds from this list and the Settings page renders it, so the
 * documented shortcuts and the working shortcuts can never disagree.
 */
export interface Shortcut {
  id: string
  keys: string[]
  /** Displayed with ⌘ on Apple platforms, Ctrl elsewhere. */
  mod?: boolean
  shift?: boolean
  label: string
  group: 'Playback' | 'Editing' | 'Timeline' | 'AI' | 'Project'
}

export const SHORTCUTS: Shortcut[] = [
  { id: 'play', keys: ['Space'], label: 'Play / pause', group: 'Playback' },
  { id: 'prev-frame', keys: ['←'], label: 'Previous frame', group: 'Playback' },
  { id: 'next-frame', keys: ['→'], label: 'Next frame', group: 'Playback' },
  { id: 'jump-back', keys: ['Shift', '←'], shift: true, label: 'Back one second', group: 'Playback' },
  { id: 'jump-forward', keys: ['Shift', '→'], shift: true, label: 'Forward one second', group: 'Playback' },
  { id: 'start', keys: ['Home'], label: 'Jump to start', group: 'Playback' },
  { id: 'end', keys: ['End'], label: 'Jump to end', group: 'Playback' },

  { id: 'split', keys: ['S'], label: 'Split clip at playhead', group: 'Editing' },
  { id: 'delete', keys: ['Delete'], label: 'Delete selected clip', group: 'Editing' },
  { id: 'ripple-delete', keys: ['Shift', 'Delete'], shift: true, label: 'Ripple delete (close the gap)', group: 'Editing' },
  { id: 'duplicate', keys: ['mod', 'D'], mod: true, label: 'Duplicate selection', group: 'Editing' },
  { id: 'undo', keys: ['mod', 'Z'], mod: true, label: 'Undo', group: 'Editing' },
  { id: 'redo', keys: ['mod', 'Shift', 'Z'], mod: true, shift: true, label: 'Redo', group: 'Editing' },
  { id: 'select-all', keys: ['mod', 'A'], mod: true, label: 'Select all clips', group: 'Editing' },
  { id: 'deselect', keys: ['Esc'], label: 'Clear selection', group: 'Editing' },

  { id: 'zoom-in', keys: ['+'], label: 'Zoom in', group: 'Timeline' },
  { id: 'zoom-out', keys: ['−'], label: 'Zoom out', group: 'Timeline' },
  { id: 'zoom-fit', keys: ['Shift', 'Z'], shift: true, label: 'Zoom to fit', group: 'Timeline' },
  { id: 'snap', keys: ['N'], label: 'Toggle snapping', group: 'Timeline' },
  { id: 'razor', keys: ['C'], label: 'Razor tool', group: 'Timeline' },
  { id: 'select-tool', keys: ['V'], label: 'Selection tool', group: 'Timeline' },

  { id: 'command-bar', keys: ['mod', 'K'], mod: true, label: 'Open the AI command bar', group: 'AI' },
  { id: 'assistant', keys: ['mod', 'J'], mod: true, label: 'Toggle the assistant panel', group: 'AI' },

  { id: 'export', keys: ['mod', 'E'], mod: true, label: 'Export', group: 'Project' },
  { id: 'save', keys: ['mod', 'S'], mod: true, label: 'Save now (autosave is always on)', group: 'Project' },
]

export const SHORTCUT_GROUPS = ['Playback', 'Editing', 'Timeline', 'AI', 'Project'] as const
