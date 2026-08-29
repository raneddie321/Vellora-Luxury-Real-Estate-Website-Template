"use client";

import * as React from "react";
import { X } from "lucide-react";
import { neighborhoods } from "@/data/neighborhoods";
import { AMENITIES, PROPERTY_TYPES, type PropertyFilters } from "@/types";
import { CheckboxRow } from "@/components/ui/checkbox";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import { InputBoxed } from "@/components/ui/input";
import { priceBoundsFor } from "@/lib/property-filters";
import { formatPriceCompact } from "@/lib/utils";

type Facets = ReturnType<typeof import("@/lib/property-filters").facetCounts>;

function Group({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-hairline py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
        <span className="eyebrow text-content">{title}</span>
        <span
          aria-hidden
          className="relative size-3 before:absolute before:top-1/2 before:left-0 before:h-px before:w-3 before:-translate-y-1/2 before:bg-current after:absolute after:top-1/2 after:left-0 after:h-px after:w-3 after:-translate-y-1/2 after:rotate-90 after:bg-current after:transition-transform after:duration-300 group-open:after:rotate-0"
        />
      </summary>
      <div className="pt-4">{children}</div>
    </details>
  );
}

export function PropertyFiltersPanel({
  filters,
  setFilters,
  facets,
  onClear,
}: {
  filters: PropertyFilters;
  setFilters: (updater: (current: PropertyFilters) => PropertyFilters) => void;
  facets: Facets;
  onClear: () => void;
}) {
  const bounds = priceBoundsFor(filters.listing);
  const min = filters.minPrice ?? bounds.min;
  const max = filters.maxPrice ?? bounds.max;

  const toggle = <K extends "neighborhoods" | "types" | "amenities">(key: K, value: string) =>
    setFilters((current) => {
      const list = current[key] as string[];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...current, [key]: next } as PropertyFilters;
    });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 pb-5">
        <h2 className="eyebrow text-content">Refine</h2>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs text-content-faint underline-offset-4 transition-colors hover:text-content hover:underline"
        >
          <X className="size-3" aria-hidden />
          Clear all
        </button>
      </div>

      <div className="border-t border-hairline">
        <Group title="Buy or rent">
          <Segmented
            size="sm"
            label="Buy or rent"
            value={filters.listing}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                listing: value,
                // Sale and rent prices are on different scales.
                minPrice: null,
                maxPrice: null,
              }))
            }
            options={[
              { value: "all", label: "All" },
              { value: "sale", label: "Buy" },
              { value: "rent", label: "Rent" },
            ]}
          />
        </Group>

        <Group title="Price">
          <Slider
            aria-label="Price range"
            value={[min, max]}
            min={bounds.min}
            max={bounds.max}
            step={bounds.step}
            minStepsBetweenThumbs={1}
            onValueChange={([lo, hi]) =>
              setFilters((current) => ({
                ...current,
                minPrice: lo === bounds.min ? null : (lo ?? null),
                maxPrice: hi === bounds.max ? null : (hi ?? null),
              }))
            }
            className="mt-3 mb-5"
          />
          <div className="flex items-center justify-between text-xs text-content-muted tabular-nums">
            <span>{formatPriceCompact(min)}</span>
            <span>
              {formatPriceCompact(max)}
              {max === bounds.max ? "+" : ""}
            </span>
          </div>
        </Group>

        <Group title="Location">
          {neighborhoods.map((n) => (
            <CheckboxRow
              key={n.slug}
              id={`f-hood-${n.slug}`}
              label={n.name}
              count={facets.neighborhoods.get(n.slug) ?? 0}
              checked={filters.neighborhoods.includes(n.slug)}
              onCheckedChange={() => toggle("neighborhoods", n.slug)}
            />
          ))}
        </Group>

        <Group title="Property type">
          {PROPERTY_TYPES.map((type) => (
            <CheckboxRow
              key={type}
              id={`f-type-${type}`}
              label={type}
              count={facets.types.get(type) ?? 0}
              checked={filters.types.includes(type)}
              onCheckedChange={() => toggle("types", type)}
            />
          ))}
        </Group>

        <Group title="Bedrooms & bathrooms">
          <div className="space-y-5">
            {(
              [
                { key: "bedrooms", label: "Bedrooms" },
                { key: "bathrooms", label: "Bathrooms" },
              ] as const
            ).map((field) => (
              <div key={field.key}>
                <p className="mb-2.5 text-xs text-content-muted">{field.label}</p>
                <Segmented
                  size="sm"
                  label={`Minimum ${field.label.toLowerCase()}`}
                  value={filters[field.key] === null ? "any" : String(filters[field.key])}
                  onChange={(value) =>
                    setFilters((current) => ({
                      ...current,
                      [field.key]: value === "any" ? null : Number(value),
                    }))
                  }
                  options={[
                    { value: "any", label: "Any" },
                    { value: "1", label: "1+" },
                    { value: "2", label: "2+" },
                    { value: "3", label: "3+" },
                    { value: "4", label: "4+" },
                    { value: "5", label: "5+" },
                  ]}
                  className="flex-wrap"
                />
              </div>
            ))}
          </div>
        </Group>

        <Group title="Amenities" defaultOpen={false}>
          <div className="max-h-64 overflow-y-auto pr-1">
            {AMENITIES.map((amenity) => (
              <CheckboxRow
                key={amenity}
                id={`f-am-${amenity}`}
                label={amenity}
                count={facets.amenities.get(amenity) ?? 0}
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={() => toggle("amenities", amenity)}
              />
            ))}
          </div>
        </Group>

        <Group title="Keyword" defaultOpen={false}>
          <InputBoxed
            type="search"
            placeholder="Reference, street, feature…"
            value={filters.query}
            onChange={(e) => setFilters((current) => ({ ...current, query: e.target.value }))}
            aria-label="Keyword search"
          />
        </Group>
      </div>
    </div>
  );
}
