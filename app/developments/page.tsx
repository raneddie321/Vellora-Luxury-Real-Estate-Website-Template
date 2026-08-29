import { PageHero } from "@/components/layout/page-hero";
import { DevelopmentCard } from "@/components/cards/development-card";
import { CtaBand } from "@/components/sections/cta-band";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { developments } from "@/data/developments";
import { buildMetadata } from "@/lib/seo";
import { formatPriceCompact, ordinal } from "@/lib/utils";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "New developments",
  description:
    "Seven developments across Marivane, from first release to final unit — waterfront apartments, ridge houses, a converted bank and a sixteenth-century convent.",
  path: "/developments",
  image: "cinema-03",
});

export default function DevelopmentsPage() {
  const totalUnits = developments.reduce((sum, d) => sum + d.totalUnits, 0);
  const available = developments.reduce((sum, d) => sum + d.availableUnits, 0);
  const from = Math.min(...developments.map((d) => d.startingPrice));

  return (
    <>
      <PageHero
        eyebrow="Developments"
        headline={["Buildings that are", "still becoming."]}
        supporting="We represent seven schemes across the city. Two are finished, four are selling, and one will not break ground until 2028 — which is exactly when the good units are chosen."
        crumbs={[{ label: "Home", href: "/" }, { label: "Developments" }]}
        image={img("cinema-03", "A development approach at dusk")}
        mobileImage={img("tall-08", "A development approach at dusk")}
        meta={[
          { label: "Schemes", value: String(developments.length) },
          { label: "Residences", value: String(totalUnits) },
          { label: "Available", value: String(available) },
          { label: "From", value: formatPriceCompact(from) },
        ]}
      />

      <section className="section-y bg-surface">
        <div className="shell">
          <RevealGroup className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {developments.map((development, i) => (
              <RevealItem key={development.id}>
                <span className="eyebrow mb-4 block text-content-faint tabular-nums">
                  ({ordinal(i)})
                </span>
                <DevelopmentCard development={development} priority={i < 3} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBand
        eyebrow="Off-plan"
        headline={["The best units go", "before the hoarding does."]}
        supporting="Register for launch access and you will see release schedules, price lists and floor plans before the public campaign begins."
        primary={{ label: "Register for launches", href: "/contact" }}
        secondary={{ label: "Speak to Yuki Tanaka", href: "/agents/yuki-tanaka" }}
        image={img("cinema-06", "A development at dusk")}
      />
    </>
  );
}
