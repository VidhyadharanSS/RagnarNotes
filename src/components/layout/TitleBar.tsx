import { motion } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { useEditorStore } from "@stores/editorStore";
import { useKeyboardShortcut } from "@hooks/useKeyboardShortcut";
import { Tooltip } from "@components/ui/Tooltip";
import { ThemeToggle } from "@components/ui/ThemeToggle";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * TitleBar — macOS-style window title bar (Stage 2)
 *
 * New in Stage 2:
 *  - Tooltip on every icon button
 *  - ThemeToggle embedded in right controls
 *  - Full keyboard shortcut wiring (⌘/, ⌘., ⌘E, ⌘P)
 *  - Improved drag region that doesn't capture button clicks
 * ───────────────────────────────────────────────────────────── */

export function TitleBar() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const isSidebarVisible = useAppStore((s) => s.isSidebarVisible);
  const openCommandPalette = useAppStore((s) => s.openCommandPalette);
  const activeNote = useEditorStore((s) => s.activeNote);
  const isUnsaved = useEditorStore((s) => s.isUnsaved);
  const mode = useEditorStore((s) => s.mode);
  const toggleZen = useEditorStore((s) => s.toggleZen);
  const setMode = useEditorStore((s) => s.setMode);
  const toggleSplitView = useEditorStore((s) => s.toggleSplitView);
  const isSplitView = useEditorStore((s) => s.isSplitView);

  const isZen = mode === "zen";

  // ── Keyboard shortcuts ──
  useKeyboardShortcut("cmd+/", toggleSidebar);
  useKeyboardShortcut("cmd+k", openCommandPalette);
  useKeyboardShortcut("cmd+.", toggleZen);
  useKeyboardShortcut("cmd+e", () => {
    if (isSplitView) toggleSplitView();
    setMode("edit");
  });
  useKeyboardShortcut("cmd+shift+p", () => {
    if (isSplitView) toggleSplitView();
    setMode("readonly");
  });
  useKeyboardShortcut("cmd+shift+s", toggleSplitView);

  return (
    <div
      className={cn(
        "drag-region relative z-50 flex h-[38px] w-full flex-shrink-0 items-center",
        "border-b border-ragnar-border-subtle",
        "bg-ragnar-bg-primary/80 glass-surface",
        isZen && "opacity-0 hover:opacity-100 transition-opacity duration-300",
      )}
    >
      {/* Traffic light placeholder — real buttons at ~72px from left in Tauri */}
      <div className="no-drag flex items-center gap-1.5 pl-[76px]">
        <Tooltip content="Toggle Sidebar" shortcut="⌘/" side="bottom">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleSidebar}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
              "text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
              !isSidebarVisible && "text-ragnar-accent",
            )}
          >
            <SidebarIcon />
          </motion.button>
        </Tooltip>
      </div>

      {/* Center: note title + unsaved indicator */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-1.5">
          {isUnsaved && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-1.5 w-1.5 rounded-full bg-ragnar-accent"
            />
          )}
          <span className="select-none text-[13px] font-medium text-ragnar-text-secondary">
            {activeNote ? activeNote.title : "Ragnar Notes"}
          </span>
        </div>
      </div>

      {/* Right controls — no-drag zone */}
      <div className="no-drag ml-auto flex items-center gap-0.5 pr-3">
        {/* Theme toggle */}
        <ThemeToggle />

        <div className="mx-1.5 h-4 w-px bg-ragnar-border-subtle" />

        {/* Edit mode */}
        <Tooltip content="Edit Mode" shortcut="⌘E" side="bottom">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => { if (isSplitView) toggleSplitView(); setMode("edit"); }}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
              mode === "edit" && !isSplitView
                ? "bg-ragnar-accent/15 text-ragnar-accent"
                : "text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
            )}
          >
            <EditIcon />
          </motion.button>
        </Tooltip>

        {/* Split view */}
        <Tooltip content="Split View" shortcut="⌘⇧S" side="bottom">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleSplitView}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
              isSplitView
                ? "bg-ragnar-accent/15 text-ragnar-accent"
                : "text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
            )}
          >
            <SplitIcon />
          </motion.button>
        </Tooltip>

        {/* Preview mode */}
        <Tooltip content="Preview Mode" shortcut="⌘⇧P" side="bottom">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => { if (isSplitView) toggleSplitView(); setMode("readonly"); }}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
              mode === "readonly" && !isSplitView
                ? "bg-ragnar-accent/15 text-ragnar-accent"
                : "text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
            )}
          >
            <PreviewIcon />
          </motion.button>
        </Tooltip>

        <div className="mx-1 h-4 w-px bg-ragnar-border-subtle" />

        {/* Zen mode */}
        <Tooltip content={isZen ? "Exit Focus Mode" : "Focus Mode"} shortcut="⌘." side="bottom">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleZen}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
              isZen
                ? "text-ragnar-accent hover:bg-ragnar-accent-muted"
                : "text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
            )}
          >
            <ZenIcon />
          </motion.button>
        </Tooltip>
      </div>
    </div>
  );
}

/* ── Icons ── */

function SidebarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="1" width="12" height="12" rx="2" />
      <line x1="5" y1="1" x2="5" y2="13" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5l2.5 2.5L4 11.5H1.5V9L9 1.5z" />
    </svg>
  );
}
function SplitIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="2" width="12" height="10" rx="1.5" />
      <line x1="7" y1="2" x2="7" y2="12" />
    </svg>
  );
}
function PreviewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 7s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" />
      <circle cx="7" cy="7" r="2" />
    </svg>
  );
}
function ZenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="2.5" />
      <line x1="7" y1="1" x2="7" y2="2.5" />
      <line x1="7" y1="11.5" x2="7" y2="13" />
      <line x1="1" y1="7" x2="2.5" y2="7" />
      <line x1="11.5" y1="7" x2="13" y2="7" />
    </svg>
  );
}
