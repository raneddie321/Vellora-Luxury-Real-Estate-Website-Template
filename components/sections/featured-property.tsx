import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import { ImageReveal } from "@/components/media/image-reveal";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { FavoriteButton } from "@/components/property/favorite-button";
import { neighborhoodName } from "@/data/neighborhoods";
import { homeContent } from "@/config/content";
import { siteConfig } from "@/config/site";
import { formatPrice, formatArea, formatNumber } from "@/lib/utils";
import type { Property } from "@/types";

/**
 * The magazine spread. One property, full-bleed, with the specification set as
 * a ruled table across the bottom — the way a property would be presented in a
 * printed portfolio.
 */
export function FeaturedProperty({ property }: { property: Property }) {
  const specs = [
    { label: "Location", value: neighborhoodName(property.neighborhoodSlug) },
    { label: "Type", value: property.type },
    { label: "Bedrooms", value: formatNumber(property.bedrooms) },
    { label: "Bathrooms", value: formatNumber(property.bathrooms) },
    { label: "Interior", value: formatArea(property.area) },
    { label: "Price", value: formatPrice(property.price) },
  ];

  return (
    <section className="theme-dark relative bg-surface text-content" aria-labelledby="featured-heading">
      <div className="shell pt-20 pb-10 lg:pt-28 lg:pb-14">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">
                {homeContent.featured.eyebrow}
              </p>
            </Reveal>
            <RevealLines
              as="h2"
              id="featured-heading"
              lines={[property.name]}
              delay={0.05}
              className="mt-6 font-serif text-title"
            />
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <Reveal delay={0.14}>
              <p className="text-lede text-content-muted">{property.headline}</p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="relative">
        <ImageReveal>
          <div className="relative">
            <Plate
              asset={property.images[0]!}
              className="h-[62svh] min-h-[24rem] w-full lg:h-[82svh]"
              sizes="100vw"
              grain
              imgClassName="object-cover"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(11,11,12,0.72),rgba(11,11,12,0.05)_46%)]"
            />
          </div>
        </ImageReveal>

        <div className="shell pointer-events-none absolute inset-x-0 bottom-0 pb-8 lg:pb-12">
          <div className="pointer-events-auto flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow text-paper/60">{property.address}</p>
              <p className="mt-3 font-serif text-4xl tracking-[-0.03em] text-paper tabular-nums sm:text-5xl">
                {formatPrice(property.price)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <FavoriteButton
                propertyId={property.id}
                propertyName={property.name}
                className="border-paper/35 text-paper"
              />
              <Magnetic>
                <Button asChild size="lg" variant="inverse">
                  <Link href={`/properties/${property.slug}`}>
                    {siteConfig.cta.viewProperty}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      <div className="shell pt-10 pb-20 lg:pt-14 lg:pb-28">
        <dl className="grid grid-cols-2 border-t border-hairline sm:grid-cols-3 lg:grid-cols-6">
          {specs.map((spec, i) => (
            <Reveal
              key={spec.label}
              delay={i * 0.05}
              className="border-b border-hairline px-0 py-6 sm:border-b-0 lg:border-r lg:last:border-r-0 lg:px-6 lg:first:pl-0"
            >
              <dt className="text-[10px] tracking-[0.2em] text-content-faint uppercase">
                {spec.label}
              </dt>
              <dd className="mt-2.5 text-base text-content tabular-nums">{spec.value}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
