import { motion } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { useEditorStore } from "@stores/editorStore";
import { useKeyboardShortcut } from "@hooks/useKeyboardShortcut";
import { Tooltip } from "@components/ui/Tooltip";
import { ThemeToggle } from "@components/ui/ThemeToggle";
import { cn } from "@utils/cn";
import {
  PanelLeft,
  Pencil,
  Columns2,
  Eye,
  Maximize2,
  Minimize2,
  Search,
Download,
  Settings,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * TitleBar — Stage 4: Enhanced with export + settings buttons
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

  // Keyboard shortcuts
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
  useKeyboardShortcut("cmd+shift+e", () => {
    window.dispatchEvent(new Event("ragnar-open-export"));
  });

  return (
    <div
      className={cn(
        "drag-region relative z-50 flex h-[38px] w-full flex-shrink-0 items-center",
        "border-b border-ragnar-border-subtle",
        "bg-ragnar-bg-primary/80 glass-surface",
        "transition-colors duration-200",
        isZen && "opacity-0 hover:opacity-100 transition-all duration-500",
      )}
    >
      {/* Left: traffic lights + sidebar + search */}
      <div className="no-drag flex items-center gap-1 pl-[76px]">
        <Tooltip content="Toggle Sidebar" shortcut="⌘/" side="bottom">
          <IconButton onClick={toggleSidebar} active={!isSidebarVisible}>
            <PanelLeft size={14} />
          </IconButton>
        </Tooltip>

        <Tooltip content="Search" shortcut="⌘K" side="bottom">
          <IconButton onClick={openCommandPalette}>
            <Search size={13} />
          </IconButton>
        </Tooltip>
      </div>

      {/* Center: note title + unsaved indicator */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2">
          {isUnsaved && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-2 w-2 rounded-full bg-ragnar-accent shadow-[0_0_8px_rgba(10,132,255,0.5)]"
            />
          )}
          <span className="select-none text-[13px] font-medium text-ragnar-text-secondary">
            {activeNote ? activeNote.title : "Ragnar Notes"}
          </span>
          {activeNote && activeNote.frontmatter.tags.length > 0 && (
            <span className="text-[11px] text-ragnar-text-muted">
              #{activeNote.frontmatter.tags[0]}
            </span>
          )}
        </div>
      </div>

      {/* Right: theme + export + settings + mode controls */}
      <div className="no-drag ml-auto flex items-center gap-0.5 pr-3">
        <ThemeToggle />

        <div className="mx-1.5 h-4 w-px bg-ragnar-border-subtle" />

        {/* Export */}
        {activeNote && (
          <Tooltip content="Export Note" shortcut="⌘⇧E" side="bottom">
            <IconButton onClick={() => window.dispatchEvent(new Event("ragnar-open-export"))}>
              <Download size={13} />
            </IconButton>
          </Tooltip>
        )}

        {/* Settings */}
        <Tooltip content="Settings" side="bottom">
          <IconButton onClick={() => window.dispatchEvent(new Event("ragnar-open-settings"))}>
            <Settings size={13} />
          </IconButton>
        </Tooltip>

        <div className="mx-1.5 h-4 w-px bg-ragnar-border-subtle" />

        {/* Edit mode */}
        <Tooltip content="Edit Mode" shortcut="⌘E" side="bottom">
          <IconButton
            onClick={() => { if (isSplitView) toggleSplitView(); setMode("edit"); }}
            active={mode === "edit" && !isSplitView}
          >
            <Pencil size={13} />
          </IconButton>
        </Tooltip>

        {/* Split view */}
        <Tooltip content="Split View" shortcut="⌘⇧S" side="bottom">
          <IconButton onClick={toggleSplitView} active={isSplitView}>
            <Columns2 size={14} />
          </IconButton>
        </Tooltip>

        {/* Preview mode */}
        <Tooltip content="Preview" shortcut="⌘⇧P" side="bottom">
          <IconButton
            onClick={() => { if (isSplitView) toggleSplitView(); setMode("readonly"); }}
            active={mode === "readonly" && !isSplitView}
          >
            <Eye size={14} />
          </IconButton>
        </Tooltip>

        <div className="mx-1 h-4 w-px bg-ragnar-border-subtle" />

        {/* Zen mode */}
        <Tooltip content={isZen ? "Exit Focus" : "Focus Mode"} shortcut="⌘." side="bottom">
          <IconButton onClick={toggleZen} active={isZen}>
            {isZen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

/* ── Reusable icon button ── */
function IconButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-ragnar-accent/15 text-ragnar-accent"
          : "text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
      )}
    >
      {children}
    </motion.button>
  );
}
