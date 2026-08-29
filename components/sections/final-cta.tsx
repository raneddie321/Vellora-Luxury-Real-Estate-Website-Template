import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import { homeContent } from "@/config/content";

export function FinalCta() {
  const { finalCta } = homeContent;

  return (
    <section
      className="theme-dark relative isolate overflow-hidden bg-ink text-content"
      aria-labelledby="final-cta-heading"
    >
      <Plate
        asset={finalCta.image}
        mobileAsset={finalCta.mobileImage}
        className="absolute inset-0 -z-10 h-full w-full"
        sizes="100vw"
        grain
        imgClassName="object-cover"
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(11,11,12,0.9),rgba(11,11,12,0.5)_55%,rgba(11,11,12,0.72))]"
      />

      <div className="shell relative flex min-h-[80svh] flex-col justify-end py-20 lg:min-h-[92svh] lg:py-28">
        <Reveal>
          <p className="eyebrow rule-accent text-paper/70">{finalCta.eyebrow}</p>
        </Reveal>

        <RevealLines
          as="h2"
          id="final-cta-heading"
          lines={[...finalCta.headline]}
          delay={0.06}
          className="mt-7 font-serif text-hero text-paper"
        />

        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <Reveal delay={0.16} className="md:col-span-5">
            <p className="measure text-lede text-paper/80">{finalCta.supporting}</p>
          </Reveal>

          <Reveal delay={0.22} className="flex flex-wrap items-center gap-3 md:col-span-6 md:col-start-7 md:justify-end">
            <Magnetic>
              <Button asChild size="xl" variant="inverse">
                <Link href={finalCta.primaryCta.href}>
                  {finalCta.primaryCta.label}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild size="xl" variant="outline" className="border-paper/40 text-paper">
                <Link href={finalCta.secondaryCta.href}>{finalCta.secondaryCta.label}</Link>
              </Button>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
