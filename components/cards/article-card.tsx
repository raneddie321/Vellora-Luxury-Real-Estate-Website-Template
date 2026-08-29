import Link from "next/link";
import { Plate } from "@/components/media/plate";
import { formatDate, cn } from "@/lib/utils";
import type { Article } from "@/types";

export function ArticleCard({
  article,
  className,
  sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw",
  ratio = "aspect-4/3",
  priority,
}: {
  article: Article;
  className?: string;
  sizes?: string;
  ratio?: string;
  priority?: boolean;
}) {
  return (
    <article className={cn("group/article relative flex flex-col", className)}>
      <div className="relative overflow-hidden">
        <Plate
          asset={article.hero}
          ratio={ratio}
          sizes={sizes}
          priority={priority}
          imgClassName="transition-transform duration-[1100ms] ease-[var(--ease-editorial)] group-hover/article:scale-[1.045]"
        />
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <p className="eyebrow flex flex-wrap items-center gap-x-2.5 gap-y-1 text-content-faint">
          <span className="text-[var(--accent)]">{article.category}</span>
          <span aria-hidden className="h-px w-3 bg-hairline-strong" />
          <time dateTime={article.publishedAt} className="normal-case tracking-[0.1em]">
            {formatDate(article.publishedAt, "short")}
          </time>
          <span aria-hidden className="h-px w-3 bg-hairline-strong" />
          <span className="normal-case tracking-[0.1em]">{article.readingTime} min read</span>
        </p>
        <h3 className="mt-3.5 font-serif text-[1.65rem] leading-[1.1] tracking-[-0.028em] text-content">
          <Link
            href={`/journal/${article.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {article.title}
          </Link>
        </h3>
        <p className="measure mt-3 text-sm leading-relaxed text-content-muted">
          {article.standfirst}
        </p>
        <p className="mt-auto pt-5 text-xs text-content-faint">
          {article.author} · {article.authorRole}
        </p>
      </div>
    </article>
  );
}
