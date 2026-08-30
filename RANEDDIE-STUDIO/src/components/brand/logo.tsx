import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * The studio mark: an aperture blade cut through a play triangle — editing and
 * capture in one glyph. Drawn inline so it inherits colour and never blocks
 * first paint on a network request.
 */
export function LogoMark({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="30" height="30" rx="8" className="fill-surface-3" />
      <rect x="1" y="1" width="30" height="30" rx="8" className="stroke-border" strokeWidth="1" />
      <path d="M12 9.5 23 16l-11 6.5V9.5Z" className="fill-primary" />
      <path d="M9 11.5v9" className="stroke-ai" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({
  className,
  showProduct = true,
}: {
  className?: string
  showProduct?: boolean
}) {
  return (
    <span className={cn('flex flex-col leading-none', className)}>
      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-foreground">
        Raneddie Studio
      </span>
      {showProduct && (
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Editime
        </span>
      )}
    </span>
  )
}

export function BrandLink({
  href = '/',
  className,
  showProduct = true,
  size = 24,
}: {
  href?: string
  className?: string
  showProduct?: boolean
  size?: number
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-2.5 rounded-md px-1 py-1 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label="Raneddie Studio — home"
    >
      <LogoMark size={size} className="transition-transform group-hover:scale-105" />
      <Wordmark showProduct={showProduct} />
    </Link>
  )
}
