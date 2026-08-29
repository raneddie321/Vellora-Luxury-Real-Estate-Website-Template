"use client";

import * as React from "react";
import { ArticleCard } from "@/components/cards/article-card";
import { EmptyState } from "@/components/ui/empty-state";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ARTICLE_CATEGORIES, type Article, type ArticleCategory } from "@/types";
import { cn } from "@/lib/utils";

/** Category filtering for the journal, kept client-side over a small set. */
export function JournalIndex({ articles }: { articles: Article[] }) {
  const [category, setCategory] = React.useState<ArticleCategory | "All">("All");
  const filtered =
    category === "All" ? articles : articles.filter((a) => a.category === category);

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const article of articles) {
      map.set(article.category, (map.get(article.category) ?? 0) + 1);
    }
    return map;
  }, [articles]);

  return (
    <>
      <nav aria-label="Article categories" className="border-y border-hairline">
        <ul className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto py-3">
          {(["All", ...ARTICLE_CATEGORIES] as const).map((item) => {
            const active = category === item;
            const count = item === "All" ? articles.length : (counts.get(item) ?? 0);
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-2 px-3.5 py-2 text-[11px] tracking-[0.16em] whitespace-nowrap uppercase transition-colors duration-300",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                    active
                      ? "bg-content text-surface"
                      : "text-content-muted hover:bg-content/[0.05] hover:text-content",
                  )}
                >
                  {item}
                  <span className="text-[10px] opacity-60 tabular-nums">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {filtered.length ? (
        <RevealGroup
          className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
          once={false}
        >
          {filtered.map((article, i) => (
            <RevealItem key={article.id}>
              <ArticleCard article={article} priority={i < 3} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <EmptyState
          className="mt-14"
          eyebrow="Nothing filed"
          title="No pieces in this category yet."
          description="We publish roughly twice a month. Try another category, or read everything."
        />
      )}
    </>
  );
}
