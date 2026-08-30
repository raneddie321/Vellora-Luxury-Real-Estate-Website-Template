import type { Metadata } from 'next'
import { AssetsView } from '@/components/studio/assets-view'

export const metadata: Metadata = { title: 'Assets' }

export default function AssetsPage() {
  return <AssetsView />
}
