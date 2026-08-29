import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Plate } from "@/components/media/plate";
import { JournalIndex } from "@/components/journal/journal-index";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { sortedArticles } from "@/data/articles";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "The Journal",
  description:
    "Essays on architecture, market analysis with the workings shown, and practical guidance on buying, selling and living in Marivane.",
  path: "/journal",
  image: "editorial-01",
});

export default function JournalPage() {
  const [lead, ...rest] = sortedArticles;
  if (!lead) return null;

  return (
    <>
      <PageHero
        eyebrow="The Journal"
        headline={["Notes from", "the market."]}
        supporting="Twelve pieces on architecture, prices, interiors and the practical business of moving. Written by the advisors, not by a content team."
        crumbs={[{ label: "Home", href: "/" }, { label: "Journal" }]}
        variant="plain"
      />

      <section className="bg-surface pb-16 lg:pb-24">
        <div className="shell">
          <Reveal>
            <article className="group/lead relative grid gap-8 border-t border-hairline pt-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <div className="overflow-hidden">
                  <Plate
                    asset={lead.hero}
                    ratio="aspect-3/2"
                    sizes="(min-width: 1024px) 56vw, 92vw"
                    priority
                    imgClassName="transition-transform duration-[1300ms] ease-[var(--ease-editorial)] group-hover/lead:scale-[1.045]"
                  />
                </div>
              </div>
              <div className="lg:col-span-5 lg:self-center">
                <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-content-faint">
                  <span className="text-[var(--accent)]">{lead.category}</span>
                  <span aria-hidden className="h-px w-4 bg-hairline-strong" />
                  <time dateTime={lead.publishedAt} className="normal-case tracking-[0.1em]">
                    {formatDate(lead.publishedAt)}
                  </time>
                  <span aria-hidden className="h-px w-4 bg-hairline-strong" />
                  <span className="normal-case tracking-[0.1em]">{lead.readingTime} min read</span>
                </p>
                <h2 className="mt-5 font-serif text-heading leading-[1.02] tracking-[-0.035em] text-content">
                  <Link
                    href={`/journal/${lead.slug}`}
                    className="after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {lead.title}
                  </Link>
                </h2>
                <p className="measure mt-5 text-lede text-content-muted">{lead.standfirst}</p>
                <p className="mt-7 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-content uppercase">
                  <span className="link-rule">Read the piece</span>
                  <ArrowUpRight
                    className="size-3.5 transition-transform duration-500 group-hover/lead:translate-x-1 group-hover/lead:-translate-y-1"
                    aria-hidden
                  />
                </p>
                <p className="mt-8 border-t border-hairline pt-5 text-xs text-content-faint">
                  {lead.author} · {lead.authorRole}
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell">
          <JournalIndex articles={rest} />
        </div>
      </section>

      <CtaBand
        eyebrow="The list"
        headline={["Market notes,", "twice a month."]}
        supporting="One email a fortnight with new instructions, off-market notices and whichever piece we have just published."
        primary={{ label: "Join the list", href: "/contact" }}
        secondary={{ label: "Browse properties", href: "/properties" }}
        image={img("cinema-05", "A coastal district at first light")}
      />
    </>
  );
}
