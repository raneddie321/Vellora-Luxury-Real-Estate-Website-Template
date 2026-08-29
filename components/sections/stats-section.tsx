"use client";

import { Counter } from "@/components/motion/counter";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import { homeContent } from "@/config/content";
import { ordinal } from "@/lib/utils";

export function StatsSection() {
  const { stats } = homeContent;

  return (
    <section className="theme-dark section-y bg-surface text-content" aria-labelledby="stats-heading">
      <div className="shell">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">{stats.eyebrow}</p>
            </Reveal>
            <RevealLines
              as="h2"
              id="stats-heading"
              lines={[...stats.headline]}
              delay={0.05}
              className="mt-6 font-serif text-title"
            />
          </div>
        </div>

        <dl className="mt-14 grid border-t border-hairline sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {stats.items.map((item, i) => (
            <Reveal
              key={item.label}
              delay={i * 0.08}
              className="border-b border-hairline py-9 lg:border-r lg:px-8 lg:last:border-r-0 lg:first:pl-0"
            >
              <dt className="eyebrow text-content-faint tabular-nums">({ordinal(i)})</dt>
              <dd className="mt-6">
                <span className="block font-serif text-[3.25rem] leading-none tracking-[-0.04em] tabular-nums sm:text-[4rem] lg:text-[4.5rem]">
                  <Counter
                    value={item.value}
                    prefix={item.prefix}
                    suffix={item.suffix}
                    decimals={item.decimals}
                  />
                </span>
                <span className="mt-5 block max-w-[24ch] text-sm leading-snug text-content-muted">
                  {item.label}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
