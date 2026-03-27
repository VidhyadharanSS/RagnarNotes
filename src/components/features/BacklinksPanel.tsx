import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@stores/notesStore";
import { useEditorStore } from "@stores/editorStore";
import { cn } from "@utils/cn";
import { Link2, FileText, ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * BacklinksPanel — Stage 5: Shows notes that link to the active note
 *
 * Scans all notes for [[wiki-links]] referencing the current note's
 * title or aliases, and displays them as clickable backlink cards.
 * ───────────────────────────────────────────────────────────── */

const WIKILINK_RE = /\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g;

export function BacklinksPanel() {
  const activeNote = useEditorStore((s) => s.activeNote);
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);

  const backlinks = useMemo(() => {
    if (!activeNote) return [];

    const targets = new Set<string>();
    targets.add(activeNote.title.toLowerCase());
    activeNote.frontmatter.aliases.forEach((a) => targets.add(a.toLowerCase()));

    return Object.values(notes).filter((n) => {
      if (n.id === activeNote.id) return false;
      if (trashedNoteIds.includes(n.id)) return false;

      const matches = n.content.matchAll(WIKILINK_RE);
      for (const m of matches) {
        if (targets.has(m[1].trim().toLowerCase())) return true;
      }
      return false;
    });
  }, [activeNote, notes, trashedNoteIds]);

  if (!activeNote) return null;

  return (
    <div className="border-t border-ragnar-border-subtle">
      <button
        className={cn(
          "flex w-full items-center gap-2 px-4 py-2",
          "text-[11px] font-semibold uppercase tracking-wider",
          "text-ragnar-text-muted hover:text-ragnar-text-primary",
          "transition-colors",
        )}
      >
        <Link2 size={11} />
        <span>Backlinks</span>
        {backlinks.length > 0 && (
          <span className="rounded-full bg-ragnar-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-ragnar-accent">
            {backlinks.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {backlinks.length > 0 ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-0.5 px-2 pb-2"
          >
            {backlinks.map((note) => (
              <motion.button
                key={note.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveNote(note)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left",
                  "text-[12px] text-ragnar-text-secondary",
                  "transition-all hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
                  "group",
                )}
              >
                <FileText size={12} className="flex-shrink-0 text-ragnar-text-muted" />
                <span className="flex-1 truncate">{note.title}</span>
                <ArrowRight
                  size={10}
                  className="flex-shrink-0 text-ragnar-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <p className="px-4 pb-2 text-[11px] text-ragnar-text-muted/60">
            No notes link to this one yet
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
