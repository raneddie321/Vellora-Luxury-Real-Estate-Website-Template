"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { primaryNav, utilityNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { Plate } from "@/components/media/plate";
import { ordinal } from "@/lib/utils";
import { img } from "@/lib/images";

const panel = { duration: 0.72, ease: [0.76, 0, 0.24, 1] as const };

const menuImage = img("cinema-08", "A cloister at dusk");

/**
 * Full-screen menu. Deliberately not a stacked copy of the desktop bar: the
 * links are set at display size with index numerals, and the panel carries an
 * image so the menu is part of the campaign rather than a utility.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  // Lock the page behind the overlay without losing scroll position.
  React.useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="theme-dark fixed inset-0 z-[95] flex flex-col bg-surface text-content lg:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={panel}
        >
          <div className="flex items-center justify-between px-5 py-5 sm:px-8">
            <Logo size="sm" />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="-m-2 inline-flex size-11 items-center justify-center p-2 text-content transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <X className="size-6" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav
            aria-label="Main"
            className="no-scrollbar flex-1 overflow-y-auto px-5 pt-4 pb-10 sm:px-8"
          >
            <ul>
              {primaryNav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 + i * 0.055, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-hairline"
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-baseline gap-4 py-4 sm:py-5"
                  >
                    <span className="eyebrow w-7 shrink-0 text-content-faint tabular-nums">
                      {ordinal(i)}
                    </span>
                    <span className="flex-1 font-serif text-[2.15rem] leading-[1.05] tracking-[-0.03em] transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1.5 sm:text-5xl">
                      {item.label}
                    </span>
                    <ArrowUpRight
                      className="mt-1 size-5 shrink-0 text-content-faint transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-content"
                      aria-hidden
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10"
            >
              <p className="eyebrow text-[var(--accent)]">Tools</p>
              <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3.5">
                {utilityNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="link-rule text-sm text-content-muted hover:text-content"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.68, duration: 0.8 }}
              className="mt-10 hidden sm:block"
            >
              <Plate asset={menuImage} ratio="aspect-16/9" sizes="90vw" wash grain />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 border-t border-hairline pt-7"
            >
              <p className="eyebrow text-content-faint">Enquiries</p>
              <a
                href={`tel:${siteConfig.contact.phoneHref}`}
                className="mt-3 block font-serif text-2xl tracking-[-0.02em]"
              >
                {siteConfig.contact.phone}
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="link-rule mt-2 inline-block text-sm text-content-muted"
              >
                {siteConfig.contact.email}
              </a>
              <p className="mt-5 text-xs leading-relaxed text-content-faint">
                {siteConfig.contact.address.line1}, {siteConfig.contact.address.city}
              </p>
            </motion.div>
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
