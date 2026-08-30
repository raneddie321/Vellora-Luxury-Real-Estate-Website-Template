import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DashboardView } from '@/components/studio/dashboard-view'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-64" />}>
      <DashboardView />
    </Suspense>
  )
}
