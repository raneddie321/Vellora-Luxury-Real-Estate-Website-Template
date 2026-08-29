import { PageHero } from "@/components/layout/page-hero";
import { NeighborhoodCard } from "@/components/cards/neighborhood-card";
import { CtaBand } from "@/components/sections/cta-band";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { neighborhoods } from "@/data/neighborhoods";
import { buildMetadata } from "@/lib/seo";
import { formatPriceCompact, ordinal } from "@/lib/utils";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "Neighbourhoods",
  description:
    "Six districts of Marivane, described by the advisors who live in them: Waterfront, Old Town, Central District, The Hills, Downtown and Harbour Point.",
  path: "/neighborhoods",
  image: "cinema-05",
});

export default function NeighborhoodsPage() {
  return (
    <>
      <PageHero
        eyebrow="Neighbourhoods"
        headline={["Where you live", "decides the day."]}
        supporting="Six districts, each described by the advisor who lives in it. Prices, transport, schools and the honest account of what each one is like in February."
        crumbs={[{ label: "Home", href: "/" }, { label: "Neighbourhoods" }]}
        image={img("cinema-05", "A coastal district at first light")}
        mobileImage={img("tall-05", "A coastal district at first light")}
        meta={[
          { label: "Districts", value: String(neighborhoods.length) },
          { label: "From", value: formatPriceCompact(Math.min(...neighborhoods.map((n) => n.averagePrice))) },
          { label: "To", value: formatPriceCompact(Math.max(...neighborhoods.map((n) => n.averagePrice))) },
        ]}
      />

      <section className="section-y bg-surface">
        <div className="shell">
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {neighborhoods.map((neighborhood, i) => (
              <RevealItem key={neighborhood.id}>
                <NeighborhoodCard
                  neighborhood={neighborhood}
                  image={neighborhood.portrait}
                  index={ordinal(i)}
                  ratio="aspect-4/5"
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                  priority={i < 3}
                />
              </RevealItem>
            ))}
          </RevealGroup>

          <RevealGroup className="mt-20 border-t border-hairline">
            {neighborhoods.map((neighborhood) => (
              <RevealItem key={`row-${neighborhood.id}`}>
                <div className="grid gap-4 border-b border-hairline py-6 sm:grid-cols-12 sm:items-baseline">
                  <p className="font-serif text-xl tracking-[-0.02em] text-content sm:col-span-3">
                    {neighborhood.name}
                  </p>
                  <p className="text-sm text-content-muted sm:col-span-4">
                    {neighborhood.tagline}
                  </p>
                  <p className="text-sm text-content tabular-nums sm:col-span-2">
                    {formatPriceCompact(neighborhood.averagePrice)} avg.
                  </p>
                  <p className="text-sm text-content-muted tabular-nums sm:col-span-2">
                    +{neighborhood.yearOnYear}% YoY
                  </p>
                  <p className="text-sm text-content-muted tabular-nums sm:col-span-1 sm:text-right">
                    Walk {neighborhood.walkScore}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBand
        eyebrow="Not sure yet?"
        headline={["Spend two days", "before you spend anything."]}
        supporting="Our orientation visit covers four districts in two days, with an honest account of what each is like out of season."
        primary={{ label: "Plan an orientation", href: "/services/relocation" }}
        secondary={{ label: "Speak to an advisor", href: "/contact" }}
        image={img("cinema-01", "A clifftop district at dusk")}
      />
    </>
  );
}
