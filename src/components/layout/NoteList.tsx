import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@stores/notesStore";
import { useEditorStore } from "@stores/editorStore";
import { useAppStore } from "@stores/appStore";
import { useSearchStore } from "@stores/searchStore";
import { ContextMenu, type ContextMenuItem } from "@components/ui/ContextMenu";
import { HoverPreview } from "@components/ui/HoverPreview";
import { NoteColorPicker, noteColorHex } from "@components/ui/NoteColorPicker";
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
  CheckSquare,
  Square,
  Package,
  Palette,
} from "lucide-react";
import type { Note, NoteId, NoteColor } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * NoteList — v1.1.0
 *
 * New features:
 *  - Note color labels (colored dot + left border tint)
 *  - Hover preview card (floating note preview on hover)
 *  - Compact mode support via preferences
 *  - NoteColorPicker via context menu
 * ───────────────────────────────────────────────────────────── */

type SortMode = "date-desc" | "title" | "date-asc";

const SORT_LABELS: Record<SortMode, { label: string; icon: React.ReactNode; next: SortMode }> = {
  "date-desc": { label: "Recent", icon: <SortDesc size={11} />, next: "title" },
  title: { label: "A–Z", icon: <SortAsc size={11} />, next: "date-asc" },
  "date-asc": { label: "Oldest", icon: <SortDesc size={11} className="rotate-180" />, next: "date-desc" },
};

export function NoteList() {
  const sidebarRoute = useAppStore((s) => s.sidebarRoute);
  const compactMode = useAppStore((s) => s.preferences.compactMode);
  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);
  const pinnedNoteIds = useNotesStore((s) => s.pinnedNoteIds);
  const noteColors = useNotesStore((s) => s.noteColors);
  const activeNoteId = useEditorStore((s) => s.activeNoteId);
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const addRecentNote = useSearchStore((s) => s.addRecentNote);
  const query = useSearchStore((s) => s.query);
  const [sortMode, setSortMode] = useState<SortMode>("date-desc");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [keyboardIdx, setKeyboardIdx] = useState(-1);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<NoteId>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  const allNotes = Object.values(notes);

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
          (n) => !trashedNoteIds.includes(n.id) && n.frontmatter.tags.length > 0,
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
      if (sidebarRoute !== "trash") {
        const aPinned = pinnedNoteIds.includes(a.id) ? 1 : 0;
        const bPinned = pinnedNoteIds.includes(b.id) ? 1 : 0;
        if (bPinned !== aPinned) return bPinned - aPinned;
      }
      if (sortMode === "title") return a.title.localeCompare(b.title);
      if (sortMode === "date-asc")
        return new Date(a.frontmatter.updatedAt).getTime() - new Date(b.frontmatter.updatedAt).getTime();
      return new Date(b.frontmatter.updatedAt).getTime() - new Date(a.frontmatter.updatedAt).getTime();
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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectMode || filteredNotes.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setKeyboardIdx((i) => Math.min(i + 1, filteredNotes.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setKeyboardIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && keyboardIdx >= 0) {
        e.preventDefault();
        const note = filteredNotes[keyboardIdx];
        if (note) { setActiveNote(note); addRecentNote(note.id); }
      }
    },
    [filteredNotes, keyboardIdx, selectMode, setActiveNote, addRecentNote],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => { setKeyboardIdx(-1); }, [query, tagFilter, sidebarRoute, sortMode]);

  useEffect(() => {
    if (keyboardIdx < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-note-item]");
    items[keyboardIdx]?.scrollIntoView({ block: "nearest" });
  }, [keyboardIdx]);

  useEffect(() => { setSelectMode(false); setSelectedIds(new Set()); }, [sidebarRoute]);

  const toggleSelect = (id: NoteId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(filteredNotes.map((n) => n.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const bulkTrash = useNotesStore((s) => s.bulkTrash);
  const bulkDelete = useNotesStore((s) => s.bulkDelete);
  const bulkRestore = useNotesStore((s) => s.bulkRestore);
  const deleteAll = useNotesStore((s) => s.deleteNote);

  function handleBulkTrash() {
    const ids = Array.from(selectedIds);
    bulkTrash(ids);
    toast.info(`${ids.length} note${ids.length > 1 ? "s" : ""} moved to trash`);
    setSelectedIds(new Set()); setSelectMode(false);
  }
  function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    bulkDelete(ids);
    toast.warning(`${ids.length} note${ids.length > 1 ? "s" : ""} permanently deleted`);
    setSelectedIds(new Set()); setSelectMode(false);
  }
  function handleBulkRestore() {
    const ids = Array.from(selectedIds);
    bulkRestore(ids);
    toast.success(`${ids.length} note${ids.length > 1 ? "s" : ""} restored`);
    setSelectedIds(new Set()); setSelectMode(false);
  }
  function handleBulkExport() { window.dispatchEvent(new Event("ragnar-open-bulk-export")); }
  function emptyTrash() {
    trashedNoteIds.forEach((id) => deleteAll(id));
    toast.success("Trash emptied");
  }

  return (
    <div className={cn("flex h-full flex-col", "border-r border-ragnar-border-subtle bg-ragnar-bg-secondary", "transition-colors duration-200")}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-4 py-2.5">
        <h2 className="text-[13px] font-bold text-ragnar-text-primary">
          {headings[sidebarRoute] ?? "Notes"}
        </h2>
        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setSelectMode(!selectMode); if (selectMode) setSelectedIds(new Set()); }}
            className={cn(
              "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] transition-colors",
              selectMode
                ? "bg-ragnar-accent/15 text-ragnar-accent"
                : "text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
            )}
          >
            <CheckSquare size={11} />
            {selectMode ? "Done" : "Select"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSortMode(SORT_LABELS[sortMode].next)}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary"
          >
            {SORT_LABELS[sortMode].icon}
            {SORT_LABELS[sortMode].label}
          </motion.button>
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

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-1.5 border-b border-ragnar-border-subtle px-3 py-2 flex-wrap"
          >
            <span className="text-[11px] font-medium text-ragnar-accent mr-1">{selectedIds.size} selected</span>
            <button onClick={selectedIds.size === filteredNotes.length ? deselectAll : selectAll} className="text-[10px] text-ragnar-text-muted hover:text-ragnar-text-primary transition-colors px-1.5 py-0.5 rounded">
              {selectedIds.size === filteredNotes.length ? "Deselect all" : "Select all"}
            </button>
            <div className="flex-1" />
            {sidebarRoute === "trash" ? (
              <>
                <button onClick={handleBulkRestore} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                  <RotateCcw size={10} /> Restore
                </button>
                <button onClick={handleBulkDelete} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={10} /> Delete
                </button>
              </>
            ) : (
              <>
                <button onClick={handleBulkExport} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-ragnar-accent bg-ragnar-accent/10 hover:bg-ragnar-accent/20 transition-colors">
                  <Package size={10} /> Export
                </button>
                <button onClick={handleBulkTrash} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={10} /> Trash
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <NoteListSearch />

      {/* Tag filter chips */}
      {(sidebarRoute === "all-notes" || sidebarRoute === "tags") && allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-ragnar-border-subtle px-3 py-1.5">
          {tagFilter && (
            <button onClick={() => setTagFilter(null)} className="flex items-center gap-1 rounded-full bg-ragnar-accent/15 px-2.5 py-0.5 text-[11px] font-medium text-ragnar-accent">
              <X size={10} /> Clear
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
      {sidebarRoute === "trash" && trashCount > 0 && !selectMode && (
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
      <div className="flex-1 overflow-y-auto no-scrollbar" ref={listRef}>
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
                isKeyboardSelected={keyboardIdx === idx}
                isSelectMode={selectMode}
                isSelected={selectedIds.has(note.id)}
                onToggleSelect={() => toggleSelect(note.id)}
                index={idx}
                searchQuery={query}
                noteColor={(noteColors[note.id] ?? "none") as NoteColor}
                compactMode={compactMode}
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
  isKeyboardSelected,
  isSelectMode,
  isSelected,
  onToggleSelect,
  index,
  searchQuery,
  noteColor,
  compactMode,
}: {
  note: Note;
  isActive: boolean;
  isPinned: boolean;
  isTrashed: boolean;
  isKeyboardSelected: boolean;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  index: number;
  searchQuery: string;
  noteColor: NoteColor;
  compactMode: boolean;
}) {
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const addRecentNote = useSearchStore((s) => s.addRecentNote);
  const pinNote = useNotesStore((s) => s.pinNote);
  const trashNote = useNotesStore((s) => s.trashNote);
  const restoreNote = useNotesStore((s) => s.restoreNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const upsertNote = useNotesStore((s) => s.upsertNote);
  const colorNote = useNotesStore((s) => s.colorNote);
  const folders = useNotesStore((s) => s.folders);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<{ x: number; y: number } | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showHoverPreview, setShowHoverPreview] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  function handleClick() {
    if (isSelectMode) { onToggleSelect(); return; }
    setActiveNote(note);
    addRecentNote(note.id);
  }

  function handleDoubleClick() {
    if (isSelectMode) return;
    pinNote(note.id, !isPinned);
    toast.info(isPinned ? "Unpinned" : "Pinned to top");
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }

  function handleMouseEnter() {
    setIsHovered(true);
    if (!isSelectMode) {
      const t = setTimeout(() => setShowHoverPreview(true), 600);
      setHoverTimeout(t);
    }
  }

  function handleMouseLeave() {
    setIsHovered(false);
    setShowHoverPreview(false);
    if (hoverTimeout) { clearTimeout(hoverTimeout); setHoverTimeout(null); }
  }

  function handleDuplicate() {
    const id = `note-${Date.now()}`;
    const now = new Date().toISOString();
    const dup: Note = {
      ...note, id,
      title: `${note.title} (Copy)`,
      filePath: `/vault/copy-${Date.now()}.md`,
      isUnsaved: true,
      frontmatter: { ...note.frontmatter, title: `${note.title} (Copy)`, createdAt: now, updatedAt: now, pinned: false },
    };
    upsertNote(dup);
    setActiveNote(dup);
    toast.success("Note duplicated");
  }

  function handleExport() {
    setActiveNote(note);
    setTimeout(() => window.dispatchEvent(new Event("ragnar-open-export")), 120);
  }

  function handleTrash() { trashNote(note.id); toast.info(`"${note.title}" moved to trash`); }
  function handleRestore() { restoreNote(note.id); toast.success(`"${note.title}" restored`); }

  const colorDotHex = noteColor !== "none" ? noteColorHex(noteColor) : null;

  const contextItems: ContextMenuItem[] = isTrashed
    ? [
        { id: "restore", label: "Restore Note", icon: <RotateCcw size={13} />, action: handleRestore },
        { id: "sep", label: "", separator: true, action: () => {} },
        { id: "delete", label: "Delete Permanently", icon: <Trash2 size={13} />, danger: true, action: () => { deleteNote(note.id); toast.warning("Note permanently deleted"); } },
      ]
    : [
        { id: "open", label: "Open Note", icon: <FileEdit size={13} />, action: () => { setActiveNote(note); addRecentNote(note.id); } },
        { id: "pin", label: isPinned ? "Unpin" : "Pin to Top", icon: isPinned ? <PinOff size={13} /> : <Pin size={13} />, action: () => { pinNote(note.id, !isPinned); toast.info(isPinned ? "Unpinned" : "Pinned"); } },
        { id: "duplicate", label: "Duplicate", icon: <Copy size={13} />, action: handleDuplicate },
        { id: "color", label: "Color Label", icon: <Palette size={13} />, action: (e?: React.MouseEvent) => {
          if (e) setShowColorPicker({ x: e.clientX, y: e.clientY });
          else setShowColorPicker({ x: contextMenu?.x ?? 200, y: contextMenu?.y ?? 200 });
        }},
        { id: "export", label: "Export…", icon: <Download size={13} />, action: handleExport },
        { id: "sep", label: "", separator: true, action: () => {} },
        { id: "trash", label: "Move to Trash", icon: <Trash2 size={13} />, danger: true, action: handleTrash },
      ];

  const folderName = note.folderId ? folders[note.folderId]?.name : null;
  const wordCount = note.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const rawExcerpt = note.content
    ? note.content.replace(/^---[\s\S]*?---\n?/, "").replace(/#{1,6}\s+/g, "").replace(/[*_`[\]>~]/g, "").replace(/\n+/g, " ").trim()
    : "";
  const excerpt = truncate(rawExcerpt, 110) || "No content yet…";

  function highlightText(text: string, q: string) {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-ragnar-accent/25 text-ragnar-text-primary rounded-sm px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  return (
    <>
      <motion.div
        ref={itemRef}
        data-note-item
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, height: 0, paddingTop: 0, paddingBottom: 0 }}
        transition={{ duration: 0.14, delay: Math.min(index * 0.015, 0.06) }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative cursor-pointer",
          compactMode ? "px-3.5 py-2" : "px-4 py-3",
          "border-b border-ragnar-border-subtle",
          "border-l-[3px] transition-all duration-150",
          isSelected
            ? "border-l-ragnar-accent bg-ragnar-accent/8"
            : colorDotHex
              ? "bg-transparent"
              : isActive
                ? "border-l-ragnar-accent bg-ragnar-accent/6"
                : isKeyboardSelected
                  ? "border-l-ragnar-accent/50 bg-ragnar-bg-hover"
                  : "border-l-transparent hover:bg-ragnar-bg-hover",
        )}
        style={
          !isSelected && !isActive && colorDotHex
            ? { borderLeftColor: colorDotHex + "cc", backgroundColor: colorDotHex + "08" }
            : undefined
        }
      >
        {/* Title row */}
        <div className="mb-0.5 flex items-start gap-1.5">
          {isSelectMode && (
            <span className="mt-0.5 flex-shrink-0">
              {isSelected ? <CheckSquare size={13} className="text-ragnar-accent" /> : <Square size={13} className="text-ragnar-text-muted" />}
            </span>
          )}
          {!isSelectMode && colorDotHex && (
            <span
              className="mt-1.5 flex-shrink-0 h-2 w-2 rounded-full"
              style={{ backgroundColor: colorDotHex }}
            />
          )}
          {isPinned && !isSelectMode && !colorDotHex && (
            <Pin size={9} className="mt-1 flex-shrink-0 text-ragnar-accent rotate-45" />
          )}
          <h3 className={cn(
            "flex-1 truncate font-semibold leading-snug",
            compactMode ? "text-[12.5px]" : "text-[13px]",
            isActive ? "text-ragnar-accent" : "text-ragnar-text-primary",
          )}>
            {highlightText(note.title || "Untitled", searchQuery)}
          </h3>

          {/* Hover quick actions */}
          <AnimatePresence>
            {isHovered && !isTrashed && !isSelectMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                className="flex flex-shrink-0 items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); pinNote(note.id, !isPinned); toast.info(isPinned ? "Unpinned" : "Pinned"); }}
                  className={cn("rounded p-1 transition-colors", isPinned ? "text-ragnar-accent" : "text-ragnar-text-muted hover:text-ragnar-accent")}
                  title={isPinned ? "Unpin" : "Pin"}
                >
                  {isPinned ? <PinOff size={11} /> : <Pin size={11} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = itemRef.current?.getBoundingClientRect();
                    if (rect) setShowColorPicker({ x: rect.right - 120, y: rect.bottom + 4 });
                  }}
                  className="rounded p-1 text-ragnar-text-muted transition-colors hover:text-ragnar-text-primary"
                  title="Color label"
                >
                  <Palette size={11} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleTrash(); }}
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
        {!compactMode && (
          <p className={cn("mb-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-ragnar-text-muted", isSelectMode && "pl-5")}>
            {excerpt}
          </p>
        )}

        {/* Footer meta */}
        <div className={cn("flex flex-wrap items-center gap-1.5", isSelectMode && "pl-5")}>
          <span className="text-[10px] text-ragnar-text-muted/80">{formatRelativeTime(note.frontmatter.updatedAt)}</span>
          <span className="text-[10px] text-ragnar-text-muted/60">·</span>
          <span className="text-[10px] text-ragnar-text-muted/80">{readingTime}m read</span>
          {folderName && (
            <span className="rounded-full bg-ragnar-accent/8 px-2 py-0.5 text-[10px] text-ragnar-accent/80">{folderName}</span>
          )}
          {note.frontmatter.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-ragnar-bg-tertiary px-2 py-0.5 text-[10px] text-ragnar-text-muted">#{tag}</span>
          ))}
          {note.frontmatter.tags.length > 2 && (
            <span className="text-[10px] text-ragnar-text-muted/60">+{note.frontmatter.tags.length - 2}</span>
          )}
        </div>
      </motion.div>

      {/* Hover Preview */}
      <AnimatePresence>
        {showHoverPreview && !isSelectMode && itemRef.current && (
          <HoverPreview note={note} anchorRect={itemRef.current.getBoundingClientRect()} />
        )}
      </AnimatePresence>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu items={contextItems} position={contextMenu} onClose={() => setContextMenu(null)} />
      )}

      {/* Color picker */}
      {showColorPicker && (
        <NoteColorPicker
          current={noteColor}
          onChange={(color) => colorNote(note.id, color)}
          onClose={() => setShowColorPicker(null)}
          position={showColorPicker}
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
      <div className={cn(
        "flex items-center gap-2 rounded-lg bg-ragnar-bg-hover/80 px-3 py-1.5",
        "transition-all focus-within:ring-1 focus-within:ring-ragnar-accent/25",
        "border border-transparent focus-within:border-ragnar-accent/20",
      )}>
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
function EmptyState({ route, hasQuery }: { route: string; hasQuery: boolean }) {
  const messages: Record<string, { title: string; body: string; icon: React.ReactNode }> = {
    "all-notes": { title: "No notes yet", body: "Create your first note to get started", icon: <FileText size={26} className="text-ragnar-text-muted" /> },
    favorites: { title: "No pinned notes", body: "Right-click or double-click a note to pin it", icon: <Pin size={26} className="text-ragnar-text-muted" /> },
    tags: { title: "No tagged notes", body: "Add tags via YAML frontmatter", icon: <FileText size={26} className="text-ragnar-text-muted" /> },
    trash: { title: "Trash is empty", body: "Deleted notes appear here", icon: <Trash2 size={26} className="text-ragnar-text-muted" /> },
  };
  const msg = hasQuery
    ? { title: "No matches", body: "Try a different search term or tag", icon: <SearchIcon size={26} className="text-ragnar-text-muted" /> }
    : messages[route] ?? { title: "Empty", body: "", icon: <FileText size={26} className="text-ragnar-text-muted" /> };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ragnar-bg-tertiary/50">{msg.icon}</div>
      <p className="text-[13px] font-semibold text-ragnar-text-secondary">{msg.title}</p>
      <p className="max-w-[200px] text-[12px] text-ragnar-text-muted">{msg.body}</p>
    </motion.div>
  );
}
