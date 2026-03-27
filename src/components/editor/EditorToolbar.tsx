import { motion } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { cn } from "@utils/cn";
import type { EditorMode } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * EditorToolbar — Contextual toolbar above the editor
 *
 * Controls:
 *  - Edit / Read-Only / Split view mode tabs
 *  - Format actions (Bold, Italic, Code, etc.) — Stage 3 wires these
 *  - Zen mode shortcut hint
 * ───────────────────────────────────────────────────────────── */

interface ModeTab {
  id: EditorMode | "split";
  label: string;
  title: string;
}

const MODE_TABS: ModeTab[] = [
  { id: "edit", label: "Edit", title: "Edit mode" },
  { id: "split", label: "Split", title: "Split view: editor + preview" },
  { id: "readonly", label: "Preview", title: "Read-only preview" },
];

export function EditorToolbar() {
  const mode = useEditorStore((s) => s.mode);
  const isSplitView = useEditorStore((s) => s.isSplitView);
  const setMode = useEditorStore((s) => s.setMode);
  const toggleSplitView = useEditorStore((s) => s.toggleSplitView);

  function getActiveTab(): EditorMode | "split" {
    if (isSplitView) return "split";
    return mode;
  }

  function handleTabClick(id: EditorMode | "split") {
    if (id === "split") {
      if (!isSplitView) {
        if (mode !== "edit") setMode("edit");
        toggleSplitView();
      } else {
        toggleSplitView();
      }
    } else {
      if (isSplitView) toggleSplitView();
      setMode(id);
    }
  }

  const activeTab = getActiveTab();

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-ragnar-border-subtle px-4 py-2",
        "bg-ragnar-bg-primary/60 glass-surface",
      )}
    >
      {/* Mode tabs */}
      <div className="flex items-center gap-0.5 rounded-lg bg-ragnar-bg-tertiary p-0.5">
        {MODE_TABS.map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleTabClick(tab.id)}
            title={tab.title}
            className={cn(
              "rounded-md px-3 py-1 text-[12px] font-medium transition-all",
              activeTab === tab.id
                ? "bg-ragnar-bg-secondary text-ragnar-text-primary shadow-sm"
                : "text-ragnar-text-muted hover:text-ragnar-text-primary",
            )}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Formatting actions (wired fully in Stage 3) */}
      <div className="ml-2 flex items-center gap-0.5">
        <FormatButton icon={<BoldIcon />} title="Bold (⌘B)" shortcut="⌘B" />
        <FormatButton icon={<ItalicIcon />} title="Italic (⌘I)" shortcut="⌘I" />
        <FormatButton icon={<CodeIcon />} title="Inline code (⌘`)" shortcut="⌘`" />
        <ToolbarDivider />
        <FormatButton icon={<Heading1Icon />} title="Heading 1" />
        <FormatButton icon={<Heading2Icon />} title="Heading 2" />
        <ToolbarDivider />
        <FormatButton icon={<ListIcon />} title="Bullet list" />
        <FormatButton icon={<OrderedListIcon />} title="Ordered list" />
        <FormatButton icon={<BlockquoteIcon />} title="Blockquote" />
        <FormatButton icon={<CodeBlockIcon />} title="Code block" />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zen mode hint */}
      <span className="text-[11px] text-ragnar-text-muted opacity-60">
        ⌘. Zen
      </span>
    </div>
  );
}

/* ── FormatButton ── */
function FormatButton({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
  shortcut?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      title={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md",
        "text-ragnar-text-muted transition-colors",
        "hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
      )}
    >
      {icon}
    </motion.button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-4 w-px bg-ragnar-border-subtle" />;
}

/* ── Toolbar icons ── */
function BoldIcon() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><text x="2" y="11" fontSize="12" fontWeight="900" fill="currentColor" stroke="none">B</text></svg>;
}
function ItalicIcon() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><text x="3" y="11" fontSize="12" fontStyle="italic" fontWeight="600" fill="currentColor">I</text></svg>;
}
function CodeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,3 1,6.5 4,10" />
      <polyline points="9,3 12,6.5 9,10" />
    </svg>
  );
}
function Heading1Icon() {
  return <svg width="14" height="13" viewBox="0 0 14 13" fill="currentColor"><text x="0" y="11" fontSize="11" fontWeight="700">H1</text></svg>;
}
function Heading2Icon() {
  return <svg width="14" height="13" viewBox="0 0 14 13" fill="currentColor"><text x="0" y="11" fontSize="11" fontWeight="700">H2</text></svg>;
}
function ListIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="2" cy="3.5" r="0.8" fill="currentColor" stroke="none" />
      <line x1="5" y1="3.5" x2="12" y2="3.5" />
      <circle cx="2" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      <line x1="5" y1="6.5" x2="12" y2="6.5" />
      <circle cx="2" cy="9.5" r="0.8" fill="currentColor" stroke="none" />
      <line x1="5" y1="9.5" x2="10" y2="9.5" />
    </svg>
  );
}
function OrderedListIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <text x="0" y="5" fontSize="5" fill="currentColor" stroke="none" fontWeight="600">1.</text>
      <line x1="5" y1="3.5" x2="12" y2="3.5" />
      <text x="0" y="9" fontSize="5" fill="currentColor" stroke="none" fontWeight="600">2.</text>
      <line x1="5" y1="6.5" x2="12" y2="6.5" />
      <text x="0" y="13" fontSize="5" fill="currentColor" stroke="none" fontWeight="600">3.</text>
      <line x1="5" y1="9.5" x2="10" y2="9.5" />
    </svg>
  );
}
function BlockquoteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="2" x2="2" y2="11" strokeWidth="2.5" />
      <line x1="5" y1="4" x2="12" y2="4" />
      <line x1="5" y1="7" x2="12" y2="7" />
      <line x1="5" y1="10" x2="10" y2="10" />
    </svg>
  );
}
function CodeBlockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="11" height="11" rx="2" />
      <line x1="3" y1="4.5" x2="5" y2="6.5" />
      <line x1="5" y1="6.5" x2="3" y2="8.5" />
      <line x1="7" y1="8.5" x2="10" y2="8.5" />
    </svg>
  );
}
