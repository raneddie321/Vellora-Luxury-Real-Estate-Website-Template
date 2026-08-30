'use client'

import Link from 'next/link'
import { Coins, CreditCard, Info, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Progress } from '@/components/ui/progress'
import { SettingsSection } from '@/components/studio/settings-nav'
import { creditLabel, useCreditsStore } from '@/lib/store/credits-store'
import { PLANS, isBillingEnabled } from '@/lib/billing/plans'
import { formatRelativeTime } from '@/lib/utils'

export function BillingSettings() {
  const balance = useCreditsStore((s) => s.balance)
  const history = useCreditsStore((s) => s.history)
  const grant = useCreditsStore((s) => s.grant)
  const reset = useCreditsStore((s) => s.reset)

  const free = PLANS[0]
  const used = Math.max(0, free.credits - balance)
  const percent = free.credits > 0 ? Math.min(100, (used / free.credits) * 100) : 0

  return (
    <>
      <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/[0.07] px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
        <p className="text-xs leading-relaxed">
          <span className="font-semibold text-warning">No payment provider is connected.</span> Nothing on
          this page charges you, and no card details are collected anywhere in this application. Credits
          are a local ledger so operation cost is visible before it is spent.
        </p>
      </div>

      <SettingsSection title="AI credits" description="Spent when you apply an operation from an edit plan.">
        <div className="rounded-md border border-border bg-surface-2 p-3">
          <div className="flex items-center gap-2">
            <Coins className="size-3.5 text-ai" aria-hidden="true" />
            <p className="text-xs font-medium">Balance</p>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular">{balance.toLocaleString()}</p>
          <div className="mt-3 space-y-1.5">
            <Progress value={percent} tone="ai" />
            <p className="text-2xs text-muted-foreground">
              {used.toLocaleString()} of {free.credits.toLocaleString()} used on the Free allowance
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => grant(250, 'Manual top-up (demo)')}>
              <Coins /> Add 250 demo credits
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw /> Reset ledger
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Usage history" description="Every credit movement, newest first.">
        {history.length === 0 ? (
          <EmptyState
            compact
            icon={Coins}
            title="Nothing spent yet"
            description="Apply an AI operation and it will be recorded here with its cost."
          />
        ) : (
          <ul className="divide-y divide-border">
            {history.slice(0, 25).map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{entry.description}</p>
                  <p className="mt-0.5 truncate text-2xs text-muted-foreground">
                    {creditLabel(entry.capability)} · {formatRelativeTime(entry.createdAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-mono text-xs tabular ${
                    entry.amount > 0 ? 'text-success' : 'text-muted-foreground'
                  }`}
                >
                  {entry.amount > 0 ? '+' : ''}
                  {entry.amount}
                </span>
                <span className="hidden w-16 shrink-0 text-right font-mono text-2xs tabular text-muted-foreground/70 sm:block">
                  {entry.balanceAfter}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>

      <SettingsSection title="Plans" description="Illustrative tiers. Selecting one does nothing in this build.">
        <ul className="space-y-2">
          {PLANS.map((plan) => (
            <li
              key={plan.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">{plan.name}</p>
                  {plan.id === 'free' && <Badge variant="success">Current</Badge>}
                </div>
                <p className="mt-0.5 truncate text-2xs text-muted-foreground">{plan.tagline}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-xs tabular">${plan.price}/mo</span>
                <Button size="sm" variant="secondary" disabled={plan.id === 'free' || !isBillingEnabled()}>
                  <CreditCard /> {plan.id === 'free' ? 'Active' : 'Unavailable'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <Button asChild variant="ghost" size="sm" className="mt-3">
          <Link href="/pricing">Compare plans in detail →</Link>
        </Button>
      </SettingsSection>
    </>
  )
}
