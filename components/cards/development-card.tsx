import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { Badge } from "@/components/ui/badge";
import { formatPriceCompact, cn } from "@/lib/utils";
import type { Development } from "@/types";

const STATUS_LABEL: Record<Development["status"], string> = {
  selling: "Now selling",
  "final-release": "Final release",
  forthcoming: "Forthcoming",
  completed: "Completed",
};

export function DevelopmentCard({
  development,
  className,
  sizes = "(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 92vw",
  priority,
}: {
  development: Development;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const facts = [
    { label: "From", value: formatPriceCompact(development.startingPrice) },
    { label: "Units", value: `${development.availableUnits} of ${development.totalUnits}` },
    { label: "Completion", value: development.completion },
  ];

  return (
    <article className={cn("group/dev relative flex flex-col", className)}>
      <div className="relative overflow-hidden">
        <Plate
          asset={development.hero}
          ratio="aspect-3/2"
          sizes={sizes}
          priority={priority}
          imgClassName="transition-transform duration-[1100ms] ease-[var(--ease-editorial)] group-hover/dev:scale-[1.045]"
        />
        <div className="absolute top-3.5 left-3.5 z-10">
          <Badge variant={development.status === "forthcoming" ? "overlay" : "accent"}>
            {STATUS_LABEL[development.status]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <p className="eyebrow text-content-faint">{development.developer}</p>
        <h3 className="mt-3 font-serif text-[1.75rem] leading-[1.06] tracking-[-0.03em] text-content">
          <Link
            href={`/developments/${development.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {development.name}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-content-muted">{development.location}</p>
        <p className="measure mt-4 text-sm leading-relaxed text-content-muted">
          {development.summary}
        </p>

        <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-hairline pt-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-[10px] tracking-[0.16em] text-content-faint uppercase">
                {fact.label}
              </dt>
              <dd className="mt-1.5 text-[13px] text-content tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <span className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-content uppercase">
          <span className="link-rule">Explore development</span>
          <ArrowUpRight
            className="size-3.5 transition-transform duration-500 group-hover/dev:translate-x-0.5 group-hover/dev:-translate-y-0.5"
            aria-hidden
          />
        </span>
      </div>
    </article>
  );
}
