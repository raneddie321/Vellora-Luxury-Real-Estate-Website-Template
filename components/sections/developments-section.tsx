import { DevelopmentCard } from "@/components/cards/development-card";
import { SectionHeader } from "@/components/sections/section-header";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { homeContent } from "@/config/content";
import type { Development } from "@/types";

export function DevelopmentsSection({ items }: { items: Development[] }) {
  return (
    <section className="section-y bg-surface-sunken" aria-labelledby="developments-heading">
      <div className="shell">
        <SectionHeader
          eyebrow={homeContent.developments.eyebrow}
          headline={homeContent.developments.headline}
          supporting={homeContent.developments.supporting}
          cta={homeContent.developments.cta}
        />

        <RevealGroup className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {items.map((development) => (
            <RevealItem key={development.id}>
              <DevelopmentCard development={development} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
