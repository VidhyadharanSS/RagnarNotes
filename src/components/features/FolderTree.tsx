import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@stores/notesStore";
import { useEditorStore } from "@stores/editorStore";
import { cn } from "@utils/cn";
import type { FolderId } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * FolderTree — Recursive folder navigation in the sidebar
 *
 * Features:
 *  - Nested folder expansion/collapse with spring animation
 *  - Note count badge per folder
 *  - Active folder highlight
 *  - Drag targets (Stage 5)
 * ───────────────────────────────────────────────────────────── */

export function FolderTree() {
  const rootFolderIds = useNotesStore((s) => s.rootFolderIds);

  if (rootFolderIds.length === 0) {
    return (
      <p className="px-3 py-2 text-[12px] text-ragnar-text-muted">
        No folders yet
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {rootFolderIds.map((id) => (
        <FolderNode key={id} folderId={id} depth={0} />
      ))}
    </div>
  );
}

/* ── Recursive Folder Node ── */

function FolderNode({
  folderId,
  depth,
}: {
  folderId: FolderId;
  depth: number;
}) {
  const folder = useNotesStore((s) => s.folders[folderId]);
  const toggleFolderExpanded = useNotesStore((s) => s.toggleFolderExpanded);
  const notes = useNotesStore((s) => s.notes);
  const activeNote = useEditorStore((s) => s.activeNote);

  if (!folder) return null;

  const noteCount = Object.values(notes).filter(
    (n) => n.folderId === folderId,
  ).length;

  const isActive = activeNote?.folderId === folderId;

  return (
    <div>
      {/* Folder row */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => toggleFolderExpanded(folderId)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg py-1.5 pr-3 text-left transition-colors",
          "text-[13px]",
          isActive
            ? "text-ragnar-text-primary"
            : "text-ragnar-text-secondary hover:bg-ragnar-sidebar-hover hover:text-ragnar-text-primary",
        )}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
      >
        {/* Chevron */}
        <motion.span
          animate={{ rotate: folder.isExpanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="flex-shrink-0 text-ragnar-text-muted"
        >
          <ChevronIcon />
        </motion.span>

        {/* Folder icon */}
        <span className="flex-shrink-0 text-ragnar-text-muted">
          {folder.isExpanded ? <FolderOpenIcon /> : <FolderIcon />}
        </span>

        {/* Name */}
        <span className="flex-1 truncate font-medium">{folder.name}</span>

        {/* Note count */}
        {noteCount > 0 && (
          <span className="ml-auto text-[11px] text-ragnar-text-muted">
            {noteCount}
          </span>
        )}
      </motion.button>

      {/* Children */}
      <AnimatePresence initial={false}>
        {folder.isExpanded && folder.children.length > 0 && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {folder.children.map((childId) => (
              <FolderNode key={childId} folderId={childId} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes in this folder (when expanded) */}
      <AnimatePresence initial={false}>
        {folder.isExpanded && noteCount > 0 && (
          <motion.div
            key="notes"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <FolderNoteList folderId={folderId} depth={depth} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Notes list inside a folder ── */

function FolderNoteList({
  folderId,
  depth,
}: {
  folderId: FolderId;
  depth: number;
}) {
  const notes = useNotesStore((s) => s.getNotesByFolder(folderId));
  const activeNoteId = useEditorStore((s) => s.activeNoteId);
  const setActiveNote = useEditorStore((s) => s.setActiveNote);

  return (
    <>
      {notes.map((note) => (
        <motion.button
          key={note.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveNote(note)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg py-1 pr-3 text-left text-[12px] transition-colors",
            note.id === activeNoteId
              ? "bg-ragnar-sidebar-active text-ragnar-accent"
              : "text-ragnar-text-muted hover:bg-ragnar-sidebar-hover hover:text-ragnar-text-primary",
          )}
          style={{ paddingLeft: `${28 + depth * 14}px` }}
        >
          <span className="flex-shrink-0">
            <NoteLeafIcon />
          </span>
          <span className="truncate">{note.title || "Untitled"}</span>
        </motion.button>
      ))}
    </>
  );
}

/* ── Icons ── */
function ChevronIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,1 6,4 2,7" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 3.5h4l1.5-2H11.5a1 1 0 011 1v7a1 1 0 01-1 1h-10a1 1 0 01-1-1V4.5a1 1 0 011-1z" />
    </svg>
  );
}
function FolderOpenIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 3.5h4l1.5-2H11.5a1 1 0 011 1v2H.5" />
      <path d="M.5 4.5l1.5 6h10l1.5-6H.5z" />
    </svg>
  );
}
function NoteLeafIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="1" y="1" width="8" height="8" rx="1" />
      <line x1="3" y1="3.5" x2="7" y2="3.5" />
      <line x1="3" y1="5.5" x2="7" y2="5.5" />
      <line x1="3" y1="7.5" x2="5.5" y2="7.5" />
    </svg>
  );
}
