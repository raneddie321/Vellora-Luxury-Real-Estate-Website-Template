"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InputBoxed } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { FAQ_CATEGORIES, type Faq, type FaqCategory } from "@/types";
import { cn } from "@/lib/utils";

/** Category rail plus a keyword filter over the whole question set. */
export function FaqBrowser({ faqs }: { faqs: Faq[] }) {
  const [category, setCategory] = React.useState<FaqCategory | "All">("All");
  const [query, setQuery] = React.useState("");

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const faq of faqs) map.set(faq.category, (map.get(faq.category) ?? 0) + 1);
    return map;
  }, [faqs]);

  const filtered = React.useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return faqs.filter((faq) => {
      if (category !== "All" && faq.category !== category) return false;
      if (!terms.length) return true;
      const haystack = `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [faqs, category, query]);

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <label htmlFor="faq-search" className="eyebrow block text-content-faint">
            Search questions
          </label>
          <InputBoxed
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Deposit, survey, service charge…"
            className="mt-3"
          />

          <nav aria-label="FAQ categories" className="mt-8">
            <ul className="border-t border-hairline">
              {(["All", ...FAQ_CATEGORIES] as const).map((item) => {
                const active = category === item;
                const count = item === "All" ? faqs.length : (counts.get(item) ?? 0);
                return (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => setCategory(item)}
                      aria-current={active}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 border-b border-hairline py-3.5 text-left text-sm transition-colors",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)]",
                        active ? "text-content" : "text-content-muted hover:text-content",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className={cn(
                            "h-px transition-all duration-500 ease-[var(--ease-editorial)]",
                            active ? "w-6 bg-[var(--accent)]" : "w-2.5 bg-hairline-strong",
                          )}
                        />
                        {item}
                      </span>
                      <span className="text-xs text-content-faint tabular-nums">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:col-span-7 lg:col-start-6">
        <p className="mb-2 text-sm text-content-faint" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "question" : "questions"}
        </p>
        {filtered.length ? (
          <Accordion type="single" collapsible className="border-t border-hairline">
            {filtered.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>
                  <span className="block">
                    <span className="eyebrow mb-2 block text-content-faint">{faq.category}</span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <EmptyState
            eyebrow="No match"
            title="We have not answered that one yet."
            description="Try a different word, or ask us directly — the answer usually arrives the same day."
          />
        )}
      </div>
    </div>
  );
}
