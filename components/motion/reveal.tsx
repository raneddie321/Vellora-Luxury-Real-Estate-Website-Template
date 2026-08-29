"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Distance in px the element travels. Keep it small; this is not a slideshow. */
  distance?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
  as?: "div" | "section" | "article" | "li" | "span" | "header" | "footer";
};

/**
 * The single scroll-reveal used site-wide. One component means one timing
 * curve, which is what makes the whole site feel like one piece of work.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 26,
  direction = "up",
  duration = 0.95,
  once = true,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as];

  const offset = React.useMemo(() => {
    if (reduce || direction === "none") return { x: 0, y: 0 };
    switch (direction) {
      case "down": return { x: 0, y: -distance };
      case "left": return { x: distance, y: 0 };
      case "right": return { x: -distance, y: 0 };
      default: return { x: 0, y: distance };
    }
  }, [direction, distance, reduce]);

  return (
    <Comp
      data-reveal
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0.01 : duration, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

const groupVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      data-reveal
      className={className}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: 0.04 } },
      }}
      initial="hidden"
      whileInView="shown"
      viewport={{ once, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      data-reveal
      className={className}
      variants={reduce ? { hidden: { opacity: 0 }, shown: { opacity: 1 } } : itemVariants}
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline treatment: each line rises out from behind a mask.
 *
 * The heading itself is what gets observed, not the masked line. A line that
 * starts translated fully outside its `overflow:hidden` parent has an empty
 * intersection rect, so observing it directly would mean it never enters view
 * and therefore never animates — the mask would hide it forever.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  id,
  stagger = 0.09,
  as: Tag = "h2",
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  id?: string;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[Tag];

  const container: Variants = {
    hidden: {},
    shown: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: reduce ? 0 : delay,
      },
    },
  };

  const line: Variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.01 } } }
    : {
        hidden: { y: "108%" },
        shown: { y: 0, transition: { duration: 1.05, ease: EASE } },
      };

  return (
    <Comp
      id={id}
      className={className}
      variants={container}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
      {lines.map((content, i) => (
        <span key={i} className={cn("block overflow-hidden", lineClassName)}>
          <motion.span data-reveal className="block will-change-transform" variants={line}>
            {content}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}

export { groupVariants, itemVariants, EASE };
