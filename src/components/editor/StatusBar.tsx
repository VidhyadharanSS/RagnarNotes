import { useEditorStore } from "@stores/editorStore";
import { formatWordCount } from "@utils/format";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * StatusBar — Bottom bar below the editor
 *
 * Shows: word count, char count, unsaved indicator, mode.
 * ───────────────────────────────────────────────────────────── */

export function StatusBar() {
  const wordCount = useEditorStore((s) => s.wordCount);
  const charCount = useEditorStore((s) => s.charCount);
  const isUnsaved = useEditorStore((s) => s.isUnsaved);
  const mode = useEditorStore((s) => s.mode);
  const activeNote = useEditorStore((s) => s.activeNote);

  if (!activeNote) return null;

  const modeLabel: Record<string, string> = {
    edit: "Editing",
    readonly: "Preview",
    zen: "Focus",
  };

  return (
    <div
      className={cn(
        "flex h-7 items-center gap-4 border-t border-ragnar-border-subtle px-4",
        "bg-ragnar-bg-primary/60 glass-surface",
      )}
    >
      {/* Unsaved dot */}
      {isUnsaved && (
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-ragnar-accent" />
          <span className="text-[11px] text-ragnar-text-muted">Unsaved</span>
        </div>
      )}

      {/* Counts */}
      <span className="text-[11px] text-ragnar-text-muted">
        {formatWordCount(wordCount)}
      </span>
      <span className="text-[11px] text-ragnar-text-muted">
        {charCount.toLocaleString()} chars
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mode badge */}
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          mode === "edit"
            ? "bg-ragnar-accent/15 text-ragnar-accent"
            : mode === "readonly"
            ? "bg-ragnar-bg-tertiary text-ragnar-text-muted"
            : "bg-purple-500/15 text-purple-400",
        )}
      >
        {modeLabel[mode] ?? mode}
      </span>

      {/* Markdown label */}
      <span className="text-[11px] text-ragnar-text-muted opacity-50">MD</span>
    </div>
  );
}
