import { NeighborhoodCard } from "@/components/cards/neighborhood-card";
import { SectionHeader } from "@/components/sections/section-header";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { homeContent } from "@/config/content";
import { ordinal } from "@/lib/utils";
import type { Neighborhood } from "@/types";

/**
 * Six districts on an intentionally uneven grid: the first two run tall across
 * seven and five columns, the rest fall into a quieter three-up row.
 */
export function NeighborhoodsSection({ items }: { items: Neighborhood[] }) {
  const [first, second, ...rest] = items;

  return (
    <section className="section-y bg-surface" aria-labelledby="neighborhoods-heading">
      <div className="shell">
        <SectionHeader
          eyebrow={homeContent.neighborhoods.eyebrow}
          headline={homeContent.neighborhoods.headline}
          supporting={homeContent.neighborhoods.supporting}
          cta={homeContent.neighborhoods.cta}
        />

        <RevealGroup className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-12">
          {first ? (
            <RevealItem className="lg:col-span-7">
              <NeighborhoodCard
                neighborhood={first}
                index={ordinal(0)}
                ratio="aspect-4/3 lg:aspect-16/10"
                sizes="(min-width: 1024px) 56vw, 92vw"
              />
            </RevealItem>
          ) : null}
          {second ? (
            <RevealItem className="lg:col-span-5">
              <NeighborhoodCard
                neighborhood={second}
                index={ordinal(1)}
                ratio="aspect-4/3 lg:aspect-16/10"
                sizes="(min-width: 1024px) 40vw, 92vw"
              />
            </RevealItem>
          ) : null}
          {rest.map((neighborhood, i) => (
            <RevealItem key={neighborhood.id} className="lg:col-span-3">
              <NeighborhoodCard
                neighborhood={neighborhood}
                image={neighborhood.portrait}
                index={ordinal(i + 2)}
                ratio="aspect-3/4"
                sizes="(min-width: 1024px) 24vw, 92vw"
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
