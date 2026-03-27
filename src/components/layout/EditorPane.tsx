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
import { FileText, Plus, Search, Keyboard, Clock, Sparkles, Info } from "lucide-react";

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
    <div className={cn("relative flex flex-1 overflow-hidden", "bg-ragnar-bg-primary", isZen && "bg-[#111113]")}>
      <div className="flex flex-1 flex-col overflow-hidden">
        {!activeNote ? (
          <WelcomeScreen />
        ) : (
          <>
            <AnimatePresence>
              {!isZen && (
                <motion.div key="toolbar" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="relative">
                  <EditorToolbar />
                  <button onClick={() => setIsInfoOpen(!isInfoOpen)} title="Toggle note info panel" className={cn("absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-md transition-colors", isInfoOpen ? "bg-ragnar-accent/15 text-ragnar-accent" : "text-ragnar-text-muted hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary")}>
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
      {activeNote && !isZen && <NoteInfoPanel isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />}
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
  const recentNoteIds = useSearchStore((s) => s.recentNoteIds);
  const openCommandPalette = useAppStore((s) => s.openCommandPalette);
  const allNotes = Object.values(notes).filter((n) => !trashedNoteIds.includes(n.id));
  const totalWords = allNotes.reduce((sum, n) => sum + n.content.split(/\s+/).filter(Boolean).length, 0);
  const totalTags = new Set(allNotes.flatMap((n) => n.frontmatter.tags)).size;
  const recentNotes = recentNoteIds.map((id) => notes[id]).filter((n) => n && !trashedNoteIds.includes(n.id)).slice(0, 4);
  const displayNotes = recentNotes.length > 0 ? recentNotes : allNotes.sort((a, b) => new Date(b.frontmatter.updatedAt).getTime() - new Date(a.frontmatter.updatedAt).getTime()).slice(0, 4);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center overflow-y-auto py-12">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 25 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ragnar-accent/10 text-ragnar-accent">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h14l6 6v18H6V4z" /><path d="M20 4v6h6" /><line x1="10" y1="14" x2="22" y2="14" /><line x1="10" y1="18" x2="22" y2="18" /><line x1="10" y1="22" x2="16" y2="22" /></svg>
      </motion.div>
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-ragnar-text-primary">Ragnar Notes</h1>
        <p className="mt-1.5 max-w-sm text-[14px] text-ragnar-text-secondary">Select a note from the sidebar, or use the shortcuts below.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex items-center gap-6">
        <StatPill icon={<FileText size={12} />} value={allNotes.length} label="Notes" />
        <StatPill icon={<Sparkles size={12} />} value={totalWords.toLocaleString()} label="Words" />
        <StatPill icon={<Clock size={12} />} value={Object.keys(folders).length} label="Folders" />
        <StatPill icon={<FileText size={12} />} value={totalTags} label="Tags" />
      </motion.div>
      {displayNotes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-md">
          <p className="mb-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">{recentNotes.length > 0 ? "Recently Opened" : "Recent Notes"}</p>
          <div className="space-y-1.5">
            {displayNotes.map((note, i) => (
              <motion.button key={note.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.04 }} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveNote(note)} className={cn("flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left", "bg-ragnar-bg-secondary/60 border border-ragnar-border-subtle", "transition-all hover:bg-ragnar-bg-hover hover:border-ragnar-border hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]", "group")}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ragnar-bg-tertiary text-ragnar-text-muted group-hover:bg-ragnar-accent/10 group-hover:text-ragnar-accent transition-colors"><FileText size={14} /></span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-medium text-ragnar-text-primary">{note.title}</p>
                  <p className="truncate text-[11px] text-ragnar-text-muted">{note.frontmatter.tags.length > 0 ? note.frontmatter.tags.map((t) => `#${t}`).join(" ") : "No tags"}</p>
                </div>
                {pinnedNoteIds.includes(note.id) && <span className="text-[10px] text-ragnar-accent">📌</span>}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex items-center gap-3">
        <ActionButton icon={<Plus size={14} />} label="New Note" shortcut="⌘N" onClick={() => {}} />
        <ActionButton icon={<Search size={14} />} label="Search" shortcut="⌘K" onClick={openCommandPalette} />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-2 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-ragnar-text-muted/60"><Keyboard size={11} /><span>Keyboard Shortcuts</span></div>
        <div className="flex flex-wrap justify-center gap-2">
          <Tip icon="⌘K" text="Search" /><Tip icon="⌘." text="Zen mode" /><Tip icon="⌘/" text="Sidebar" /><Tip icon="⌘⇧E" text="Export" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return <div className="flex items-center gap-1.5 text-ragnar-text-muted">{icon}<span className="text-[13px] font-semibold text-ragnar-text-primary">{value}</span><span className="text-[11px]">{label}</span></div>;
}

function ActionButton({ icon, label, shortcut, onClick }: { icon: React.ReactNode; label: string; shortcut: string; onClick: () => void }) {
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onClick} className={cn("flex items-center gap-2 rounded-xl border border-ragnar-border-subtle bg-ragnar-bg-secondary/60 px-4 py-2.5 text-[13px] font-medium text-ragnar-text-secondary transition-all hover:border-ragnar-border hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary")}>
      {icon}<span>{label}</span><kbd className="rounded bg-ragnar-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-ragnar-text-muted">{shortcut}</kbd>
    </motion.button>
  );
}

function Tip({ icon, text }: { icon: string; text: string }) {
  return <div className="flex items-center gap-1.5 rounded-lg bg-ragnar-bg-hover px-2.5 py-1.5"><kbd className="rounded bg-ragnar-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-ragnar-text-secondary">{icon}</kbd><span className="text-[11px] text-ragnar-text-muted">{text}</span></div>;
}
