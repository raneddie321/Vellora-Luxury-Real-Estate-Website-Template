import { LegalPage } from "@/components/legal/legal-page";
import { cookieSections, legalUpdatedAt } from "@/data/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description: "What this site stores in your browser, and how to clear it.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="This template stores almost nothing. Here is exactly what it does store, and how to remove it."
      updatedAt={legalUpdatedAt}
      sections={cookieSections}
    />
  );
}
