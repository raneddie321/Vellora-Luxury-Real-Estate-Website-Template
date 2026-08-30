'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'
import { PLANS, isBillingEnabled } from '@/lib/billing/plans'
import { cn } from '@/lib/utils'

export function PricingTable() {
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly')
  const billingLive = isBillingEnabled()

  return (
    <div>
      <div
        role="note"
        className="mx-auto flex max-w-[62ch] items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/[0.07] px-4 py-3"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-foreground/90">
          <span className="font-semibold text-warning">These prices are a demonstration.</span> No payment
          provider is connected, no card details are collected anywhere in this application, and
          selecting a plan does not charge you. Everything on the Free tier works today with no account.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <Segmented
          aria-label="Billing period"
          value={cycle}
          onChange={setCycle}
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'annual', label: 'Annual · save 20%' },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = cycle === 'annual' ? plan.annualPrice : plan.price
          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-xl border bg-surface-1 p-5',
                plan.highlight ? 'border-primary/45 shadow-glow' : 'border-border',
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-2.5 left-5 rounded border border-primary/40 bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                  Most complete
                </span>
              )}

              <h3 className="text-sm font-semibold">{plan.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight tabular">${price}</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <p className="mt-1 text-2xs text-muted-foreground">
                {plan.credits.toLocaleString()} AI credits included
              </p>

              <Button
                asChild={plan.id === 'free'}
                variant={plan.highlight ? 'default' : 'secondary'}
                className="mt-5 w-full"
                disabled={plan.id !== 'free' && !billingLive}
                title={
                  plan.id !== 'free' && !billingLive
                    ? 'Billing is not connected in this build'
                    : undefined
                }
              >
                {plan.id === 'free' ? <Link href="/dashboard">{plan.cta}</Link> : <span>{plan.cta}</span>}
              </Button>
              {plan.id !== 'free' && !billingLive && (
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  Checkout is disabled — no billing provider configured
                </p>
              )}

              <ul className="mt-5 space-y-2 border-t border-border pt-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-2xs">
                {Object.entries(plan.limits).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <dt className="capitalize text-muted-foreground">{key}</dt>
                    <dd className="text-right font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </div>
    </div>
  )
}
