import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { neighborhoods, neighborhoodBySlug } from "@/data/neighborhoods";
import { properties } from "@/data/properties";
import { agents } from "@/data/agents";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { Plate } from "@/components/media/plate";
import { PropertyCard } from "@/components/property/property-card";
import { AgentCard } from "@/components/cards/agent-card";
import { StaticMap } from "@/components/property/static-map";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/sections/cta-band";
import { areaUnitLabel, formatPrice, ordinal } from "@/lib/utils";
import { img } from "@/lib/images";

export function generateStaticParams() {
  return neighborhoods.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const neighborhood = neighborhoodBySlug(slug);
  if (!neighborhood) return buildMetadata({ title: "Neighbourhood not found", noIndex: true });
  return buildMetadata({
    title: `${neighborhood.name} — ${neighborhood.tagline}`,
    description: neighborhood.summary,
    path: `/neighborhoods/${neighborhood.slug}`,
    image: neighborhood.hero.key,
  });
}

export default async function NeighborhoodDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const neighborhood = neighborhoodBySlug(slug);
  if (!neighborhood) notFound();

  const listings = properties.filter((p) => p.neighborhoodSlug === slug && p.status !== "sold");
  const localAgents = agents.filter((a) => a.neighborhoodSlugs.includes(slug)).slice(0, 4);

  const categories = ["Restaurant", "Culture", "School", "Retail", "Outdoors", "Wellness"] as const;

  return (
    <>
      <PageHero
        eyebrow="Neighbourhood"
        headline={[neighborhood.name]}
        supporting={neighborhood.summary}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Neighbourhoods", href: "/neighborhoods" },
          { label: neighborhood.name },
        ]}
        image={neighborhood.hero}
        meta={[
          { label: "Average price", value: formatPrice(neighborhood.averagePrice) },
          { label: `Per ${areaUnitLabel}`, value: formatPrice(neighborhood.pricePerArea) },
          { label: "Year on year", value: `+${neighborhood.yearOnYear}%` },
          { label: "Walk score", value: String(neighborhood.walkScore) },
        ]}
      />

      <section className="section-y bg-surface">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">Overview</p>
            </Reveal>
            <div className="prose-editorial mt-8">
              {neighborhood.overview.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <Reveal className="mt-14">
              <p className="eyebrow rule-accent text-[var(--accent)]">Lifestyle</p>
              <ul className="mt-8 space-y-5">
                {neighborhood.lifestyle.map((line, i) => (
                  <li key={i} className="flex gap-5 border-b border-hairline pb-5">
                    <span className="eyebrow shrink-0 text-content-faint tabular-nums">
                      {ordinal(i)}
                    </span>
                    <span className="text-[0.95rem] leading-relaxed text-content-muted">{line}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.1}>
              <div className="border border-hairline p-6">
                <p className="eyebrow text-content-faint">Best for</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {neighborhood.bestFor.map((item) => (
                    <li
                      key={item}
                      className="border border-hairline px-2.5 py-1 text-[11px] tracking-[0.1em] text-content-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="eyebrow mt-8 text-content-faint">Getting around</p>
                <ul className="mt-4 space-y-3 border-t border-hairline pt-4">
                  {neighborhood.transport.map((link) => (
                    <li key={link.name} className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-content-muted">
                        <span className="text-[10px] tracking-[0.16em] text-content-faint uppercase">
                          {link.mode}
                        </span>{" "}
                        {link.name}
                      </span>
                      <span className="shrink-0 text-content tabular-nums">{link.time}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild className="mt-7 w-full">
                  <Link href={`/properties?neighborhood=${neighborhood.slug}`}>
                    See {listings.length} {listings.length === 1 ? "property" : "properties"}
                  </Link>
                </Button>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="bg-surface pb-20 lg:pb-28">
        <div className="shell">
          <RevealGroup className="grid gap-2 sm:grid-cols-3">
            {neighborhood.images.map((image, i) => (
              <RevealItem key={image.key + i}>
                <Plate
                  asset={image}
                  ratio="aspect-4/3"
                  sizes="(min-width: 640px) 32vw, 92vw"
                  imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-editorial)] hover:scale-[1.04]"
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="theme-dark section-y bg-surface text-content">
        <div className="shell">
          <Reveal>
            <p className="eyebrow rule-accent text-[var(--accent)]">The neighbourhood</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-serif text-title">Restaurants, schools and the rest</h2>
          </Reveal>

          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const items = neighborhood.highlights.filter((h) => h.category === category);
              if (!items.length) return null;
              return (
                <Reveal key={category}>
                  <h3 className="eyebrow border-b border-hairline pb-3 text-content-faint">
                    {category}
                  </h3>
                  <ul className="mt-5 space-y-5">
                    {items.map((item) => (
                      <li key={item.name}>
                        <p className="text-base text-content">{item.name}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-content-muted">
                          {item.note}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="shell">
          <Reveal>
            <p className="eyebrow rule-accent text-[var(--accent)]">Location</p>
          </Reveal>
          <Reveal delay={0.06}>
            <StaticMap
              address={`${neighborhood.name}, Marivane`}
              coordinates={neighborhood.coordinates}
              seed={neighborhood.slug}
              className="mt-8"
            />
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-surface-sunken">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Reveal>
                <p className="eyebrow rule-accent text-[var(--accent)]">Available now</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-6 font-serif text-title text-content">
                  In {neighborhood.name}
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <Link
                href={`/properties?neighborhood=${neighborhood.slug}`}
                className="link-rule text-[11px] tracking-[0.18em] text-content uppercase"
              >
                All listings
              </Link>
            </Reveal>
          </div>

          {listings.length ? (
            <RevealGroup className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {listings.slice(0, 6).map((property) => (
                <RevealItem key={property.id}>
                  <PropertyCard property={property} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <EmptyState
              className="mt-14"
              eyebrow="Nothing available"
              title={`No listings in ${neighborhood.name} today.`}
              description="Stock here is tightly held. Register and we will contact you the moment something comes to us."
              action={
                <Button asChild>
                  <Link href="/contact">Register requirements</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>

      {localAgents.length ? (
        <section className="section-y bg-surface">
          <div className="shell">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">Local advisors</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-serif text-title text-content">
                Who covers {neighborhood.name}
              </h2>
            </Reveal>
            <RevealGroup className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {localAgents.map((agent) => (
                <RevealItem key={agent.id}>
                  <AgentCard agent={agent} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow="See it for yourself"
        headline={["Walk the streets", "before you choose one."]}
        supporting={`We will spend a morning in ${neighborhood.name} with you — including the parts that are not on the postcards.`}
        primary={{ label: "Book a viewing", href: "/book-a-viewing" }}
        secondary={{ label: "Contact an advisor", href: "/contact" }}
        image={img("cinema-09", "A district at first light")}
      />
    </>
  );
}
