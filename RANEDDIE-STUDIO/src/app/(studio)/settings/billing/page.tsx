import type { Metadata } from 'next'
import { BillingSettings } from '@/components/studio/billing-settings'

export const metadata: Metadata = { title: 'Billing' }

export default function BillingSettingsPage() {
  return <BillingSettings />
}
