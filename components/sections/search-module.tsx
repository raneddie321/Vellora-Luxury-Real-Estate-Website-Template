"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { neighborhoods } from "@/data/neighborhoods";
import { PROPERTY_TYPES } from "@/types";
import { homeContent } from "@/config/content";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPriceCompact } from "@/lib/utils";

const SALE_PRICES = [750_000, 1_500_000, 2_500_000, 4_000_000, 6_000_000, 9_000_000];
const RENT_PRICES = [2_000, 4_000, 6_000, 8_000, 10_000, 12_000];
const ANY = "any";

/**
 * The front door to the marketplace. Six controls, no cleverness — it composes
 * a query string and hands off to /properties, which owns the real filtering.
 */
export function SearchModule() {
  const router = useRouter();
  const [listing, setListing] = React.useState<"sale" | "rent">("sale");
  const [location, setLocation] = React.useState(ANY);
  const [type, setType] = React.useState(ANY);
  const [maxPrice, setMaxPrice] = React.useState(ANY);
  const [bedrooms, setBedrooms] = React.useState(ANY);
  const [bathrooms, setBathrooms] = React.useState(ANY);

  const prices = listing === "rent" ? RENT_PRICES : SALE_PRICES;

  // Rent and sale prices are on different scales, so a carried-over cap is
  // nonsense — clear it when the mode changes.
  function changeListing(value: "sale" | "rent") {
    setListing(value);
    setMaxPrice(ANY);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set("listing", listing);
    if (location !== ANY) params.set("neighborhood", location);
    if (type !== ANY) params.set("type", type);
    if (maxPrice !== ANY) params.set("maxPrice", maxPrice);
    if (bedrooms !== ANY) params.set("bedrooms", bedrooms);
    if (bathrooms !== ANY) params.set("bathrooms", bathrooms);
    router.push(`/properties?${params.toString()}`);
  }

  const fields = [
    {
      id: "location",
      label: "Location",
      value: location,
      onChange: setLocation,
      placeholder: "Any district",
      options: neighborhoods.map((n) => ({ value: n.slug, label: n.name })),
    },
    {
      id: "type",
      label: "Property type",
      value: type,
      onChange: setType,
      placeholder: "Any type",
      options: PROPERTY_TYPES.map((t) => ({ value: t, label: t })),
    },
    {
      id: "price",
      label: "Maximum price",
      value: maxPrice,
      onChange: setMaxPrice,
      placeholder: "No maximum",
      options: prices.map((p) => ({
        value: String(p),
        label: listing === "rent" ? `${formatPriceCompact(p)}/mo` : formatPriceCompact(p),
      })),
    },
    {
      id: "bedrooms",
      label: "Bedrooms",
      value: bedrooms,
      onChange: setBedrooms,
      placeholder: "Any",
      options: [1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}+` })),
    },
    {
      id: "bathrooms",
      label: "Bathrooms",
      value: bathrooms,
      onChange: setBathrooms,
      placeholder: "Any",
      options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}+` })),
    },
  ];

  return (
    <section className="section-y bg-surface-sunken" aria-labelledby="search-heading">
      <div className="shell">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">
                {homeContent.search.eyebrow}
              </p>
            </Reveal>
            <RevealLines
              as="h2"
              id="search-heading"
              lines={[...homeContent.search.headline]}
              delay={0.05}
              className="mt-6 font-serif text-title text-content"
            />
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <Reveal delay={0.14}>
              <p className="measure text-lede text-content-muted">
                {homeContent.search.supporting}
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.18}>
          <form
            onSubmit={onSubmit}
            className="mt-12 border border-hairline bg-surface p-6 shadow-[var(--shadow-plate)] sm:p-8 lg:mt-16 lg:p-10"
          >
            <Segmented
              label="Buy or rent"
              value={listing}
              onChange={changeListing}
              options={[
                { value: "sale", label: "Buy" },
                { value: "rent", label: "Rent" },
              ]}
            />

            <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={`search-${field.id}`}
                    className="eyebrow block text-content-faint"
                  >
                    {field.label}
                  </label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={`search-${field.id}`} className="mt-2.5">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ANY}>{field.placeholder}</SelectItem>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div className="flex items-end">
                <Button type="submit" size="lg" className="w-full">
                  <Search className="size-4" aria-hidden />
                  {siteConfig.cta.search}
                </Button>
              </div>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
