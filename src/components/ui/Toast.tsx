import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@utils/cn";
import {
  CheckCircle,
  AlertCircle,
  Info,
  X,
  AlertTriangle,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * Toast Notification System
 *
 * Global toast system — import `toast` anywhere and call:
 *   toast.success("Note saved!")
 *   toast.error("Failed to write")
 *   toast.info("Auto-saved")
 *   toast.warning("Large file detected")
 * ───────────────────────────────────────────────────────────── */

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// ── Global event bus ──
type Listener = (t: ToastData) => void;
const listeners = new Set<Listener>();

function emit(t: ToastData) {
  listeners.forEach((fn) => fn(t));
}

let toastCounter = 0;

export const toast = {
  success: (message: string, duration = 3000) =>
    emit({ id: `toast-${++toastCounter}`, message, type: "success", duration }),
  error: (message: string, duration = 5000) =>
    emit({ id: `toast-${++toastCounter}`, message, type: "error", duration }),
  info: (message: string, duration = 3000) =>
    emit({ id: `toast-${++toastCounter}`, message, type: "info", duration }),
  warning: (message: string, duration = 4000) =>
    emit({ id: `toast-${++toastCounter}`, message, type: "warning", duration }),
};

// ── Icon map ──
const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
  warning: <AlertTriangle size={16} />,
};

const colorMap: Record<ToastType, string> = {
  success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  error: "text-red-400 bg-red-500/10 border-red-500/20",
  info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

/* ── Toast Container (mount once in App.tsx) ── */

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler: Listener = (t) => {
      setToasts((prev) => [...prev, t]);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[500] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), t.duration);
    return () => clearTimeout(timer);
  }, [t, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3",
        "glass-surface shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        "min-w-[280px] max-w-[400px]",
        colorMap[t.type],
      )}
    >
      <span className="flex-shrink-0">{iconMap[t.type]}</span>
      <p className="flex-1 text-[13px] font-medium text-ragnar-text-primary">
        {t.message}
      </p>
      <button
        onClick={() => onDismiss(t.id)}
        className="flex-shrink-0 rounded-md p-0.5 text-ragnar-text-muted transition-colors hover:text-ragnar-text-primary"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
