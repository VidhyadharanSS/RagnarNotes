import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { useClickOutside } from "@hooks/useClickOutside";
import { exportNoteToPdf, exportNoteAsMarkdown, exportNoteAsHtml } from "@utils/exportPdf";
import { toast } from "@components/ui/Toast";
import { cn } from "@utils/cn";
import {
  FileDown,
  FileText,
  FileCode,
  X,
  Download,
  CheckCircle,
  Loader2,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * ExportModal — Stage 4: Beautiful note export dialog
 *
 * Supports: PDF, Markdown (.md), HTML
 * Features: Format cards, page size selector, live progress
 * ───────────────────────────────────────────────────────────── */

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = "pdf" | "markdown" | "html";
type PageSize = "a4" | "letter" | "legal";

const FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
}[] = [
  {
    id: "pdf",
    label: "PDF Document",
    description: "Beautifully formatted, print-ready document",
    icon: <FileDown size={22} className="text-red-400" />,
    extension: ".pdf",
  },
  {
    id: "markdown",
    label: "Markdown",
    description: "Raw Markdown source file",
    icon: <FileText size={22} className="text-blue-400" />,
    extension: ".md",
  },
  {
    id: "html",
    label: "HTML",
    description: "Standalone web page with styling",
    icon: <FileCode size={22} className="text-orange-400" />,
    extension: ".html",
  },
];

const PAGE_SIZES: { id: PageSize; label: string }[] = [
  { id: "a4", label: "A4" },
  { id: "letter", label: "Letter" },
  { id: "legal", label: "Legal" },
];

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const activeNote = useEditorStore((s) => s.activeNote);
  const draftContent = useEditorStore((s) => s.draftContent);
  const panelRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  useClickOutside(panelRef, onClose);

  if (!activeNote) return null;

  // Use draftContent (live editing content) merged with note metadata
  const noteForExport = { ...activeNote, content: draftContent || activeNote.content };

  async function handleExport() {
    setIsExporting(true);
    setExportDone(false);

    try {
      switch (format) {
        case "pdf":
          await exportNoteToPdf(noteForExport, { pageSize });
          toast.success("PDF exported successfully!");
          break;
        case "markdown":
          exportNoteAsMarkdown(noteForExport);
          toast.success("Markdown file downloaded!");
          break;
        case "html":
          exportNoteAsHtml(noteForExport);
          toast.success("HTML file downloaded!");
          break;
      }
      setExportDone(true);
      setTimeout(() => {
        onClose();
        setExportDone(false);
      }, 1200);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="export-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="export-modal"
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
              "fixed left-1/2 top-1/2 z-[201] w-full max-w-[480px]",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-2xl border border-ragnar-border bg-ragnar-bg-secondary/95",
              "glass-surface shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
              "overflow-hidden",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ragnar-accent/10">
                  <Download size={18} className="text-ragnar-accent" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-ragnar-text-primary">Export Note</h2>
                  <p className="text-[12px] text-ragnar-text-muted truncate max-w-[280px]">
                    {activeNote.title}
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

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Format selection */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
                  Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMAT_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setFormat(opt.id); setExportDone(false); }}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-all",
                        format === opt.id
                          ? "border-ragnar-accent bg-ragnar-accent/8 shadow-sm"
                          : "border-ragnar-border-subtle bg-ragnar-bg-hover/50 hover:border-ragnar-border",
                      )}
                    >
                      {opt.icon}
                      <span className={cn(
                        "text-[12px] font-semibold",
                        format === opt.id ? "text-ragnar-accent" : "text-ragnar-text-primary",
                      )}>
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-ragnar-text-muted">{opt.extension}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* PDF-specific options */}
              <AnimatePresence mode="wait">
                {format === "pdf" && (
                  <motion.div
                    key="pdf-options"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
                      Page Size
                    </label>
                    <div className="flex gap-2">
                      {PAGE_SIZES.map((ps) => (
                        <motion.button
                          key={ps.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPageSize(ps.id)}
                          className={cn(
                            "rounded-lg border px-4 py-2 text-[12px] font-medium transition-all",
                            pageSize === ps.id
                              ? "border-ragnar-accent bg-ragnar-accent/8 text-ragnar-accent"
                              : "border-ragnar-border-subtle text-ragnar-text-muted hover:border-ragnar-border hover:text-ragnar-text-primary",
                          )}
                        >
                          {ps.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Note info summary */}
              <div className="rounded-xl bg-ragnar-bg-hover/60 px-4 py-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ragnar-text-muted">Words</span>
                  <span className="font-medium text-ragnar-text-primary">
                    {noteForExport.content.split(/\s+/).filter(Boolean).length.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-ragnar-text-muted">Tags</span>
                  <span className="font-medium text-ragnar-text-primary">
                    {activeNote.frontmatter.tags.length > 0
                      ? activeNote.frontmatter.tags.map((t) => `#${t}`).join(", ")
                      : "None"}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-ragnar-text-muted">Last updated</span>
                  <span className="font-medium text-ragnar-text-primary">
                    {new Date(activeNote.frontmatter.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

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
                disabled={isExporting}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white",
                  "transition-all",
                  exportDone
                    ? "bg-emerald-500 shadow-[0_2px_12px_rgba(16,185,129,0.3)]"
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
                {isExporting ? "Exporting…" : exportDone ? "Done!" : `Export as ${FORMAT_OPTIONS.find((o) => o.id === format)?.label}`}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
