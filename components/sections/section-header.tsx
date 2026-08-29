import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * Every section on the site opens the same way: a champagne eyebrow, a
 * serif headline set in lines that rise from behind a mask, and an optional
 * supporting paragraph offset into the right-hand columns.
 */
export function SectionHeader({
  eyebrow,
  headline,
  supporting,
  cta,
  align = "split",
  className,
  as = "h2",
}: {
  eyebrow: string;
  headline: readonly string[] | string[];
  supporting?: string;
  cta?: { label: string; href: string };
  align?: "split" | "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={cn(
        align === "split" && "grid gap-8 md:grid-cols-12 md:items-end",
        align === "center" && "mx-auto max-w-3xl text-center",
        className,
      )}
    >
      <div className={cn(align === "split" && "md:col-span-6 lg:col-span-7")}>
        <Reveal>
          <p
            className={cn(
              "eyebrow text-[var(--accent)]",
              align !== "center" && "rule-accent",
            )}
          >
            {eyebrow}
          </p>
        </Reveal>
        <RevealLines
          as={as}
          lines={[...headline]}
          delay={0.06}
          className="mt-6 font-serif text-title text-content"
        />
      </div>

      {supporting || cta ? (
        <div
          className={cn(
            align === "split" && "md:col-span-5 md:col-start-8",
            align === "center" && "mt-6",
          )}
        >
          {supporting ? (
            <Reveal delay={0.14}>
              <p className="measure text-lede text-content-muted">{supporting}</p>
            </Reveal>
          ) : null}
          {cta ? (
            <Reveal delay={0.2}>
              <Link
                href={cta.href}
                className="group mt-7 inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.18em] text-content uppercase"
              >
                <span className="link-rule">{cta.label}</span>
                <ArrowRight
                  className="size-4 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1.5"
                  aria-hidden
                />
              </Link>
            </Reveal>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** The hairline + index numeral that separates full-bleed sections. */
export function SectionRule({ index, label }: { index: string; label?: string }) {
  return (
    <div className="shell">
      <div className="flex items-center gap-5 border-t border-hairline pt-5">
        <span className="eyebrow text-content-faint tabular-nums">({index})</span>
        {label ? <span className="eyebrow text-content-faint">{label}</span> : null}
      </div>
    </div>
  );
}
