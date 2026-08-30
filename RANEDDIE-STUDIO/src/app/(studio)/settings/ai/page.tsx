import type { Metadata } from 'next'
import { AISettings } from '@/components/studio/ai-settings'

export const metadata: Metadata = { title: 'AI settings' }

export default function AISettingsPage() {
  return <AISettings />
}
