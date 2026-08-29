"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Counts up once, when the number first scrolls into view.
 *
 * Formatting is expressed as plain props rather than a callback so a server
 * component can render one directly — functions cannot cross that boundary.
 */
export function Counter({
  value,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "en-GB",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setProgress,
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  // With motion reduced there is nothing to animate — the final value is shown
  // as soon as the element is in view.
  const shown = reduce ? (inView ? value : 0) : progress;
  const display =
    decimals > 0
      ? shown.toFixed(decimals)
      : Math.round(shown).toLocaleString(locale, { maximumFractionDigits: 0 });

  return (
    <span ref={ref} className={className} data-numeric>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
