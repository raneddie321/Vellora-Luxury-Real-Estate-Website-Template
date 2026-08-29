/**
 * VELLORA — domain model.
 * Every data file in `/data` is typed against these, so a mistyped field is a
 * build error rather than a broken page.
 */

/* -------------------------------------------------------------------------- */
/*                                  Shared                                    */
/* -------------------------------------------------------------------------- */

import type { MediaKey } from "@/lib/media-keys";

export type ImageAsset = {
  /**
   * Key into the media registry — resolves to a shipped plate in
   * `/public/media` or to the same filename on your CDN.
   * Add your own keys to `lib/media-keys.ts` (or regenerate it with
   * `npm run media`) to widen this union.
   */
  key: MediaKey;
  /** Always write real alt text. It is read aloud and indexed. */
  alt: string;
  /** Optional focal point for art-directed cropping, 0–100. */
  focus?: { x: number; y: number };
};

export type Money = number;

export type Coordinates = { lat: number; lng: number };

/* -------------------------------------------------------------------------- */
/*                                 Properties                                 */
/* -------------------------------------------------------------------------- */

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Penthouse",
  "Townhouse",
  "Estate",
  "Land",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_TYPES = ["sale", "rent"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const PROPERTY_STATUSES = [
  "available",
  "under-offer",
  "reserved",
  "sold",
  "let",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const AMENITIES = [
  "Private pool",
  "Sea view",
  "Garden",
  "Roof terrace",
  "Parking",
  "Concierge",
  "Gym",
  "Lift",
  "Fireplace",
  "Wine cellar",
  "Home cinema",
  "Staff quarters",
  "Air conditioning",
  "Underfloor heating",
  "Smart home",
  "Solar array",
  "Guest house",
  "Private mooring",
  "Tennis court",
  "Spa",
] as const;
export type Amenity = (typeof AMENITIES)[number];

export type FloorPlan = {
  name: string;
  level: string;
  area: number;
  image: ImageAsset;
  rooms: string[];
};

export type PropertyFeature = {
  label: string;
  value: string;
};

export type Property = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  /** One-sentence hook used on cards and in metadata. */
  summary: string;
  /** Long-form editorial description, one paragraph per entry. */
  description: string[];
  type: PropertyType;
  listing: ListingType;
  status: PropertyStatus;
  price: Money;
  /** Only for rentals. */
  pricePeriod?: "month" | "week";
  priceQualifier?: string;
  neighborhoodSlug: string;
  address: string;
  coordinates: Coordinates;
  bedrooms: number;
  bathrooms: number;
  /** Interior area, in the unit set by siteConfig.market.areaUnit. */
  area: number;
  plotArea?: number;
  yearBuilt: number;
  /** Energy Performance Certificate band. */
  epc: "A+" | "A" | "B" | "C" | "D" | "E";
  parking: number;
  amenities: Amenity[];
  features: PropertyFeature[];
  images: ImageAsset[];
  floorPlans: FloorPlan[];
  agentId: string;
  developmentSlug?: string;
  featured?: boolean;
  /** ISO date — drives "New" badges and default sorting. */
  listedAt: string;
  tourUrl?: string;
  reference: string;
};

/* -------------------------------------------------------------------------- */
/*                                   Agents                                   */
/* -------------------------------------------------------------------------- */

export type Agent = {
  id: string;
  slug: string;
  name: string;
  title: string;
  portrait: ImageAsset;
  location: string;
  neighborhoodSlugs: string[];
  specialties: string[];
  languages: string[];
  bio: string[];
  email: string;
  phone: string;
  yearsExperience: number;
  transactions: number;
  /** Total value represented, in market currency. */
  volume: Money;
  social?: { linkedin?: string; instagram?: string };
  featured?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                Developments                                */
/* -------------------------------------------------------------------------- */

export type DevelopmentStatus = "selling" | "final-release" | "forthcoming" | "completed";

export type ResidenceType = {
  name: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  from: Money;
  available: number;
  image: ImageAsset;
};

export type Development = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  summary: string;
  story: string[];
  developer: string;
  architect: string;
  interiorDesign?: string;
  landscape?: string;
  location: string;
  neighborhoodSlug: string;
  coordinates: Coordinates;
  startingPrice: Money;
  totalUnits: number;
  availableUnits: number;
  completion: string;
  status: DevelopmentStatus;
  amenities: string[];
  residences: ResidenceType[];
  floorPlans: FloorPlan[];
  images: ImageAsset[];
  hero: ImageAsset;
  featured?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                               Neighbourhoods                               */
/* -------------------------------------------------------------------------- */

export type NeighborhoodHighlight = {
  name: string;
  category: "Restaurant" | "School" | "Culture" | "Retail" | "Outdoors" | "Wellness";
  note: string;
};

export type TransportLink = {
  mode: "Metro" | "Tram" | "Rail" | "Airport" | "Ferry" | "Road";
  name: string;
  time: string;
};

export type Neighborhood = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  overview: string[];
  lifestyle: string[];
  hero: ImageAsset;
  /** Composed for 4:5 frames — cards, rails, anywhere the hero would crop badly. */
  portrait: ImageAsset;
  images: ImageAsset[];
  coordinates: Coordinates;
  averagePrice: Money;
  pricePerArea: Money;
  yearOnYear: number;
  walkScore: number;
  highlights: NeighborhoodHighlight[];
  transport: TransportLink[];
  bestFor: string[];
  featured?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                  Journal                                   */
/* -------------------------------------------------------------------------- */

export const ARTICLE_CATEGORIES = [
  "Market",
  "Architecture",
  "Interiors",
  "Investment",
  "Lifestyle",
  "Neighbourhoods",
] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; items: string[] }
  | { type: "image"; image: ImageAsset; caption?: string }
  | { type: "stat"; value: string; label: string };

export type Article = {
  id: string;
  slug: string;
  title: string;
  standfirst: string;
  category: ArticleCategory;
  author: string;
  authorRole: string;
  publishedAt: string;
  readingTime: number;
  hero: ImageAsset;
  body: ArticleBlock[];
  tags: string[];
  featured?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                  Services                                  */
/* -------------------------------------------------------------------------- */

export type ServiceStep = {
  title: string;
  description: string;
};

export type Service = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  summary: string;
  /** Lucide icon name, resolved in components/sections/ServicesGrid.tsx */
  icon: string;
  intro: string[];
  hero: ImageAsset;
  image: ImageAsset;
  process: ServiceStep[];
  benefits: { title: string; description: string }[];
  stats: { value: string; label: string }[];
  faqIds: string[];
  testimonialId: string;
  ctaLabel: string;
};

/* -------------------------------------------------------------------------- */
/*                                Testimonials                                */
/* -------------------------------------------------------------------------- */

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  location: string;
  propertyReference?: string;
  service?: string;
  featured?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                    FAQ                                     */
/* -------------------------------------------------------------------------- */

export const FAQ_CATEGORIES = [
  "Buying",
  "Selling",
  "Renting",
  "Viewing",
  "Financing",
  "Investment",
  "Property Management",
] as const;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export type Faq = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
};

/* -------------------------------------------------------------------------- */
/*                            Search & filtering                              */
/* -------------------------------------------------------------------------- */

export type SortKey =
  | "newest"
  | "price-desc"
  | "price-asc"
  | "area-desc"
  | "bedrooms-desc";

export type PropertyFilters = {
  query: string;
  listing: ListingType | "all";
  neighborhoods: string[];
  types: PropertyType[];
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[];
  sort: SortKey;
};
