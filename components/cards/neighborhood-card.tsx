import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { formatPriceCompact, cn } from "@/lib/utils";
import type { Neighborhood } from "@/types";

export function NeighborhoodCard({
  neighborhood,
  index,
  image,
  className,
  sizes = "(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 92vw",
  ratio = "aspect-4/5",
  priority,
}: {
  neighborhood: Neighborhood;
  index?: string;
  /** Defaults to the wide hero; pass `neighborhood.portrait` for tall frames. */
  image?: Neighborhood["hero"];
  className?: string;
  sizes?: string;
  ratio?: string;
  priority?: boolean;
}) {
  return (
    <article className={cn("group/hood relative", className)}>
      <div className="relative overflow-hidden">
        <Plate
          asset={image ?? neighborhood.hero}
          ratio={ratio}
          sizes={sizes}
          priority={priority}
          wash
          imgClassName="transition-transform duration-[1300ms] ease-[var(--ease-editorial)] group-hover/hood:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-7">
          {index ? (
            <span className="eyebrow absolute top-5 left-5 text-paper/70 tabular-nums sm:top-7 sm:left-7">
              ({index})
            </span>
          ) : null}
          <h3 className="font-serif text-[2rem] leading-[1.02] tracking-[-0.03em] text-paper sm:text-[2.5rem]">
            <Link
              href={`/neighborhoods/${neighborhood.slug}`}
              className="pointer-events-auto after:absolute after:inset-0 focus-visible:outline-none"
            >
              {neighborhood.name}
            </Link>
          </h3>
          <p className="mt-2 max-w-[32ch] text-sm leading-snug text-paper/75">
            {neighborhood.tagline}
          </p>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-paper/25 pt-4">
            <span className="text-[11px] tracking-[0.14em] text-paper/70 uppercase">
              Avg. {formatPriceCompact(neighborhood.averagePrice)}
            </span>
            <ArrowUpRight
              className="size-4 text-paper transition-transform duration-500 ease-[var(--ease-editorial)] group-hover/hood:translate-x-1 group-hover/hood:-translate-y-1"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </article>
  );
}
