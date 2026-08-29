import { PageHero } from "@/components/layout/page-hero";
import { AdvancedSearch } from "@/components/search/advanced-search";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Search",
  description:
    "Search the Vellora collection by keyword, district, price, size, type and amenity — or by reference number.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;

  return (
    <>
      <PageHero
        eyebrow="Search"
        headline={["Find it", "by name."]}
        supporting="Keyword search across every property, plus the full filter set. Reference numbers work too."
        crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
        variant="plain"
      />
      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell">
          <AdvancedSearch initialQuery={raw ?? ""} />
        </div>
      </section>
    </>
  );
}
