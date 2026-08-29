import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { developments, developmentBySlug } from "@/data/developments";
import { neighborhoodBySlug } from "@/data/neighborhoods";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { Plate, PlateBlock } from "@/components/media/plate";
import { StaticMap } from "@/components/property/static-map";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/sections/cta-band";
import { formatArea, formatPrice, formatPriceCompact, ordinal } from "@/lib/utils";
import { img } from "@/lib/images";

const STATUS_LABEL = {
  selling: "Now selling",
  "final-release": "Final release",
  forthcoming: "Forthcoming",
  completed: "Completed",
} as const;

export function generateStaticParams() {
  return developments.map((development) => ({ slug: development.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const development = developmentBySlug(slug);
  if (!development) return buildMetadata({ title: "Development not found", noIndex: true });
  return buildMetadata({
    title: `${development.name} — ${development.location}`,
    description: development.summary,
    path: `/developments/${development.slug}`,
    image: development.hero.key,
  });
}

export default async function DevelopmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const development = developmentBySlug(slug);
  if (!development) notFound();
  const neighborhood = neighborhoodBySlug(development.neighborhoodSlug);

  const credits = [
    { label: "Developer", value: development.developer },
    { label: "Architect", value: development.architect },
    development.interiorDesign
      ? { label: "Interior design", value: development.interiorDesign }
      : null,
    development.landscape ? { label: "Landscape", value: development.landscape } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <PageHero
        eyebrow={STATUS_LABEL[development.status]}
        headline={[development.name]}
        supporting={development.headline}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Developments", href: "/developments" },
          { label: development.name },
        ]}
        image={development.hero}
        meta={[
          { label: "From", value: formatPriceCompact(development.startingPrice) },
          { label: "Residences", value: String(development.totalUnits) },
          { label: "Available", value: String(development.availableUnits) },
          { label: "Completion", value: development.completion },
        ]}
      />

      <section className="section-y bg-surface">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">The architecture</p>
            </Reveal>
            <div className="prose-editorial mt-8">
              {development.story.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.1}>
              <dl className="divide-y divide-[color:var(--hairline)] border-y border-hairline">
                {credits.map((credit) => (
                  <div key={credit.label} className="py-4">
                    <dt className="text-[10px] tracking-[0.2em] text-content-faint uppercase">
                      {credit.label}
                    </dt>
                    <dd className="mt-2 text-sm text-content">{credit.value}</dd>
                  </div>
                ))}
                <div className="py-4">
                  <dt className="text-[10px] tracking-[0.2em] text-content-faint uppercase">
                    Location
                  </dt>
                  <dd className="mt-2 text-sm text-content">
                    {neighborhood ? (
                      <Link href={`/neighborhoods/${neighborhood.slug}`} className="link-rule">
                        {development.location}
                      </Link>
                    ) : (
                      development.location
                    )}
                  </dd>
                </div>
              </dl>
              <Button asChild size="lg" className="mt-8 w-full">
                <Link href={`/contact?development=${development.slug}`}>Register interest</Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-surface pb-20 lg:pb-28">
        <div className="shell">
          <RevealGroup className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {development.images.map((image, i) => (
              <RevealItem key={image.key + i}>
                <Plate
                  asset={image}
                  ratio={i === 0 ? "aspect-3/2" : "aspect-4/3"}
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw"
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
            <p className="eyebrow rule-accent text-[var(--accent)]">Amenities</p>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-x-10 gap-y-1 border-t border-hairline sm:grid-cols-2 lg:grid-cols-3">
            {development.amenities.map((amenity, i) => (
              <RevealItem key={amenity}>
                <p className="flex items-baseline gap-4 border-b border-hairline py-5 text-base">
                  <span className="eyebrow text-content-faint tabular-nums">{ordinal(i)}</span>
                  <span className="flex-1">{amenity}</span>
                  <Check className="size-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="shell">
          <Reveal>
            <p className="eyebrow rule-accent text-[var(--accent)]">Residences</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-serif text-title text-content">Availability</h2>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {development.residences.map((residence) => (
              <RevealItem key={residence.name}>
                <article>
                  <Plate
                    asset={residence.image}
                    ratio="aspect-4/3"
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw"
                  />
                  <div className="pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-serif text-xl leading-tight tracking-[-0.02em] text-content">
                        {residence.name}
                      </h3>
                      <Badge variant={residence.available ? "muted" : "outline"}>
                        {residence.available ? `${residence.available} left` : "Sold"}
                      </Badge>
                    </div>
                    <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
                      {residence.bedrooms > 0 ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-content-faint">Bedrooms</dt>
                          <dd className="text-content tabular-nums">{residence.bedrooms}</dd>
                        </div>
                      ) : null}
                      <div className="flex justify-between gap-3">
                        <dt className="text-content-faint">Area</dt>
                        <dd className="text-content tabular-nums">{formatArea(residence.area)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-content-faint">From</dt>
                        <dd className="text-content tabular-nums">{formatPrice(residence.from)}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {development.floorPlans.length ? (
        <section className="section-y bg-surface-sunken">
          <div className="shell">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">Floor plans</p>
            </Reveal>
            <Reveal delay={0.06}>
              <Tabs defaultValue={development.floorPlans[0]!.name} className="mt-10">
                <TabsList>
                  {development.floorPlans.map((plan) => (
                    <TabsTrigger key={plan.name} value={plan.name}>
                      {plan.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {development.floorPlans.map((plan) => (
                  <TabsContent key={plan.name} value={plan.name}>
                    <div className="grid gap-10 lg:grid-cols-3">
                      <div className="lg:col-span-2">
                        <PlateBlock
                          asset={plan.image}
                          sizes="(min-width: 1024px) 60vw, 92vw"
                          className="border border-hairline bg-surface"
                        />
                      </div>
                      <div>
                        <p className="eyebrow text-content-faint">{plan.level}</p>
                        <p className="mt-3 font-serif text-3xl tracking-[-0.025em] text-content">
                          {formatArea(plan.area)}
                        </p>
                        <ul className="mt-6 space-y-2.5 border-t border-hairline pt-5">
                          {plan.rooms.map((room) => (
                            <li key={room} className="text-sm text-content-muted">
                              {room}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="section-y bg-surface">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">Location</p>
            </Reveal>
            <Reveal delay={0.06}>
              <StaticMap
                address={development.location}
                coordinates={development.coordinates}
                seed={development.slug}
                className="mt-8"
              />
            </Reveal>
          </div>
          {neighborhood ? (
            <div className="lg:col-span-4 lg:col-start-9">
              <Reveal delay={0.1}>
                <h2 className="font-serif text-heading text-content">{neighborhood.name}</h2>
                <p className="mt-5 text-[0.95rem] leading-relaxed text-content-muted">
                  {neighborhood.summary}
                </p>
                <ul className="mt-7 space-y-3 border-t border-hairline pt-5">
                  {neighborhood.transport.slice(0, 4).map((link) => (
                    <li key={link.name} className="flex justify-between gap-4 text-sm">
                      <span className="text-content-muted">{link.name}</span>
                      <span className="shrink-0 text-content tabular-nums">{link.time}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/neighborhoods/${neighborhood.slug}`}
                  className="link-rule mt-7 inline-block text-[11px] tracking-[0.18em] text-content uppercase"
                >
                  Explore {neighborhood.name}
                </Link>
              </Reveal>
            </div>
          ) : null}
        </div>
      </section>

      <CtaBand
        eyebrow="Enquire"
        headline={[`${development.availableUnits} residences`, "remain available."]}
        supporting="Request the price list, floor plans and specification, or arrange to see the show apartment."
        primary={{ label: "Register interest", href: `/contact?development=${development.slug}` }}
        secondary={{ label: "Book a viewing", href: "/book-a-viewing" }}
        image={img("cinema-11", "A development at dusk")}
      />
    </>
  );
}
