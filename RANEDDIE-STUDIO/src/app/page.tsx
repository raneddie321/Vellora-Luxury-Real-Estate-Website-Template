import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { Hero } from '@/components/landing/hero'
import { Showcase } from '@/components/landing/showcase'
import { Features } from '@/components/landing/features'
import { ClosingCTA } from '@/components/landing/cta'

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <Showcase />
        <Features />
        <ClosingCTA />
      </main>
      <SiteFooter />
    </div>
  )
}
