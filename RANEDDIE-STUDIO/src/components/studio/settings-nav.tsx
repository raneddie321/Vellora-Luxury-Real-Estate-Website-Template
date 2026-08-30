'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/settings', label: 'Account' },
  { href: '/settings/appearance', label: 'Appearance' },
  { href: '/settings/ai', label: 'AI' },
  { href: '/settings/shortcuts', label: 'Keyboard Shortcuts' },
  { href: '/settings/storage', label: 'Storage' },
  { href: '/settings/billing', label: 'Billing' },
]

export function SettingsNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Settings" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:px-0">
      {ITEMS.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-md px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-surface-3 font-medium text-foreground'
                : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-surface-1">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function SettingRow({
  label,
  hint,
  control,
}: {
  label: string
  hint?: string
  control: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-xs font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-2xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}
