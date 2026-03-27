import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@stores/notesStore";
import { useEditorStore } from "@stores/editorStore";
import { useAppStore } from "@stores/appStore";
import { useSearchStore } from "@stores/searchStore";
import { ContextMenu, type ContextMenuItem } from "@components/ui/ContextMenu";
import { cn } from "@utils/cn";
import { formatRelativeTime, truncate } from "@utils/format";
import type { Note } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * NoteList — Middle panel (Stage 2)
 *
 * Stage 2 additions:
 *  - Right-click context menu per note (pin, trash, rename)
 *  - Hover actions (pin toggle, trash)
 *  - Folder badge under note title
 *  - Smooth layout animations (layoutId)
 * ───────────────────────────────────────────────────────────── */

export function NoteList() {
  const sidebarRoute = useAppStore((s) => s.sidebarRoute);
  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);
  const pinnedNoteIds = useNotesStore((s) => s.pinnedNoteIds);
  const activeNoteId = useEditorStore((s) => s.activeNoteId);
  const query = useSearchStore((s) => s.query);

  const allNotes = Object.values(notes);

  function filterNotes(): Note[] {
    let filtered: Note[];
    switch (sidebarRoute) {
      case "favorites":
        filtered = allNotes.filter((n) => pinnedNoteIds.includes(n.id));
        break;
      case "trash":
        filtered = allNotes.filter((n) => trashedNoteIds.includes(n.id));
        break;
      default:
        filtered = allNotes.filter((n) => !trashedNoteIds.includes(n.id));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q),
      );
    }
    return filtered.sort((a, b) => {
      const aPinned = pinnedNoteIds.includes(a.id) ? 1 : 0;
      const bPinned = pinnedNoteIds.includes(b.id) ? 1 : 0;
      if (bPinned !== aPinned) return bPinned - aPinned;
      return (
        new Date(b.frontmatter.updatedAt).getTime() -
        new Date(a.frontmatter.updatedAt).getTime()
      );
    });
  }

  const filteredNotes = filterNotes();

  const headings: Record<string, string> = {
    "all-notes": "All Notes",
    favorites: "Pinned",
    tags: "Tags",
    trash: "Trash",
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        "border-r border-ragnar-border-subtle bg-ragnar-bg-secondary",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-4 py-3">
        <h2 className="text-[13px] font-semibold text-ragnar-text-primary">
          {headings[sidebarRoute] ?? "Notes"}
        </h2>
        <motion.span
          key={filteredNotes.length}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[11px] text-ragnar-text-muted"
        >
          {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
        </motion.span>
      </div>

      {/* Search input */}
      <NoteListSearch />

      {/* Note items */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {filteredNotes.length === 0 ? (
            <EmptyState route={sidebarRoute} hasQuery={!!query} />
          ) : (
            filteredNotes.map((note, idx) => (
              <NoteItem
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                isPinned={pinnedNoteIds.includes(note.id)}
                isTrashed={trashedNoteIds.includes(note.id)}
                index={idx}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── NoteItem ── */

function NoteItem({
  note,
  isActive,
  isPinned,
  isTrashed,
  index,
}: {
  note: Note;
  isActive: boolean;
  isPinned: boolean;
  isTrashed: boolean;
  index: number;
}) {
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const addRecentNote = useSearchStore((s) => s.addRecentNote);
  const pinNote = useNotesStore((s) => s.pinNote);
  const trashNote = useNotesStore((s) => s.trashNote);
  const restoreNote = useNotesStore((s) => s.restoreNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const folders = useNotesStore((s) => s.folders);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  function handleClick() {
    setActiveNote(note);
    addRecentNote(note.id);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }

  const contextItems: ContextMenuItem[] = isTrashed
    ? [
        {
          id: "restore",
          label: "Restore Note",
          icon: <RestoreIcon />,
          action: () => restoreNote(note.id),
        },
        {
          id: "sep",
          label: "",
          separator: true,
          action: () => {},
        },
        {
          id: "delete",
          label: "Delete Permanently",
          icon: <TrashIcon />,
          danger: true,
          action: () => deleteNote(note.id),
        },
      ]
    : [
        {
          id: "pin",
          label: isPinned ? "Unpin Note" : "Pin Note",
          icon: <PinIcon />,
          action: () => pinNote(note.id, !isPinned),
        },
        {
          id: "sep",
          label: "",
          separator: true,
          action: () => {},
        },
        {
          id: "trash",
          label: "Move to Trash",
          icon: <TrashIcon />,
          danger: true,
          action: () => trashNote(note.id),
        },
      ];

  const folderName = note.folderId ? folders[note.folderId]?.name : null;

  const excerpt = note.content
    ? truncate(
        note.content
          .replace(/^---[\s\S]*?---\n?/, "")
          .replace(/#{1,6}\s+/g, "")
          .replace(/[*_`[\]>]/g, "")
          .replace(/\n+/g, " ")
          .trim(),
        110,
      )
    : "No content yet…";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4, height: 0 }}
        transition={{ duration: 0.15, delay: Math.min(index * 0.025, 0.1) }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative cursor-pointer border-b border-ragnar-border-subtle px-4 py-3",
          "transition-colors",
          isActive
            ? "bg-ragnar-accent/8 border-l-2 border-l-ragnar-accent"
            : "hover:bg-ragnar-bg-hover",
        )}
      >
        {/* Title row */}
        <div className="mb-1 flex items-center gap-1.5">
          {isPinned && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-ragnar-accent opacity-70"
            >
              <PinIcon size={9} />
            </motion.span>
          )}
          <h3
            className={cn(
              "flex-1 truncate text-[13px] font-semibold leading-tight",
              "text-ragnar-text-primary",
            )}
          >
            {note.title || "Untitled"}
          </h3>

          {/* Hover actions */}
          <AnimatePresence>
            {isHovered && !isTrashed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                className="flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); pinNote(note.id, !isPinned); }}
                  className={cn(
                    "rounded p-1 transition-colors",
                    isPinned
                      ? "text-ragnar-accent"
                      : "text-ragnar-text-muted hover:text-ragnar-accent",
                  )}
                  title={isPinned ? "Unpin" : "Pin"}
                >
                  <PinIcon size={10} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); trashNote(note.id); }}
                  className="rounded p-1 text-ragnar-text-muted transition-colors hover:text-red-400"
                  title="Move to Trash"
                >
                  <TrashIcon />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Excerpt */}
        <p className="mb-1.5 line-clamp-2 text-[12px] leading-relaxed text-ragnar-text-muted">
          {excerpt}
        </p>

        {/* Footer: date + folder + tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-ragnar-text-muted">
            {formatRelativeTime(note.frontmatter.updatedAt)}
          </span>
          {folderName && (
            <span className="rounded-full bg-ragnar-accent/10 px-2 py-0.5 text-[10px] text-ragnar-accent/70">
              {folderName}
            </span>
          )}
          {note.frontmatter.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-ragnar-bg-tertiary px-2 py-0.5 text-[10px] text-ragnar-text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          items={contextItems}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

/* ── Search ── */
function NoteListSearch() {
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);

  return (
    <div className="border-b border-ragnar-border-subtle px-3 py-2">
      <div className="flex items-center gap-2 rounded-md bg-ragnar-bg-hover px-3 py-1.5">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="flex-shrink-0 text-ragnar-text-muted"
        >
          <circle cx="5" cy="5" r="3.5" />
          <line x1="8" y1="8" x2="11" y2="11" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter notes…"
          className={cn(
            "flex-1 bg-transparent text-[12px] text-ragnar-text-primary outline-none",
            "placeholder:text-ragnar-text-muted",
          )}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={() => setQuery("")}
              className="rounded-full bg-ragnar-bg-tertiary p-0.5 text-[11px] text-ragnar-text-muted hover:text-ragnar-text-primary"
            >
              ×
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ route, hasQuery }: { route: string; hasQuery: boolean }) {
  const messages: Record<string, { title: string; body: string; emoji: string }> = {
    "all-notes": { title: "No notes yet", body: "Create your first note to get started.", emoji: "📝" },
    favorites: { title: "No pinned notes", body: "Pin notes to find them quickly.", emoji: "📌" },
    tags: { title: "No tags yet", body: "Add tags via frontmatter.", emoji: "🏷️" },
    trash: { title: "Trash is empty", body: "Deleted notes appear here.", emoji: "🗑️" },
  };
  const msg = hasQuery
    ? { title: "No results", body: "Try a different search term.", emoji: "🔍" }
    : (messages[route] ?? { title: "Empty", body: "", emoji: "📄" });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2"
    >
      <span className="text-3xl">{msg.emoji}</span>
      <p className="text-[13px] font-medium text-ragnar-text-secondary">{msg.title}</p>
      <p className="text-[12px] text-ragnar-text-muted">{msg.body}</p>
    </motion.div>
  );
}

/* ── Icons ── */
function PinIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="currentColor">
      <path d="M7 0H3v4L1 6h3v4l1 0 1 0V6h3L7 4V0z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <polyline points="1,2.5 10,2.5" />
      <path d="M3.5 2.5V2a1 1 0 011-1h2a1 1 0 011 1v.5" />
      <path d="M2 2.5l.6 6.5a1 1 0 001 .9h3.8a1 1 0 001-.9L9 2.5" />
    </svg>
  );
}
function RestoreIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 5.5a4.5 4.5 0 109-0" />
      <polyline points="1,2.5 1,5.5 4,5.5" />
    </svg>
  );
}
