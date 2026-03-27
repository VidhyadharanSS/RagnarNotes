import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@stores/notesStore";
import { useEditorStore } from "@stores/editorStore";
import { useAppStore } from "@stores/appStore";
import { useSearchStore } from "@stores/searchStore";
import { ContextMenu, type ContextMenuItem } from "@components/ui/ContextMenu";
import { cn } from "@utils/cn";
import { formatRelativeTime, truncate } from "@utils/format";
import {
  Pin,
  Trash2,
  RotateCcw,
  FileText,
  Search as SearchIcon,
  PinOff,
  X,
  SortAsc,
  SortDesc,
} from "lucide-react";
import type { Note } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * NoteList — Stage 3: Enhanced middle panel
 *
 * Enhancements:
 *  - Sort toggle (date / title)
 *  - Lucide icons everywhere
 *  - Smooth stagger animation on notes
 *  - Improved note card with gradient hover
 *  - Reading time in card
 *  - Better empty states
 * ───────────────────────────────────────────────────────────── */

type SortMode = "date" | "title";

export function NoteList() {
  const sidebarRoute = useAppStore((s) => s.sidebarRoute);
  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);
  const pinnedNoteIds = useNotesStore((s) => s.pinnedNoteIds);
  const activeNoteId = useEditorStore((s) => s.activeNoteId);
  const query = useSearchStore((s) => s.query);
  const [sortMode, setSortMode] = useState<SortMode>("date");

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
      if (sortMode === "title") return a.title.localeCompare(b.title);
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
      <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-4 py-2.5">
        <h2 className="text-[13px] font-bold text-ragnar-text-primary">
          {headings[sidebarRoute] ?? "Notes"}
        </h2>
        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSortMode(sortMode === "date" ? "title" : "date")}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary"
            title={`Sort by ${sortMode === "date" ? "title" : "date"}`}
          >
            {sortMode === "date" ? <SortDesc size={11} /> : <SortAsc size={11} />}
            {sortMode === "date" ? "Recent" : "A–Z"}
          </motion.button>
          <motion.span
            key={filteredNotes.length}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full bg-ragnar-bg-tertiary px-2 py-0.5 text-[10px] font-semibold text-ragnar-text-muted"
          >
            {filteredNotes.length}
          </motion.span>
        </div>
      </div>

      {/* Search */}
      <NoteListSearch />

      {/* Notes */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
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
        { id: "restore", label: "Restore Note", icon: <RotateCcw size={13} />, action: () => restoreNote(note.id) },
        { id: "sep", label: "", separator: true, action: () => {} },
        { id: "delete", label: "Delete Permanently", icon: <Trash2 size={13} />, danger: true, action: () => deleteNote(note.id) },
      ]
    : [
        { id: "pin", label: isPinned ? "Unpin" : "Pin Note", icon: isPinned ? <PinOff size={13} /> : <Pin size={13} />, action: () => pinNote(note.id, !isPinned) },
        { id: "sep", label: "", separator: true, action: () => {} },
        { id: "trash", label: "Move to Trash", icon: <Trash2 size={13} />, danger: true, action: () => trashNote(note.id) },
      ];

  const folderName = note.folderId ? folders[note.folderId]?.name : null;
  const wordCount = note.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const excerpt = note.content
    ? truncate(
        note.content
          .replace(/^---[\s\S]*?---\n?/, "")
          .replace(/#{1,6}\s+/g, "")
          .replace(/[*_`[\]>]/g, "")
          .replace(/\n+/g, " ")
          .trim(),
        100,
      )
    : "No content yet…";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4, height: 0 }}
        transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.08) }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative cursor-pointer border-b border-ragnar-border-subtle px-4 py-3",
          "transition-all duration-150",
          isActive
            ? "bg-ragnar-accent/8 border-l-2 border-l-ragnar-accent"
            : "border-l-2 border-l-transparent hover:bg-ragnar-bg-hover hover:border-l-ragnar-text-muted/30",
        )}
      >
        {/* Title row */}
        <div className="mb-1 flex items-center gap-1.5">
          {isPinned && (
            <Pin size={10} className="flex-shrink-0 text-ragnar-accent rotate-45" />
          )}
          <h3
            className={cn(
              "flex-1 truncate text-[13px] font-semibold leading-tight",
              isActive ? "text-ragnar-accent" : "text-ragnar-text-primary",
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
                    isPinned ? "text-ragnar-accent" : "text-ragnar-text-muted hover:text-ragnar-accent",
                  )}
                  title={isPinned ? "Unpin" : "Pin"}
                >
                  {isPinned ? <PinOff size={11} /> : <Pin size={11} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); trashNote(note.id); }}
                  className="rounded p-1 text-ragnar-text-muted transition-colors hover:text-red-400"
                  title="Trash"
                >
                  <Trash2 size={11} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Excerpt */}
        <p className="mb-1.5 line-clamp-2 text-[12px] leading-relaxed text-ragnar-text-muted">
          {excerpt}
        </p>

        {/* Footer: date + folder + reading time + tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-ragnar-text-muted">
            {formatRelativeTime(note.frontmatter.updatedAt)}
          </span>
          <span className="text-[10px] text-ragnar-text-muted">
            · {readingTime}m read
          </span>
          {folderName && (
            <span className="rounded-full bg-ragnar-accent/8 px-2 py-0.5 text-[10px] text-ragnar-accent/70">
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
      <div className="flex items-center gap-2 rounded-lg bg-ragnar-bg-hover/80 px-3 py-1.5 transition-all focus-within:ring-1 focus-within:ring-ragnar-accent/30">
        <SearchIcon size={12} className="flex-shrink-0 text-ragnar-text-muted" />
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
              className="rounded-full p-0.5 text-ragnar-text-muted hover:text-ragnar-text-primary hover:bg-ragnar-bg-tertiary"
            >
              <X size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Empty States ── */
function EmptyState({ route, hasQuery }: { route: string; hasQuery: boolean }) {
  const messages: Record<string, { title: string; body: string; icon: React.ReactNode }> = {
    "all-notes": {
      title: "No notes yet",
      body: "Create your first note to get started",
      icon: <FileText size={28} className="text-ragnar-text-muted" />,
    },
    favorites: {
      title: "No pinned notes",
      body: "Pin notes to find them quickly",
      icon: <Pin size={28} className="text-ragnar-text-muted" />,
    },
    tags: {
      title: "No tags yet",
      body: "Add tags via YAML frontmatter",
      icon: <></>,
    },
    trash: {
      title: "Trash is empty",
      body: "Deleted notes appear here",
      icon: <Trash2 size={28} className="text-ragnar-text-muted" />,
    },
  };

  const msg = hasQuery
    ? { title: "No results", body: "Try a different search term", icon: <SearchIcon size={28} className="text-ragnar-text-muted" /> }
    : (messages[route] ?? { title: "Empty", body: "", icon: <FileText size={28} className="text-ragnar-text-muted" /> });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center gap-3"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ragnar-bg-tertiary/50">
        {msg.icon}
      </div>
      <p className="text-[13px] font-semibold text-ragnar-text-secondary">{msg.title}</p>
      <p className="text-[12px] text-ragnar-text-muted max-w-[200px]">{msg.body}</p>
    </motion.div>
  );
}
