import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * The wordmark is drawn rather than imported so it stays crisp at any size and
 * inherits `currentColor` — which is what lets the same mark sit on the paper
 * ground and inside a dark room without a second asset.
 *
 * Replacing it with a supplied logo: swap the <svg> for an <Image>, keep the
 * outer <Link> and its aria-label.
 */
export function Logo({
  className,
  showMark = true,
  size = "md",
}: {
  className?: string;
  showMark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const wordmark = {
    sm: "text-[0.95rem] tracking-[0.34em]",
    md: "text-[1.1rem] tracking-[0.36em]",
    lg: "text-[1.5rem] tracking-[0.38em]",
  }[size];
  const markSize = { sm: "size-5", md: "size-6", lg: "size-8" }[size];

  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn(
        "group inline-flex items-center gap-3 text-content transition-opacity duration-300 hover:opacity-70",
        className,
      )}
    >
      {showMark ? (
        <svg
          viewBox="0 0 24 24"
          className={cn("shrink-0", markSize)}
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          {/* An opening in a wall: the smallest possible piece of architecture. */}
          <rect x="0.6" y="0.6" width="22.8" height="22.8" strokeWidth="1" opacity="0.35" />
          <path d="M7 19V11a5 5 0 0 1 10 0v8" strokeWidth="1.2" />
          <path
            d="M12 19v-8"
            strokeWidth="1"
            opacity="0.4"
            className="origin-bottom transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-y-0"
          />
        </svg>
      ) : null}
      <span className={cn("font-serif leading-none uppercase", wordmark)}>
        {siteConfig.name}
      </span>
    </Link>
  );
}
