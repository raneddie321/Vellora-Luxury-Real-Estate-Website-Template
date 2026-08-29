import { PropertyCard } from "@/components/property/property-card";
import { SectionHeader } from "@/components/sections/section-header";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { homeContent } from "@/config/content";
import type { Property } from "@/types";

export function PropertyCollection({ items }: { items: Property[] }) {
  return (
    <section id="collection" className="section-y bg-surface" aria-labelledby="collection-heading">
      <div className="shell">
        <SectionHeader
          eyebrow={homeContent.collection.eyebrow}
          headline={homeContent.collection.headline}
          supporting={homeContent.collection.supporting}
          cta={homeContent.collection.cta}
        />

        <RevealGroup className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {items.map((property, i) => (
            <RevealItem key={property.id}>
              <PropertyCard property={property} priority={i < 3} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
