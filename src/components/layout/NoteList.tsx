import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@stores/notesStore";
import { useEditorStore } from "@stores/editorStore";
import { useAppStore } from "@stores/appStore";
import { useSearchStore } from "@stores/searchStore";
import { cn } from "@utils/cn";
import { formatRelativeTime, truncate } from "@utils/format";
import type { Note } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * NoteList — Middle panel: filtered list of notes
 *
 * Shows notes based on the current sidebar route:
 *  - all-notes  → all non-trashed notes
 *  - favorites  → pinned notes
 *  - trash      → trashed notes
 *  - tags       → tag browser (stub for Stage 5)
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

    // Sort: pinned first, then by updatedAt descending
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
        "flex h-full flex-col border-r border-ragnar-border-subtle",
        "bg-ragnar-bg-secondary",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-4 py-3">
        <h2 className="text-[13px] font-semibold text-ragnar-text-primary">
          {headings[sidebarRoute] ?? "Notes"}
        </h2>
        <span className="text-[11px] text-ragnar-text-muted">
          {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
        </span>
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
  index,
}: {
  note: Note;
  isActive: boolean;
  isPinned: boolean;
  index: number;
}) {
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const addRecentNote = useSearchStore((s) => s.addRecentNote);

  function handleClick() {
    setActiveNote(note);
    addRecentNote(note.id);
  }

  const excerpt = note.content
    ? truncate(
        note.content
          .replace(/#{1,6}\s+/g, "")
          .replace(/[*_`[\]>]/g, "")
          .replace(/\n+/g, " ")
          .trim(),
        120,
      )
    : "No content yet…";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.12) }}
      onClick={handleClick}
      className={cn(
        "group relative cursor-pointer border-b border-ragnar-border-subtle px-4 py-3",
        "transition-colors",
        isActive
          ? "bg-ragnar-accent/10 border-l-2 border-l-ragnar-accent"
          : "hover:bg-ragnar-bg-hover",
      )}
    >
      {/* Title row */}
      <div className="mb-1 flex items-center gap-1.5">
        {isPinned && (
          <span className="text-ragnar-accent">
            <PinIcon />
          </span>
        )}
        <h3
          className={cn(
            "flex-1 truncate text-[13px] font-semibold leading-tight",
            isActive ? "text-ragnar-text-primary" : "text-ragnar-text-primary",
          )}
        >
          {note.title || "Untitled"}
        </h3>
      </div>

      {/* Excerpt */}
      <p className="mb-1.5 line-clamp-2 text-[12px] leading-relaxed text-ragnar-text-muted">
        {excerpt}
      </p>

      {/* Footer: date + tags */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-ragnar-text-muted">
          {formatRelativeTime(note.frontmatter.updatedAt)}
        </span>
        {note.frontmatter.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-ragnar-bg-tertiary px-2 py-0.5 text-[10px] text-ragnar-text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Search ── */
function NoteListSearch() {
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);

  return (
    <div className="border-b border-ragnar-border-subtle px-3 py-2">
      <div className="flex items-center gap-2 rounded-md bg-ragnar-bg-hover px-3 py-1.5">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-ragnar-text-muted flex-shrink-0">
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
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-ragnar-text-muted hover:text-ragnar-text-primary"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({
  route,
  hasQuery,
}: {
  route: string;
  hasQuery: boolean;
}) {
  const messages: Record<string, { title: string; body: string }> = {
    "all-notes": { title: "No notes yet", body: "Create your first note to get started." },
    favorites: { title: "No pinned notes", body: "Pin notes to find them quickly here." },
    tags: { title: "No tags yet", body: "Add tags to notes via frontmatter." },
    trash: { title: "Trash is empty", body: "Deleted notes appear here." },
  };

  const msg = hasQuery
    ? { title: "No results", body: "Try a different search term." }
    : (messages[route] ?? { title: "Empty", body: "" });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <p className="text-[13px] font-medium text-ragnar-text-secondary">
        {msg.title}
      </p>
      <p className="mt-1 text-[12px] text-ragnar-text-muted">{msg.body}</p>
    </motion.div>
  );
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
      <path d="M7 0H3v4L1 6h3v4l1 0 1 0V6h3L7 4V0z" />
    </svg>
  );
}
