import { PageHero } from "@/components/layout/page-hero";
import { PropertyExplorer } from "@/components/property/property-explorer";
import { CtaBand } from "@/components/sections/cta-band";
import { buildMetadata } from "@/lib/seo";
import { defaultFilters } from "@/lib/property-filters";
import { properties } from "@/data/properties";
import { PROPERTY_TYPES, type ListingType, type PropertyFilters, type PropertyType } from "@/types";
import { neighborhoods } from "@/data/neighborhoods";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "Properties for sale and to rent",
  description:
    "Browse the full Vellora collection: apartments, villas, penthouses, townhouses, estates and land across six districts of Marivane.",
  path: "/properties",
  image: "cinema-02",
});

/**
 * Search params are parsed on the server and become the explorer's initial
 * state, so a shared link opens on exactly the filtered view the sender saw.
 */
function parseFilters(params: Record<string, string | string[] | undefined>): PropertyFilters {
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const many = (key: string) => {
    const value = params[key];
    if (!value) return [];
    return (Array.isArray(value) ? value : value.split(",")).filter(Boolean);
  };
  const num = (key: string) => {
    const value = Number(one(key));
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const listing = one("listing");
  const validSlugs = new Set(neighborhoods.map((n) => n.slug));
  const validTypes = new Set<string>(PROPERTY_TYPES);

  return {
    ...defaultFilters,
    query: one("q") ?? "",
    listing: listing === "sale" || listing === "rent" ? (listing as ListingType) : "all",
    neighborhoods: many("neighborhood").filter((slug) => validSlugs.has(slug)),
    types: many("type").filter((type) => validTypes.has(type)) as PropertyType[],
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    bedrooms: num("bedrooms"),
    bathrooms: num("bathrooms"),
    amenities: many("amenity"),
  };
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialFilters = parseFilters(params);
  const forSale = properties.filter((p) => p.listing === "sale").length;
  const toRent = properties.length - forSale;

  return (
    <>
      <PageHero
        eyebrow="The collection"
        headline={["Every property", "we represent."]}
        supporting="Twenty residences across six districts. Filter by district, type, price and specification — or search by reference if you already know what you are looking for."
        crumbs={[{ label: "Home", href: "/" }, { label: "Properties" }]}
        variant="plain"
        meta={[
          { label: "For sale", value: String(forSale) },
          { label: "To rent", value: String(toRent) },
          { label: "Districts", value: String(neighborhoods.length) },
          { label: "Off-market", value: "34% of sales" },
        ]}
      />
      <PropertyExplorer initialFilters={initialFilters} />
      <CtaBand
        eyebrow="Not on the list?"
        headline={["A third of what we sell", "is never advertised."]}
        supporting="Register your requirements and we will contact you before an instruction is published — usually two to six weeks before."
        primary={{ label: "Register requirements", href: "/contact" }}
        secondary={{ label: "Book a viewing", href: "/book-a-viewing" }}
        image={img("cinema-03", "An estate approach at dusk")}
      />
    </>
  );
}
