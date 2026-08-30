import { Suspense } from 'react'
import type { Metadata } from 'next'
import { TemplatesView } from '@/components/studio/templates-view'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = { title: 'Templates' }

export default function TemplatesPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-64" />}>
      <TemplatesView />
    </Suspense>
  )
}
