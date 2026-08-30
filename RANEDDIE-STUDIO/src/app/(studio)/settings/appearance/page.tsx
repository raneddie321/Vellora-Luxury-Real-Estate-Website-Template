import type { Metadata } from 'next'
import { AppearanceSettings } from '@/components/studio/appearance-settings'

export const metadata: Metadata = { title: 'Appearance' }

export default function AppearanceSettingsPage() {
  return <AppearanceSettings />
}
