# Changelog

All notable changes to Vellora are recorded here.
This project follows [Semantic Versioning](https://semver.org).

---

## [1.0.0] — 2026-08-29

First public release.

### Pages

- Home with cinematic hero, editorial statement, featured property spread,
  property collection, search module, developments, neighbourhoods, services,
  advisors, journal, testimonials, animated statistics and a full-bleed
  closing call to action.
- Property marketplace with faceted filtering, sorting, grid and list layouts,
  pagination, active filter chips and an empty state.
- Property detail with cinematic gallery and full-screen viewer, specification
  table, editorial description, amenities, floor plans, styled map,
  neighbourhood overview, sticky enquiry panel and similar properties.
- Developments index and detail, with residence availability, amenities,
  floor plans, gallery and credits.
- Neighbourhoods index and detail, with overview, lifestyle, categorised
  highlights, transport, map and local listings.
- Advisors index and profile pages, each with live instructions and a direct
  contact form.
- Six service pages — buying, selling, renting, investment, property
  management and relocation — each with process, benefits, animated
  statistics, a testimonial and scoped FAQs.
- Journal index with category filtering, and article pages with a block-based
  body renderer, related reading and a newsletter block.
- About, contact, and a searchable FAQ across seven categories.
- Five-step booking flow with a custom calendar and time slots.
- Favourites, four-way property comparison, advanced search and a mortgage
  calculator with indicative purchase costs.
- Privacy, terms and cookie policies; a bespoke 404; error and loading states.

### Design system

- Token-driven colour, type, spacing, radius, shadow and motion scales in a
  single CSS file.
- A `theme-dark` scope that flips any section to a dark room with no
  per-component overrides.
- Editorial type system pairing Instrument Serif and Instrument Sans, with a
  fluid display scale.
- 20+ primitives: button, input, textarea, select, checkbox, slider, label,
  field, badge, skeleton, dialog, accordion, tabs, breadcrumbs, pagination,
  segmented control, toast, empty state.
- Domain components: property card and row, agent, development, article and
  neighbourhood cards, gallery, filters, compare table, enquiry panel.
- Motion primitives: reveal, staggered reveal, masked line reveal, parallax,
  parallax zoom, animated counter and magnetic hover.

### Content and data

- 20 properties, 12 advisors, 7 developments, 6 neighbourhoods, 12 articles,
  14 testimonials, 28 FAQs and 6 service lines, all typed.
- Central `siteConfig` for brand, contact, market, currency, area unit,
  navigation, CTA labels, social profiles and feature switches.
- Central `content` file holding every headline and paragraph outside the data
  records.

### Artwork

- 172 art-directed SVG plates generated deterministically from source, across
  thirteen scene types including floor plans and stylised maps.
- Dual-mode image resolution: shipped plates by default, or any CDN with a
  one-line switch.
- Mobile art direction — portrait plates swap in below the `sm` breakpoint so
  full-bleed heroes never crop to an unreadable band.

### Accessibility

- Semantic landmarks and heading order throughout.
- Full keyboard paths, including the gallery, calendar, filters and menus.
- Visible focus rings on every interactive element.
- ARIA used where it earns its place: live regions, pressed and current states,
  labelled controls, described-by validation.
- `prefers-reduced-motion` respected across every animation.
- A `<noscript>` fallback so scroll reveals never leave content hidden.

### Performance and SEO

- Static generation for all 85 routes.
- Server components for all imagery — no JavaScript ships for pictures.
- Per-route metadata, Open Graph, Twitter cards, canonical URLs.
- JSON-LD for the organisation, properties, articles, FAQs and breadcrumbs.
- Generated `sitemap.xml` and `robots.txt`.

### Tooling

- Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4, Framer Motion 13.
- ESLint flat config and Prettier with Tailwind class sorting.
- `npm run media` to regenerate artwork; `npm run package` to build a clean
  distributable.
