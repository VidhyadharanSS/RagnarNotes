import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TitleBar } from "@components/layout/TitleBar";
import { Sidebar } from "@components/layout/Sidebar";
import { NoteList } from "@components/layout/NoteList";
import { EditorPane } from "@components/layout/EditorPane";
import { CommandPalette } from "@components/features/CommandPalette";
import { ExportModal } from "@components/features/ExportModal";
import { SettingsPanel } from "@components/features/SettingsPanel";
import { ToastContainer } from "@components/ui/Toast";
import { useAppStore } from "@stores/appStore";
import { useEditorStore } from "@stores/editorStore";
import { useNotesStore } from "@stores/notesStore";
import { useTheme } from "@hooks/useTheme";
import { SEED_NOTES, SEED_FOLDERS } from "@lib/seedData";

export function App() {
  const isSidebarVisible = useAppStore((s) => s.isSidebarVisible);
  const editorMode = useEditorStore((s) => s.mode);
  const isZenMode = editorMode === "zen";
  const setNotes = useNotesStore((s) => s.setNotes);
  const setFolders = useNotesStore((s) => s.setFolders);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Theme must be called at root level
  useTheme();

  // Seed data on first load
  useEffect(() => {
    const pinnedNoteIds = SEED_NOTES.filter((n) => n.frontmatter.pinned).map((n) => n.id);
    setFolders(SEED_FOLDERS);
    setNotes(SEED_NOTES);
    useNotesStore.setState({ pinnedNoteIds });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global event listeners
  useEffect(() => {
    const openExport = () => setIsExportOpen(true);
    const openSettings = () => setIsSettingsOpen(true);
    window.addEventListener("ragnar-open-export", openExport);
    window.addEventListener("ragnar-open-settings", openSettings);
    return () => {
      window.removeEventListener("ragnar-open-export", openExport);
      window.removeEventListener("ragnar-open-settings", openSettings);
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
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ToastContainer />
    </div>
  );
}
