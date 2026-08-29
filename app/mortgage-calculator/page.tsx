import { PageHero } from "@/components/layout/page-hero";
import { MortgageCalculator } from "@/components/tools/mortgage-calculator";
import { CtaBand } from "@/components/sections/cta-band";
import { buildMetadata } from "@/lib/seo";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "Mortgage calculator",
  description:
    "Work out monthly payments, total interest and indicative purchase costs across price, deposit, rate and term.",
  path: "/mortgage-calculator",
  image: "editorial-09",
});

export default function MortgageCalculatorPage() {
  return (
    <>
      <PageHero
        eyebrow="Tools"
        headline={["What it actually", "costs per month."]}
        supporting="Move the four inputs and watch the monthly figure change. Purchase costs are estimated alongside, because they are the part people forget."
        crumbs={[{ label: "Home", href: "/" }, { label: "Mortgage calculator" }]}
        variant="plain"
      />
      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell">
          <MortgageCalculator />
        </div>
      </section>
      <CtaBand
        eyebrow="Financing"
        headline={["A decision in principle", "before you offer."]}
        supporting="We will introduce you to independent brokers. We take no commission from lenders, which is why the introduction is worth having."
        primary={{ label: "Talk to us", href: "/contact?service=investment" }}
        secondary={{ label: "Financing questions", href: "/faq" }}
        image={img("cinema-04", "The city at night")}
      />
    </>
  );
}
