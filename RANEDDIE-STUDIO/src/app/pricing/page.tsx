import type { Metadata } from 'next'
import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { PricingTable } from '@/components/landing/pricing-table'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Demonstration pricing for Editime by Raneddie Studio. No payments are processed.',
}

const FAQ = [
  {
    q: 'What can I actually do without paying?',
    a: 'Everything on the Free tier, today: the full timeline editor, media library, effects, text, captions, templates, the deterministic AI planner, local media analysis and real browser export. There is no account and no upload.',
  },
  {
    q: 'What are AI credits?',
    a: 'A local accounting unit so you can see what an operation costs before you run it. In this build the ledger lives in your browser and nothing is billed — it is the mechanism that will meter real usage later.',
  },
  {
    q: 'Which features need an API key?',
    a: 'Background removal, image generation, video generation, synthetic voice, music and sound effects. Each has a finished provider interface and is labelled "Requires API" in the app until you configure a provider.',
  },
  {
    q: 'Where is my media stored?',
    a: 'In your own browser, in IndexedDB. Nothing is uploaded. If you connect a language model, only a compact timeline summary and your instruction are sent — never your video.',
  },
]

export default function PricingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
            <div className="mx-auto max-w-[46ch] text-center">
              <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
              <h1 className="mt-3 text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.03em]">
                Start free. Stay free until you need a model.
              </h1>
            </div>
            <div className="mt-10">
              <PricingTable />
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface-1/40">
          <div className="mx-auto max-w-[860px] px-5 py-16 sm:px-8">
            <h2 className="text-xl font-bold tracking-tight">Questions worth asking</h2>
            <dl className="mt-6 divide-y divide-border border-y border-border">
              {FAQ.map((item) => (
                <div key={item.q} className="py-5">
                  <dt className="text-sm font-semibold">{item.q}</dt>
                  <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
