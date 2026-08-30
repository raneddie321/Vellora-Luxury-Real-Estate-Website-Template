'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FolderOpen,
  Images,
  LayoutDashboard,
  LayoutTemplate,
  Menu,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { BrandLink } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { useCreditsStore } from '@/lib/store/credits-store'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/assets', label: 'Assets', icon: Images },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const balance = useCreditsStore((s) => s.balance)

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const nav = (
    <nav aria-label="Studio" className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-surface-3 font-medium text-foreground'
                : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Mobile top bar */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
        <BrandLink showProduct={false} />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="studio-nav"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>
      {mobileOpen && (
        <div id="studio-nav" className="border-b border-border bg-surface-1 p-3 lg:hidden">
          {nav}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-[228px] shrink-0 flex-col border-r border-border bg-surface-1 lg:flex">
        <div className="flex h-16 items-center border-b border-border px-3">
          <BrandLink />
        </div>
        <div className="flex-1 overflow-y-auto p-3">{nav}</div>
        <div className="border-t border-border p-3">
          <div className="rounded-lg border border-ai/25 bg-ai/[0.06] p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-ai" aria-hidden="true" />
              <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-ai">AI Credits</p>
            </div>
            <p className="mt-2 text-xl font-bold tabular tracking-tight">{balance.toLocaleString()}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Local ledger. Nothing is billed.
            </p>
            <Button asChild variant="ghost" size="xs" className="mt-2 w-full justify-start px-1.5">
              <Link href="/settings/billing">Usage &amp; plans →</Link>
            </Button>
          </div>
        </div>
      </aside>

      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-7">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-[70ch] text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
