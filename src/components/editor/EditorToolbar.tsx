import { useCallback } from "react";
import { motion } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { cn } from "@utils/cn";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  Link,
  Image,
  Strikethrough,
  Minus,
  CheckSquare,
  Table,
} from "lucide-react";
import type { EditorMode } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * EditorToolbar — Stage 3: Fully functional formatting toolbar
 * ───────────────────────────────────────────────────────────── */

interface ModeTab {
  id: EditorMode | "split";
  label: string;
  title: string;
}

const MODE_TABS: ModeTab[] = [
  { id: "edit", label: "Edit", title: "Edit mode" },
  { id: "split", label: "Split", title: "Split view" },
  { id: "readonly", label: "Preview", title: "Preview" },
];

type FormatAction = {
  icon: React.ReactNode;
  title: string;
  shortcut?: string;
  action: "wrap" | "prefix" | "insert" | "block";
  before: string;
  after?: string;
};

const FORMAT_ACTIONS: FormatAction[] = [
  { icon: <Bold size={14} />, title: "Bold", shortcut: "⌘B", action: "wrap", before: "**", after: "**" },
  { icon: <Italic size={14} />, title: "Italic", shortcut: "⌘I", action: "wrap", before: "*", after: "*" },
  { icon: <Strikethrough size={14} />, title: "Strikethrough", action: "wrap", before: "~~", after: "~~" },
  { icon: <Code size={14} />, title: "Code", shortcut: "⌘`", action: "wrap", before: "`", after: "`" },
];

const BLOCK_ACTIONS: FormatAction[] = [
  { icon: <Heading1 size={14} />, title: "Heading 1", action: "prefix", before: "# " },
  { icon: <Heading2 size={14} />, title: "Heading 2", action: "prefix", before: "## " },
  { icon: <Heading3 size={14} />, title: "Heading 3", action: "prefix", before: "### " },
];

const LIST_ACTIONS: FormatAction[] = [
  { icon: <List size={14} />, title: "Bullet List", action: "prefix", before: "- " },
  { icon: <ListOrdered size={14} />, title: "Numbered List", action: "prefix", before: "1. " },
  { icon: <CheckSquare size={14} />, title: "Task List", action: "prefix", before: "- [ ] " },
  { icon: <Quote size={14} />, title: "Blockquote", action: "prefix", before: "> " },
];

const INSERT_ACTIONS: FormatAction[] = [
  { icon: <SquareCode size={14} />, title: "Code Block", action: "insert", before: "\n```\n", after: "\n```\n" },
  { icon: <Minus size={14} />, title: "Horizontal Rule", action: "insert", before: "\n---\n" },
  { icon: <Link size={14} />, title: "Link", action: "insert", before: "[", after: "](url)" },
  { icon: <Image size={14} />, title: "Image", action: "insert", before: "![alt](", after: ")" },
  { icon: <Table size={14} />, title: "Table", action: "insert", before: "\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n" },
];

export function EditorToolbar() {
  const mode = useEditorStore((s) => s.mode);
  const isSplitView = useEditorStore((s) => s.isSplitView);
  const setMode = useEditorStore((s) => s.setMode);
  const toggleSplitView = useEditorStore((s) => s.toggleSplitView);
  const activeNote = useEditorStore((s) => s.activeNote);

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

  const handleFormat = useCallback(
    (format: FormatAction) => {
      const event = new CustomEvent("ragnar-format", { detail: format });
      window.dispatchEvent(event);
    },
    [],
  );

  const activeTab = getActiveTab();
  const isEditMode = mode === "edit" || isSplitView;

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-ragnar-border-subtle px-4 py-1.5",
        "bg-ragnar-bg-primary/60 glass-surface",
      )}
    >
      {/* Mode tabs */}
      <div className="flex items-center gap-0.5 rounded-lg bg-ragnar-bg-tertiary/60 p-0.5">
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

      <ToolbarDivider />

      {/* Formatting — disabled in preview mode */}
      <div className={cn("flex items-center gap-0.5", !isEditMode && "opacity-40 pointer-events-none")}>
        {FORMAT_ACTIONS.map((f) => (
          <FormatButton key={f.title} icon={f.icon} title={f.shortcut ? `${f.title} (${f.shortcut})` : f.title} onClick={() => handleFormat(f)} />
        ))}
        <ToolbarDivider />
        {BLOCK_ACTIONS.map((f) => (
          <FormatButton key={f.title} icon={f.icon} title={f.title} onClick={() => handleFormat(f)} />
        ))}
        <ToolbarDivider />
        {LIST_ACTIONS.map((f) => (
          <FormatButton key={f.title} icon={f.icon} title={f.title} onClick={() => handleFormat(f)} />
        ))}
        <ToolbarDivider />
        {INSERT_ACTIONS.map((f) => (
          <FormatButton key={f.title} icon={f.icon} title={f.title} onClick={() => handleFormat(f)} />
        ))}
      </div>

      <div className="flex-1" />

      {activeNote && (
        <span className="max-w-[180px] truncate text-[11px] text-ragnar-text-muted">
          {activeNote.title}
        </span>
      )}
    </div>
  );
}

function FormatButton({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      title={title}
      onClick={onClick}
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
