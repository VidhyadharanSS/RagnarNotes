import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { useNotesStore } from "@stores/notesStore";
import { WordGoalWidget } from "@components/features/WordGoalWidget";
import { formatWordCount, formatRelativeTime } from "@utils/format";
import { cn } from "@utils/cn";
import {
  FileText,
  Clock,
  Hash,
  Eye,
  Pencil,
  Focus,
  CloudUpload,
  CloudCheck,
  Download,
  Pin,
  Info,
} from "lucide-react";

/**
 * StatusBar — Stage 5
 *
 * New features:
 *  - Word Goal progress ring (compact, click to set goal)
 *  - Note Info toggle button
 *  - Paragraph count
 *  - Improved responsive layout
 */
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
  const sentenceCount = (activeNote.content.match(/[.!?]+/g) ?? []).length;

  const modeConfig = {
    edit: {
      label: "Editing",
      icon: <Pencil size={10} />,
      color: "text-ragnar-accent bg-ragnar-accent/10",
    },
    readonly: {
      label: "Preview",
      icon: <Eye size={10} />,
      color: "text-emerald-400 bg-emerald-500/10",
    },
    zen: {
      label: "Focus",
      icon: <Focus size={10} />,
      color: "text-violet-400 bg-violet-500/10",
    },
  } as const;

  const currentMode = modeConfig[mode as keyof typeof modeConfig] ?? modeConfig.edit;

  return (
    <div
      className={cn(
        "flex h-[26px] items-center gap-2.5 border-t border-ragnar-border-subtle px-4",
        "bg-ragnar-bg-primary/70 backdrop-blur-sm",
        "text-[11px] transition-colors duration-200 overflow-hidden",
      )}
    >
      {/* Save status */}
      <AnimatePresence mode="wait">
        {isUnsaved ? (
          <motion.div
            key="unsaved"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-1 text-ragnar-accent"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <CloudUpload size={11} />
            </motion.div>
            <span>Unsaved</span>
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-1 text-ragnar-text-muted"
          >
            <CloudCheck size={11} />
            <span>Saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Dot />

      {/* Word count */}
      <div className="flex items-center gap-1 text-ragnar-text-muted">
        <FileText size={10} />
        <span>{formatWordCount(wordCount)}</span>
      </div>

      {/* Char + Sentence (hidden on small) */}
      <span className="hidden sm:inline text-ragnar-text-muted/70">
        {charCount.toLocaleString()} chars
      </span>
      {sentenceCount > 0 && (
        <span className="hidden md:inline text-ragnar-text-muted/70">
          {sentenceCount} sentences
        </span>
      )}

      <Dot />

      {/* Reading time */}
      <div className="flex items-center gap-1 text-ragnar-text-muted">
        <Clock size={10} />
        <span>{readingTime} min read</span>
      </div>

      {/* Tags */}
      {tagCount > 0 && (
        <>
          <Dot />
          <div className="flex items-center gap-1 text-ragnar-text-muted">
            <Hash size={10} />
            <span>{tagCount} {tagCount === 1 ? "tag" : "tags"}</span>
          </div>
        </>
      )}

      {/* Pinned */}
      {isPinned && (
        <>
          <Dot />
          <div className="flex items-center gap-1 text-ragnar-accent">
            <Pin size={9} className="rotate-45" />
            <span>Pinned</span>
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* Word Goal Widget */}
      <WordGoalWidget compact />

      <Dot />

      {/* Note Info */}
      <button
        onClick={() => window.dispatchEvent(new Event("ragnar-toggle-info"))}
        title="Toggle note info panel"
        className={cn(
          "flex items-center gap-1 rounded px-1.5 py-0.5",
          "text-ragnar-text-muted transition-colors",
          "hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
        )}
      >
        <Info size={10} />
        <span>Info</span>
      </button>

      <Dot />

      {/* Export */}
      <button
        onClick={() => window.dispatchEvent(new Event("ragnar-open-export"))}
        title="Export note (⌘⇧E)"
        className={cn(
          "flex items-center gap-1 rounded px-1.5 py-0.5",
          "text-ragnar-text-muted transition-colors",
          "hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
        )}
      >
        <Download size={10} />
        <span>Export</span>
      </button>

      <Dot />

      {/* Last saved */}
      <span className="text-ragnar-text-muted">
        {formatRelativeTime(activeNote.frontmatter.updatedAt)}
      </span>

      <Dot />

      {/* Mode badge */}
      <span
        className={cn(
          "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold",
          currentMode.color,
        )}
      >
        {currentMode.icon}
        {isSplitView ? "Split" : currentMode.label}
      </span>

      <span className="text-ragnar-text-muted/40">Markdown</span>
    </div>
  );
}

function Dot() {
  return <span className="text-ragnar-border select-none">·</span>;
}
