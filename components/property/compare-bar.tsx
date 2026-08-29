"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useCollections } from "@/components/providers/collection-provider";
import { properties } from "@/data/properties";
import { Plate } from "@/components/media/plate";

/**
 * A persistent tray listing whatever is queued for comparison. It hides itself
 * on /compare, where it would only be repeating the page.
 */
export function CompareBar() {
  const { compare, removeCompare, clearCompare, ready } = useCollections();
  const pathname = usePathname();
  const selected = compare
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is (typeof properties)[number] => Boolean(p));

  const visible = ready && selected.length > 0 && pathname !== "/compare";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="theme-dark fixed inset-x-0 bottom-0 z-[70] border-t border-hairline bg-surface/95 text-content backdrop-blur-xl"
        >
          <div className="shell flex items-center gap-4 py-3.5">
            <p className="eyebrow hidden shrink-0 text-content-faint sm:block">
              Comparing
            </p>
            <ul className="no-scrollbar flex flex-1 items-center gap-2.5 overflow-x-auto">
              {selected.map((property) => (
                <li key={property.id} className="relative shrink-0">
                  <Plate
                    asset={property.images[0]!}
                    className="w-16 sm:w-20"
                    ratio="aspect-4/3"
                    sizes="80px"
                  />
                  <button
                    type="button"
                    onClick={() => removeCompare(property.id)}
                    aria-label={`Remove ${property.name} from comparison`}
                    className="absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center bg-surface-inverse text-content-inverse transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={clearCompare}
              className="hidden shrink-0 text-xs text-content-faint underline-offset-4 transition-colors hover:text-content hover:underline sm:block"
            >
              Clear
            </button>
            <Link
              href="/compare"
              className="group inline-flex shrink-0 items-center gap-2 bg-surface-inverse px-4 py-3 text-[11px] font-medium tracking-[0.16em] text-content-inverse uppercase transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-6"
            >
              Compare
              <span className="tabular-nums">{selected.length}</span>
              <ArrowRight
                className="size-3.5 transition-transform duration-500 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
