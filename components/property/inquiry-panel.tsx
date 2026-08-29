"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/property/favorite-button";
import { CompareToggle } from "@/components/property/compare-toggle";
import { formatPrice, formatRent } from "@/lib/utils";
import type { Agent, Property } from "@/types";

/**
 * Sticky on desktop, inline at the foot of the content on mobile — where a
 * fixed bar would cover the thing the visitor is reading.
 */
export function InquiryPanel({ property, agent }: { property: Property; agent?: Agent }) {
  const price =
    property.listing === "rent"
      ? formatRent(property.price, property.pricePeriod ?? "month")
      : formatPrice(property.price);

  return (
    <div className="border border-hairline bg-surface-raised p-6 shadow-[var(--shadow-plate)] lg:p-7">
      <p className="eyebrow text-content-faint">Interested in this property?</p>
      <p className="mt-4 font-serif text-3xl tracking-[-0.03em] text-content tabular-nums">
        {price}
      </p>
      {property.priceQualifier ? (
        <p className="mt-1.5 text-xs text-content-faint">{property.priceQualifier}</p>
      ) : null}

      <div className="mt-6 space-y-2.5">
        <Button asChild size="lg" className="w-full">
          <Link href={`/book-a-viewing?property=${property.slug}`}>Book a Viewing</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href={agent ? `/agents/${agent.slug}#contact` : "/contact"}>Contact Agent</Link>
        </Button>
      </div>

      <div className="mt-4 flex gap-2.5">
        <FavoriteButton
          propertyId={property.id}
          propertyName={property.name}
          tone="plain"
          className="flex-1"
        />
        <CompareToggle
          propertyId={property.id}
          propertyName={property.name}
          withLabel
          className="flex-1"
        />
      </div>

      {agent ? (
        <div className="mt-7 border-t border-hairline pt-6">
          <div className="flex items-center gap-4">
            <Plate
              asset={agent.portrait}
              className="w-16 shrink-0"
              ratio="aspect-4/5"
              sizes="64px"
            />
            <div className="min-w-0">
              <p className="truncate text-base text-content">
                <Link href={`/agents/${agent.slug}`} className="link-rule">
                  {agent.name}
                </Link>
              </p>
              <p className="mt-0.5 truncate text-xs text-content-muted">{agent.title}</p>
              <p className="mt-1.5 text-[11px] tracking-[0.14em] text-content-faint uppercase">
                {agent.location}
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <a
              href={`tel:${agent.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2.5 text-content-muted transition-colors hover:text-content"
            >
              <Phone className="size-3.5 shrink-0 text-content-faint" aria-hidden />
              {agent.phone}
            </a>
            <a
              href={`mailto:${agent.email}`}
              className="flex items-center gap-2.5 break-all text-content-muted transition-colors hover:text-content"
            >
              <Mail className="size-3.5 shrink-0 text-content-faint" aria-hidden />
              {agent.email}
            </a>
          </div>
        </div>
      ) : null}

      <p className="mt-6 border-t border-hairline pt-5 text-[11px] leading-relaxed text-content-faint">
        Reference {property.reference}. All viewings are accompanied and by appointment.
      </p>
    </div>
  );
}
