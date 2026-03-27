import { motion } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { useNotesStore } from "@stores/notesStore";
import { formatWordCount, formatRelativeTime } from "@utils/format";
import { cn } from "@utils/cn";
import {
  FileText,
  Clock,
  Hash,
  Eye,
  Pencil,
  Focus,
  Save,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * StatusBar — Stage 3: Enhanced bottom bar
 *
 * Shows: mode badge, word/char counts, save status,
 *        reading time, tag count, last updated
 * ───────────────────────────────────────────────────────────── */

export function StatusBar() {
  const wordCount = useEditorStore((s) => s.wordCount);
  const charCount = useEditorStore((s) => s.charCount);
  const isUnsaved = useEditorStore((s) => s.isUnsaved);
  const mode = useEditorStore((s) => s.mode);
  const isSplitView = useEditorStore((s) => s.isSplitView);
  const activeNote = useEditorStore((s) => s.activeNote);
  const pinnedNoteIds = useNotesStore((s) => s.pinnedNoteIds);

  if (!activeNote) return null;

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const tagCount = activeNote.frontmatter.tags.length;
  const isPinned = pinnedNoteIds.includes(activeNote.id);

  const modeConfig = {
    edit: { label: "Editing", icon: <Pencil size={10} />, color: "text-ragnar-accent bg-ragnar-accent/12" },
    readonly: { label: "Preview", icon: <Eye size={10} />, color: "text-emerald-400 bg-emerald-500/12" },
    zen: { label: "Focus", icon: <Focus size={10} />, color: "text-purple-400 bg-purple-500/12" },
  };

  const currentMode = modeConfig[mode] ?? modeConfig.edit;

  return (
    <div
      className={cn(
        "flex h-7 items-center gap-3 border-t border-ragnar-border-subtle px-4",
        "bg-ragnar-bg-primary/60 glass-surface",
        "text-[11px]",
      )}
    >
      {/* Save status */}
      <div className="flex items-center gap-1.5">
        {isUnsaved ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-ragnar-accent"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ragnar-accent animate-pulse" />
            <span>Unsaved</span>
          </motion.div>
        ) : (
          <div className="flex items-center gap-1 text-ragnar-text-muted">
            <Save size={10} />
            <span>Saved</span>
          </div>
        )}
      </div>

      <StatusDivider />

      {/* Word count */}
      <div className="flex items-center gap-1 text-ragnar-text-muted">
        <FileText size={10} />
        <span>{formatWordCount(wordCount)}</span>
      </div>

      {/* Char count */}
      <span className="text-ragnar-text-muted">
        {charCount.toLocaleString()} chars
      </span>

      <StatusDivider />

      {/* Reading time */}
      <div className="flex items-center gap-1 text-ragnar-text-muted">
        <Clock size={10} />
        <span>{readingTime} min read</span>
      </div>

      {/* Tags */}
      {tagCount > 0 && (
        <>
          <StatusDivider />
          <div className="flex items-center gap-1 text-ragnar-text-muted">
            <Hash size={10} />
            <span>{tagCount} {tagCount === 1 ? "tag" : "tags"}</span>
          </div>
        </>
      )}

      {/* Pinned indicator */}
      {isPinned && (
        <>
          <StatusDivider />
          <span className="text-ragnar-accent">📌 Pinned</span>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Last updated */}
      <span className="text-ragnar-text-muted">
        {formatRelativeTime(activeNote.frontmatter.updatedAt)}
      </span>

      <StatusDivider />

      {/* Mode badge */}
      <span
        className={cn(
          "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          currentMode.color,
        )}
      >
        {currentMode.icon}
        {isSplitView ? "Split" : currentMode.label}
      </span>

      {/* Format label */}
      <span className="text-ragnar-text-muted opacity-50">Markdown</span>
    </div>
  );
}

function StatusDivider() {
  return <span className="text-ragnar-border">·</span>;
}
