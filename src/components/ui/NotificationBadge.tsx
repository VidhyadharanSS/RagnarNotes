import { motion } from "framer-motion";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * NotificationBadge — Animated count badge with pulse effect
 * ───────────────────────────────────────────────────────────── */

interface NotificationBadgeProps {
  count: number;
  max?: number;
  variant?: "default" | "accent" | "danger";
  className?: string;
}

export function NotificationBadge({
  count,
  max = 99,
  variant = "default",
  className,
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const display = count > max ? `${max}+` : String(count);

  const variants = {
    default: "bg-ragnar-bg-tertiary text-ragnar-text-muted",
    accent: "bg-ragnar-accent text-white",
    danger: "bg-red-500 text-white",
  };

  return (
    <motion.span
      key={count}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5",
        "text-[10px] font-bold leading-none",
        variants[variant],
        className,
      )}
    >
      {display}
    </motion.span>
  );
}
