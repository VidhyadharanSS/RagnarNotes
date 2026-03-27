import { motion } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { useEditorStore } from "@stores/editorStore";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * TitleBar — macOS-style window title bar
 *
 * Features:
 *  - Full drag region for window movement
 *  - Traffic light button placeholders (Tauri provides real ones)
 *  - Current note title in center
 *  - Unsaved indicator (dot)
 *  - Sidebar & mode toggle buttons on the right
 * ───────────────────────────────────────────────────────────── */

export function TitleBar() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const isSidebarVisible = useAppStore((s) => s.isSidebarVisible);
  const activeNote = useEditorStore((s) => s.activeNote);
  const isUnsaved = useEditorStore((s) => s.isUnsaved);
  const mode = useEditorStore((s) => s.mode);
  const toggleZen = useEditorStore((s) => s.toggleZen);

  const isZen = mode === "zen";

  return (
    <div
      className={cn(
        "drag-region relative z-50 flex h-[38px] w-full flex-shrink-0 items-center",
        "border-b border-ragnar-border-subtle bg-ragnar-bg-primary/80",
        "glass-surface",
      )}
    >
      {/* Traffic light placeholder — Tauri renders real buttons here */}
      <div className="no-drag flex items-center gap-2 pl-[72px]">
        {/* Sidebar toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleSidebar}
          title={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-ragnar-text-muted",
            "transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
          )}
        >
          <SidebarIcon />
        </motion.button>
      </div>

      {/* Center: note title */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-1.5">
          {isUnsaved && (
            <span className="h-1.5 w-1.5 rounded-full bg-ragnar-accent" />
          )}
          <span className="select-none text-[13px] font-medium text-ragnar-text-secondary">
            {activeNote ? activeNote.title : "Ragnar Notes"}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="no-drag ml-auto flex items-center gap-1 pr-3">
        {/* Zen mode toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleZen}
          title={isZen ? "Exit focus mode (⌘\\.)" : "Focus mode (⌘\\.)"}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
            isZen
              ? "text-ragnar-accent hover:bg-ragnar-accent-muted"
              : "text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
          )}
        >
          <ZenIcon />
        </motion.button>
      </div>
    </div>
  );
}

/* ── Icon components (inline SVG — no extra dependency) ── */

function SidebarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <rect x="1" y="1" width="12" height="12" rx="2" />
      <line x1="5" y1="1" x2="5" y2="13" />
    </svg>
  );
}

function ZenIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="7" cy="7" r="2.5" />
      <line x1="7" y1="1" x2="7" y2="2.5" />
      <line x1="7" y1="11.5" x2="7" y2="13" />
      <line x1="1" y1="7" x2="2.5" y2="7" />
      <line x1="11.5" y1="7" x2="13" y2="7" />
    </svg>
  );
}
