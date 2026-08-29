import { PageHero } from "@/components/layout/page-hero";
import { FaqBrowser } from "@/components/faq/faq-browser";
import { CtaBand } from "@/components/sections/cta-band";
import { faqs } from "@/data/faqs";
import { buildMetadata } from "@/lib/seo";
import { FAQ_CATEGORIES } from "@/types";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "Frequently asked questions",
  description:
    "Twenty-eight answers on buying, selling, renting, viewing, financing, investment and property management in Marivane.",
  path: "/faq",
  image: "editorial-06",
});

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        eyebrow="Frequently asked"
        headline={["The questions", "we get asked."]}
        supporting="Twenty-eight answers across seven categories. If yours is not here, it is probably a good question — send it to us."
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
        variant="plain"
        meta={[
          { label: "Questions", value: String(faqs.length) },
          { label: "Categories", value: String(FAQ_CATEGORIES.length) },
        ]}
      />

      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell">
          <FaqBrowser faqs={faqs} />
        </div>
      </section>

      <CtaBand
        eyebrow="Still unsure?"
        headline={["Ask a person", "instead of a page."]}
        supporting="Every enquiry reaches the advisor who covers the district, not a general inbox."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "Book a viewing", href: "/book-a-viewing" }}
        image={img("cinema-02", "A residence at first light")}
      />
    </>
  );
}
