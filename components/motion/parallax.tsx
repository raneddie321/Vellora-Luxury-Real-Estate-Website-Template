"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Subtle vertical drift as the element crosses the viewport.
 * `strength` is expressed in percent of the element's own height, so it never
 * exposes an edge no matter the element's size.
 */
export function Parallax({
  children,
  className,
  strength = 8,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  as?: "div" | "span";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  const y = useSpring(raw, { stiffness: 90, damping: 26, mass: 0.4 });
  const Comp = as === "span" ? motion.span : motion.div;

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <Comp style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </Comp>
    </div>
  );
}

/** Scales an image inside a fixed frame as it scrolls — the hero "breath". */
export function ParallaxZoom({
  children,
  className,
  from = 1.12,
  to = 1,
}: {
  children: React.ReactNode;
  className?: string;
  from?: number;
  to?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [to, from]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={reduce ? undefined : { scale, y }}
        className="absolute inset-0 will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
