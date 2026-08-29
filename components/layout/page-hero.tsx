import { Plate } from "@/components/media/plate";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types";

/**
 * The standard opening for every interior page. Two variants: `image` gives a
 * full-bleed cinematic band, `plain` gives a quiet ruled masthead. Using one
 * component for both is what keeps twenty routes feeling like one site.
 */
export function PageHero({
  eyebrow,
  headline,
  supporting,
  crumbs,
  image,
  mobileImage,
  meta,
  variant = image ? "image" : "plain",
  className,
  children,
}: {
  eyebrow: string;
  headline: string[];
  supporting?: string;
  crumbs?: Crumb[];
  image?: ImageAsset;
  /** Portrait alternative used below the `sm` breakpoint. */
  mobileImage?: ImageAsset;
  meta?: { label: string; value: string }[];
  variant?: "image" | "plain";
  className?: string;
  children?: React.ReactNode;
}) {
  if (variant === "image" && image) {
    return (
      <section
        className={cn(
          "theme-dark relative isolate flex min-h-[68svh] flex-col justify-end overflow-hidden bg-ink pt-32 pb-12 text-content lg:min-h-[78svh] lg:pb-16",
          className,
        )}
      >
        <Plate
          asset={image}
          mobileAsset={mobileImage}
          className="absolute inset-0 -z-10 h-full w-full"
          sizes="100vw"
          priority
          grain
          imgClassName="object-cover"
        />
        <span
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(11,11,12,0.88),rgba(11,11,12,0.28)_48%,rgba(11,11,12,0.58))]"
        />
        <div className="shell">
          {crumbs ? (
            <Reveal>
              <Breadcrumbs items={crumbs} className="mb-8 text-paper/60" />
            </Reveal>
          ) : null}
          <Reveal>
            <p className="eyebrow rule-accent text-paper/75">{eyebrow}</p>
          </Reveal>
          <RevealLines
            as="h1"
            lines={headline}
            delay={0.05}
            className="mt-6 font-serif text-hero text-paper"
          />
          {supporting ? (
            <Reveal delay={0.16}>
              <p className="measure mt-7 text-lede text-paper/80">{supporting}</p>
            </Reveal>
          ) : null}
          {meta ? (
            <Reveal delay={0.22}>
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-paper/20 pt-6">
                {meta.map((item) => (
                  <div key={item.label}>
                    <dt className="text-[10px] tracking-[0.2em] text-paper/55 uppercase">
                      {item.label}
                    </dt>
                    <dd className="mt-1.5 text-sm text-paper tabular-nums">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ) : null}
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("bg-surface pt-32 pb-14 lg:pt-44 lg:pb-20", className)}>
      <div className="shell">
        {crumbs ? (
          <Reveal>
            <Breadcrumbs items={crumbs} className="mb-9" />
          </Reveal>
        ) : null}
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">{eyebrow}</p>
            </Reveal>
            <RevealLines
              as="h1"
              lines={headline}
              delay={0.05}
              className="mt-6 font-serif text-hero text-content"
            />
          </div>
          {supporting ? (
            <div className="md:col-span-5 md:col-start-8">
              <Reveal delay={0.14}>
                <p className="measure text-lede text-content-muted">{supporting}</p>
              </Reveal>
            </div>
          ) : null}
        </div>
        {meta ? (
          <Reveal delay={0.2}>
            <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-5 border-t border-hairline pt-6">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="text-[10px] tracking-[0.2em] text-content-faint uppercase">
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 text-sm text-content tabular-nums">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        ) : null}
        {children}
      </div>
    </section>
  );
}
