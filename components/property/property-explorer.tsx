"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, Rows3, SlidersHorizontal, X } from "lucide-react";
import { PropertyCard, PropertyRow } from "@/components/property/property-card";
import { PropertyFiltersPanel } from "@/components/property/property-filters-panel";
import { PropertyCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SORT_OPTIONS,
  activeFilterChips,
  defaultFilters,
  facetCounts,
  filterProperties,
  sortProperties,
} from "@/lib/property-filters";
import { properties } from "@/data/properties";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { PropertyFilters, SortKey } from "@/types";
import { formatNumber } from "@/lib/utils";

const PER_PAGE = 9;

/**
 * The marketplace. Filtering runs entirely in the browser over a small, fully
 * loaded dataset — swap `filterProperties` for a fetch when you connect a CMS
 * and everything above it keeps working.
 */
export function PropertyExplorer({ initialFilters }: { initialFilters: PropertyFilters }) {
  const [filters, setFilters] = React.useState<PropertyFilters>(initialFilters);
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [page, setPage] = React.useState(1);
  const [pending, setPending] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const firstRender = React.useRef(true);

  const results = React.useMemo(
    () => sortProperties(filterProperties(filters), filters.sort),
    [filters],
  );
  const facets = React.useMemo(() => facetCounts(properties), []);
  const chips = activeFilterChips(filters);
  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const pageItems = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // A short pending state makes the change legible; without it results
  // swap so fast the page appears not to have responded.
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setPage(1);
    setPending(true);
    const timer = window.setTimeout(() => setPending(false), 280);
    return () => window.clearTimeout(timer);
  }, [filters]);

  function removeChip(key: string) {
    const [kind, value] = key.split(":");
    setFilters((current) => {
      switch (kind) {
        case "query":
          return { ...current, query: "" };
        case "listing":
          return { ...current, listing: "all" };
        case "bedrooms":
          return { ...current, bedrooms: null };
        case "bathrooms":
          return { ...current, bathrooms: null };
        case "neighborhood":
          return { ...current, neighborhoods: current.neighborhoods.filter((v) => v !== value) };
        case "type":
          return { ...current, types: current.types.filter((v) => v !== value) };
        case "amenity":
          return { ...current, amenities: current.amenities.filter((v) => v !== value) };
        default:
          return current;
      }
    });
  }

  const panel = (
    <PropertyFiltersPanel
      filters={filters}
      setFilters={setFilters}
      facets={facets}
      onClear={() => setFilters(defaultFilters)}
    />
  );

  return (
    <div className="shell pb-24 lg:pb-32">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-28 max-h-[calc(100svh-9rem)] overflow-y-auto pr-2">{panel}</div>
        </aside>

        <div className="lg:col-span-9" ref={resultsRef}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-5">
            <p className="text-sm text-content-muted" aria-live="polite">
              <span className="text-content tabular-nums">{formatNumber(results.length)}</span>{" "}
              {results.length === 1 ? "property" : "properties"}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setDrawerOpen(true)}
              >
                <SlidersHorizontal className="size-3.5" aria-hidden />
                Filters
                {chips.length ? <span className="tabular-nums">({chips.length})</span> : null}
              </Button>

              <div className="w-44">
                <Select
                  value={filters.sort}
                  onValueChange={(value) =>
                    setFilters((current) => ({ ...current, sort: value as SortKey }))
                  }
                >
                  <SelectTrigger aria-label="Sort properties" className="py-2 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Segmented
                size="sm"
                label="Layout"
                value={view}
                onChange={setView}
                options={[
                  { value: "grid", label: "Grid", icon: LayoutGrid },
                  { value: "list", label: "List", icon: Rows3 },
                ]}
                className="hidden sm:inline-flex"
              />
            </div>
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
                    <X className="size-3 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
                    <span className="sr-only">Remove filter</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setFilters(defaultFilters)}
                  className="px-2 py-1.5 text-[11px] tracking-[0.1em] text-content-faint underline-offset-4 hover:text-content hover:underline"
                >
                  Clear all
                </button>
              </li>
            </ul>
          ) : null}

          <div className="mt-10">
            {pending ? (
              <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                eyebrow="No matches"
                title="Nothing fits that brief — yet."
                description="Widen a filter, or register your requirements and we will contact you when something arrives. A third of what we sell is never listed publicly."
                action={
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button onClick={() => setFilters(defaultFilters)}>Clear filters</Button>
                    <Button asChild variant="outline">
                      <Link href="/contact">Register requirements</Link>
                    </Button>
                  </div>
                }
              />
            ) : view === "grid" ? (
              <RevealGroup
                className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3"
                once={false}
              >
                {pageItems.map((property, i) => (
                  <RevealItem key={property.id}>
                    <PropertyCard
                      property={property}
                      priority={i < 3}
                      sizes="(min-width: 1280px) 26vw, (min-width: 640px) 42vw, 92vw"
                    />
                  </RevealItem>
                ))}
              </RevealGroup>
            ) : (
              <RevealGroup className="space-y-10" once={false}>
                {pageItems.map((property) => (
                  <RevealItem key={property.id}>
                    <PropertyRow property={property} />
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </div>

          {!pending && results.length > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(next) => {
                setPage(next);
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="mt-16"
            />
          ) : null}
        </div>
      </div>

      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="max-h-[86svh] max-w-lg overflow-y-auto">
          <DialogTitle className="mb-6 text-2xl">Refine your search</DialogTitle>
          {panel}
          <Button className="mt-8 w-full" onClick={() => setDrawerOpen(false)}>
            Show {formatNumber(results.length)} {results.length === 1 ? "property" : "properties"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
