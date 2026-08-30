'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { Segmented } from '@/components/ui/segmented'
import { Switch } from '@/components/ui/switch'
import { SettingRow, SettingsSection } from '@/components/studio/settings-nav'
import { useUIStore, type ThemeMode } from '@/lib/store/ui-store'

export function AppearanceSettings() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const reduceMotion = useUIStore((s) => s.reduceMotion)
  const setReduceMotion = useUIStore((s) => s.setReduceMotion)

  return (
    <>
      <SettingsSection
        title="Theme"
        description="Editime is dark by default because a bright shell distorts colour judgement while grading. A light theme is available for bright rooms."
      >
        <SettingRow
          label="Interface theme"
          control={
            <Segmented
              aria-label="Interface theme"
              value={theme}
              onChange={(value) => setTheme(value as ThemeMode)}
              options={[
                { value: 'dark', label: <><Moon /> Dark</> },
                { value: 'light', label: <><Sun /> Light</> },
                { value: 'system', label: <><Monitor /> System</> },
              ]}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Motion" description="Animation is decorative and can be turned off entirely.">
        <SettingRow
          label="Reduce motion"
          hint="Also honoured automatically when your operating system requests reduced motion."
          control={
            <Switch
              checked={reduceMotion}
              onCheckedChange={setReduceMotion}
              aria-label="Reduce motion"
            />
          }
        />
      </SettingsSection>
    </>
  )
}
