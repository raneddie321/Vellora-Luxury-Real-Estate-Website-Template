"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Heart, Menu, Search } from "lucide-react";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Button } from "@/components/ui/button";
import { useCollections } from "@/components/providers/collection-provider";
import { cn } from "@/lib/utils";

/** Routes whose hero is full-bleed imagery, so the bar starts transparent. */
const TRANSPARENT_ROUTES = [
  "/",
  "/about",
  "/properties/",
  "/developments/",
  "/neighborhoods/",
  "/journal/",
  "/agents/",
  "/services/",
];

function startsTransparent(pathname: string) {
  if (pathname === "/" || pathname === "/about") return true;
  return TRANSPARENT_ROUTES.some(
    (route) => route.endsWith("/") && route !== "/" && pathname.startsWith(route) && pathname !== route.slice(0, -1),
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const { favorites, ready } = useCollections();
  const { scrollY } = useScroll();
  const lastY = React.useRef(0);

  const overlay = startsTransparent(pathname);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
    // Give the page back to the reader on the way down; return it on the way up.
    const goingDown = latest > lastY.current;
    setHidden(goingDown && latest > 520 && !menuOpen);
    lastY.current = latest;
  });

  // Links inside the menu close it themselves; this covers the back button.
  React.useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  const solid = scrolled || !overlay;

  return (
    <>
      <a
        href="#main"
        className="sr-only left-4 top-4 z-[110] bg-content px-4 py-2 text-xs tracking-[0.16em] text-surface uppercase focus:not-sr-only focus:fixed"
      >
        Skip to content
      </a>

      <motion.header
        animate={{ y: hidden ? "-102%" : "0%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-[background-color,border-color,color] duration-500",
          solid
            ? "border-b border-hairline bg-surface/88 text-content backdrop-blur-xl backdrop-saturate-150"
            : "theme-dark border-b border-transparent text-paper",
        )}
      >
        <div className="shell flex h-[4.5rem] items-center justify-between gap-6 lg:h-[5.25rem]">
          <Logo size="sm" />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-8 xl:gap-10">
              {primaryNav.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-active={active}
                      className={cn(
                        "link-retract text-[11px] font-medium tracking-[0.16em] uppercase transition-opacity duration-300",
                        active ? "opacity-100" : "opacity-70 hover:opacity-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/search"
              aria-label="Search properties"
              className="inline-flex size-10 items-center justify-center transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <Search className="size-[18px]" aria-hidden />
            </Link>

            <Link
              href="/favorites"
              aria-label={
                ready && favorites.length
                  ? `Favourites, ${favorites.length} saved`
                  : "Favourites"
              }
              className="relative inline-flex size-10 items-center justify-center transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <Heart className="size-[18px]" aria-hidden />
              {ready && favorites.length > 0 ? (
                <span className="absolute top-1 right-0.5 flex min-w-4 items-center justify-center bg-[var(--accent)] px-1 text-[9px] leading-4 font-medium text-surface tabular-nums">
                  {favorites.length}
                </span>
              ) : null}
            </Link>

            <Button
              asChild
              size="sm"
              variant={solid ? "primary" : "inverse"}
              className="ml-1 hidden sm:inline-flex"
            >
              <Link href="/book-a-viewing">{siteConfig.cta.secondary}</Link>
            </Button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="-mr-2 inline-flex size-10 items-center justify-center transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:hidden"
            >
              <Menu className="size-[22px]" aria-hidden />
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
