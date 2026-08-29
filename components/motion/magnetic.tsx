"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Pulls its child a few pixels toward the pointer. Only ever active on devices
 * with a real pointer — on touch it renders as a plain wrapper with no
 * listeners at all.
 */
export function Magnetic({
  children,
  strength = 0.28,
  radius = 90,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 190, damping: 17, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 190, damping: 17, mass: 0.35 });

  React.useEffect(() => {
    if (reduce) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  const handleMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      const falloff = Math.max(0, 1 - distance / (radius + rect.width / 2));
      x.set(dx * strength * falloff);
      y.set(dy * strength * falloff);
    },
    [radius, strength, x, y],
  );

  const reset = React.useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onBlur={reset}
    >
      {children}
    </motion.div>
  );
}
