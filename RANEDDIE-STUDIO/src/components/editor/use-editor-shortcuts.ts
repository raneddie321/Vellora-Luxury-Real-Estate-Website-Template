'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { allClips } from '@/lib/timeline/operations'
import { useEditorStore } from '@/lib/store/editor-store'
import { useUIStore } from '@/lib/store/ui-store'

/** True when the event came from somewhere the user is actually typing. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * Binds the shortcuts declared in `lib/shortcuts.ts`.
 *
 * One listener on the window, suppressed while typing, and every branch calls a
 * store action — so a shortcut can never diverge from the button that does the
 * same thing.
 */
export function useEditorShortcuts({ onExport }: { onExport: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const store = useEditorStore.getState()
      const ui = useUIStore.getState()
      const mod = event.metaKey || event.ctrlKey

      // The command bar must open even from inside a text field.
      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        ui.toggleCommandBar()
        return
      }
      if (isTypingTarget(event.target)) return
      if (!store.project) return

      // --- Modifier combinations ---
      if (mod) {
        switch (event.key.toLowerCase()) {
          case 'z': {
            event.preventDefault()
            const label = event.shiftKey ? store.redo() : store.undo()
            if (label) toast.success(`${event.shiftKey ? 'Redid' : 'Undid'}: ${label}`)
            return
          }
          case 'y': {
            event.preventDefault()
            const label = store.redo()
            if (label) toast.success(`Redid: ${label}`)
            return
          }
          case 'd':
            event.preventDefault()
            store.duplicateSelected()
            return
          case 'a':
            event.preventDefault()
            store.select(allClips(store.project.timeline).map((clip) => clip.id))
            return
          case 'e':
            event.preventDefault()
            onExport()
            return
          case 'j':
            event.preventDefault()
            ui.setAssistantOpen(!ui.assistantOpen)
            return
          case 's':
            // Autosave is always on; acknowledge the muscle memory rather than
            // letting the browser open a Save Page dialog.
            event.preventDefault()
            toast.success('Saved', { description: 'Autosave keeps this project current.' })
            return
          default:
            return
        }
      }

      // --- Single keys ---
      switch (event.key) {
        case ' ':
          event.preventDefault()
          store.togglePlay()
          break
        case 'ArrowLeft':
          event.preventDefault()
          if (event.shiftKey) store.setPlayhead(store.playhead - 1)
          else store.stepFrames(-1)
          break
        case 'ArrowRight':
          event.preventDefault()
          if (event.shiftKey) store.setPlayhead(store.playhead + 1)
          else store.stepFrames(1)
          break
        case 'Home':
          event.preventDefault()
          store.setPlayhead(0)
          break
        case 'End':
          event.preventDefault()
          store.setPlayhead(store.project.timeline.duration)
          break
        case 'Delete':
        case 'Backspace':
          if (store.selection.length === 0) return
          event.preventDefault()
          store.deleteSelected(event.shiftKey)
          break
        case 'Escape':
          store.clearSelection()
          break
        case '+':
        case '=':
          event.preventDefault()
          store.setZoom(store.zoom * 1.35)
          break
        case '-':
        case '_':
          event.preventDefault()
          store.setZoom(store.zoom / 1.35)
          break
        default:
          switch (event.key.toLowerCase()) {
            case 's':
              event.preventDefault()
              store.splitAtPlayhead()
              break
            case 'n':
              event.preventDefault()
              store.toggleSnap()
              break
            case 'v':
              store.setTool('select')
              break
            case 'c':
              store.setTool('razor')
              break
            case 'z':
              if (event.shiftKey) {
                event.preventDefault()
                const duration = store.project.timeline.duration
                if (duration > 0) store.setZoom((window.innerWidth - 700) / duration)
              }
              break
            default:
              break
          }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onExport])
}
