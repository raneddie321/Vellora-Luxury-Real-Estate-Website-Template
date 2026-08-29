<div align="center">

# VELLORA

**Exceptional properties. Distinctive living.**

A premium luxury real-estate website template built with Next.js 16, React 19,
TypeScript, Tailwind CSS v4 and Framer Motion.

</div>

---

## What this is

Vellora is a complete, production-ready front end for a luxury property
brokerage. It is not a landing page with a form on it — it is twenty-four route
types, a filterable marketplace, a five-step booking flow, a mortgage
calculator, favourites, comparison, an editorial journal and a full design
system, all wired to typed demo data you can replace in an afternoon.

Everything runs client-side or statically. There is no database, no API key and
no account to create. `npm install && npm run dev` gives you the whole site.

### Highlights

| | |
|---|---|
| **24 route types** | Home, properties (index + detail), developments (index + detail), neighbourhoods (index + detail), agents (index + detail), services (index + 6 detail), journal (index + detail), about, contact, FAQ, booking, favourites, compare, search, mortgage calculator, 3 legal pages, 404, error and loading states |
| **85 static pages** | Every detail route is pre-rendered at build time |
| **Typed demo data** | 20 properties · 12 advisors · 7 developments · 6 neighbourhoods · 12 articles · 14 testimonials · 28 FAQs · 6 services |
| **Own artwork** | 172 art-directed SVG plates generated from source — no stock licences, no broken images, works offline |
| **Design system** | 20+ reusable components on one set of tokens, with a light/dark "room" system |
| **Accessible** | Semantic HTML, keyboard paths, visible focus, ARIA where it earns its place, reduced-motion support, no-JS fallback |
| **SEO ready** | Per-route metadata, Open Graph, Twitter cards, JSON-LD, sitemap, robots |

---

## Requirements

- **Node.js 20.9 or newer** (22 LTS recommended) — <https://nodejs.org>
- **npm 10+** (ships with Node), or pnpm / yarn / bun if you prefer
- Around 500 MB of disk for `node_modules`

No other services are required to run the template.

---

## Installation

```bash
# 1. Unzip the download, then open the folder in a terminal
cd vellora-luxury-real-estate-template

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open <http://localhost:3000>.

> New to this? `CUSTOMER_SETUP.md` walks the same ground one step at a time,
> including installing Node and deploying to Vercel.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload on port 3000 |
| `npm run build` | Production build — must pass before you deploy |
| `npm start` | Serve the production build locally |
| `npm run lint` | ESLint across the project |
| `npm run typecheck` | TypeScript with no emit |
| `npm run format` | Prettier, including Tailwind class sorting |
| `npm run media` | Regenerate the artwork in `public/media` |
| `npm run package` | Build a clean, distributable copy in `release/` |

---

## Project structure

```
app/                      Routes (Next.js App Router)
  layout.tsx              Fonts, providers, navigation, footer
  template.tsx            Page transition
  page.tsx                Home
  properties/             Marketplace + detail
  developments/           Developments + detail
  neighborhoods/          Districts + detail
  agents/                 Advisors + profile
  services/               Service lines + detail
  journal/                Editorial index + article
  about  contact  faq     Static pages
  book-a-viewing          Five-step booking flow
  favorites  compare      Saved-property experiences
  search                  Advanced search
  mortgage-calculator     Financial tool
  privacy  terms  cookies Legal
  not-found.tsx           404
  error.tsx  loading.tsx  Error and loading states
  sitemap.ts  robots.ts   SEO endpoints

components/
  ui/                     Design-system primitives (button, input, select, …)
  layout/                 Navbar, mobile menu, footer, page hero, logo
  sections/               Home and shared page sections
  property/               Cards, gallery, filters, compare, favourites
  cards/                  Agent, development, article, neighbourhood cards
  booking/                Booking flow and calendar
  forms/                  Contact and newsletter forms
  motion/                 Reveal, parallax, counter, magnetic
  media/                  Image components
  providers/              Favourites and comparison store

config/
  site.ts                 Brand, contact, market, feature flags  ← start here
  navigation.ts           Menus
  content.ts              Page copy

data/                     Typed demo content (properties, agents, …)
lib/                      Utilities, filtering, SEO, mortgage maths
types/                    The domain model
scripts/                  Artwork generator and release packager
public/media/             172 generated SVG plates
```

---

## Customising

Almost everything a new owner needs is in three files:

1. **`config/site.ts`** — name, tagline, contact details, market, currency,
   social links, CTA labels, feature switches.
2. **`config/content.ts`** — every headline and paragraph that is not part of a
   data record.
3. **`app/globals.css`** — the complete colour, type, spacing and motion scale.

Content lives in `data/`, typed against `types/index.ts`, so a mistyped field is
a build error rather than a broken page.

Full walkthrough: **`CUSTOMER_SETUP.md`**.

---

## Images

Vellora ships with its own artwork: 172 art-directed SVG plates generated
deterministically by `scripts/generate-media.mjs`. That means the template is
complete on first run, works with no network, and carries no third-party image
licences.

To use your own photography, either:

- drop files into `public/media/` using the same filenames, or
- set `images.useRemote` and `images.remoteBase` in `config/site.ts` to point
  every key at your CDN.

Add your CDN host to `next.config.ts → images.remotePatterns` first.

---

## Production build

```bash
npm run build
npm start
```

The build must complete with no errors before you deploy. `npm run lint` and
`npm run typecheck` are both clean in the shipped source.

---

## Deployment

### Vercel (recommended)

1. Push the project to a Git repository.
2. Import it at <https://vercel.com/new>.
3. Framework preset: **Next.js**. No build settings need changing.
4. Add `NEXT_PUBLIC_SITE_URL` in project settings.
5. Deploy, then add your domain.

### Netlify

Install `@netlify/plugin-nextjs`, set the build command to `npm run build` and
the publish directory to `.next`.

### Self-hosted / Docker / any Node host

```bash
npm ci
npm run build
npm start          # serves on PORT, default 3000
```

Put a reverse proxy in front for TLS. Node 20.9+ is required at runtime.

### Static export

The template uses no server-only features, so `output: "export"` in
`next.config.ts` will produce a fully static build if you prefer that. Set
`images.unoptimized = true` alongside it.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. Only
`NEXT_PUBLIC_SITE_URL` matters for a basic deployment.

**Never commit `.env.local`.** It is git-ignored for you.

---

## Forms

Contact, newsletter and booking are frontend-only by design: they validate,
show real loading and success states, and resolve through `submitDemo()` in
`lib/validation.ts`. Replace that function's body with a `fetch` to your own
endpoint — a Next route handler, Formspree, Resend, or your CRM — and nothing
else needs to change.

---

## Browser support

Modern evergreen browsers: Chrome, Edge, Firefox and Safari, last two versions.
The design uses CSS nesting, `color-mix()` and `svh` units, all of which have
been baseline since 2023.

---

## Licence

Commercial licence — see `LICENSE.md`. In short: use it for your own and your
clients' projects, commercially, on unlimited sites you own or build for
others. Do not redistribute or resell the template source itself.

---

## Support

Questions about setup are answered in `CUSTOMER_SETUP.md`. Version history is in
`CHANGELOG.md`.
