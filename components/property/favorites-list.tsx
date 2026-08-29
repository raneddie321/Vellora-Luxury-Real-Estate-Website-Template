"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCollections } from "@/components/providers/collection-provider";
import { properties } from "@/data/properties";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { formatPrice } from "@/lib/utils";

export function FavoritesList() {
  const { favorites, clearFavorites, ready } = useCollections();
  const saved = favorites
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is (typeof properties)[number] => Boolean(p));

  if (!ready) {
    return (
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!saved.length) {
    return (
      <EmptyState
        eyebrow="Nothing saved"
        title="Your shortlist is empty."
        description="Tap the heart on any property to keep it here. Favourites are stored in this browser only — nothing is sent to us."
        action={
          <Button asChild>
            <Link href="/properties">Browse the collection</Link>
          </Button>
        }
      />
    );
  }

  const total = saved.reduce((sum, p) => (p.listing === "sale" ? sum + p.price : sum), 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-5">
        <p className="text-sm text-content-muted">
          <span className="text-content tabular-nums">{saved.length}</span> saved
          {total > 0 ? (
            <>
              {" · "}
              <span className="text-content tabular-nums">{formatPrice(total)}</span> combined
            </>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/compare">Compare</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={clearFavorites}>
            <Trash2 className="size-3.5" aria-hidden />
            Clear all
          </Button>
        </div>
      </div>

      <RevealGroup
        className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        once={false}
      >
        {saved.map((property) => (
          <RevealItem key={property.id}>
            <PropertyCard property={property} />
          </RevealItem>
        ))}
      </RevealGroup>
    </>
  );
}
