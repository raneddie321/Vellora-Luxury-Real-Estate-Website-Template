import { PageHero } from "@/components/layout/page-hero";
import { ServicesSection } from "@/components/sections/services-section";
import { CtaBand } from "@/components/sections/cta-band";
import { services } from "@/data/services";
import { buildMetadata } from "@/lib/seo";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "Services",
  description:
    "Buying, selling, renting, investment, property management and relocation — six service lines run by the people who do the work.",
  path: "/services",
  image: "cinema-09",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        headline={["What we do,", "and how."]}
        supporting="Six service lines. Each is run by the people who do the work rather than a department that coordinates it, and each one will tell you when the answer is no."
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        variant="plain"
      />
      <ServicesSection items={services} />
      <CtaBand
        eyebrow="Start somewhere"
        headline={["Tell us what", "you need done."]}
        supporting="A short conversation is usually enough to work out which of the six this is — and whether it is one at all."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "Frequently asked", href: "/faq" }}
        image={img("cinema-02", "A residence at first light")}
      />
    </>
  );
}
