import type { Metadata } from 'next'
import { ShortcutSettings } from '@/components/studio/shortcut-settings'

export const metadata: Metadata = { title: 'Keyboard shortcuts' }

export default function ShortcutSettingsPage() {
  return <ShortcutSettings />
}
