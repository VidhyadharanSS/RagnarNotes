import { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@stores/notesStore";
import { useEditorStore } from "@stores/editorStore";
import { useClickOutside } from "@hooks/useClickOutside";
import { toast } from "@components/ui/Toast";
import { cn } from "@utils/cn";
import { formatBytes } from "@utils/format";
import type { Note } from "@/types";
import {
  X,
  HardDrive,
  Trash2,
  FileText,
  FolderOpen,
  Pin,
  Tag,
  Upload,
  AlertTriangle,
  RefreshCw,
  Database,
  Download,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * StorageManager — Stage 6 (Final)
 *
 * Local app data management:
 *  - Shows localStorage usage & breakdown
 *  - Import .md files via file input
 *  - Export all notes as .md files
 *  - Clear all data with confirmation
 *  - Stats: notes, folders, tags, storage used
 * ───────────────────────────────────────────────────────────── */

interface StorageManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StorageManager({ isOpen, onClose }: StorageManagerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notes = useNotesStore((s) => s.notes);
  const folders = useNotesStore((s) => s.folders);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);
  const pinnedNoteIds = useNotesStore((s) => s.pinnedNoteIds);
  const importNotes = useNotesStore((s) => s.importNotes);
  const clearAllData = useNotesStore((s) => s.clearAllData);
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useClickOutside(panelRef, isOpen ? onClose : () => {});

  const stats = useMemo(() => {
    const allNotes = Object.values(notes);
    const activeNotes = allNotes.filter((n) => !trashedNoteIds.includes(n.id));
    const totalWords = activeNotes.reduce(
      (sum, n) => sum + n.content.split(/\s+/).filter(Boolean).length,
      0,
    );
    const allTags = new Set(activeNotes.flatMap((n) => n.frontmatter.tags));

    let notesSize = 0;
    let prefsSize = 0;
    let appSize = 0;
    try {
      const notesData = localStorage.getItem("ragnar-notes-store");
      notesSize = notesData ? new Blob([notesData]).size : 0;
      const prefsData = localStorage.getItem("ragnar-app-store");
      prefsSize = prefsData ? new Blob([prefsData]).size : 0;
      const prefData = localStorage.getItem("ragnar-preferences");
      appSize = prefData ? new Blob([prefData]).size : 0;
    } catch {
      // ignore
    }

    return {
      totalNotes: allNotes.length,
      activeNotes: activeNotes.length,
      trashedNotes: trashedNoteIds.length,
      pinnedNotes: pinnedNoteIds.length,
      totalFolders: Object.keys(folders).length,
      totalWords,
      totalTags: allTags.size,
      notesSize,
      prefsSize,
      appSize,
      totalSize: notesSize + prefsSize + appSize,
    };
  }, [notes, folders, trashedNoteIds, pinnedNoteIds]);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const imported: Note[] = [];
      const now = new Date().toISOString();

      for (const file of Array.from(files)) {
        if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown") && !file.name.endsWith(".txt")) {
          toast.warning(`Skipped: ${file.name} (not a Markdown file)`);
          continue;
        }

        try {
          const content = await file.text();
          const title = file.name.replace(/\.(md|markdown|txt)$/, "");
          const id = `note-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

          const tagMatches = content.match(/#(\w+)/g);
          const tags = tagMatches
            ? [...new Set(tagMatches.map((t) => t.slice(1)))].slice(0, 10)
            : [];

          imported.push({
            id,
            title,
            content,
            folderId: "folder-work",
            filePath: `/vault/imported/${file.name}`,
            isUnsaved: false,
            frontmatter: {
              title,
              createdAt: now,
              updatedAt: now,
              tags,
              pinned: false,
              aliases: [],
            },
          });
        } catch {
          toast.error(`Failed to read: ${file.name}`);
        }
      }

      if (imported.length > 0) {
        importNotes(imported);
        toast.success(`Imported ${imported.length} note${imported.length > 1 ? "s" : ""}`);
        if (imported.length === 1) {
          setActiveNote(imported[0]);
        }
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [importNotes, setActiveNote],
  );

  const handleClearAll = useCallback(() => {
    clearAllData();
    setActiveNote(null);
    localStorage.removeItem("ragnar-notes-store");
    toast.success("All data cleared. Reload to start fresh.");
    setShowConfirmClear(false);
    onClose();
  }, [clearAllData, setActiveNote, onClose]);

  const handleExportAll = useCallback(() => {
    const allNotes = Object.values(notes).filter((n) => !trashedNoteIds.includes(n.id));
    if (allNotes.length === 0) {
      toast.warning("No notes to export");
      return;
    }
    window.dispatchEvent(new Event("ragnar-open-bulk-export"));
    onClose();
  }, [notes, trashedNoteIds, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="storage-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black"
          />
          <motion.div
            key="storage-panel"
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className={cn(
              "fixed right-0 top-0 z-[151] h-full w-full max-w-[380px]",
              "border-l border-ragnar-border bg-ragnar-bg-secondary",
              "shadow-[-20px_0_60px_rgba(0,0,0,0.35)]",
              "flex flex-col overflow-hidden",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ragnar-accent/10">
                  <HardDrive size={15} className="text-ragnar-accent" />
                </div>
                <h2 className="text-[15px] font-bold text-ragnar-text-primary">Storage & Data</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-6">
              {/* Storage usage */}
              <div>
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
                  <Database size={11} /> Local Storage
                </p>
                <div className="rounded-xl bg-ragnar-bg-hover/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-ragnar-text-primary">
                      {formatBytes(stats.totalSize)}
                    </span>
                    <span className="text-[11px] text-ragnar-text-muted">of ~5 MB limit</span>
                  </div>
                  <div className="h-2 rounded-full bg-ragnar-bg-tertiary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats.totalSize / (5 * 1024 * 1024)) * 100, 100)}%` }}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        "h-full rounded-full",
                        stats.totalSize > 4 * 1024 * 1024 ? "bg-red-500" : stats.totalSize > 3 * 1024 * 1024 ? "bg-amber-500" : "bg-ragnar-accent",
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-ragnar-text-muted">Notes data</span>
                      <span className="text-ragnar-text-primary font-medium">{formatBytes(stats.notesSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ragnar-text-muted">Preferences</span>
                      <span className="text-ragnar-text-primary font-medium">{formatBytes(stats.prefsSize + stats.appSize)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
                  <FileText size={11} /> Vault Statistics
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard icon={<FileText size={13} />} label="Active Notes" value={stats.activeNotes} />
                  <StatCard icon={<Trash2 size={13} />} label="In Trash" value={stats.trashedNotes} />
                  <StatCard icon={<Pin size={13} />} label="Pinned" value={stats.pinnedNotes} />
                  <StatCard icon={<FolderOpen size={13} />} label="Folders" value={stats.totalFolders} />
                  <StatCard icon={<Tag size={13} />} label="Tags" value={stats.totalTags} />
                  <StatCard icon={<FileText size={13} />} label="Total Words" value={stats.totalWords.toLocaleString()} />
                </div>
              </div>

              {/* Import */}
              <div>
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
                  <Upload size={11} /> Import Notes
                </p>
                <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt" multiple onChange={handleImport} className="hidden" />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl border",
                    "border-dashed border-ragnar-border py-4 text-[13px] font-medium",
                    "text-ragnar-text-muted transition-all",
                    "hover:border-ragnar-accent hover:text-ragnar-accent hover:bg-ragnar-accent/5",
                  )}
                >
                  <Upload size={16} />
                  Drop or click to import .md files
                </motion.button>
              </div>

              {/* Export all */}
              <div>
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
                  <Download size={11} /> Export Data
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExportAll}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl border",
                    "border-ragnar-border-subtle py-3 text-[13px] font-medium",
                    "text-ragnar-text-secondary transition-all",
                    "hover:border-ragnar-border hover:text-ragnar-text-primary hover:bg-ragnar-bg-hover",
                  )}
                >
                  <Download size={14} />
                  Bulk Export All Notes
                </motion.button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-ragnar-border-subtle px-5 py-4 space-y-2">
              {showConfirmClear ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle size={14} />
                    <span className="text-[12px] font-semibold">Delete ALL notes permanently?</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowConfirmClear(false)} className="flex-1 rounded-lg border border-ragnar-border-subtle py-2 text-[12px] font-medium text-ragnar-text-muted hover:bg-ragnar-bg-hover transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleClearAll} className="flex-1 rounded-lg bg-red-500 py-2 text-[12px] font-semibold text-white hover:bg-red-600 transition-colors">
                      Yes, Delete Everything
                    </button>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowConfirmClear(true)}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl border",
                    "border-red-400/20 py-2.5 text-[12px] font-medium",
                    "text-red-400 transition-all",
                    "hover:border-red-400/40 hover:bg-red-500/5",
                  )}
                >
                  <RefreshCw size={12} />
                  Clear All Data
                </motion.button>
              )}
              <p className="text-center text-[10px] text-ragnar-text-muted/40">
                Data stored locally · Not synced to cloud
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-ragnar-bg-hover/60 px-3 py-2.5">
      <span className="text-ragnar-text-muted">{icon}</span>
      <div>
        <p className="text-[13px] font-bold text-ragnar-text-primary">{value}</p>
        <p className="text-[10px] text-ragnar-text-muted">{label}</p>
      </div>
    </div>
  );
}
