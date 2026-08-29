import type {
  ListingType,
  Property,
  PropertyFilters,
  PropertyType,
  SortKey,
} from "@/types";
import { properties } from "@/data/properties";
import { neighborhoodName } from "@/data/neighborhoods";

export const defaultFilters: PropertyFilters = {
  query: "",
  listing: "all",
  neighborhoods: [],
  types: [],
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  bathrooms: null,
  amenities: [],
  sort: "newest",
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Most recent" },
  { value: "price-desc", label: "Price — high to low" },
  { value: "price-asc", label: "Price — low to high" },
  { value: "area-desc", label: "Largest first" },
  { value: "bedrooms-desc", label: "Most bedrooms" },
];

/**
 * Sale and rental prices live in the same field but on wildly different
 * scales, so the price slider switches range with the listing type.
 */
export const PRICE_BOUNDS = {
  sale: { min: 500_000, max: 9_000_000, step: 50_000 },
  rent: { min: 1_000, max: 12_000, step: 250 },
} as const;

export function priceBoundsFor(listing: ListingType | "all") {
  return listing === "rent" ? PRICE_BOUNDS.rent : PRICE_BOUNDS.sale;
}

function matchesQuery(property: Property, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = [
    property.name,
    property.headline,
    property.summary,
    property.address,
    property.type,
    property.reference,
    neighborhoodName(property.neighborhoodSlug),
    ...property.amenities,
  ]
    .join(" ")
    .toLowerCase();
  // Every word must appear somewhere, so "villa hills" narrows rather than widens.
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export function filterProperties(
  filters: PropertyFilters,
  source: Property[] = properties,
): Property[] {
  return source.filter((property) => {
    if (!matchesQuery(property, filters.query)) return false;
    if (filters.listing !== "all" && property.listing !== filters.listing) return false;
    if (filters.neighborhoods.length && !filters.neighborhoods.includes(property.neighborhoodSlug))
      return false;
    if (filters.types.length && !filters.types.includes(property.type)) return false;
    if (filters.minPrice !== null && property.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && property.price > filters.maxPrice) return false;
    if (filters.bedrooms !== null && property.bedrooms < filters.bedrooms) return false;
    if (filters.bathrooms !== null && property.bathrooms < filters.bathrooms) return false;
    if (
      filters.amenities.length &&
      !filters.amenities.every((amenity) => property.amenities.includes(amenity as never))
    )
      return false;
    return true;
  });
}

export function sortProperties(items: Property[], sort: SortKey): Property[] {
  const sorted = [...items];
  switch (sort) {
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "area-desc":
      return sorted.sort((a, b) => b.area - a.area);
    case "bedrooms-desc":
      return sorted.sort((a, b) => b.bedrooms - a.bedrooms);
    default:
      return sorted.sort(
        (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime(),
      );
  }
}

/** Counts used to annotate filter checkboxes so dead ends are visible. */
export function facetCounts(items: Property[]) {
  const count = <T extends string>(pick: (p: Property) => T | T[]) => {
    const map = new Map<T, number>();
    for (const property of items) {
      const values = pick(property);
      for (const value of Array.isArray(values) ? values : [values]) {
        map.set(value, (map.get(value) ?? 0) + 1);
      }
    }
    return map;
  };
  return {
    neighborhoods: count((p) => p.neighborhoodSlug),
    types: count<PropertyType>((p) => p.type),
    amenities: count((p) => p.amenities as unknown as string[]),
  };
}

/**
 * Similar properties: same district first, then same type, then closest price.
 * Deliberately simple — it is a browsing aid, not a recommender.
 */
export function similarProperties(property: Property, limit = 3): Property[] {
  return properties
    .filter((p) => p.id !== property.id && p.status !== "sold")
    .map((p) => {
      let score = 0;
      if (p.neighborhoodSlug === property.neighborhoodSlug) score += 40;
      if (p.type === property.type) score += 25;
      if (p.listing === property.listing) score += 20;
      const priceGap = Math.abs(p.price - property.price) / Math.max(property.price, 1);
      score += Math.max(0, 25 - priceGap * 50);
      if (p.bedrooms === property.bedrooms) score += 8;
      return { property: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.property);
}

export function activeFilterChips(filters: PropertyFilters): {
  key: string;
  label: string;
}[] {
  const chips: { key: string; label: string }[] = [];
  if (filters.query) chips.push({ key: "query", label: `“${filters.query}”` });
  if (filters.listing !== "all")
    chips.push({ key: "listing", label: filters.listing === "sale" ? "For sale" : "To rent" });
  filters.neighborhoods.forEach((slug) =>
    chips.push({ key: `neighborhood:${slug}`, label: neighborhoodName(slug) }),
  );
  filters.types.forEach((type) => chips.push({ key: `type:${type}`, label: type }));
  if (filters.bedrooms) chips.push({ key: "bedrooms", label: `${filters.bedrooms}+ beds` });
  if (filters.bathrooms) chips.push({ key: "bathrooms", label: `${filters.bathrooms}+ baths` });
  filters.amenities.forEach((amenity) =>
    chips.push({ key: `amenity:${amenity}`, label: amenity }),
  );
  return chips;
}

export function countActiveFilters(filters: PropertyFilters): number {
  return activeFilterChips(filters).length + (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0);
}
