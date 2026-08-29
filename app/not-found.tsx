import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { properties } from "@/data/properties";
import { img } from "@/lib/images";
import { formatPrice } from "@/lib/utils";
import { neighborhoodName } from "@/data/neighborhoods";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — Vellora",
  robots: { index: false, follow: false },
};

const suggestions = [
  { label: "The collection", href: "/properties", note: "Twenty properties, six districts" },
  { label: "Developments", href: "/developments", note: "Seven schemes, from launch to last unit" },
  { label: "Neighbourhoods", href: "/neighborhoods", note: "Where to live, street by street" },
  { label: "The Journal", href: "/journal", note: "Market notes and essays" },
];

export default function NotFound() {
  // A different door: rather than a dead end, show the way back and one listing.
  const featured = properties.find((p) => p.slug === "lighthouse-house") ?? properties[0]!;

  return (
    <div className="theme-dark relative isolate min-h-[100svh] overflow-hidden bg-ink text-content">
      <Plate
        asset={img("cinema-10", "The city at night")}
        className="absolute inset-0 -z-10 h-full w-full"
        sizes="100vw"
        priority
        grain
        imgClassName="object-cover"
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(11,11,12,0.94),rgba(11,11,12,0.6)_55%,rgba(11,11,12,0.8))]"
      />

      <div className="shell flex min-h-[100svh] flex-col justify-end pt-32 pb-14">
        <p className="eyebrow rule-accent text-paper/70">Error 404</p>

        <h1 className="mt-7 font-serif text-hero text-paper">
          <span className="block">This address</span>
          <span className="block italic">is no longer listed.</span>
        </h1>

        <p className="measure mt-7 text-lede text-paper/75">
          The page you were looking for has been withdrawn, renamed, or never existed. Everything
          else is exactly where you left it.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Magnetic>
            <Button asChild size="lg" variant="inverse">
              <Link href="/">
                Return home
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild size="lg" variant="outline" className="border-paper/40 text-paper">
              <Link href="/search">Search the collection</Link>
            </Button>
          </Magnetic>
        </div>

        <div className="mt-14 grid gap-10 border-t border-paper/20 pt-8 lg:grid-cols-12">
          <nav aria-label="Suggested pages" className="lg:col-span-7">
            <p className="eyebrow text-paper/50">Try instead</p>
            <ul className="mt-5">
              {suggestions.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-baseline gap-5 border-b border-paper/15 py-4"
                  >
                    <span className="eyebrow w-7 shrink-0 text-paper/40 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-serif text-2xl tracking-[-0.025em] text-paper transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1.5">
                      {item.label}
                    </span>
                    <span className="hidden text-sm text-paper/50 sm:block">{item.note}</span>
                    <ArrowRight
                      className="size-4 shrink-0 text-paper/50 transition-transform duration-500 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4 lg:col-start-9">
            <p className="eyebrow text-paper/50">While you are here</p>
            <Link href={`/properties/${featured.slug}`} className="group mt-5 block">
              <Plate
                asset={featured.images[0]!}
                ratio="aspect-4/3"
                sizes="(min-width: 1024px) 30vw, 92vw"
                imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
              />
              <p className="mt-4 font-serif text-xl tracking-[-0.02em] text-paper">
                {featured.name}
              </p>
              <p className="mt-1 text-sm text-paper/60">
                {neighborhoodName(featured.neighborhoodSlug)} · {formatPrice(featured.price)}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
