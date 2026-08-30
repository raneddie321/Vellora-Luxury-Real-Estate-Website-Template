'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { BrandLink } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/#capabilities', label: 'Capabilities' },
  { href: '/#showcase', label: 'Showcase' },
  { href: '/#future', label: 'Roadmap' },
  { href: '/pricing', label: 'Pricing' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-200',
        scrolled ? 'border-b border-border bg-background/85 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <BrandLink />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Open studio</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard?new=1">Start creating</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-border bg-surface-1 px-5 py-3 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/dashboard">Open studio</Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link href="/dashboard?new=1">Start creating</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
