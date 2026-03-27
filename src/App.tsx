import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TitleBar } from "@components/layout/TitleBar";
import { Sidebar } from "@components/layout/Sidebar";
import { NoteList } from "@components/layout/NoteList";
import { EditorPane } from "@components/layout/EditorPane";
import { CommandPalette } from "@components/features/CommandPalette";
import { ExportModal } from "@components/features/ExportModal";
import { SettingsPanel } from "@components/features/SettingsPanel";
import { StorageManager } from "@components/features/StorageManager";
import { BulkExportModal } from "@components/features/BulkExportModal";
import { ToastContainer } from "@components/ui/Toast";
import { useAppStore } from "@stores/appStore";
import { useEditorStore } from "@stores/editorStore";
import { useNotesStore } from "@stores/notesStore";
import { useTheme } from "@hooks/useTheme";
import { SEED_NOTES, SEED_FOLDERS } from "@lib/seedData";

/* ─────────────────────────────────────────────────────────────
 * App — Stage 6 (Final) — v1.0.0
 *
 * Seed data only on FIRST launch (when notes store is empty).
 * On subsequent launches, persisted data from localStorage is used.
 * ───────────────────────────────────────────────────────────── */

export function App() {
  const isSidebarVisible = useAppStore((s) => s.isSidebarVisible);
  const editorMode = useEditorStore((s) => s.mode);
  const isZenMode = editorMode === "zen";
  const notes = useNotesStore((s) => s.notes);
  const setNotes = useNotesStore((s) => s.setNotes);
  const setFolders = useNotesStore((s) => s.setFolders);
  const hasHydrated = useNotesStore((s) => s._hasHydrated);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [isBulkExportOpen, setIsBulkExportOpen] = useState(false);

  useTheme();

  // Seed data ONLY on first launch
  useEffect(() => {
    if (!hasHydrated) return;
    const noteCount = Object.keys(notes).length;
    if (noteCount === 0) {
      const pinnedNoteIds = SEED_NOTES.filter((n) => n.frontmatter.pinned).map((n) => n.id);
      setFolders(SEED_FOLDERS);
      setNotes(SEED_NOTES);
      useNotesStore.setState({ pinnedNoteIds });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  // Global event listeners
  useEffect(() => {
    const openExport = () => setIsExportOpen(true);
    const openSettings = () => setIsSettingsOpen(true);
    const openStorage = () => setIsStorageOpen(true);
    const openBulkExport = () => setIsBulkExportOpen(true);
    window.addEventListener("ragnar-open-export", openExport);
    window.addEventListener("ragnar-open-settings", openSettings);
    window.addEventListener("ragnar-open-storage", openStorage);
    window.addEventListener("ragnar-open-bulk-export", openBulkExport);
    return () => {
      window.removeEventListener("ragnar-open-export", openExport);
      window.removeEventListener("ragnar-open-settings", openSettings);
      window.removeEventListener("ragnar-open-storage", openStorage);
      window.removeEventListener("ragnar-open-bulk-export", openBulkExport);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-ragnar-bg-primary transition-colors duration-300">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isZenMode && isSidebarVisible && (
            <motion.div key="sidebar" initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }} className="flex-shrink-0 overflow-hidden">
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {!isZenMode && (
            <motion.div key="note-list" initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }} className="flex-shrink-0 overflow-hidden">
              <NoteList />
            </motion.div>
          )}
        </AnimatePresence>
        <EditorPane />
      </div>
      <CommandPalette />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <BulkExportModal isOpen={isBulkExportOpen} onClose={() => setIsBulkExportOpen(false)} />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <StorageManager isOpen={isStorageOpen} onClose={() => setIsStorageOpen(false)} />
      <ToastContainer />
    </div>
  );
}
