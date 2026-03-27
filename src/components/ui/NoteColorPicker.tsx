import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@utils/cn";
import type { NoteColor } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * NoteColorPicker
 *
 * A small floating color palette to color-label a note.
 * Shown via context menu "Color Label" → submenu.
 * ───────────────────────────────────────────────────────────── */

export const NOTE_COLORS: Array<{ id: NoteColor; label: string; hex: string }> = [
  { id: "none",   label: "None",   hex: "transparent" },
  { id: "red",    label: "Red",    hex: "#ff453a" },
  { id: "orange", label: "Orange", hex: "#ff9f0a" },
  { id: "yellow", label: "Yellow", hex: "#ffd60a" },
  { id: "green",  label: "Green",  hex: "#30d158" },
  { id: "blue",   label: "Blue",   hex: "#0a84ff" },
  { id: "purple", label: "Purple", hex: "#bf5af2" },
  { id: "pink",   label: "Pink",   hex: "#f472b6" },
];

export function noteColorHex(color: NoteColor): string {
  return NOTE_COLORS.find((c) => c.id === color)?.hex ?? "transparent";
}

interface NoteColorPickerProps {
  current: NoteColor;
  onChange: (color: NoteColor) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function NoteColorPicker({ current, onChange, onClose, position }: NoteColorPickerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.12 }}
        style={{ top: position.y, left: position.x }}
        className={cn(
          "fixed z-[300] flex flex-col gap-2 p-2.5 rounded-xl",
          "border border-ragnar-border bg-ragnar-bg-secondary/95 glass-surface",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        )}
      >
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
          Color Label
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {NOTE_COLORS.map((color) => (
            <motion.button
              key={color.id}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { onChange(color.id); onClose(); }}
              title={color.label}
              className={cn(
                "relative h-6 w-6 rounded-full transition-all",
                color.id === "none"
                  ? "border-2 border-dashed border-ragnar-border hover:border-ragnar-text-muted"
                  : "border-2 border-transparent hover:scale-110",
                current === color.id && color.id !== "none" && "ring-2 ring-white/50 ring-offset-1 ring-offset-ragnar-bg-secondary",
                current === color.id && color.id === "none" && "border-ragnar-accent",
              )}
              style={{ backgroundColor: color.id === "none" ? "transparent" : color.hex }}
            >
              {color.id === "none" && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-ragnar-text-muted">✕</span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
      {/* Click-away */}
      <div className="fixed inset-0 z-[299]" onClick={onClose} />
    </AnimatePresence>
  );
}
