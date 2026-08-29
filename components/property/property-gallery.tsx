"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types";

/**
 * Lead image plus a mosaic, and a full-screen viewer with real keyboard
 * support: arrows move, Escape closes, and the active thumbnail is announced.
 */
export function PropertyGallery({
  images,
  title,
}: {
  images: ImageAsset[];
  title: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const lead = images[0];
  const mosaic = images.slice(1, 5);
  const active = images[index];

  const go = React.useCallback(
    (next: number) => setIndex((next + images.length) % images.length),
    [images.length],
  );

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, go]);

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  if (!lead || !active) return null;

  return (
    <>
      <div className="grid gap-2 md:grid-cols-12">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="group relative block md:col-span-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          <Plate
            asset={lead}
            ratio="aspect-4/3 md:aspect-3/2"
            sizes="(min-width: 768px) 66vw, 100vw"
            priority
            imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
          />
          <span className="pointer-events-none absolute right-4 bottom-4 inline-flex items-center gap-2 bg-ink/60 px-3.5 py-2 text-[10px] tracking-[0.18em] text-paper uppercase backdrop-blur-[2px]">
            <Expand className="size-3.5" aria-hidden />
            View all {images.length}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2 md:col-span-4 md:grid-cols-1">
          {mosaic.map((image, i) => (
            <button
              key={image.key + i}
              type="button"
              onClick={() => openAt(i + 1)}
              className="group relative block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <Plate
                asset={image}
                ratio="aspect-4/3"
                sizes="(min-width: 768px) 32vw, 46vw"
                imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
              />
              <span className="sr-only">Open image {i + 2}</span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent layout="full" hideClose className="flex flex-col">
          <DialogTitle className="sr-only">{title} — image gallery</DialogTitle>

          <div className="theme-dark flex items-center justify-between px-5 py-4 text-content sm:px-8">
            <p className="eyebrow text-paper/70 tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </p>
            <p className="hidden truncate px-6 text-sm text-paper/70 sm:block">{title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="-mr-2 inline-flex size-11 items-center justify-center text-paper/70 transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <X className="size-5" aria-hidden />
              <span className="sr-only">Close gallery</span>
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 sm:px-16">
            <Plate
              asset={active}
              className="h-full max-h-[70svh] w-full"
              sizes="100vw"
              imgClassName="object-contain"
            />
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
              className="absolute left-2 inline-flex size-12 items-center justify-center border border-paper/25 bg-ink/40 text-paper transition-colors hover:bg-ink/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:left-4"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next image"
              className="absolute right-2 inline-flex size-12 items-center justify-center border border-paper/25 bg-ink/40 text-paper transition-colors hover:bg-ink/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:right-4"
            >
              <ArrowRight className="size-5" aria-hidden />
            </button>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-5 sm:px-8">
            {images.map((image, i) => (
              <button
                key={image.key + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative w-24 shrink-0 transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:w-32",
                  i === index ? "opacity-100" : "opacity-45 hover:opacity-80",
                )}
              >
                <Plate asset={image} ratio="aspect-4/3" sizes="128px" />
                {i === index ? (
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-gold-300)]" />
                ) : null}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
