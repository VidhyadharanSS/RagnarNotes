import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { useNotesStore } from "@stores/notesStore";
import { useClickOutside } from "@hooks/useClickOutside";
import { OutlinePanel } from "@components/features/OutlinePanel";
import { BacklinksPanel } from "@components/features/BacklinksPanel";
import { NoteHistory } from "@components/features/NoteHistory";
import { cn } from "@utils/cn";
import {
  X,
  Info,
  Tag,
  FolderOpen,
  FileText,
  Clock,
  Hash,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * NoteInfoPanel — Stage 5: Right slide-out with note metadata,
 * outline, backlinks, and history
 * ───────────────────────────────────────────────────────────── */

interface NoteInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NoteInfoPanel({ isOpen, onClose }: NoteInfoPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const activeNote = useEditorStore((s) => s.activeNote);
  const wordCount = useEditorStore((s) => s.wordCount);
  const charCount = useEditorStore((s) => s.charCount);
  const folders = useNotesStore((s) => s.folders);
  const pinnedNoteIds = useNotesStore((s) => s.pinnedNoteIds);

  useClickOutside(panelRef, isOpen ? onClose : () => {});

  if (!activeNote) return null;

  const folder = folders[activeNote.folderId];
  const isPinned = pinnedNoteIds.includes(activeNote.id);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const sentences = (activeNote.content.match(/[.!?]+/g) ?? []).length;
  const paragraphs = activeNote.content.split(/\n\s*\n/).filter(Boolean).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="note-info-panel"
          ref={panelRef}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            "h-full flex-shrink-0 overflow-hidden",
            "border-l border-ragnar-border-subtle bg-ragnar-bg-secondary",
          )}
        >
          <div className="flex h-full w-[280px] flex-col overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-4 py-3">
              <div className="flex items-center gap-2">
                <Info size={13} className="text-ragnar-accent" />
                <h3 className="text-[13px] font-bold text-ragnar-text-primary">Note Info</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary"
              >
                <X size={13} />
              </button>
            </div>

            {/* Metadata */}
            <div className="space-y-2.5 px-4 py-3 border-b border-ragnar-border-subtle">
              <MetaRow icon={<FileText size={11} />} label="Title" value={activeNote.title} />
              {folder && (
                <MetaRow icon={<FolderOpen size={11} />} label="Folder" value={folder.name} />
              )}
              <MetaRow icon={<Hash size={11} />} label="Words" value={`${wordCount.toLocaleString()} (${charCount.toLocaleString()} chars)`} />
              <MetaRow icon={<Clock size={11} />} label="Reading" value={`${readingTime} min · ${sentences} sentences · ${paragraphs} paragraphs`} />
              <MetaRow
                icon={<Clock size={11} />}
                label="Created"
                value={new Date(activeNote.frontmatter.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />
              <MetaRow
                icon={<Clock size={11} />}
                label="Updated"
                value={new Date(activeNote.frontmatter.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />

              {/* Tags */}
              {activeNote.frontmatter.tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag size={11} className="mt-0.5 flex-shrink-0 text-ragnar-text-muted" />
                  <div className="flex flex-wrap gap-1">
                    {activeNote.frontmatter.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-ragnar-accent/10 px-2 py-0.5 text-[10px] font-medium text-ragnar-accent"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status badges */}
              <div className="flex items-center gap-2 pt-1">
                {isPinned && (
                  <span className="rounded-full bg-ragnar-accent/10 px-2 py-0.5 text-[10px] font-semibold text-ragnar-accent">
                    📌 Pinned
                  </span>
                )}
                {activeNote.isUnsaved && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                    ● Unsaved
                  </span>
                )}
              </div>
            </div>

            {/* Outline */}
            <OutlinePanel />

            {/* Backlinks */}
            <BacklinksPanel />

            {/* History */}
            <NoteHistory />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex-shrink-0 text-ragnar-text-muted">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-ragnar-text-muted">{label}</p>
        <p className="truncate text-[12px] text-ragnar-text-primary">{value}</p>
      </div>
    </div>
  );
}
