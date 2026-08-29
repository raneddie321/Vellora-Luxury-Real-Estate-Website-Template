"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Uncovers an image by lifting a solid panel off it, rather than fading it in.
 * Fades read as "loading"; a curtain reads as "presented".
 */
export function ImageReveal({
  children,
  className,
  delay = 0,
  from = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right";
}) {
  const reduce = useReducedMotion();

  // The panel starts covering the frame and slides away in the given direction.
  const rest = { x: 0, y: 0 };
  const target =
    from === "bottom"
      ? { ...rest, y: "-100%" }
      : { ...rest, x: from === "left" ? "100%" : "-100%" };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        data-reveal
        initial={reduce ? { opacity: 1 } : { scale: 1.14 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        transition={{ duration: reduce ? 0.01 : 1.5, delay, ease: [0.16, 1, 0.3, 1] }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
      {reduce ? null : (
        <motion.span
          aria-hidden
          data-reveal-curtain
          className="pointer-events-none absolute inset-0 z-10 bg-surface"
          initial={rest}
          whileInView={target}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 1.15, delay, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
    </div>
  );
}
