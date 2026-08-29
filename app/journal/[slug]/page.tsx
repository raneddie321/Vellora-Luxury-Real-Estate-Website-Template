import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, articleBySlug, sortedArticles } from "@/data/articles";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Plate, PlateBlock } from "@/components/media/plate";
import { ArticleCard } from "@/components/cards/article-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { newsletterContent } from "@/config/content";
import { formatDate, initials } from "@/lib/utils";
import type { ArticleBlock } from "@/types";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return buildMetadata({ title: "Article not found", noIndex: true });
  return buildMetadata({
    title: article.title,
    description: article.standfirst,
    path: `/journal/${article.slug}`,
    image: article.hero.key,
    type: "article",
    publishedTime: article.publishedAt,
    authors: [article.author],
  });
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading":
      return <h2>{block.text}</h2>;
    case "subheading":
      return <h3>{block.text}</h3>;
    case "quote":
      return (
        <blockquote>
          {block.text}
          {block.attribution ? (
            <footer className="mt-4 text-sm tracking-[0.08em] text-content-faint not-italic">
              — {block.attribution}
            </footer>
          ) : null}
        </blockquote>
      );
    case "list":
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "image":
      return (
        <figure>
          <PlateBlock asset={block.image} sizes="(min-width: 1024px) 62vw, 92vw" />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );
    case "stat":
      return (
        <aside className="my-12 border-y border-hairline py-8 text-center">
          <p className="font-serif text-[3.5rem] leading-none tracking-[-0.04em] text-content tabular-nums">
            {block.value}
          </p>
          <p className="mx-auto mt-4 max-w-sm text-sm text-content-muted">{block.label}</p>
        </aside>
      );
    default:
      return <p>{block.text}</p>;
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  const related = sortedArticles
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      const score = (item: typeof a) =>
        (item.category === article.category ? 2 : 0) +
        (item.tags.some((tag) => article.tags.includes(tag)) ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.standfirst,
    datePublished: article.publishedAt,
    author: { "@type": "Person", name: article.author, jobTitle: article.authorRole },
    articleSection: article.category,
    keywords: article.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Journal", path: "/journal" },
              { name: article.title, path: `/journal/${article.slug}` },
            ]),
          ),
        }}
      />

      <article>
        <header className="bg-surface pt-28 pb-12 lg:pt-36">
          <div className="shell">
            <Reveal>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Journal", href: "/journal" },
                  { label: article.category, href: "/journal" },
                ]}
              />
            </Reveal>
            <div className="mx-auto mt-10 max-w-4xl">
              <Reveal>
                <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-content-faint">
                  <span className="text-[var(--accent)]">{article.category}</span>
                  <span aria-hidden className="h-px w-4 bg-hairline-strong" />
                  <time dateTime={article.publishedAt} className="normal-case tracking-[0.1em]">
                    {formatDate(article.publishedAt)}
                  </time>
                  <span aria-hidden className="h-px w-4 bg-hairline-strong" />
                  <span className="normal-case tracking-[0.1em]">
                    {article.readingTime} min read
                  </span>
                </p>
              </Reveal>
              <Reveal delay={0.06}>
                <h1 className="mt-7 font-serif text-title text-content">{article.title}</h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="measure mt-7 text-lede text-content-muted">{article.standfirst}</p>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="mt-9 flex items-center gap-4 border-t border-hairline pt-6">
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center border border-hairline text-[11px] tracking-[0.1em] text-content-muted"
                  >
                    {initials(article.author)}
                  </span>
                  <div>
                    <p className="text-sm text-content">{article.author}</p>
                    <p className="text-xs text-content-faint">{article.authorRole}</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </header>

        <div className="bg-surface pb-14">
          <div className="shell">
            <Reveal>
              <Plate
                asset={article.hero}
                ratio="aspect-4/3 sm:aspect-video"
                sizes="100vw"
                priority
                grain
              />
            </Reveal>
          </div>
        </div>

        <div className="bg-surface pb-20 lg:pb-28">
          <div className="shell">
            <div className="prose-editorial mx-auto max-w-[46rem]">
              {article.body.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>

            <div className="mx-auto mt-14 max-w-[46rem] border-t border-hairline pt-7">
              <p className="eyebrow text-content-faint">Filed under</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <li
                    key={tag}
                    className="border border-hairline px-2.5 py-1 text-[11px] tracking-[0.1em] text-content-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </article>

      <section className="theme-dark section-y-sm bg-surface text-content">
        <div className="shell">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="eyebrow text-[var(--accent)]">{newsletterContent.eyebrow}</p>
              <h2 className="mt-5 font-serif text-4xl leading-[1.02] tracking-[-0.035em]">
                {newsletterContent.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-content-muted">
                {newsletterContent.description}
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <h2 className="font-serif text-title text-content">Related reading</h2>
            </Reveal>
            <Reveal delay={0.06}>
              <Link
                href="/journal"
                className="link-rule text-[11px] tracking-[0.18em] text-content uppercase"
              >
                All pieces
              </Link>
            </Reveal>
          </div>
          <RevealGroup className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <RevealItem key={item.id}>
                <ArticleCard article={item} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
