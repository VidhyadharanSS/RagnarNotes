import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
 * ReadingProgress — Stage 5: Thin animated progress bar at top
 *
 * Shows scroll progress when in preview / readonly mode.
 * ───────────────────────────────────────────────────────────── */

interface ReadingProgressProps {
  progress: number; // 0–100
}

export function ReadingProgress({ progress }: ReadingProgressProps) {
  if (progress <= 0) return null;

  return (
    <div className="absolute left-0 right-0 top-0 z-10 h-[2px] bg-ragnar-bg-tertiary/30">
      <motion.div
        className="h-full bg-ragnar-accent"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: "linear" }}
      />
    </div>
  );
}
