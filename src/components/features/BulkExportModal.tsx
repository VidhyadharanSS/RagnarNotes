import { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@stores/notesStore";
import { useClickOutside } from "@hooks/useClickOutside";
import { exportNoteToPdf, exportNoteAsMarkdown, exportNoteAsHtml } from "@utils/exportPdf";
import { toast } from "@components/ui/Toast";
import { cn } from "@utils/cn";
import {
  Download,
  X,
  FileText,
  FileDown,
  FileCode,
  CheckSquare,
  Square,
  Loader2,
  CheckCircle,
  Package,
  MinusSquare,
} from "lucide-react";
import type { Note, NoteId } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * BulkExportModal — Stage 6 (Final)
 *
 * Select multiple notes → export as individual files.
 * Supports PDF, Markdown, and HTML formats.
 * Exports each note individually (ZIP requires jszip which
 * is installed but we keep it simple — sequential downloads).
 * ───────────────────────────────────────────────────────────── */

interface BulkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = "pdf" | "markdown" | "html";

export function BulkExportModal({ isOpen, onClose }: BulkExportModalProps) {
  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<NoteId>>(new Set());
  const [format, setFormat] = useState<ExportFormat>("markdown");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportDone, setExportDone] = useState(false);

  useClickOutside(panelRef, isOpen ? onClose : () => {});

  const allNotes = useMemo(
    () =>
      Object.values(notes)
        .filter((n) => !trashedNoteIds.includes(n.id))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [notes, trashedNoteIds],
  );

  const toggleNote = useCallback((id: NoteId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === allNotes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allNotes.map((n) => n.id)));
    }
  }, [allNotes, selectedIds.size]);

  async function handleExport() {
    if (selectedIds.size === 0) {
      toast.warning("Select at least one note to export");
      return;
    }

    setIsExporting(true);
    setExportDone(false);
    setProgress(0);

    const selected = allNotes.filter((n) => selectedIds.has(n.id));
    let done = 0;

    try {
      for (const note of selected) {
        switch (format) {
          case "pdf":
            await exportNoteToPdf(note);
            break;
          case "markdown":
            exportNoteAsMarkdown(note);
            break;
          case "html":
            exportNoteAsHtml(note);
            break;
        }
        done++;
        setProgress(Math.round((done / selected.length) * 100));
        // Small delay between exports to prevent browser blocking
        if (done < selected.length) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      setExportDone(true);
      toast.success(`Exported ${done} note${done > 1 ? "s" : ""} as ${format.toUpperCase()}`);

      setTimeout(() => {
        onClose();
        setExportDone(false);
        setSelectedIds(new Set());
        setProgress(0);
      }, 1500);
    } catch (err) {
      console.error("Bulk export failed:", err);
      toast.error(`Export failed after ${done} notes. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  }

  const allSelected = selectedIds.size === allNotes.length && allNotes.length > 0;
  const someSelected = selectedIds.size > 0 && selectedIds.size < allNotes.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="bulk-export-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            key="bulk-export-modal"
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
              "fixed left-1/2 top-1/2 z-[201] w-full max-w-[540px]",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-2xl border border-ragnar-border bg-ragnar-bg-secondary/95",
              "glass-surface shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
              "overflow-hidden flex flex-col max-h-[80vh]",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ragnar-accent/10">
                  <Package size={18} className="text-ragnar-accent" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-ragnar-text-primary">Bulk Export</h2>
                  <p className="text-[12px] text-ragnar-text-muted">
                    {selectedIds.size} of {allNotes.length} notes selected
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary"
              >
                <X size={16} />
              </button>
            </div>

            {/* Format picker */}
            <div className="border-b border-ragnar-border-subtle px-6 py-3">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
                Export Format
              </label>
              <div className="flex gap-2">
                {([
                  { id: "markdown" as const, label: "Markdown", icon: <FileText size={14} className="text-blue-400" /> },
                  { id: "pdf" as const, label: "PDF", icon: <FileDown size={14} className="text-red-400" /> },
                  { id: "html" as const, label: "HTML", icon: <FileCode size={14} className="text-orange-400" /> },
                ]).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-medium transition-all",
                      format === f.id
                        ? "border-ragnar-accent bg-ragnar-accent/8 text-ragnar-accent"
                        : "border-ragnar-border-subtle text-ragnar-text-muted hover:border-ragnar-border",
                    )}
                  >
                    {f.icon}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select all */}
            <div className="flex items-center gap-3 border-b border-ragnar-border-subtle px-6 py-2">
              <button onClick={toggleAll} className="flex items-center gap-2 text-[12px] font-medium text-ragnar-text-secondary hover:text-ragnar-text-primary transition-colors">
                {allSelected ? (
                  <CheckSquare size={14} className="text-ragnar-accent" />
                ) : someSelected ? (
                  <MinusSquare size={14} className="text-ragnar-accent" />
                ) : (
                  <Square size={14} />
                )}
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>

            {/* Note list */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-2">
              {allNotes.map((note) => (
                <NoteCheckRow
                  key={note.id}
                  note={note}
                  isSelected={selectedIds.has(note.id)}
                  onToggle={() => toggleNote(note.id)}
                />
              ))}
            </div>

            {/* Progress bar */}
            {isExporting && (
              <div className="px-6 py-2 border-t border-ragnar-border-subtle">
                <div className="flex items-center gap-2 mb-1">
                  <Loader2 size={12} className="animate-spin text-ragnar-accent" />
                  <span className="text-[11px] text-ragnar-text-muted">Exporting... {progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-ragnar-bg-tertiary overflow-hidden">
                  <motion.div
                    className="h-full bg-ragnar-accent rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-ragnar-border-subtle px-6 py-4">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleExport}
                disabled={isExporting || selectedIds.size === 0}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white",
                  "transition-all",
                  exportDone
                    ? "bg-emerald-500"
                    : selectedIds.size === 0
                      ? "bg-ragnar-text-muted/30 cursor-not-allowed"
                      : "bg-ragnar-accent shadow-[0_2px_12px_rgba(10,132,255,0.3)] hover:shadow-[0_4px_20px_rgba(10,132,255,0.45)]",
                  isExporting && "opacity-80 cursor-wait",
                )}
              >
                {isExporting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : exportDone ? (
                  <CheckCircle size={14} />
                ) : (
                  <Download size={14} />
                )}
                {isExporting
                  ? "Exporting…"
                  : exportDone
                    ? "Done!"
                    : `Export ${selectedIds.size} note${selectedIds.size !== 1 ? "s" : ""}`}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NoteCheckRow({
  note,
  isSelected,
  onToggle,
}: {
  note: Note;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const wordCount = note.content.split(/\s+/).filter(Boolean).length;

  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
        isSelected ? "bg-ragnar-accent/8" : "hover:bg-ragnar-bg-hover",
      )}
    >
      {isSelected ? (
        <CheckSquare size={14} className="flex-shrink-0 text-ragnar-accent" />
      ) : (
        <Square size={14} className="flex-shrink-0 text-ragnar-text-muted" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("truncate text-[13px] font-medium", isSelected ? "text-ragnar-accent" : "text-ragnar-text-primary")}>
          {note.title}
        </p>
        <p className="text-[10px] text-ragnar-text-muted">
          {wordCount} words · {note.frontmatter.tags.length > 0 ? note.frontmatter.tags.map((t) => `#${t}`).join(" ") : "No tags"}
        </p>
      </div>
    </button>
  );
}
