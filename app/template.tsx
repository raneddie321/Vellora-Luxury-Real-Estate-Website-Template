"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Page transition. `template.tsx` remounts on every navigation, which is
 * exactly the hook a route change needs. Kept to opacity and a few pixels —
 * anything more starts to feel like waiting.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.01 : 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
