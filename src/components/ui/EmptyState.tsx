import { motion } from "framer-motion";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * EmptyState — Reusable animated empty state component
 * ───────────────────────────────────────────────────────────── */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-8 py-16 text-center",
        className,
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ragnar-bg-tertiary text-ragnar-text-muted"
      >
        {icon}
      </motion.div>
      <div className="space-y-1">
        <p className="text-[14px] font-semibold text-ragnar-text-secondary">
          {title}
        </p>
        {description && (
          <p className="max-w-xs text-[13px] text-ragnar-text-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}
