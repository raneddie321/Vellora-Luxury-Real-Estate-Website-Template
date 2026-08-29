import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { ArticleCard } from "@/components/cards/article-card";
import { SectionHeader } from "@/components/sections/section-header";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { homeContent } from "@/config/content";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types";

/** One lead piece across seven columns, three secondaries stacked beside it. */
export function JournalSection({ items }: { items: Article[] }) {
  const [lead, ...rest] = items;
  if (!lead) return null;

  return (
    <section className="section-y bg-surface-sunken" aria-labelledby="journal-heading">
      <div className="shell">
        <SectionHeader
          eyebrow={homeContent.journal.eyebrow}
          headline={homeContent.journal.headline}
          supporting={homeContent.journal.supporting}
          cta={homeContent.journal.cta}
        />

        <div className="mt-14 grid gap-x-8 gap-y-12 lg:mt-20 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <article className="group/lead relative">
              <div className="relative overflow-hidden">
                <Plate
                  asset={lead.hero}
                  ratio="aspect-4/3"
                  sizes="(min-width: 1024px) 56vw, 92vw"
                  imgClassName="transition-transform duration-[1300ms] ease-[var(--ease-editorial)] group-hover/lead:scale-[1.05]"
                />
              </div>
              <p className="eyebrow mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-content-faint">
                <span className="text-[var(--accent)]">{lead.category}</span>
                <span aria-hidden className="h-px w-4 bg-hairline-strong" />
                <time dateTime={lead.publishedAt} className="normal-case tracking-[0.1em]">
                  {formatDate(lead.publishedAt)}
                </time>
                <span aria-hidden className="h-px w-4 bg-hairline-strong" />
                <span className="normal-case tracking-[0.1em]">{lead.readingTime} min read</span>
              </p>
              <h3 className="mt-4 font-serif text-heading leading-[1.03] tracking-[-0.032em] text-content">
                <Link
                  href={`/journal/${lead.slug}`}
                  className="after:absolute after:inset-0 focus-visible:outline-none"
                >
                  {lead.title}
                </Link>
              </h3>
              <p className="measure mt-4 text-lede text-content-muted">{lead.standfirst}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-content uppercase">
                <span className="link-rule">Read the piece</span>
                <ArrowUpRight
                  className="size-3.5 transition-transform duration-500 group-hover/lead:translate-x-1 group-hover/lead:-translate-y-1"
                  aria-hidden
                />
              </p>
            </article>
          </Reveal>

          <RevealGroup className="lg:col-span-4 lg:col-start-9">
            <ul className="divide-y divide-[color:var(--hairline)] border-t border-hairline">
              {rest.map((article) => (
                <RevealItem key={article.id} className="py-7 first:pt-7">
                  <article className="group/item relative">
                    <p className="eyebrow flex flex-wrap items-center gap-x-2.5 gap-y-1 text-content-faint">
                      <span className="text-[var(--accent)]">{article.category}</span>
                      <span aria-hidden className="h-px w-3 bg-hairline-strong" />
                      <time dateTime={article.publishedAt} className="normal-case tracking-[0.1em]">
                        {formatDate(article.publishedAt, "short")}
                      </time>
                    </p>
                    <h3 className="mt-3 font-serif text-2xl leading-[1.1] tracking-[-0.025em] text-content transition-colors group-hover/item:text-content-muted">
                      <Link
                        href={`/journal/${article.slug}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-content-muted">
                      {article.standfirst}
                    </p>
                  </article>
                </RevealItem>
              ))}
            </ul>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

export { ArticleCard };
