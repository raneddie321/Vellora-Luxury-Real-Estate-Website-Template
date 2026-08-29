"use client";

import Link from "next/link";
import { Check, Minus, Trash2, X } from "lucide-react";
import { useCollections } from "@/components/providers/collection-provider";
import { properties } from "@/data/properties";
import { Plate } from "@/components/media/plate";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { neighborhoodName } from "@/data/neighborhoods";
import { agentById } from "@/data/agents";
import { AMENITIES } from "@/types";
import { areaUnitLabel, cn, formatArea, formatPrice, formatRent, unique } from "@/lib/utils";
import type { Property } from "@/types";

type Row = {
  label: string;
  render: (property: Property) => React.ReactNode;
  /** Highlight the best value in the row. */
  best?: (items: Property[]) => string | null;
};

const rows: Row[] = [
  {
    label: "Price",
    render: (p) =>
      p.listing === "rent" ? formatRent(p.price, p.pricePeriod ?? "month") : formatPrice(p.price),
    best: (items) => {
      const sale = items.filter((p) => p.listing === "sale");
      if (sale.length < 2) return null;
      return sale.reduce((low, p) => (p.price < low.price ? p : low)).id;
    },
  },
  { label: "Listing", render: (p) => (p.listing === "sale" ? "For sale" : "To rent") },
  { label: "Location", render: (p) => neighborhoodName(p.neighborhoodSlug) },
  { label: "Type", render: (p) => p.type },
  {
    label: "Bedrooms",
    render: (p) => (p.bedrooms === 0 ? "—" : p.bedrooms),
    best: (items) => items.reduce((high, p) => (p.bedrooms > high.bedrooms ? p : high)).id,
  },
  {
    label: "Bathrooms",
    render: (p) => (p.bathrooms === 0 ? "—" : p.bathrooms),
    best: (items) => items.reduce((high, p) => (p.bathrooms > high.bathrooms ? p : high)).id,
  },
  {
    label: `Interior (${areaUnitLabel})`,
    render: (p) => formatArea(p.area),
    best: (items) => items.reduce((high, p) => (p.area > high.area ? p : high)).id,
  },
  { label: "Plot", render: (p) => (p.plotArea ? formatArea(p.plotArea) : "—") },
  {
    label: "Price per area",
    render: (p) => (p.listing === "sale" ? formatPrice(Math.round(p.price / p.area)) : "—"),
  },
  { label: "Built", render: (p) => p.yearBuilt },
  { label: "EPC", render: (p) => p.epc },
  { label: "Parking", render: (p) => (p.parking ? `${p.parking} spaces` : "None") },
  { label: "Advisor", render: (p) => agentById(p.agentId)?.name ?? "—" },
  { label: "Reference", render: (p) => p.reference },
];

export function CompareTable() {
  const { compare, removeCompare, clearCompare, ready } = useCollections();
  const selected = compare
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is Property => Boolean(p));

  if (!ready) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (selected.length === 0) {
    return (
      <EmptyState
        eyebrow="Nothing to compare"
        title="Add two or three properties."
        description="Use the compare button on any property to line them up side by side — price, area, specification and amenities."
        action={
          <Button asChild>
            <Link href="/properties">Browse the collection</Link>
          </Button>
        }
      />
    );
  }

  // Only show amenities at least one of the selected properties actually has.
  const relevantAmenities = AMENITIES.filter((amenity) =>
    selected.some((p) => p.amenities.includes(amenity)),
  );
  const features = unique(selected.flatMap((p) => p.features.map((f) => f.label)));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-5">
        <p className="text-sm text-content-muted">
          Comparing <span className="text-content tabular-nums">{selected.length}</span> properties
        </p>
        <Button variant="ghost" size="sm" onClick={clearCompare}>
          <Trash2 className="size-3.5" aria-hidden />
          Clear all
        </Button>
      </div>

      <div className="-mx-5 mt-10 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <caption className="sr-only">Property comparison</caption>
          <thead>
            <tr>
              <th scope="col" className="w-40 pb-6 text-left align-bottom">
                <span className="eyebrow text-content-faint">Property</span>
              </th>
              {selected.map((property) => (
                <th key={property.id} scope="col" className="px-3 pb-6 text-left align-bottom">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => removeCompare(property.id)}
                      aria-label={`Remove ${property.name}`}
                      className="absolute -top-2 -right-2 z-10 inline-flex size-7 items-center justify-center border border-hairline bg-surface text-content-faint transition-colors hover:border-content hover:text-content"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                    <Plate
                      asset={property.images[0]!}
                      ratio="aspect-4/3"
                      sizes="240px"
                      className="w-full"
                    />
                    <Link
                      href={`/properties/${property.slug}`}
                      className="link-rule mt-4 block font-serif text-lg leading-tight tracking-[-0.02em] text-content"
                    >
                      {property.name}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const bestId = row.best?.(selected) ?? null;
              return (
                <tr key={row.label} className="border-t border-hairline">
                  <th scope="row" className="py-3.5 pr-4 text-left font-normal text-content-faint">
                    {row.label}
                  </th>
                  {selected.map((property) => (
                    <td
                      key={property.id}
                      className={cn(
                        "px-3 py-3.5 tabular-nums",
                        bestId === property.id ? "text-content" : "text-content-muted",
                      )}
                    >
                      {row.render(property)}
                      {bestId === property.id ? (
                        <span
                          aria-label="Best in this row"
                          className="ml-2 inline-block size-1.5 translate-y-[-2px] rounded-full bg-[var(--accent)]"
                        />
                      ) : null}
                    </td>
                  ))}
                </tr>
              );
            })}

            <tr className="border-t border-hairline-strong">
              <th
                scope="row"
                colSpan={selected.length + 1}
                className="pt-8 pb-3 text-left"
              >
                <span className="eyebrow text-content">Amenities</span>
              </th>
            </tr>
            {relevantAmenities.map((amenity) => (
              <tr key={amenity} className="border-t border-hairline">
                <th scope="row" className="py-3 pr-4 text-left font-normal text-content-faint">
                  {amenity}
                </th>
                {selected.map((property) => (
                  <td key={property.id} className="px-3 py-3">
                    {property.amenities.includes(amenity) ? (
                      <>
                        <Check className="size-4 text-[var(--accent)]" aria-hidden />
                        <span className="sr-only">Included</span>
                      </>
                    ) : (
                      <>
                        <Minus className="size-4 text-content-faint/50" aria-hidden />
                        <span className="sr-only">Not included</span>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}

            <tr className="border-t border-hairline-strong">
              <th scope="row" colSpan={selected.length + 1} className="pt-8 pb-3 text-left">
                <span className="eyebrow text-content">Specification</span>
              </th>
            </tr>
            {features.map((label) => (
              <tr key={label} className="border-t border-hairline">
                <th scope="row" className="py-3 pr-4 text-left font-normal text-content-faint">
                  {label}
                </th>
                {selected.map((property) => (
                  <td key={property.id} className="px-3 py-3 text-content-muted">
                    {property.features.find((f) => f.label === label)?.value ?? "—"}
                  </td>
                ))}
              </tr>
            ))}

            <tr className="border-t border-hairline">
              <td />
              {selected.map((property) => (
                <td key={property.id} className="px-3 pt-8">
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/book-a-viewing?property=${property.slug}`}>Book a viewing</Link>
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
