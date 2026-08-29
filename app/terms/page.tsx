import { LegalPage } from "@/components/legal/legal-page";
import { termsSections, legalUpdatedAt } from "@/data/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "The terms on which this site is made available.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="The terms on which this site is made available, and the limits of what anything published here means."
      updatedAt={legalUpdatedAt}
      sections={termsSections}
    />
  );
}
