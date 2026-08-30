'use client'

import { Kbd } from '@/components/ui/kbd'
import { SettingsSection } from '@/components/studio/settings-nav'
import { useModKey } from '@/hooks/use-mod-key'
import { SHORTCUTS, SHORTCUT_GROUPS } from '@/lib/shortcuts'

export function ShortcutSettings() {
  const mod = useModKey()

  return (
    <>
      {SHORTCUT_GROUPS.map((group) => (
        <SettingsSection key={group} title={group}>
          <ul className="divide-y divide-border">
            {SHORTCUTS.filter((shortcut) => shortcut.group === group).map((shortcut) => (
              <li key={shortcut.id} className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
                <span className="text-xs">{shortcut.label}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {shortcut.keys.map((key, index) => (
                    <Kbd key={`${shortcut.id}-${index}`}>{key === 'mod' ? mod : key}</Kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </SettingsSection>
      ))}
      <p className="px-1 text-2xs leading-relaxed text-muted-foreground">
        Shortcuts are bound from one registry (<code className="font-mono">src/lib/shortcuts.ts</code>) that both
        this page and the editor read, so the list can never drift from what actually works. They are
        suppressed while you are typing in a field.
      </p>
    </>
  )
}
