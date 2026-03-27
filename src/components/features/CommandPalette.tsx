import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { useEditorStore } from "@stores/editorStore";
import { useNotesStore } from "@stores/notesStore";
import { useSearchStore } from "@stores/searchStore";
import { useKeyboardShortcut } from "@hooks/useKeyboardShortcut";
import { useClickOutside } from "@hooks/useClickOutside";
import { useDebounce } from "@hooks/useDebounce";
import { cn } from "@utils/cn";
import type { PaletteCommand, Note } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * CommandPalette — Global Cmd+K search & command launcher
 *
 * Features:
 *  - Instant fuzzy search across all notes (title + excerpt)
 *  - Built-in app commands (toggle sidebar, change mode, etc.)
 *  - Recent notes shown when query is empty
 *  - Keyboard navigation (↑↓ Enter Esc)
 *  - Framer Motion slide-down animation
 * ───────────────────────────────────────────────────────────── */

export function CommandPalette() {
  const isOpen = useAppStore((s) => s.isCommandPaletteOpen);
  const close = useAppStore((s) => s.closeCommandPalette);
  const open = useAppStore((s) => s.openCommandPalette);

  // Global shortcut: Cmd+K
  useKeyboardShortcut("cmd+k", open);
  useKeyboardShortcut("Escape", close, isOpen);

  return (
    <AnimatePresence>
      {isOpen && <PaletteModal onClose={close} />}
    </AnimatePresence>
  );
}

/* ── Modal ── */

function PaletteModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 120);

  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const recentNoteIds = useSearchStore((s) => s.recentNoteIds);
  const addRecentNote = useSearchStore((s) => s.addRecentNote);

  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setMode = useEditorStore((s) => s.setMode);
  const toggleZen = useEditorStore((s) => s.toggleZen);
  const toggleSplitView = useEditorStore((s) => s.toggleSplitView);

  useClickOutside(panelRef, onClose);

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Built-in commands
  const builtinCommands: PaletteCommand[] = [
    {
      id: "toggle-sidebar",
      label: "Toggle Sidebar",
      shortcut: "⌘/",
      icon: "▤",
      section: "view",
      action: () => { toggleSidebar(); onClose(); },
    },
    {
      id: "mode-edit",
      label: "Edit Mode",
      shortcut: "⌘E",
      icon: "✏️",
      section: "editor",
      action: () => { setMode("edit"); onClose(); },
    },
    {
      id: "mode-readonly",
      label: "Preview Mode",
      shortcut: "⌘P",
      icon: "👁",
      section: "editor",
      action: () => { setMode("readonly"); onClose(); },
    },
    {
      id: "mode-zen",
      label: "Zen / Focus Mode",
      shortcut: "⌘.",
      icon: "🎯",
      section: "view",
      action: () => { toggleZen(); onClose(); },
    },
    {
      id: "split-view",
      label: "Toggle Split View",
      icon: "⊞",
      section: "view",
      action: () => { toggleSplitView(); onClose(); },
    },
  ];

  // Note search results
  const noteResults: Note[] = debouncedQuery
    ? Object.values(notes)
        .filter(
          (n) =>
            !trashedNoteIds.includes(n.id) &&
            (n.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              n.content.toLowerCase().includes(debouncedQuery.toLowerCase())),
        )
        .slice(0, 8)
    : recentNoteIds
        .map((id) => notes[id])
        .filter(Boolean)
        .slice(0, 5);

  // Command filter
  const filteredCommands = debouncedQuery
    ? builtinCommands.filter((c) =>
        c.label.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
    : builtinCommands;

  type PaletteItem =
    | { kind: "note"; note: Note }
    | { kind: "command"; command: PaletteCommand };

  const items: PaletteItem[] = [
    ...noteResults.map((note) => ({ kind: "note" as const, note })),
    ...filteredCommands.map((command) => ({
      kind: "command" as const,
      command,
    })),
  ];

  // Clamp selection
  useEffect(() => {
    setSelectedIdx(0);
  }, [debouncedQuery]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = items[selectedIdx];
        if (!item) return;
        if (item.kind === "note") {
          setActiveNote(item.note);
          addRecentNote(item.note.id);
          onClose();
        } else {
          item.command.action();
        }
      }
    },
    [items, selectedIdx, setActiveNote, addRecentNote, onClose],
  );

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        key="panel"
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.97, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -12 }}
        transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "fixed left-1/2 top-[15vh] z-[101] w-full max-w-[600px]",
          "-translate-x-1/2",
          "rounded-xl border border-ragnar-border bg-ragnar-bg-secondary/90",
          "glass-surface shadow-[0_24px_80px_rgba(0,0,0,0.6)]",
          "overflow-hidden",
        )}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-ragnar-border-subtle px-4 py-3.5">
          <span className="flex-shrink-0 text-ragnar-text-muted">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes or type a command…"
            className={cn(
              "flex-1 bg-transparent text-[14px] text-ragnar-text-primary outline-none",
              "placeholder:text-ragnar-text-muted",
            )}
          />
          <kbd className="rounded bg-ragnar-bg-tertiary px-1.5 py-0.5 text-[11px] text-ragnar-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[440px] overflow-y-auto py-1.5">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-ragnar-text-muted">
              No results for "{query}"
            </div>
          ) : (
            <>
              {noteResults.length > 0 && (
                <SectionHeader
                  label={debouncedQuery ? "Notes" : "Recent"}
                />
              )}
              {noteResults.map((note, idx) => (
                <PaletteNoteRow
                  key={note.id}
                  note={note}
                  isSelected={selectedIdx === idx}
                  onSelect={() => {
                    setActiveNote(note);
                    addRecentNote(note.id);
                    onClose();
                  }}
                />
              ))}

              {filteredCommands.length > 0 && (
                <SectionHeader label="Commands" />
              )}
              {filteredCommands.map((cmd, idx) => (
                <PaletteCommandRow
                  key={cmd.id}
                  command={cmd}
                  isSelected={selectedIdx === noteResults.length + idx}
                  onSelect={cmd.action}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 border-t border-ragnar-border-subtle px-4 py-2">
          <Hint keys={["↑", "↓"]} label="navigate" />
          <Hint keys={["↵"]} label="select" />
          <Hint keys={["Esc"]} label="close" />
        </div>
      </motion.div>
    </>
  );
}

/* ── Sub-components ── */

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
      {label}
    </p>
  );
}

function PaletteNoteRow({
  note,
  isSelected,
  onSelect,
}: {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const excerpt = note.content
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_`>[\]]/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 80);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
        isSelected
          ? "bg-ragnar-accent/15"
          : "hover:bg-ragnar-bg-hover",
      )}
    >
      <span className="flex-shrink-0 text-ragnar-text-muted">
        <NoteIcon />
      </span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-[13px] font-medium text-ragnar-text-primary">
          {note.title || "Untitled"}
        </p>
        {excerpt && (
          <p className="truncate text-[11px] text-ragnar-text-muted">{excerpt}</p>
        )}
      </div>
      {isSelected && (
        <span className="flex-shrink-0 text-[11px] text-ragnar-text-muted">↵</span>
      )}
    </button>
  );
}

function PaletteCommandRow({
  command,
  isSelected,
  onSelect,
}: {
  command: PaletteCommand;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
        isSelected ? "bg-ragnar-accent/15" : "hover:bg-ragnar-bg-hover",
      )}
    >
      <span className="flex-shrink-0 w-4 text-center text-[14px]">
        {command.icon ?? "⚡"}
      </span>
      <span className="flex-1 text-[13px] font-medium text-ragnar-text-primary">
        {command.label}
      </span>
      {command.shortcut && (
        <kbd className="rounded bg-ragnar-bg-tertiary px-1.5 py-0.5 font-mono text-[11px] text-ragnar-text-muted">
          {command.shortcut}
        </kbd>
      )}
    </button>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="rounded bg-ragnar-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-ragnar-text-muted"
        >
          {k}
        </kbd>
      ))}
      <span className="ml-0.5 text-[11px] text-ragnar-text-muted">{label}</span>
    </div>
  );
}

/* ── Icons ── */
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="6" cy="6" r="4.5" />
      <line x1="10" y1="10" x2="13" y2="13" />
    </svg>
  );
}
function NoteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="1" width="9" height="11" rx="1.5" />
      <line x1="4" y1="4.5" x2="9" y2="4.5" />
      <line x1="4" y1="6.5" x2="9" y2="6.5" />
      <line x1="4" y1="8.5" x2="7" y2="8.5" />
    </svg>
  );
}
