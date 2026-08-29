import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { properties, propertyBySlug } from "@/data/properties";
import { agentById } from "@/data/agents";
import { neighborhoodBySlug } from "@/data/neighborhoods";
import { developmentBySlug } from "@/data/developments";
import { similarProperties } from "@/lib/property-filters";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import {
  areaUnitLabel,
  formatArea,
  formatDate,
  formatNumber,
  formatPrice,
  formatRent,
  ordinal,
} from "@/lib/utils";
import { PropertyGallery } from "@/components/property/property-gallery";
import { InquiryPanel } from "@/components/property/inquiry-panel";
import { StaticMap } from "@/components/property/static-map";
import { PropertyCard } from "@/components/property/property-card";
import { StatusBadge } from "@/components/property/status-badge";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlateBlock } from "@/components/media/plate";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { img } from "@/lib/images";

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = propertyBySlug(slug);
  if (!property) return buildMetadata({ title: "Property not found", noIndex: true });
  return buildMetadata({
    title: `${property.name} — ${property.type} in ${neighborhoodBySlug(property.neighborhoodSlug)?.name ?? ""}`,
    description: property.summary,
    path: `/properties/${property.slug}`,
    image: property.images[0]?.key,
  });
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = propertyBySlug(slug);
  if (!property) notFound();

  const agent = agentById(property.agentId);
  const neighborhood = neighborhoodBySlug(property.neighborhoodSlug);
  const development = property.developmentSlug
    ? developmentBySlug(property.developmentSlug)
    : undefined;
  const similar = similarProperties(property);
  const isLand = property.type === "Land";

  const price =
    property.listing === "rent"
      ? formatRent(property.price, property.pricePeriod ?? "month")
      : formatPrice(property.price);

  const specs = [
    !isLand && { label: "Bedrooms", value: formatNumber(property.bedrooms) },
    !isLand && { label: "Bathrooms", value: formatNumber(property.bathrooms) },
    { label: isLand ? "Permitted area" : "Interior", value: formatArea(property.area) },
    property.plotArea ? { label: "Plot", value: formatArea(property.plotArea) } : null,
    { label: "Type", value: property.type },
    { label: isLand ? "Consent" : "Built", value: String(property.yearBuilt) },
    { label: "EPC", value: property.epc },
    property.parking ? { label: "Parking", value: `${property.parking} spaces` } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    name: property.name,
    description: property.summary,
    numberOfRooms: property.bedrooms,
    floorSize: { "@type": "QuantitativeValue", value: property.area, unitCode: "MTK" },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: neighborhood?.name,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.coordinates.lat,
      longitude: property.coordinates.lng,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Properties", path: "/properties" },
              { name: property.name, path: `/properties/${property.slug}` },
            ]),
          ),
        }}
      />

      <section className="bg-surface pt-28 pb-10 lg:pt-36">
        <div className="shell">
          <Reveal>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Properties", href: "/properties" },
                { label: neighborhood?.name ?? "", href: `/neighborhoods/${property.neighborhoodSlug}` },
                { label: property.name },
              ]}
            />
          </Reveal>

          <div className="mt-8 grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <Reveal>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{property.type}</Badge>
                  {property.listing === "rent" ? <Badge variant="muted">To rent</Badge> : null}
                  <StatusBadge status={property.status} variant="outline" />
                  <span className="ml-1 text-[11px] tracking-[0.14em] text-content-faint uppercase">
                    Ref. {property.reference}
                  </span>
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <h1 className="mt-5 font-serif text-title text-content">{property.name}</h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-lede text-content-muted">{property.address}</p>
              </Reveal>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Reveal delay={0.14}>
                <p className="font-serif text-4xl tracking-[-0.035em] text-content tabular-nums lg:text-5xl">
                  {price}
                </p>
                <p className="mt-2 text-xs text-content-faint">
                  Listed {formatDate(property.listedAt)}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface pb-14">
        <div className="shell">
          <Reveal>
            <PropertyGallery images={property.images} title={property.name} />
          </Reveal>
        </div>
      </section>

      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <Reveal>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-7 border-y border-hairline py-8 sm:grid-cols-4">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <dt className="text-[10px] tracking-[0.2em] text-content-faint uppercase">
                      {spec.label}
                    </dt>
                    <dd className="mt-2 text-base text-content tabular-nums">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal className="mt-14">
              <h2 className="font-serif text-heading text-content">{property.headline}</h2>
              <div className="prose-editorial mt-8">
                {property.description.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </Reveal>

            <Reveal className="mt-16">
              <h2 className="eyebrow rule-accent text-[var(--accent)]">Amenities</h2>
              <ul className="mt-7 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2.5 border-b border-hairline pb-3 text-sm text-content-muted"
                  >
                    <Check className="size-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
                    {amenity}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-16">
              <h2 className="eyebrow rule-accent text-[var(--accent)]">Specification</h2>
              <dl className="mt-7 divide-y divide-[color:var(--hairline)] border-y border-hairline">
                {property.features.map((feature) => (
                  <div key={feature.label} className="grid gap-2 py-4 sm:grid-cols-3">
                    <dt className="text-sm text-content-faint">{feature.label}</dt>
                    <dd className="text-sm text-content sm:col-span-2">{feature.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {property.floorPlans.length ? (
              <Reveal className="mt-16">
                <h2 className="eyebrow rule-accent text-[var(--accent)]">Floor plans</h2>
                <Tabs defaultValue={property.floorPlans[0]!.name} className="mt-7">
                  <TabsList>
                    {property.floorPlans.map((plan) => (
                      <TabsTrigger key={plan.name} value={plan.name}>
                        {plan.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {property.floorPlans.map((plan) => (
                    <TabsContent key={plan.name} value={plan.name}>
                      <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                          <PlateBlock
                            asset={plan.image}
                            sizes="(min-width: 1024px) 50vw, 92vw"
                            className="border border-hairline"
                          />
                        </div>
                        <div>
                          <p className="eyebrow text-content-faint">{plan.level}</p>
                          <p className="mt-3 font-serif text-2xl tracking-[-0.02em] text-content">
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
            ) : null}

            <Reveal className="mt-16">
              <h2 className="eyebrow rule-accent text-[var(--accent)]">Location</h2>
              <StaticMap
                address={property.address}
                coordinates={property.coordinates}
                seed={property.slug}
                className="mt-7"
              />
            </Reveal>

            {neighborhood ? (
              <Reveal className="mt-16">
                <h2 className="eyebrow rule-accent text-[var(--accent)]">
                  The neighbourhood
                </h2>
                <h3 className="mt-6 font-serif text-heading text-content">{neighborhood.name}</h3>
                <p className="measure mt-5 text-lede text-content-muted">{neighborhood.summary}</p>
                <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-hairline pt-6 sm:grid-cols-4">
                  <div>
                    <dt className="text-[10px] tracking-[0.2em] text-content-faint uppercase">
                      Average price
                    </dt>
                    <dd className="mt-2 text-sm text-content tabular-nums">
                      {formatPrice(neighborhood.averagePrice)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] tracking-[0.2em] text-content-faint uppercase">
                      Per {areaUnitLabel}
                    </dt>
                    <dd className="mt-2 text-sm text-content tabular-nums">
                      {formatPrice(neighborhood.pricePerArea)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] tracking-[0.2em] text-content-faint uppercase">
                      Year on year
                    </dt>
                    <dd className="mt-2 text-sm text-content tabular-nums">
                      +{neighborhood.yearOnYear}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] tracking-[0.2em] text-content-faint uppercase">
                      Walk score
                    </dt>
                    <dd className="mt-2 text-sm text-content tabular-nums">
                      {neighborhood.walkScore}
                    </dd>
                  </div>
                </dl>
                <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {neighborhood.transport.slice(0, 4).map((link) => (
                    <li
                      key={link.name}
                      className="flex items-baseline justify-between gap-4 border-b border-hairline pb-3 text-sm"
                    >
                      <span className="text-content-muted">
                        <span className="text-[11px] tracking-[0.14em] text-content-faint uppercase">
                          {link.mode}
                        </span>{" "}
                        {link.name}
                      </span>
                      <span className="shrink-0 text-content tabular-nums">{link.time}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/neighborhoods/${neighborhood.slug}`}
                  className="group mt-8 inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] text-content uppercase"
                >
                  <span className="link-rule">Explore {neighborhood.name}</span>
                  <ArrowRight
                    className="size-3.5 transition-transform duration-500 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </Reveal>
            ) : null}

            {development ? (
              <Reveal className="mt-16 border border-hairline p-7">
                <p className="eyebrow text-content-faint">Part of</p>
                <h3 className="mt-3 font-serif text-2xl tracking-[-0.025em] text-content">
                  {development.name}
                </h3>
                <p className="mt-3 text-sm text-content-muted">{development.summary}</p>
                <Link
                  href={`/developments/${development.slug}`}
                  className="link-rule mt-5 inline-block text-[11px] tracking-[0.18em] text-content uppercase"
                >
                  View the development
                </Link>
              </Reveal>
            ) : null}
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <InquiryPanel property={property} agent={agent} />
            </div>
          </div>
        </div>
      </section>

      {similar.length ? (
        <section className="section-y bg-surface-sunken">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Reveal>
                  <p className="eyebrow rule-accent text-[var(--accent)]">Also consider</p>
                </Reveal>
                <Reveal delay={0.05}>
                  <h2 className="mt-6 font-serif text-title text-content">Similar properties</h2>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <Link
                  href="/properties"
                  className="link-rule text-[11px] tracking-[0.18em] text-content uppercase"
                >
                  View all
                </Link>
              </Reveal>
            </div>
            <RevealGroup className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item, i) => (
                <RevealItem key={item.id}>
                  <span className="eyebrow mb-4 block text-content-faint tabular-nums">
                    ({ordinal(i)})
                  </span>
                  <PropertyCard property={item} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow="Arrange a viewing"
        headline={["See it properly,", "in person."]}
        supporting="Viewings are accompanied and by appointment. Evening and weekend slots are available on request."
        primary={{ label: "Book a viewing", href: `/book-a-viewing?property=${property.slug}` }}
        secondary={{ label: "Speak to an advisor", href: "/contact" }}
        image={img("cinema-07", "A residence at dusk")}
      />
    </>
  );
}
