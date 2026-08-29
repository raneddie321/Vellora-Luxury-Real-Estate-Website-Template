"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import { homeContent } from "@/config/content";
import { ordinal } from "@/lib/utils";
import type { Testimonial } from "@/types";

/**
 * No cards. One quote at display size, changed by an index list on the right —
 * the way a printed piece would carry testimony.
 */
export function TestimonialsSection({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = React.useState(0);
  const current = items[index];

  const go = React.useCallback(
    (next: number) => setIndex((next + items.length) % items.length),
    [items.length],
  );

  if (!current) return null;

  return (
    <section className="section-y bg-surface" aria-labelledby="testimonials-heading">
      <div className="shell">
        <Reveal>
          <p className="eyebrow rule-accent text-[var(--accent)]">
            {homeContent.testimonials.eyebrow}
          </p>
        </Reveal>
        <RevealLines
          as="h2"
          id="testimonials-heading"
          lines={[...homeContent.testimonials.headline]}
          delay={0.05}
          className="mt-6 font-serif text-title text-content"
        />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="min-h-[18rem] sm:min-h-[20rem]">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={current.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <blockquote>
                    <p className="font-serif text-[1.8rem] leading-[1.18] tracking-[-0.028em] text-content sm:text-[2.4rem] lg:text-[2.9rem]">
                      <span aria-hidden className="text-[var(--accent)]">
                        “
                      </span>
                      {current.quote}
                      <span aria-hidden className="text-[var(--accent)]">
                        ”
                      </span>
                    </p>
                  </blockquote>
                  <figcaption className="mt-9 flex flex-wrap items-baseline gap-x-4 gap-y-1.5 border-t border-hairline pt-6">
                    <span className="text-base text-content">{current.name}</span>
                    <span className="text-sm text-content-muted">{current.role}</span>
                    <span aria-hidden className="h-px w-4 bg-hairline-strong" />
                    <span className="text-[11px] tracking-[0.16em] text-content-faint uppercase">
                      {current.location}
                    </span>
                    {current.propertyReference ? (
                      <span className="text-[11px] tracking-[0.16em] text-content-faint uppercase">
                        · {current.propertyReference}
                      </span>
                    ) : null}
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous testimonial"
                className="inline-flex size-11 items-center justify-center border border-hairline text-content transition-colors hover:border-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next testimonial"
                className="inline-flex size-11 items-center justify-center border border-hairline text-content transition-colors hover:border-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <ArrowRight className="size-4" aria-hidden />
              </button>
              <span className="ml-3 text-xs text-content-faint tabular-nums">
                {ordinal(index)} / {ordinal(items.length - 1)}
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 xl:col-span-3 xl:col-start-10">
            <ul className="border-t border-hairline">
              {items.map((testimonial, i) => (
                <li key={testimonial.id}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-current={i === index}
                    className="group flex w-full items-baseline gap-4 border-b border-hairline py-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <span
                      className={`eyebrow tabular-nums transition-colors ${
                        i === index ? "text-[var(--accent)]" : "text-content-faint"
                      }`}
                    >
                      {ordinal(i)}
                    </span>
                    <span
                      className={`flex-1 text-sm transition-colors ${
                        i === index ? "text-content" : "text-content-muted group-hover:text-content"
                      }`}
                    >
                      {testimonial.name}
                    </span>
                    <span
                      aria-hidden
                      className={`h-px transition-all duration-500 ease-[var(--ease-editorial)] ${
                        i === index ? "w-8 bg-[var(--accent)]" : "w-3 bg-hairline-strong"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
