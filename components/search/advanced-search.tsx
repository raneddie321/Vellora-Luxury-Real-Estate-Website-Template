"use client";

import * as React from "react";
import Link from "next/link";
import { Search as SearchIcon, X } from "lucide-react";
import { InputBoxed } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import { CheckboxRow } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PropertyCard } from "@/components/property/property-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { neighborhoods } from "@/data/neighborhoods";
import { AMENITIES, PROPERTY_TYPES, type PropertyFilters } from "@/types";
import {
  activeFilterChips,
  defaultFilters,
  filterProperties,
  priceBoundsFor,
  sortProperties,
} from "@/lib/property-filters";
import { formatPriceCompact } from "@/lib/utils";

const SUGGESTIONS = [
  "sea view penthouse",
  "villa with pool",
  "old town restoration",
  "downtown loft",
  "land with consent",
  "VLR-1042",
];

/**
 * A single-page search: keyword first, structured filters underneath, and the
 * active set expressed as removable chips so the state is always visible.
 */
export function AdvancedSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const [filters, setFilters] = React.useState<PropertyFilters>({
    ...defaultFilters,
    query: initialQuery,
  });

  const bounds = priceBoundsFor(filters.listing);
  const min = filters.minPrice ?? bounds.min;
  const max = filters.maxPrice ?? bounds.max;

  const results = React.useMemo(
    () => sortProperties(filterProperties(filters), filters.sort),
    [filters],
  );
  const chips = activeFilterChips(filters);

  const toggle = <K extends "neighborhoods" | "types" | "amenities">(key: K, value: string) =>
    setFilters((current) => {
      const list = current[key] as string[];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      } as PropertyFilters;
    });

  function removeChip(key: string) {
    const [kind, value] = key.split(":");
    setFilters((current) => {
      switch (kind) {
        case "query": return { ...current, query: "" };
        case "listing": return { ...current, listing: "all" };
        case "bedrooms": return { ...current, bedrooms: null };
        case "bathrooms": return { ...current, bathrooms: null };
        case "neighborhood":
          return { ...current, neighborhoods: current.neighborhoods.filter((v) => v !== value) };
        case "type": return { ...current, types: current.types.filter((v) => v !== value) };
        case "amenity":
          return { ...current, amenities: current.amenities.filter((v) => v !== value) };
        default: return current;
      }
    });
  }

  return (
    <>
      <div className="border border-hairline bg-surface-raised p-6 sm:p-8 lg:p-10">
        <label htmlFor="site-search" className="eyebrow block text-content-faint">
          Keyword
        </label>
        <div className="relative mt-3">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-content-faint"
            aria-hidden
          />
          <InputBoxed
            id="site-search"
            type="search"
            value={filters.query}
            onChange={(e) => setFilters((c) => ({ ...c, query: e.target.value }))}
            placeholder="Try “sea view penthouse” or a reference such as VLR-1042"
            className="py-4 pl-12 text-base"
          />
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => setFilters((c) => ({ ...c, query: suggestion }))}
                className="border border-hairline px-2.5 py-1 text-[11px] tracking-[0.08em] text-content-muted transition-colors hover:border-content hover:text-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-9 grid gap-8 border-t border-hairline pt-8 lg:grid-cols-3">
          <div>
            <p className="eyebrow text-content-faint">Buy or rent</p>
            <Segmented
              size="sm"
              label="Buy or rent"
              value={filters.listing}
              onChange={(value) =>
                setFilters((c) => ({ ...c, listing: value, minPrice: null, maxPrice: null }))
              }
              options={[
                { value: "all", label: "All" },
                { value: "sale", label: "Buy" },
                { value: "rent", label: "Rent" },
              ]}
              className="mt-3"
            />

            <p className="eyebrow mt-8 text-content-faint">Price</p>
            <Slider
              aria-label="Price range"
              value={[min, max]}
              min={bounds.min}
              max={bounds.max}
              step={bounds.step}
              minStepsBetweenThumbs={1}
              onValueChange={([lo, hi]) =>
                setFilters((c) => ({
                  ...c,
                  minPrice: lo === bounds.min ? null : (lo ?? null),
                  maxPrice: hi === bounds.max ? null : (hi ?? null),
                }))
              }
              className="mt-5 mb-4"
            />
            <div className="flex justify-between text-xs text-content-muted tabular-nums">
              <span>{formatPriceCompact(min)}</span>
              <span>
                {formatPriceCompact(max)}
                {max === bounds.max ? "+" : ""}
              </span>
            </div>

            <p className="eyebrow mt-8 text-content-faint">Bedrooms</p>
            <Segmented
              size="sm"
              label="Minimum bedrooms"
              value={filters.bedrooms === null ? "any" : String(filters.bedrooms)}
              onChange={(value) =>
                setFilters((c) => ({ ...c, bedrooms: value === "any" ? null : Number(value) }))
              }
              options={[
                { value: "any", label: "Any" },
                { value: "1", label: "1+" },
                { value: "2", label: "2+" },
                { value: "3", label: "3+" },
                { value: "4", label: "4+" },
              ]}
              className="mt-3 flex-wrap"
            />

            <p className="eyebrow mt-8 text-content-faint">Bathrooms</p>
            <Segmented
              size="sm"
              label="Minimum bathrooms"
              value={filters.bathrooms === null ? "any" : String(filters.bathrooms)}
              onChange={(value) =>
                setFilters((c) => ({ ...c, bathrooms: value === "any" ? null : Number(value) }))
              }
              options={[
                { value: "any", label: "Any" },
                { value: "1", label: "1+" },
                { value: "2", label: "2+" },
                { value: "3", label: "3+" },
                { value: "4", label: "4+" },
              ]}
              className="mt-3 flex-wrap"
            />
          </div>

          <div>
            <p className="eyebrow text-content-faint">Location</p>
            <div className="mt-3">
              {neighborhoods.map((n) => (
                <CheckboxRow
                  key={n.slug}
                  id={`s-hood-${n.slug}`}
                  label={n.name}
                  checked={filters.neighborhoods.includes(n.slug)}
                  onCheckedChange={() => toggle("neighborhoods", n.slug)}
                />
              ))}
            </div>

            <p className="eyebrow mt-8 text-content-faint">Property type</p>
            <div className="mt-3">
              {PROPERTY_TYPES.map((type) => (
                <CheckboxRow
                  key={type}
                  id={`s-type-${type}`}
                  label={type}
                  checked={filters.types.includes(type)}
                  onCheckedChange={() => toggle("types", type)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow text-content-faint">Amenities</p>
            <div className="mt-3 max-h-[28rem] overflow-y-auto pr-1">
              {AMENITIES.map((amenity) => (
                <CheckboxRow
                  key={amenity}
                  id={`s-am-${amenity}`}
                  label={amenity}
                  checked={filters.amenities.includes(amenity)}
                  onCheckedChange={() => toggle("amenities", amenity)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-5">
        <p className="text-sm text-content-muted" aria-live="polite">
          <span className="text-content tabular-nums">{results.length}</span>{" "}
          {results.length === 1 ? "result" : "results"}
        </p>
        {chips.length ? (
          <Button variant="ghost" size="sm" onClick={() => setFilters(defaultFilters)}>
            Reset search
          </Button>
        ) : null}
      </div>

      {chips.length ? (
        <ul className="flex flex-wrap gap-2 pt-5">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => removeChip(chip.key)}
                className="group inline-flex items-center gap-2 border border-hairline px-3 py-1.5 text-[11px] tracking-[0.1em] text-content-muted transition-colors hover:border-content hover:text-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {chip.label}
                <X className="size-3 opacity-60 group-hover:opacity-100" aria-hidden />
                <span className="sr-only">Remove filter</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-12">
        {results.length ? (
          <RevealGroup
            className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
            once={false}
          >
            {results.map((property) => (
              <RevealItem key={property.id}>
                <PropertyCard property={property} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <EmptyState
            eyebrow="No results"
            title="Nothing matches that search."
            description="Try fewer words, or drop a filter. If you are looking for something specific, tell us and we will watch for it."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => setFilters(defaultFilters)}>Reset search</Button>
                <Button asChild variant="outline">
                  <Link href="/contact">Register requirements</Link>
                </Button>
              </div>
            }
          />
        )}
      </div>
    </>
  );
}
