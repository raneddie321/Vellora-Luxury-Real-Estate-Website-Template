import Link from "next/link";
import { ArrowUpRight, Building2, Compass, Handshake, Home, KeyRound, LineChart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "@/components/sections/section-header";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Plate } from "@/components/media/plate";
import { homeContent } from "@/config/content";
import { ordinal } from "@/lib/utils";
import type { Service } from "@/types";

const ICONS: Record<string, LucideIcon> = {
  Home,
  Handshake,
  KeyRound,
  LineChart,
  Building2,
  Compass,
};

export function ServicesSection({ items }: { items: Service[] }) {
  return (
    <section className="theme-dark section-y bg-surface text-content" aria-labelledby="services-heading">
      <div className="shell">
        <SectionHeader
          eyebrow={homeContent.services.eyebrow}
          headline={homeContent.services.headline}
          supporting={homeContent.services.supporting}
          cta={homeContent.services.cta}
        />

        <RevealGroup className="mt-14 grid border-t border-hairline lg:mt-20 lg:grid-cols-3">
          {items.map((service, i) => {
            const Icon = ICONS[service.icon] ?? Home;
            return (
              <RevealItem
                key={service.id}
                className="border-b border-hairline lg:border-r lg:[&:nth-child(3n)]:border-r-0"
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden p-7 transition-colors duration-500 hover:bg-content/[0.04] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[var(--accent)] lg:p-9"
                >
                  {/* The visual is held back until hover, so the grid stays typographic. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-[var(--ease-editorial)] group-hover:opacity-[0.16]"
                  >
                    <Plate
                      asset={service.image}
                      className="h-full w-full"
                      sizes="(min-width: 1024px) 33vw, 92vw"
                      imgClassName="object-cover"
                    />
                  </span>

                  <span className="relative flex items-center justify-between">
                    <Icon className="size-5 text-[var(--accent)]" aria-hidden />
                    <span className="eyebrow text-content-faint tabular-nums">
                      ({ordinal(i)})
                    </span>
                  </span>

                  <h3 className="relative mt-10 font-serif text-3xl leading-tight tracking-[-0.03em] lg:mt-14">
                    {service.name}
                  </h3>
                  <p className="relative mt-3.5 max-w-[38ch] text-sm leading-relaxed text-content-muted">
                    {service.summary}
                  </p>

                  <span className="relative mt-8 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase lg:mt-12">
                    <span className="link-rule">{service.ctaLabel}</span>
                    <ArrowUpRight
                      className="size-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                      aria-hidden
                    />
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
