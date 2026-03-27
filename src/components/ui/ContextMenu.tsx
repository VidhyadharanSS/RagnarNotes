import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "@hooks/useClickOutside";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * ContextMenu — Right-click context menu
 * ───────────────────────────────────────────────────────────── */

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  separator?: boolean;
  action: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, onClose);

  // Adjust position so menu stays within viewport
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.right > vw) el.style.left = `${vw - rect.width - 8}px`;
    if (rect.bottom > vh) el.style.top = `${vh - rect.height - 8}px`;
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.12 }}
        style={{ left: position.x, top: position.y }}
        className={cn(
          "fixed z-[300] min-w-[180px]",
          "rounded-xl border border-ragnar-border",
          "bg-ragnar-bg-secondary/95 glass-surface",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-1.5",
        )}
      >
        {items.map((item) =>
          item.separator ? (
            <div
              key={item.id}
              className="mx-2 my-1 h-px bg-ragnar-border-subtle"
            />
          ) : (
            <button
              key={item.id}
              onClick={() => { item.action(); onClose(); }}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-1.5 text-left",
                "text-[13px] transition-colors",
                item.danger
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-ragnar-text-primary hover:bg-ragnar-bg-hover",
              )}
            >
              {item.icon && (
                <span className="flex-shrink-0 opacity-70">{item.icon}</span>
              )}
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <kbd className="rounded bg-ragnar-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-ragnar-text-muted">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          ),
        )}
      </motion.div>
    </AnimatePresence>
  );
}
