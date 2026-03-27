import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TitleBar } from "@components/layout/TitleBar";
import { Sidebar } from "@components/layout/Sidebar";
import { NoteList } from "@components/layout/NoteList";
import { EditorPane } from "@components/layout/EditorPane";
import { CommandPalette } from "@components/features/CommandPalette";
import { useAppStore } from "@stores/appStore";
import { useEditorStore } from "@stores/editorStore";
import { useNotesStore } from "@stores/notesStore";
import { SEED_NOTES, SEED_FOLDERS } from "@lib/seedData";

export function App() {
  const isSidebarVisible = useAppStore((s) => s.isSidebarVisible);
  const editorMode = useEditorStore((s) => s.mode);
  const isZenMode = editorMode === "zen";
  const setNotes = useNotesStore((s) => s.setNotes);
  const setFolders = useNotesStore((s) => s.setFolders);
  const pinnedNoteIds = SEED_NOTES.filter((n) => n.frontmatter.pinned).map((n) => n.id);

  // Bootstrap seed data in dev/browser mode (Stage 4 replaces with vault read)
  useEffect(() => {
    setFolders(SEED_FOLDERS);
    setNotes(SEED_NOTES);
    // Seed pinned notes
    useNotesStore.setState({ pinnedNoteIds });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-ragnar-bg-primary">
      {/* macOS-style title bar (drag region) */}
      <TitleBar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isZenMode && isSidebarVisible && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex-shrink-0 overflow-hidden"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isZenMode && (
            <motion.div
              key="note-list"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex-shrink-0 overflow-hidden"
            >
              <NoteList />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor pane always visible, expands to fill */}
        <EditorPane />
      </div>

      {/* Command palette overlay */}
      <CommandPalette />
    </div>
  );
}
