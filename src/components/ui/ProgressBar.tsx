import { motion } from "framer-motion";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * ProgressBar — Animated progress indicator
 * ───────────────────────────────────────────────────────────── */

interface ProgressBarProps {
  value: number; // 0–100
  variant?: "default" | "accent" | "success" | "warning";
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  variant = "accent",
  size = "sm",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const colors = {
    default: "bg-ragnar-text-muted",
    accent: "bg-ragnar-accent",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
  };

  const heights = { sm: "h-1", md: "h-2" };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex-1 overflow-hidden rounded-full bg-ragnar-bg-tertiary",
          heights[size],
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", colors[variant])}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-medium text-ragnar-text-muted tabular-nums">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
