import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@stores/notesStore";
import { useEditorStore } from "@stores/editorStore";
import { useAppStore } from "@stores/appStore";
import { useSearchStore } from "@stores/searchStore";
import { ContextMenu, type ContextMenuItem } from "@components/ui/ContextMenu";
import { toast } from "@components/ui/Toast";
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
  Copy,
  Download,
  FileEdit,
} from "lucide-react";
import type { Note } from "@/types";

/**
 * NoteList — Stage 4
 *
 * Improvements:
 *  - Tag filter chips at top (click to filter by tag)
 *  - Improved card: gradient left border on active, better excerpt
 *  - Trash bulk-empty action
 *  - Hover inline: pin + trash quick actions
 *  - Sort label cycles: Recent → A–Z → Oldest
 */

type SortMode = "date-desc" | "title" | "date-asc";

const SORT_LABELS: Record<SortMode, { label: string; icon: React.ReactNode; next: SortMode }> = {
  "date-desc": { label: "Recent", icon: <SortDesc size={11} />, next: "title" },
  title: { label: "A–Z", icon: <SortAsc size={11} />, next: "date-asc" },
  "date-asc": { label: "Oldest", icon: <SortDesc size={11} className="rotate-180" />, next: "date-desc" },
};

export function NoteList() {
  const sidebarRoute = useAppStore((s) => s.sidebarRoute);
  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);
  const pinnedNoteIds = useNotesStore((s) => s.pinnedNoteIds);
  const activeNoteId = useEditorStore((s) => s.activeNoteId);
  const query = useSearchStore((s) => s.query);
  const [sortMode, setSortMode] = useState<SortMode>("date-desc");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allNotes = Object.values(notes);

  // Collect all unique tags across non-trashed notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allNotes
      .filter((n) => !trashedNoteIds.includes(n.id))
      .forEach((n) => n.frontmatter.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [allNotes, trashedNoteIds]);

  function filterNotes(): Note[] {
    let filtered: Note[];
    switch (sidebarRoute) {
      case "favorites":
        filtered = allNotes.filter((n) => pinnedNoteIds.includes(n.id));
        break;
      case "trash":
        filtered = allNotes.filter((n) => trashedNoteIds.includes(n.id));
        break;
      case "tags":
        filtered = allNotes.filter(
          (n) =>
            !trashedNoteIds.includes(n.id) &&
            n.frontmatter.tags.length > 0,
        );
        break;
      default:
        filtered = allNotes.filter((n) => !trashedNoteIds.includes(n.id));
    }

    if (tagFilter) {
      filtered = filtered.filter((n) => n.frontmatter.tags.includes(tagFilter));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.frontmatter.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return filtered.sort((a, b) => {
      // Always pin notes first (in non-trash views)
      if (sidebarRoute !== "trash") {
        const aPinned = pinnedNoteIds.includes(a.id) ? 1 : 0;
        const bPinned = pinnedNoteIds.includes(b.id) ? 1 : 0;
        if (bPinned !== aPinned) return bPinned - aPinned;
      }
      if (sortMode === "title") return a.title.localeCompare(b.title);
      if (sortMode === "date-asc") {
        return (
          new Date(a.frontmatter.updatedAt).getTime() -
          new Date(b.frontmatter.updatedAt).getTime()
        );
      }
      return (
        new Date(b.frontmatter.updatedAt).getTime() -
        new Date(a.frontmatter.updatedAt).getTime()
      );
    });
  }

  const filteredNotes = filterNotes();
  const trashCount = trashedNoteIds.length;

  const headings: Record<string, string> = {
    "all-notes": "All Notes",
    favorites: "Pinned",
    tags: "Tags",
    trash: "Trash",
  };

  const deleteAll = useNotesStore((s) => s.deleteNote);
  function emptyTrash() {
    trashedNoteIds.forEach((id) => deleteAll(id));
    toast.success("Trash emptied");
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        "border-r border-ragnar-border-subtle bg-ragnar-bg-secondary",
        "transition-colors duration-200",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-4 py-2.5">
        <h2 className="text-[13px] font-bold text-ragnar-text-primary">
          {headings[sidebarRoute] ?? "Notes"}
        </h2>
        <div className="flex items-center gap-1.5">
          {/* Sort toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSortMode(SORT_LABELS[sortMode].next)}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary"
            title="Change sort order"
          >
            {SORT_LABELS[sortMode].icon}
            {SORT_LABELS[sortMode].label}
          </motion.button>

          {/* Note count badge */}
          <AnimatePresence mode="wait">
            <motion.span
              key={filteredNotes.length}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full bg-ragnar-bg-tertiary px-2 py-0.5 text-[10px] font-semibold text-ragnar-text-muted"
            >
              {filteredNotes.length}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Search bar */}
      <NoteListSearch />

      {/* Tag filter chips (only in all-notes / tags view) */}
      {(sidebarRoute === "all-notes" || sidebarRoute === "tags") && allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-ragnar-border-subtle px-3 py-1.5">
          {tagFilter && (
            <button
              onClick={() => setTagFilter(null)}
              className="flex items-center gap-1 rounded-full bg-ragnar-accent/15 px-2.5 py-0.5 text-[11px] font-medium text-ragnar-accent"
            >
              <X size={10} />
              Clear
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className={cn(
                "flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                tagFilter === tag
                  ? "bg-ragnar-accent text-white"
                  : "bg-ragnar-bg-tertiary text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Trash: Empty all button */}
      {sidebarRoute === "trash" && trashCount > 0 && (
        <div className="border-b border-ragnar-border-subtle px-3 py-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={emptyTrash}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-lg py-2",
              "text-[12px] font-medium text-red-400",
              "border border-red-400/20 bg-red-500/5",
              "hover:bg-red-500/10 hover:border-red-400/40 transition-all",
            )}
          >
            <Trash2 size={12} />
            Empty Trash ({trashCount})
          </motion.button>
        </div>
      )}

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence initial={false}>
          {filteredNotes.length === 0 ? (
            <EmptyState route={sidebarRoute} hasQuery={!!query || !!tagFilter} />
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
  const upsertNote = useNotesStore((s) => s.upsertNote);
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

  function handleDuplicate() {
    const id = `note-${Date.now()}`;
    const now = new Date().toISOString();
    const dup: Note = {
      ...note,
      id,
      title: `${note.title} (Copy)`,
      filePath: `/vault/copy-${Date.now()}.md`,
      isUnsaved: true,
      frontmatter: {
        ...note.frontmatter,
        title: `${note.title} (Copy)`,
        createdAt: now,
        updatedAt: now,
        pinned: false,
      },
    };
    upsertNote(dup);
    setActiveNote(dup);
    toast.success("Note duplicated");
  }

  function handleExport() {
    setActiveNote(note);
    setTimeout(() => window.dispatchEvent(new Event("ragnar-open-export")), 120);
  }

  function handleTrash() {
    trashNote(note.id);
    toast.info(`"${note.title}" moved to trash`);
  }

  function handleRestore() {
    restoreNote(note.id);
    toast.success(`"${note.title}" restored`);
  }

  const contextItems: ContextMenuItem[] = isTrashed
    ? [
        {
          id: "restore",
          label: "Restore Note",
          icon: <RotateCcw size={13} />,
          action: handleRestore,
        },
        { id: "sep", label: "", separator: true, action: () => {} },
        {
          id: "delete",
          label: "Delete Permanently",
          icon: <Trash2 size={13} />,
          danger: true,
          action: () => {
            deleteNote(note.id);
            toast.warning("Note permanently deleted");
          },
        },
      ]
    : [
        {
          id: "open",
          label: "Open Note",
          icon: <FileEdit size={13} />,
          action: handleClick,
        },
        {
          id: "pin",
          label: isPinned ? "Unpin" : "Pin to Top",
          icon: isPinned ? <PinOff size={13} /> : <Pin size={13} />,
          action: () => {
            pinNote(note.id, !isPinned);
            toast.info(isPinned ? "Unpinned" : "Pinned to top");
          },
        },
        {
          id: "duplicate",
          label: "Duplicate",
          icon: <Copy size={13} />,
          action: handleDuplicate,
        },
        {
          id: "export",
          label: "Export…",
          icon: <Download size={13} />,
          action: handleExport,
        },
        { id: "sep", label: "", separator: true, action: () => {} },
        {
          id: "trash",
          label: "Move to Trash",
          icon: <Trash2 size={13} />,
          danger: true,
          action: handleTrash,
        },
      ];

  const folderName = note.folderId ? folders[note.folderId]?.name : null;
  const wordCount = note.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const excerpt = note.content
    ? truncate(
        note.content
          .replace(/^---[\s\S]*?---\n?/, "")
          .replace(/#{1,6}\s+/g, "")
          .replace(/[*_`[\]>~]/g, "")
          .replace(/\n+/g, " ")
          .trim(),
        110,
      )
    : "No content yet…";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, height: 0, paddingTop: 0, paddingBottom: 0 }}
        transition={{ duration: 0.14, delay: Math.min(index * 0.015, 0.06) }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative cursor-pointer px-4 py-3",
          "border-b border-ragnar-border-subtle",
          "border-l-2 transition-all duration-150",
          isActive
            ? "border-l-ragnar-accent bg-ragnar-accent/6"
            : "border-l-transparent hover:bg-ragnar-bg-hover hover:border-l-ragnar-text-muted/20",
        )}
      >
        {/* Title + quick actions */}
        <div className="mb-0.5 flex items-start gap-1.5">
          {isPinned && (
            <Pin
              size={9}
              className="mt-1 flex-shrink-0 text-ragnar-accent rotate-45"
            />
          )}
          <h3
            className={cn(
              "flex-1 truncate text-[13px] font-semibold leading-snug",
              isActive ? "text-ragnar-accent" : "text-ragnar-text-primary",
            )}
          >
            {note.title || "Untitled"}
          </h3>

          {/* Hover quick actions */}
          <AnimatePresence>
            {isHovered && !isTrashed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                className="flex flex-shrink-0 items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    pinNote(note.id, !isPinned);
                    toast.info(isPinned ? "Unpinned" : "Pinned");
                  }}
                  className={cn(
                    "rounded p-1 transition-colors",
                    isPinned
                      ? "text-ragnar-accent"
                      : "text-ragnar-text-muted hover:text-ragnar-accent",
                  )}
                  title={isPinned ? "Unpin" : "Pin"}
                >
                  {isPinned ? <PinOff size={11} /> : <Pin size={11} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrash();
                  }}
                  className="rounded p-1 text-ragnar-text-muted transition-colors hover:text-red-400"
                  title="Move to Trash"
                >
                  <Trash2 size={11} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Excerpt */}
        <p className="mb-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-ragnar-text-muted">
          {excerpt}
        </p>

        {/* Footer meta */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-ragnar-text-muted/80">
            {formatRelativeTime(note.frontmatter.updatedAt)}
          </span>
          <span className="text-[10px] text-ragnar-text-muted/60">·</span>
          <span className="text-[10px] text-ragnar-text-muted/80">
            {readingTime}m read
          </span>
          {folderName && (
            <span className="rounded-full bg-ragnar-accent/8 px-2 py-0.5 text-[10px] text-ragnar-accent/80">
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
          {note.frontmatter.tags.length > 2 && (
            <span className="text-[10px] text-ragnar-text-muted/60">
              +{note.frontmatter.tags.length - 2}
            </span>
          )}
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
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-ragnar-bg-hover/80 px-3 py-1.5",
          "transition-all focus-within:ring-1 focus-within:ring-ragnar-accent/25",
          "border border-transparent focus-within:border-ragnar-accent/20",
        )}
      >
        <SearchIcon size={12} className="flex-shrink-0 text-ragnar-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter notes…"
          className="flex-1 bg-transparent text-[12px] text-ragnar-text-primary outline-none placeholder:text-ragnar-text-muted"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={() => setQuery("")}
              className="rounded-full p-0.5 text-ragnar-text-muted hover:text-ragnar-text-primary"
            >
              <X size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Empty states ── */
function EmptyState({
  route,
  hasQuery,
}: {
  route: string;
  hasQuery: boolean;
}) {
  const messages: Record<
    string,
    { title: string; body: string; icon: React.ReactNode }
  > = {
    "all-notes": {
      title: "No notes yet",
      body: "Create your first note to get started",
      icon: <FileText size={26} className="text-ragnar-text-muted" />,
    },
    favorites: {
      title: "No pinned notes",
      body: "Right-click a note to pin it",
      icon: <Pin size={26} className="text-ragnar-text-muted" />,
    },
    tags: {
      title: "No tagged notes",
      body: "Add tags via YAML frontmatter",
      icon: <FileText size={26} className="text-ragnar-text-muted" />,
    },
    trash: {
      title: "Trash is empty",
      body: "Deleted notes appear here",
      icon: <Trash2 size={26} className="text-ragnar-text-muted" />,
    },
  };

  const msg = hasQuery
    ? {
        title: "No matches",
        body: "Try a different search term or tag",
        icon: <SearchIcon size={26} className="text-ragnar-text-muted" />,
      }
    : messages[route] ?? {
        title: "Empty",
        body: "",
        icon: <FileText size={26} className="text-ragnar-text-muted" />,
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ragnar-bg-tertiary/50">
        {msg.icon}
      </div>
      <p className="text-[13px] font-semibold text-ragnar-text-secondary">
        {msg.title}
      </p>
      <p className="max-w-[200px] text-[12px] text-ragnar-text-muted">{msg.body}</p>
    </motion.div>
  );
}
