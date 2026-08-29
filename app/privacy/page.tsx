import { LegalPage } from "@/components/legal/legal-page";
import { privacySections, legalUpdatedAt } from "@/data/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Vellora collects, uses and protects personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="What we collect, why we collect it, how long we keep it, and what you can ask us to do about it."
      updatedAt={legalUpdatedAt}
      sections={privacySections}
    />
  );
}
