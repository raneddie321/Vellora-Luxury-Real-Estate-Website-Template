import { PageHero } from "@/components/layout/page-hero";
import { CompareTable } from "@/components/property/compare-table";
import { CtaBand } from "@/components/sections/cta-band";
import { buildMetadata } from "@/lib/seo";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "Compare properties",
  description: "Line up to four properties side by side — price, area, specification and amenities.",
  path: "/compare",
  noIndex: true,
});

export default function ComparePage() {
  return (
    <>
      <PageHero
        eyebrow="Compare"
        headline={["Side by side."]}
        supporting="Up to four properties at a time. Price, area, specification and amenities, with the strongest figure in each row marked."
        crumbs={[{ label: "Home", href: "/" }, { label: "Compare" }]}
        variant="plain"
      />
      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell">
          <CompareTable />
        </div>
      </section>
      <CtaBand
        eyebrow="Still deciding?"
        headline={["Ask someone", "who has seen both."]}
        supporting="Our advisors have walked every property on this site. They will tell you which one is actually the better buy."
        primary={{ label: "Speak to an advisor", href: "/contact" }}
        secondary={{ label: "Back to properties", href: "/properties" }}
        image={img("cinema-11", "A clifftop residence at dusk")}
      />
    </>
  );
}
