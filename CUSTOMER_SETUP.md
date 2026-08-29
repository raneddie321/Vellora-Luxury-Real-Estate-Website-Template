# Vellora — setup guide

A step-by-step guide from downloaded ZIP to live site on your own domain.
No prior Next.js experience assumed. Allow about an hour end to end.

---

## 1. Download and unzip

Download `Vellora-Luxury-Real-Estate-Template.zip` from your purchase receipt
and unzip it somewhere sensible — your Documents or Projects folder is fine.

You should end up with a folder containing `package.json`, `app/`, `components/`
and this file. If you see a single folder inside another folder of the same
name, go one level deeper; the folder with `package.json` in it is the project.

---

## 2. Install Node.js

The template needs **Node.js 20.9 or newer**. Node 22 LTS is recommended.

1. Go to <https://nodejs.org> and download the **LTS** version.
2. Run the installer and accept the defaults.
3. Confirm it worked — open a terminal and run:

```bash
node -v
```

You should see something like `v22.x.x`. Anything from `v20.9.0` upward is fine.

<details>
<summary>How do I open a terminal?</summary>

- **macOS** — press ⌘ + Space, type "Terminal", press Enter.
- **Windows** — press Start, type "PowerShell", press Enter.
- **Linux** — you already know.
</details>

---

## 3. Open the project

In the terminal, move into the project folder. The easiest way is to type `cd `
(with a trailing space) and then drag the folder onto the terminal window:

```bash
cd /path/to/vellora-luxury-real-estate-template
```

Press Enter. Run `ls` (macOS/Linux) or `dir` (Windows) — you should see
`package.json` in the list.

---

## 4. Install dependencies

```bash
npm install
```

This downloads the libraries the template uses. It takes one to three minutes
and creates a `node_modules` folder. You only need to do this once.

> Seeing warnings about deprecated packages? That is normal and harmless.
> Errors are different — see **Troubleshooting** at the end.

---

## 5. Start the development server

```bash
npm run dev
```

Open <http://localhost:3000> in your browser. You should see the Vellora
homepage.

Leave this running while you work. Every file you save appears in the browser
within a second. Press `Ctrl + C` in the terminal to stop it.

---

## 6. Change the brand

Open **`config/site.ts`** in a text editor
([VS Code](https://code.visualstudio.com) is free and excellent).

```ts
export const siteConfig = {
  name: "Vellora",                                   // ← your brand name
  legalName: "Vellora Residential Group",            // ← the registered entity
  tagline: "Exceptional properties. Distinctive living.",
  shortDescription: "A private brokerage representing …",
  description: "Vellora represents exceptional homes …",
  ...
```

Save the file and the browser updates. The name appears in the navigation, the
footer, page titles and social share cards.

**The logo** is drawn in code so it stays sharp at any size, in
`components/layout/logo.tsx`. To use a supplied logo file instead, put it in
`public/` and replace the `<svg>` there with:

```tsx
<Image src="/your-logo.svg" alt="" width={130} height={24} priority />
```

Keep the surrounding `<Link>` and its `aria-label`.

---

## 7. Change the colours

All colour lives in **`app/globals.css`**, at the top, in the `@theme` block.

```css
@theme {
  --color-ink: #0b0b0c;        /* near-black — text and dark sections */
  --color-paper: #f6f3ed;      /* warm white — the page ground        */
  --color-gold-500: #b08e55;   /* champagne accent — used sparingly   */
  ...
}
```

Change a value, save, and the whole site follows: buttons, borders, hover
states, dark sections, everything.

**Dark sections.** Any element with the class `theme-dark` becomes a "dark
room" — its children automatically flip to light text on a dark ground with no
extra classes. That is how the footer, the services grid and the final CTA are
built. Add or remove `theme-dark` on a `<section>` to flip it.

**Fonts** are set in `app/layout.tsx` using `next/font/google`. Swap
`Instrument_Sans` and `Instrument_Serif` for any Google font:

```ts
import { Fraunces, Manrope } from "next/font/google";
```

Keep the `variable:` names the same and the rest of the site follows.

---

## 8. Change the images

Vellora ships with 172 pieces of its own artwork in `public/media`, so nothing
is ever broken and there are no licences to worry about. There are two ways to
use your own photography.

### Option A — replace the files (simplest)

Put your images in `public/media` using the same filenames, with a `.jpg` or
`.webp` extension, then change one line in `lib/images.ts`:

```ts
return `/media/${key}.svg`;      // change .svg to .jpg
```

Filenames follow a pattern: `villa-01`, `coastal-03`, `interior-14`,
`portrait-07`, `room-02`, `tall-05`, `cinema-08`, `plan-01`, `map-03`.
Open `public/media` to see the full list.

### Option B — point at a CDN

In `config/site.ts`:

```ts
images: {
  useRemote: true,
  remoteBase: "https://cdn.your-domain.com/vellora",
  remoteExtension: "jpg",
},
```

Every image key is then requested from `{remoteBase}/{key}.jpg`. Add your CDN
host to `next.config.ts` first:

```ts
remotePatterns: [{ protocol: "https", hostname: "cdn.your-domain.com" }],
```

### Changing which image a page uses

Images are referenced by key in `data/` and `config/content.ts`:

```ts
hero: img("cinema-08", "A modernist residence at dusk, lit from within"),
```

The second argument is the alt text — always write real alt text; it is read
aloud by screen readers and indexed by search engines.

### Regenerating the shipped artwork

```bash
npm run media
```

Edit `scripts/lib/palettes.mjs` to shift the colour grade, or
`scripts/generate-media.mjs` to change how many plates of each type exist.

---

## 9. Change the properties

Open **`data/properties.ts`**. Each property is one object:

```ts
{
  id: "p-01",
  slug: "the-estuary-penthouse",     // becomes /properties/the-estuary-penthouse
  name: "The Estuary Penthouse",
  headline: "A single floor, four terraces, and the whole estuary",
  summary: "The top floor of Dock House: 412 m² …",
  description: ["Paragraph one …", "Paragraph two …"],
  type: "Penthouse",                 // Apartment | Villa | Penthouse | Townhouse | Estate | Land
  listing: "sale",                   // sale | rent
  status: "available",               // available | under-offer | reserved | sold | let
  price: 6_950_000,
  neighborhoodSlug: "waterfront",    // must match a slug in data/neighborhoods.ts
  ...
  agentId: "a-02",                   // must match an id in data/agents.ts
}
```

Rules that will save you time:

- `slug` must be unique — it is the URL.
- `neighborhoodSlug` and `agentId` must match existing records.
- Image keys must exist. TypeScript will tell you if they do not.
- Prices are plain numbers. `6_950_000` and `6950000` are the same thing;
  the underscores are only there for legibility.
- For rentals, set `pricePeriod` and `priceQualifier`.

Delete the demo entries and add your own. Everything downstream — filters,
counts, search, comparison, sitemap — updates automatically.

The other content files work the same way:

| File | Contains |
|---|---|
| `data/agents.ts` | Advisors and their profiles |
| `data/developments.ts` | New developments |
| `data/neighborhoods.ts` | Districts, transport, highlights |
| `data/articles.ts` | Journal articles |
| `data/services.ts` | Service lines, process, benefits, stats |
| `data/testimonials.ts` | Client quotes |
| `data/faqs.ts` | Questions and answers |
| `data/legal.ts` | Privacy, terms and cookie text |

### Connecting a CMS instead

Nothing in the pages reads the data files directly except through the exported
helpers. To use Sanity, Contentful, Payload or a database, replace the body of
`data/properties.ts` with a fetch that returns the same `Property[]` shape.

---

## 10. Change the contact information

Also in `config/site.ts`:

```ts
contact: {
  email: "enquiries@vellora.example.com",
  phone: "+351 210 447 900",
  phoneHref: "+351210447900",       // digits only, for tel: links
  address: { line1: "…", city: "…", postcode: "…", country: "…" },
  hours: [{ days: "Monday — Friday", time: "09:00 — 19:00" }],
  coordinates: { lat: 38.7075, lng: -9.1364 },
},
```

`coordinates` positions the map on the contact page. Find yours by
right-clicking your office on Google Maps.

While you are there, set your market:

```ts
market: {
  city: "Marivane",
  currency: "EUR",            // any ISO currency code
  currencySymbol: "€",
  areaUnit: "sqm",            // "sqm" or "sqft" — switches m² ⇄ sq ft site-wide
},
```

---

## 11. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then set at least:

```
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

This is used for canonical URLs, social share cards and the sitemap. Get it
wrong and your Open Graph previews will point at the wrong place.

> **Security.** `.env.local` is git-ignored and must never be committed.
> Anything prefixed `NEXT_PUBLIC_` is visible to anyone who opens your site —
> never put a secret behind that prefix.

### Making the forms live

The contact, newsletter and booking forms are frontend-only demonstrations.
They validate properly and show real loading and success states, but they do
not send anything.

To connect them, open `lib/validation.ts` and replace the body of
`submitDemo()`:

```ts
export async function submitDemo<T>(payload: T) {
  const res = await fetch("/api/enquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Request failed");
  return { ok: true as const, payload };
}
```

Then add `app/api/enquiry/route.ts` that emails or stores the payload. Keep any
API key server-side, in `.env.local` without the `NEXT_PUBLIC_` prefix.

---

## 12. Build the production version

Before deploying, always run:

```bash
npm run lint
npm run typecheck
npm run build
```

All three must pass. The build compiles every page and will refuse to complete
if anything is broken — which is exactly what you want to find out now rather
than after launch.

To preview the production build locally:

```bash
npm start
```

---

## 13. Deploy to Vercel

Vercel is made by the same team as Next.js and the free tier is generous.

1. Create a free account at <https://vercel.com>.
2. Put your project in a Git repository (GitHub, GitLab or Bitbucket).
   If you have never used Git: install it, then in the project folder run
   `git init`, `git add .`, `git commit -m "Initial commit"`, and follow
   GitHub's instructions to push.
3. At <https://vercel.com/new>, import the repository.
4. Vercel detects Next.js automatically. **Do not change the build settings.**
5. Open **Settings → Environment Variables** and add
   `NEXT_PUBLIC_SITE_URL` with your final domain.
6. Click **Deploy**. Two to three minutes later you have a live URL.

Every push to your main branch redeploys automatically.

<details>
<summary>Deploying somewhere else</summary>

- **Netlify** — install `@netlify/plugin-nextjs`; build `npm run build`,
  publish `.next`.
- **Cloudflare Pages** — use the Next.js preset.
- **Your own server** — `npm ci && npm run build && npm start`, behind Nginx or
  Caddy for TLS. Node 20.9+ required.
</details>

---

## 14. Connect a custom domain

1. Buy the domain from any registrar.
2. In Vercel: **Settings → Domains → Add**, and enter it.
3. Vercel shows the DNS records to create. Usually:
   - an `A` record for `@` pointing at Vercel's IP, and
   - a `CNAME` for `www` pointing at `cname.vercel-dns.com`.
4. Add those at your registrar. Propagation takes minutes to a few hours.
5. HTTPS is issued automatically once DNS resolves.
6. Update `NEXT_PUBLIC_SITE_URL` to the real domain and redeploy so canonical
   URLs and share cards are correct.

---

## Going live — a short checklist

- [ ] Brand name, tagline and description updated in `config/site.ts`
- [ ] Contact details, address, hours and coordinates are yours
- [ ] Social links point at real profiles (or are removed)
- [ ] Demo properties, agents and developments replaced
- [ ] Images replaced, with real alt text on every one
- [ ] Legal pages reviewed by someone qualified — `data/legal.ts`
- [ ] The demo disclaimer removed from `siteConfig.legal.disclaimer`
- [ ] Forms connected to a real endpoint
- [ ] `NEXT_PUBLIC_SITE_URL` set to the live domain
- [ ] `npm run build` passes
- [ ] Checked on a real phone, not just a narrow browser window

---

## Troubleshooting

**`npm install` fails with a permissions error**
Do not use `sudo`. Reinstall Node with the official installer, or use
[nvm](https://github.com/nvm-sh/nvm).

**`command not found: npm`**
Node is not installed, or the terminal was open before you installed it. Close
the terminal, open a new one, and try `node -v` again.

**Port 3000 is already in use**
```bash
npm run dev -- -p 3001
```

**The build fails with a TypeScript error in `data/`**
Usually a typo in an image key, a `neighborhoodSlug` that does not exist, or a
missing required field. The error names the file and line.

**Images are missing after switching to my own photography**
Check the extension in `lib/images.ts` matches your files, and that the
filenames match the keys exactly — they are case-sensitive.

**Fonts do not load / the build fails downloading fonts**
`next/font` fetches from Google Fonts at build time. Behind a restrictive
network, either allow `fonts.googleapis.com` and `fonts.gstatic.com`, or
download the font files and switch to `next/font/local`.

**Animations do not run**
Check your operating system's "reduce motion" setting. Vellora respects it and
disables non-essential animation.
