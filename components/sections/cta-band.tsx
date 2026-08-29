import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import { Plate } from "@/components/media/plate";
import type { ImageAsset } from "@/types";

/** The closing invitation used at the foot of most interior pages. */
export function CtaBand({
  eyebrow = "Next",
  headline,
  supporting,
  primary,
  secondary,
  image,
  mobileImage,
}: {
  eyebrow?: string;
  headline: string[];
  supporting?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  image?: ImageAsset;
  mobileImage?: ImageAsset;
}) {
  return (
    <section className="theme-dark relative isolate overflow-hidden bg-ink text-content">
      {image ? (
        <>
          <Plate
            asset={image}
            mobileAsset={mobileImage}
            className="absolute inset-0 -z-10 h-full w-full"
            sizes="100vw"
            grain
            imgClassName="object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(11,11,12,0.92),rgba(11,11,12,0.68)_58%,rgba(11,11,12,0.84))]"
          />
        </>
      ) : null}
      <div className="shell section-y">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">{eyebrow}</p>
            </Reveal>
            <RevealLines
              as="h2"
              lines={headline}
              delay={0.05}
              className="mt-6 font-serif text-title text-paper"
            />
            {supporting ? (
              <Reveal delay={0.14}>
                <p className="measure mt-6 text-lede text-paper/75">{supporting}</p>
              </Reveal>
            ) : null}
          </div>
          <Reveal
            delay={0.2}
            className="flex flex-wrap items-center gap-3 md:col-span-5 md:col-start-8 md:justify-end"
          >
            <Magnetic>
              <Button asChild size="lg" variant="inverse">
                <Link href={primary.href}>
                  {primary.label}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </Magnetic>
            {secondary ? (
              <Magnetic>
                <Button asChild size="lg" variant="outline" className="border-paper/40 text-paper">
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              </Magnetic>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
