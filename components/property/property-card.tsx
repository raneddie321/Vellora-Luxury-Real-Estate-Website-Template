import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/property/favorite-button";
import { PropertyMeta } from "@/components/property/property-meta";
import { StatusBadge, isNewListing } from "@/components/property/status-badge";
import { neighborhoodName } from "@/data/neighborhoods";
import { cn, formatPrice, formatRent } from "@/lib/utils";
import type { Property } from "@/types";

function priceLabel(property: Property) {
  return property.listing === "rent"
    ? formatRent(property.price, property.pricePeriod ?? "month")
    : formatPrice(property.price);
}

/**
 * The card the whole site is built on.
 *
 * The link is a pseudo-element overlay rather than a wrapper, so the favourite
 * button can sit inside the card without nesting one interactive element in
 * another — which screen readers and keyboards both dislike.
 */
export function PropertyCard({
  property,
  priority = false,
  sizes = "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw",
  className,
}: {
  property: Property;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const isNew = property.status === "available" && isNewListing(property.listedAt);

  return (
    <article className={cn("group/card relative flex flex-col", className)}>
      <div className="relative overflow-hidden">
        <Plate
          asset={property.images[0]!}
          ratio="aspect-4/3"
          sizes={sizes}
          priority={priority}
          imgClassName="transition-transform duration-[1100ms] ease-[var(--ease-editorial)] group-hover/card:scale-[1.045]"
        />
        {/* A wash that only arrives on hover, so the still image stays clean. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-700 group-hover/card:opacity-100"
        />

        <div className="absolute top-3.5 left-3.5 z-20 flex flex-wrap gap-1.5">
          <StatusBadge status={property.status} />
          {isNew ? <Badge variant="accent">New</Badge> : null}
          {property.listing === "rent" ? <Badge variant="overlay">To rent</Badge> : null}
        </div>

        <FavoriteButton
          propertyId={property.id}
          propertyName={property.name}
          size="sm"
          className="absolute top-3.5 right-3.5"
        />

        <span className="pointer-events-none absolute right-4 bottom-4 z-10 inline-flex translate-y-2 items-center gap-1.5 text-[10px] tracking-[0.18em] text-paper uppercase opacity-0 transition-all duration-500 ease-[var(--ease-editorial)] group-hover/card:translate-y-0 group-hover/card:opacity-100">
          View
          <ArrowUpRight className="size-3.5" aria-hidden />
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <p className="eyebrow flex items-center gap-2 text-content-faint">
          <span>{property.type}</span>
          <span aria-hidden className="h-px w-3 bg-hairline-strong" />
          <span className="normal-case tracking-[0.08em]">{property.reference}</span>
        </p>

        <h3 className="mt-3 font-serif text-[1.65rem] leading-[1.08] tracking-[-0.025em] text-content">
          <Link
            href={`/properties/${property.slug}`}
            className="after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
          >
            {property.name}
          </Link>
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-content-muted">
          <MapPin className="size-3.5 shrink-0 text-content-faint" aria-hidden />
          {neighborhoodName(property.neighborhoodSlug)}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-baseline justify-between gap-4 border-t border-hairline pt-4">
            <p className="text-[1.05rem] tracking-[-0.01em] text-content tabular-nums">
              {priceLabel(property)}
            </p>
            {property.priceQualifier ? (
              <p className="text-[11px] text-content-faint">{property.priceQualifier}</p>
            ) : null}
          </div>
          <PropertyMeta property={property} className="mt-3.5" />
        </div>
      </div>
    </article>
  );
}

/** Horizontal variant for the list view on /properties. */
export function PropertyRow({ property }: { property: Property }) {
  const isNew = property.status === "available" && isNewListing(property.listedAt);

  return (
    <article className="group/card relative grid gap-5 border-b border-hairline pb-8 sm:grid-cols-[minmax(0,34%)_1fr] sm:gap-8">
      <div className="relative overflow-hidden">
        <Plate
          asset={property.images[0]!}
          ratio="aspect-4/3"
          sizes="(min-width: 640px) 34vw, 92vw"
          imgClassName="transition-transform duration-[1100ms] ease-[var(--ease-editorial)] group-hover/card:scale-[1.045]"
        />
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
          <StatusBadge status={property.status} />
          {isNew ? <Badge variant="accent">New</Badge> : null}
        </div>
        <FavoriteButton
          propertyId={property.id}
          propertyName={property.name}
          size="sm"
          className="absolute top-3 right-3"
        />
      </div>

      <div className="flex flex-col">
        <p className="eyebrow flex items-center gap-2 text-content-faint">
          <span>{property.type}</span>
          <span aria-hidden className="h-px w-3 bg-hairline-strong" />
          <span>{neighborhoodName(property.neighborhoodSlug)}</span>
          {property.listing === "rent" ? (
            <>
              <span aria-hidden className="h-px w-3 bg-hairline-strong" />
              <span>To rent</span>
            </>
          ) : null}
        </p>

        <h3 className="mt-3 font-serif text-3xl leading-[1.05] tracking-[-0.03em] text-content sm:text-[2.25rem]">
          <Link
            href={`/properties/${property.slug}`}
            className="after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
          >
            {property.name}
          </Link>
        </h3>

        <p className="measure mt-3.5 text-sm leading-relaxed text-content-muted">
          {property.summary}
        </p>

        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pt-6">
          <PropertyMeta property={property} size="md" showParking />
          <p className="text-xl tracking-[-0.02em] text-content tabular-nums">
            {priceLabel(property)}
          </p>
        </div>
      </div>
    </article>
  );
}
