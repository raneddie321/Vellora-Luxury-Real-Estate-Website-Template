import type { Metadata } from 'next'
import { StorageSettings } from '@/components/studio/storage-settings'

export const metadata: Metadata = { title: 'Storage' }

export default function StorageSettingsPage() {
  return <StorageSettings />
}
