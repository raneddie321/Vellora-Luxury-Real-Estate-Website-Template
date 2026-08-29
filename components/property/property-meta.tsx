import { Bath, BedDouble, Car, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { areaUnitLabel, formatNumber } from "@/lib/utils";
import type { Property } from "@/types";

const AREA_FACTOR = areaUnitLabel === "m²" ? 1 : 10.7639;

/** Beds · baths · area, in one consistent row. Used on cards and detail pages. */
export function PropertyMeta({
  property,
  className,
  showParking = false,
  size = "sm",
}: {
  property: Property;
  className?: string;
  showParking?: boolean;
  size?: "sm" | "md";
}) {
  const isLand = property.type === "Land";
  const items = [
    !isLand && {
      icon: BedDouble,
      value: property.bedrooms,
      label: property.bedrooms === 1 ? "bed" : "beds",
    },
    !isLand && {
      icon: Bath,
      value: property.bathrooms,
      label: property.bathrooms === 1 ? "bath" : "baths",
    },
    {
      icon: Maximize,
      value: formatNumber(Math.round(property.area * AREA_FACTOR)),
      label: areaUnitLabel,
    },
    showParking &&
      property.parking > 0 && {
        icon: Car,
        value: property.parking,
        label: property.parking === 1 ? "space" : "spaces",
      },
  ].filter(Boolean) as { icon: React.ElementType; value: string | number; label: string }[];

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center",
        size === "sm" ? "gap-x-4 gap-y-1.5 text-xs" : "gap-x-7 gap-y-2 text-sm",
        className,
      )}
    >
      {items.map((item, i) => (
        <li key={item.label + i} className="flex items-center gap-1.5 text-content-muted">
          <item.icon
            className={cn("shrink-0 text-content-faint", size === "sm" ? "size-3.5" : "size-4")}
            aria-hidden
          />
          <span className="tabular-nums text-content">{item.value}</span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
