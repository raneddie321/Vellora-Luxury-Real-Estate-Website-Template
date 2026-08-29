"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { homeContent } from "@/config/content";
import { Plate } from "@/components/media/plate";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { siteConfig } from "@/config/site";
import * as React from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const facts = [
  { label: "Established", value: String(siteConfig.established) },
  { label: "Districts", value: "Six" },
  { label: "Represented", value: "€2.4B+" },
];

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // The image drifts and grows a little; the type leaves faster than the image.
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-24%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);

  const { hero } = homeContent;

  return (
    <section
      ref={ref}
      aria-label="Introduction"
      className="theme-dark relative h-[100svh] min-h-[38rem] w-full overflow-hidden bg-ink text-content"
    >
      <motion.div
        style={reduce ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0 will-change-transform"
      >
        <Plate
          asset={hero.image}
          mobileAsset={hero.mobileImage}
          className="h-full w-full"
          sizes="100vw"
          priority
          grain
          imgClassName="object-cover"
        />
      </motion.div>

      {/* Two gradients rather than one: the type needs a floor, the eyebrow a ceiling. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,11,12,0.62)_0%,rgba(11,11,12,0.12)_28%,rgba(11,11,12,0.18)_52%,rgba(11,11,12,0.86)_100%)]"
      />

      {/* Hairline column grid — the architectural signature, barely visible. */}
      <div aria-hidden className="shell pointer-events-none absolute inset-0">
        <div className="grid h-full grid-cols-4 lg:grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`h-full border-l border-paper/[0.05] ${i >= 4 ? "hidden lg:block" : ""}`}
            />
          ))}
        </div>
      </div>

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex h-full flex-col"
      >
        <div className="shell flex flex-1 flex-col justify-end pb-8 sm:pb-14">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: EASE }}
            className="eyebrow rule-accent text-paper/70"
          >
            {hero.eyebrow}
          </motion.p>

          <h1 className="mt-7 font-serif text-hero text-paper">
            {hero.headline.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block will-change-transform"
                  initial={{ y: reduce ? 0 : "108%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.42 + i * 0.1, duration: 1.25, ease: EASE }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <div className="mt-9 grid gap-8 md:grid-cols-12 md:items-end">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78, duration: 0.9, ease: EASE }}
              className="measure text-lede text-paper/80 md:col-span-6 lg:col-span-5"
            >
              {hero.supporting}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.88, duration: 0.9, ease: EASE }}
              className="flex flex-wrap items-center gap-3 md:col-span-6 md:justify-end lg:col-span-7"
            >
              <Magnetic>
                <Button asChild size="lg" variant="inverse">
                  <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button asChild size="lg" variant="outline" className="border-paper/40 text-paper">
                  <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
                </Button>
              </Magnetic>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 1 }}
          className="shell border-t border-paper/20"
        >
          <div className="flex items-center justify-between gap-6 py-4 sm:py-5">
            <a
              href="#collection"
              className="group inline-flex items-center gap-3 text-[10px] tracking-[0.22em] text-paper/80 uppercase transition-colors hover:text-paper"
            >
              <span className="relative flex h-7 w-px overflow-hidden bg-paper/25 sm:h-9">
                <motion.span
                  className="absolute inset-x-0 top-0 h-3 bg-paper"
                  animate={reduce ? undefined : { y: ["-100%", "300%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
              {hero.scrollLabel}
              <ArrowDown className="size-3 transition-transform duration-500 group-hover:translate-y-0.5" aria-hidden />
            </a>

            <dl className="hidden gap-10 sm:flex">
              {facts.map((fact) => (
                <div key={fact.label} className="text-right">
                  <dt className="text-[10px] tracking-[0.2em] text-paper/60 uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm text-paper tabular-nums">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
