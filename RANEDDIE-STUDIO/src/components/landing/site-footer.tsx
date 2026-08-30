import Link from 'next/link'
import { LogoMark } from '@/components/brand/logo'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/templates', label: 'Templates' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/settings/ai', label: 'AI settings' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { href: '/projects', label: 'Projects' },
      { href: '/assets', label: 'Assets' },
      { href: '/settings/storage', label: 'Storage' },
      { href: '/settings/shortcuts', label: 'Shortcuts' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-1">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <LogoMark size={26} />
            <div className="leading-none">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]">Raneddie Studio</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Editime</p>
            </div>
          </div>
          <p className="max-w-[38ch] text-xs leading-relaxed text-muted-foreground">
            An AI-native creative studio for video, VFX, motion, audio and beyond. Your media stays on
            your machine unless you connect a provider yourself.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {column.title}
            </p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-5 text-2xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Raneddie Studio. Editime is an early MVP.</p>
          <p>Pricing shown on this site is illustrative — no payments are processed.</p>
        </div>
      </div>
    </footer>
  )
}
