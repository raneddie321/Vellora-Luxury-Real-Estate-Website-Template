/**
 * ---------------------------------------------------------------------------
 * VELLORA — site configuration
 * ---------------------------------------------------------------------------
 * This is the first file to edit after you buy the template. Almost everything
 * a new owner needs to change lives here: brand, contact details, navigation,
 * call-to-action labels, social profiles and image sourcing.
 *
 * Nothing in this file is secret — it is bundled into the client.
 * Put credentials in `.env.local` instead (see `.env.example`).
 * ---------------------------------------------------------------------------
 */

export const siteConfig = {
  /* --- Brand ------------------------------------------------------------ */
  name: "Vellora",
  legalName: "Vellora Residential Group",
  tagline: "Exceptional properties. Distinctive living.",
  shortDescription:
    "A private brokerage representing exceptional homes, residences and developments.",
  description:
    "Vellora represents exceptional homes, landmark residences and considered developments for buyers who expect more. Browse the collection, book a private viewing, and work with advisors who know every street.",
  /* The wordmark is drawn in code (components/layout/Logo.tsx) so it stays
     crisp at any size. Swap in an <img> there if you have a supplied logo. */
  logoMark: "V",
  established: 2009,

  /* --- Where the site lives --------------------------------------------- */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://vellora.example.com",
  locale: "en_GB",
  language: "en",

  /* --- Market ------------------------------------------------------------ */
  market: {
    city: "Marivane",
    region: "Marivane Bay",
    country: "Portugal",
    /* Used to format every price on the site. */
    currency: "EUR",
    currencySymbol: "€",
    /* Metric or imperial. Switches m² ⇄ sq ft everywhere. */
    areaUnit: "sqm" as "sqm" | "sqft",
  },

  /* --- Contact ----------------------------------------------------------- */
  contact: {
    email: "enquiries@vellora.example.com",
    pressEmail: "press@vellora.example.com",
    careersEmail: "careers@vellora.example.com",
    phone: "+351 210 447 900",
    phoneHref: "+351210447900",
    whatsapp: "+351 910 447 900",
    address: {
      line1: "14 Rua da Alfândega",
      line2: "Praça do Comércio",
      city: "Marivane",
      postcode: "1100-016",
      country: "Portugal",
    },
    hours: [
      { days: "Monday — Friday", time: "09:00 — 19:00" },
      { days: "Saturday", time: "10:00 — 17:00" },
      { days: "Sunday", time: "By appointment" },
    ],
    /* Decimal coordinates power the styled map on /contact. */
    coordinates: { lat: 38.7075, lng: -9.1364 },
  },

  /* --- Social ------------------------------------------------------------ */
  social: {
    instagram: "https://instagram.com/vellora",
    linkedin: "https://linkedin.com/company/vellora",
    x: "https://x.com/vellora",
    youtube: "https://youtube.com/@vellora",
    pinterest: "https://pinterest.com/vellora",
  },

  /* --- Call-to-action labels -------------------------------------------- */
  cta: {
    primary: "Explore Properties",
    secondary: "Book a Viewing",
    tertiary: "Contact an Advisor",
    viewProperty: "View Property",
    exploreDevelopment: "Explore Development",
    exploreNeighborhood: "Explore Neighbourhood",
    meetAgents: "Meet Our Agents",
    search: "Search Properties",
    newsletter: "Join the list",
  },

  /* --- Imagery ----------------------------------------------------------- */
  images: {
    /**
     * Vellora ships with its own art-directed plates in `/public/media`, so the
     * template looks complete offline, on first `npm run dev`, with no broken
     * images and no third-party licences to worry about.
     *
     * When you are ready to use real photography you have two options:
     *   1. Drop your own files into `/public/media` using the same filenames.
     *   2. Set `useRemote: true` and `remoteBase` to your CDN — every image key
     *      is then requested from `${remoteBase}/${key}.jpg`.
     *      Remember to allow your CDN host in `next.config.ts → images`.
     */
    useRemote: false,
    remoteBase: "",
    remoteExtension: "jpg",
  },

  /* --- Feature switches --------------------------------------------------- */
  features: {
    favorites: true,
    compare: true,
    mortgageCalculator: true,
    journal: true,
    developments: true,
    neighborhoods: true,
  },

  /* --- Regulatory footnotes ---------------------------------------------- */
  legal: {
    registration: "AMI 24817",
    copyrightHolder: "Vellora Residential Group",
    disclaimer:
      "All properties, developments, advisors and editorial content shown on this site are fictional and exist for demonstration purposes only.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
