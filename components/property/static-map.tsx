import { MapPin } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { img, type MediaKey } from "@/lib/images";
import { seededIndex } from "@/lib/utils";
import type { Coordinates } from "@/types";

const MAP_PLATES: MediaKey[] = [
  "map-01", "map-02", "map-03", "map-04", "map-05", "map-06", "map-07", "map-08",
];

/**
 * A styled map plate with the address over it. No third-party script, no
 * consent banner, no API key — swap the <Plate> for an embed or a Mapbox
 * canvas if you need a live map (see CUSTOMER_SETUP.md).
 */
export function StaticMap({
  address,
  coordinates,
  seed,
  className,
}: {
  address: string;
  coordinates: Coordinates;
  seed: string;
  className?: string;
}) {
  const plate = MAP_PLATES[seededIndex(seed, MAP_PLATES.length)]!;

  return (
    <figure className={className}>
      <div className="relative">
        <Plate
          asset={img(plate, `Map showing the approximate location of ${address}`)}
          ratio="aspect-16/10 sm:aspect-video"
          sizes="(min-width: 1024px) 60vw, 92vw"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 bg-ink/75 px-5 py-4 backdrop-blur-[2px]">
          <p className="flex items-center gap-2.5 text-sm text-paper">
            <MapPin className="size-4 shrink-0 text-[var(--color-gold-300)]" aria-hidden />
            {address}
          </p>
          <p className="text-[11px] text-paper/60 tabular-nums">
            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </p>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-content-faint">
        Location shown is approximate. Exact address confirmed at viewing.
      </figcaption>
    </figure>
  );
}
