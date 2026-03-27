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
import {
  Search,
  FileText,
  PanelLeft,
  Pencil,
  Eye,
  Focus,
  Columns2,
  Moon,
  Sun,
  Monitor,
  Plus,
  Hash,
  Clock,
} from "lucide-react";
import type { PaletteCommand, Note } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * CommandPalette — Stage 3: Enhanced with Lucide icons,
 * note metadata in results, tag search, theme commands, and
 * improved animation
 * ───────────────────────────────────────────────────────────── */

export function CommandPalette() {
  const isOpen = useAppStore((s) => s.isCommandPaletteOpen);
  const close = useAppStore((s) => s.closeCommandPalette);
  const open = useAppStore((s) => s.openCommandPalette);

  useKeyboardShortcut("cmd+k", open);
  useKeyboardShortcut("Escape", close, isOpen);

  return (
    <AnimatePresence>
      {isOpen && <PaletteModal onClose={close} />}
    </AnimatePresence>
  );
}

function PaletteModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 100);

  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const recentNoteIds = useSearchStore((s) => s.recentNoteIds);
  const addRecentNote = useSearchStore((s) => s.addRecentNote);

  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setMode = useEditorStore((s) => s.setMode);
  const toggleZen = useEditorStore((s) => s.toggleZen);
  const toggleSplitView = useEditorStore((s) => s.toggleSplitView);
  const updatePreferences = useAppStore((s) => s.updatePreferences);

  useClickOutside(panelRef, onClose);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const builtinCommands: PaletteCommand[] = [
    { id: "toggle-sidebar", label: "Toggle Sidebar", shortcut: "⌘/", icon: "panel", section: "view", action: () => { toggleSidebar(); onClose(); } },
    { id: "mode-edit", label: "Edit Mode", shortcut: "⌘E", icon: "pencil", section: "editor", action: () => { setMode("edit"); onClose(); } },
    { id: "mode-readonly", label: "Preview Mode", shortcut: "⌘⇧P", icon: "eye", section: "editor", action: () => { setMode("readonly"); onClose(); } },
    { id: "mode-zen", label: "Focus Mode", shortcut: "⌘.", icon: "focus", section: "view", action: () => { toggleZen(); onClose(); } },
    { id: "split-view", label: "Split View", shortcut: "⌘⇧S", icon: "columns", section: "view", action: () => { toggleSplitView(); onClose(); } },
    { id: "theme-dark", label: "Theme: Dark", icon: "moon", section: "system", action: () => { updatePreferences({ theme: "dark" }); onClose(); } },
    { id: "theme-light", label: "Theme: Light", icon: "sun", section: "system", action: () => { updatePreferences({ theme: "light" }); onClose(); } },
    { id: "theme-system", label: "Theme: System", icon: "monitor", section: "system", action: () => { updatePreferences({ theme: "system" }); onClose(); } },
  ];

  const commandIconMap: Record<string, React.ReactNode> = {
    panel: <PanelLeft size={14} />,
    pencil: <Pencil size={14} />,
    eye: <Eye size={14} />,
    focus: <Focus size={14} />,
    columns: <Columns2 size={14} />,
    moon: <Moon size={14} />,
    sun: <Sun size={14} />,
    monitor: <Monitor size={14} />,
  };

  // Note search
  const noteResults: Note[] = debouncedQuery
    ? Object.values(notes)
        .filter(
          (n) =>
            !trashedNoteIds.includes(n.id) &&
            (n.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              n.content.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              n.frontmatter.tags.some((t) =>
                t.toLowerCase().includes(debouncedQuery.toLowerCase()),
              )),
        )
        .slice(0, 8)
    : recentNoteIds.map((id) => notes[id]).filter(Boolean).slice(0, 5);

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
    ...filteredCommands.map((command) => ({ kind: "command" as const, command })),
  ];

  useEffect(() => {
    setSelectedIdx(0);
  }, [debouncedQuery]);

  // Auto-scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.children[selectedIdx] as HTMLElement;
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIdx]);

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
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        key="panel"
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.97, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -16 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "fixed left-1/2 top-[12vh] z-[101] w-full max-w-[620px]",
          "-translate-x-1/2",
          "rounded-2xl border border-ragnar-border bg-ragnar-bg-secondary/95",
          "glass-surface shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
          "overflow-hidden",
        )}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-ragnar-border-subtle px-4 py-3.5">
          <Search size={16} className="flex-shrink-0 text-ragnar-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, tags, or type a command…"
            className={cn(
              "flex-1 bg-transparent text-[14px] text-ragnar-text-primary outline-none",
              "placeholder:text-ragnar-text-muted",
            )}
          />
          <kbd className="rounded-md bg-ragnar-bg-tertiary px-2 py-0.5 text-[11px] font-medium text-ragnar-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[420px] overflow-y-auto py-1.5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Search size={24} className="text-ragnar-text-muted opacity-40" />
              <p className="text-[13px] text-ragnar-text-muted">
                No results for "{query}"
              </p>
            </div>
          ) : (
            <>
              {noteResults.length > 0 && (
                <SectionHeader
                  label={debouncedQuery ? "Notes" : "Recent"}
                  icon={debouncedQuery ? <FileText size={11} /> : <Clock size={11} />}
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
                <SectionHeader label="Commands" icon={<Hash size={11} />} />
              )}
              {filteredCommands.map((cmd, idx) => (
                <PaletteCommandRow
                  key={cmd.id}
                  command={cmd}
                  icon={commandIconMap[cmd.icon ?? ""] ?? <Plus size={14} />}
                  isSelected={selectedIdx === noteResults.length + idx}
                  onSelect={cmd.action}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-ragnar-border-subtle px-4 py-2">
          <Hint keys={["↑", "↓"]} label="navigate" />
          <Hint keys={["↵"]} label="select" />
          <Hint keys={["Esc"]} label="close" />
          <div className="flex-1" />
          <span className="text-[10px] text-ragnar-text-muted opacity-50">
            {items.length} results
          </span>
        </div>
      </motion.div>
    </>
  );
}

/* ── Sub-components ── */

function SectionHeader({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-4 pb-1 pt-2.5">
      {icon && <span className="text-ragnar-text-muted">{icon}</span>}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
        {label}
      </p>
    </div>
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
        isSelected ? "bg-ragnar-accent/12" : "hover:bg-ragnar-bg-hover",
      )}
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-ragnar-bg-tertiary text-ragnar-text-muted">
        <FileText size={14} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-medium text-ragnar-text-primary">
            {note.title || "Untitled"}
          </p>
          {note.frontmatter.tags.length > 0 && (
            <span className="rounded-full bg-ragnar-bg-tertiary px-1.5 py-0.5 text-[9px] text-ragnar-text-muted">
              #{note.frontmatter.tags[0]}
            </span>
          )}
        </div>
        {excerpt && (
          <p className="truncate text-[11px] text-ragnar-text-muted">{excerpt}</p>
        )}
      </div>
      {isSelected && (
        <kbd className="flex-shrink-0 rounded bg-ragnar-bg-tertiary px-1.5 py-0.5 text-[10px] text-ragnar-text-muted">↵</kbd>
      )}
    </button>
  );
}

function PaletteCommandRow({
  command,
  icon,
  isSelected,
  onSelect,
}: {
  command: PaletteCommand;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
        isSelected ? "bg-ragnar-accent/12" : "hover:bg-ragnar-bg-hover",
      )}
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-ragnar-bg-tertiary text-ragnar-text-muted">
        {icon}
      </span>
      <span className="flex-1 text-[13px] font-medium text-ragnar-text-primary">
        {command.label}
      </span>
      {command.shortcut && (
        <kbd className="rounded-md bg-ragnar-bg-tertiary px-2 py-0.5 font-mono text-[11px] text-ragnar-text-muted">
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
