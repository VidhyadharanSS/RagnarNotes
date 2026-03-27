import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { useNotesStore } from "@stores/notesStore";
import { useSearchStore } from "@stores/searchStore";
import { useAppStore } from "@stores/appStore";
import { MarkdownEditor } from "@components/editor/MarkdownEditor";
import { MarkdownPreview } from "@components/editor/MarkdownPreview";
import { EditorToolbar } from "@components/editor/EditorToolbar";
import { StatusBar } from "@components/editor/StatusBar";
import { NoteInfoPanel } from "@components/features/NoteInfoPanel";
import { ReadingProgress } from "@components/ui/ReadingProgress";
import { cn } from "@utils/cn";
import {
  FileText, Plus, Search, Keyboard, Clock,
  Sparkles, Info, Feather, Zap, Shield,
} from "lucide-react";

export function EditorPane() {
  const activeNote = useEditorStore((s) => s.activeNote);
  const mode = useEditorStore((s) => s.mode);
  const isSplitView = useEditorStore((s) => s.isSplitView);
  const isZen = mode === "zen";
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const handler = () => setIsInfoOpen((v) => !v);
    window.addEventListener("ragnar-toggle-info", handler);
    return () => window.removeEventListener("ragnar-toggle-info", handler);
  }, []);

  useEffect(() => { if (isZen) setIsInfoOpen(false); }, [isZen]);

  const handlePreviewScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable > 0) setReadProgress((el.scrollTop / scrollable) * 100);
  }, []);

  return (
    <div className={cn("relative flex flex-1 overflow-hidden", "bg-ragnar-bg-primary", isZen && "bg-[#0d0d0f]")}>
      <div className="flex flex-1 flex-col overflow-hidden">
        {!activeNote ? (
          <WelcomeScreen />
        ) : (
          <>
            <AnimatePresence>
              {!isZen && (
                <motion.div
                  key="toolbar"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="relative"
                >
                  <EditorToolbar />
                  <button
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    title="Toggle note info panel"
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 z-10",
                      "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                      isInfoOpen ? "bg-ragnar-accent/15 text-ragnar-accent" : "text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
                    )}
                  >
                    <Info size={13} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={cn("relative flex flex-1 overflow-hidden", isZen && "items-start justify-center pt-16")}>
              {(mode === "readonly" || isSplitView) && !isZen && <ReadingProgress progress={readProgress} />}
              {isSplitView && !isZen ? (
                <SplitView onPreviewScroll={handlePreviewScroll} />
              ) : mode === "readonly" ? (
                <div className="flex-1 overflow-y-auto" onScroll={handlePreviewScroll}><MarkdownPreview /></div>
              ) : (
                <MarkdownEditor />
              )}
            </div>

            <AnimatePresence>
              {!isZen && (
                <motion.div key="statusbar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }}>
                  <StatusBar />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
      {activeNote && !isZen && (
        <NoteInfoPanel isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      )}
    </div>
  );
}

function SplitView({ onPreviewScroll }: { onPreviewScroll: (e: React.UIEvent<HTMLDivElement>) => void }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-hidden border-r border-ragnar-border-subtle"><MarkdownEditor /></div>
      <div className="flex-1 overflow-y-auto" onScroll={onPreviewScroll}><MarkdownPreview /></div>
    </div>
  );
}

function WelcomeScreen() {
  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);
  const pinnedNoteIds = useNotesStore((s) => s.pinnedNoteIds);
  const folders = useNotesStore((s) => s.folders);
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const upsertNote = useNotesStore((s) => s.upsertNote);
  const setSidebarRoute = useAppStore((s) => s.setSidebarRoute);
  const recentNoteIds = useSearchStore((s) => s.recentNoteIds);
  const openCommandPalette = useAppStore((s) => s.openCommandPalette);


  const allNotes = Object.values(notes).filter((n) => !trashedNoteIds.includes(n.id));
  const totalWords = allNotes.reduce((sum, n) => sum + n.content.split(/\s+/).filter(Boolean).length, 0);
  const totalTags = new Set(allNotes.flatMap((n) => n.frontmatter.tags)).size;

  const recentNotes = recentNoteIds
    .map((id) => notes[id])
    .filter((n) => n && !trashedNoteIds.includes(n.id))
    .slice(0, 4);

  const displayNotes = recentNotes.length > 0
    ? recentNotes
    : allNotes
        .sort((a, b) => new Date(b.frontmatter.updatedAt).getTime() - new Date(a.frontmatter.updatedAt).getTime())
        .slice(0, 4);

  function handleNewNote() {
    const id = `note-${Date.now()}`;
    const now = new Date().toISOString();
    const newNote = {
      id,
      title: "Untitled",
      content: "# Untitled\n\nStart writing here…\n",
      folderId: "folder-work",
      filePath: `/vault/untitled-${Date.now()}.md`,
      isUnsaved: true,
      frontmatter: { title: "Untitled", createdAt: now, updatedAt: now, tags: [], pinned: false, aliases: [] },
    };
    upsertNote(newNote);
    setActiveNote(newNote);
    setSidebarRoute("all-notes");
  }

  // Feature cards
  const features = [
    { icon: <Feather size={14} />, title: "Markdown-first", desc: "Full GFM + callouts + wiki-links" },
    { icon: <Shield size={14} />, title: "Local & private", desc: "No cloud, no tracking, ever" },
    { icon: <Zap size={14} />, title: "Instant search", desc: "⌘K to search notes & commands" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-1 flex-col items-center justify-start overflow-y-auto no-scrollbar"
    >
      {/* Animated gradient hero section */}
      <div className="relative w-full flex flex-col items-center pt-16 pb-10 px-8 overflow-hidden">
        {/* Animated gradient rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute h-[400px] w-[400px] rounded-full border border-ragnar-accent/5"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute h-[280px] w-[280px] rounded-full border border-ragnar-accent/8"
          />
          <div className="absolute h-[160px] w-[160px] rounded-full bg-ragnar-accent/4 blur-3xl" />
        </div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 22 }}
          className="relative mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-ragnar-accent/10 text-ragnar-accent ring-1 ring-ragnar-accent/20"
          style={{ boxShadow: "0 0 40px var(--ragnar-accent-muted)" }}
        >
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h14l6 6v18H6V4z" />
            <path d="M20 4v6h6" />
            <line x1="10" y1="14" x2="22" y2="14" />
            <line x1="10" y1="18" x2="22" y2="18" />
            <line x1="10" y1="22" x2="16" y2="22" />
          </svg>

          {/* Glowing dot */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-ragnar-accent shadow-[0_0_12px_var(--ragnar-accent)]"
          />
        </motion.div>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-[26px] font-bold tracking-tight text-ragnar-text-primary mb-1">
            Ragnar Notes
          </h1>
          <p className="text-[14px] text-ragnar-text-secondary max-w-sm">
            Your local-first, distraction-free writing companion for macOS
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-6 flex items-center gap-6"
        >
          <StatPill icon={<FileText size={12} />} value={allNotes.length} label="Notes" />
          <div className="h-4 w-px bg-ragnar-border-subtle" />
          <StatPill icon={<Sparkles size={12} />} value={totalWords.toLocaleString()} label="Words" />
          <div className="h-4 w-px bg-ragnar-border-subtle" />
          <StatPill icon={<Clock size={12} />} value={Object.keys(folders).length} label="Folders" />
          <div className="h-4 w-px bg-ragnar-border-subtle" />
          <StatPill icon={<FileText size={12} />} value={totalTags} label="Tags" />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-lg px-6 pb-12 space-y-5">

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="flex gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNewNote}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3",
              "bg-gradient-to-r from-ragnar-accent to-ragnar-accent-hover text-white",
              "text-[13px] font-semibold",
              "shadow-[0_2px_16px_var(--ragnar-accent-muted)]",
              "hover:shadow-[0_4px_24px_var(--ragnar-accent-muted)] transition-all",
            )}
          >
            <Plus size={15} strokeWidth={2.5} />
            New Note
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={openCommandPalette}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3",
              "border border-ragnar-border-subtle bg-ragnar-bg-secondary/60",
              "text-[13px] font-medium text-ragnar-text-secondary",
              "hover:border-ragnar-border hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary transition-all",
            )}
          >
            <Search size={14} />
            <span>Search</span>
            <kbd className="rounded bg-ragnar-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-ragnar-text-muted">⌘K</kbd>
          </motion.button>
        </motion.div>

        {/* Recent / Recent notes */}
        {displayNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
          >
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
              {recentNotes.length > 0 ? "Recently Opened" : "Recent Notes"}
            </p>
            <div className="space-y-1.5">
              {displayNotes.map((note, i) => (
                <motion.button
                  key={note.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.04 }}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveNote(note)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left",
                    "bg-ragnar-bg-secondary/60 border border-ragnar-border-subtle",
                    "transition-all hover:bg-ragnar-bg-hover hover:border-ragnar-border",
                    "hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] group",
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ragnar-bg-tertiary text-ragnar-text-muted group-hover:bg-ragnar-accent/10 group-hover:text-ragnar-accent transition-colors flex-shrink-0">
                    <FileText size={13} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[13px] font-medium text-ragnar-text-primary">{note.title}</p>
                    <p className="truncate text-[11px] text-ragnar-text-muted">
                      {note.frontmatter.tags.length > 0 ? note.frontmatter.tags.map((t) => `#${t}`).join(" ") : "No tags"}
                    </p>
                  </div>
                  {pinnedNoteIds.includes(note.id) && (
                    <span className="text-[11px] text-ragnar-accent">📌</span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="grid grid-cols-3 gap-2"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 + i * 0.06 }}
              className={cn(
                "flex flex-col gap-1.5 rounded-xl p-3",
                "bg-ragnar-bg-secondary/50 border border-ragnar-border-subtle",
              )}
            >
              <span className="text-ragnar-accent">{f.icon}</span>
              <p className="text-[11.5px] font-semibold text-ragnar-text-primary">{f.title}</p>
              <p className="text-[10.5px] text-ragnar-text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Keyboard tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.52 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-ragnar-text-muted/60">
            <Keyboard size={11} />
            <span>Keyboard Shortcuts</span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            <Tip icon="⌘K" text="Search" />
            <Tip icon="⌘." text="Zen mode" />
            <Tip icon="⌘/" text="Sidebar" />
            <Tip icon="⌘⇧E" text="Export" />
            <Tip icon="⌘⇧S" text="Split view" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-ragnar-text-muted">
      {icon}
      <span className="text-[13px] font-bold text-ragnar-text-primary">{value}</span>
      <span className="text-[11px]">{label}</span>
    </div>
  );
}

function Tip({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-ragnar-bg-hover px-2.5 py-1.5">
      <kbd className="rounded bg-ragnar-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-ragnar-text-secondary">{icon}</kbd>
      <span className="text-[11px] text-ragnar-text-muted">{text}</span>
    </div>
  );
}
