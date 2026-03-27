import { motion } from "framer-motion";
import { cn } from "@utils/cn";
import { formatRelativeTime } from "@utils/format";
import { FileText, Clock, Hash } from "lucide-react";
import type { Note } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * HoverPreview
 *
 * A floating card shown when hovering over a note item in the
 * note list. Shows title, excerpt, tags, word count, and last
 * modified time. Positioned relative to the hovered item.
 * ───────────────────────────────────────────────────────────── */

interface HoverPreviewProps {
  note: Note;
  anchorRect: DOMRect;
}

export function HoverPreview({ note, anchorRect }: HoverPreviewProps) {
  const previewWidth = 280;
  const previewMaxHeight = 200;

  // Position to the right of the note list item, vertically centered
  const windowWidth = window.innerWidth;
  const spaceRight = windowWidth - anchorRect.right;

  let left = anchorRect.right + 8;
  if (spaceRight < previewWidth + 16) {
    left = anchorRect.left - previewWidth - 8;
  }

  const top = Math.min(
    anchorRect.top,
    window.innerHeight - previewMaxHeight - 16,
  );

  const rawExcerpt = note.content
    .replace(/^---[\s\S]*?---\n?/, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_`[\]>~]/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 200);

  const wordCount = note.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -8, scale: 0.95 }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ top, left, width: previewWidth, maxHeight: previewMaxHeight }}
      className={cn(
        "hover-preview-card fixed z-[250]",
        "rounded-2xl border border-ragnar-border bg-ragnar-bg-secondary/95",
        "glass-surface shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        "overflow-hidden pointer-events-none",
        "flex flex-col",
      )}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2.5 border-b border-ragnar-border-subtle px-3.5 py-2.5">
        <FileText size={12} className="flex-shrink-0 text-ragnar-accent" />
        <h3 className="flex-1 truncate text-[13px] font-semibold text-ragnar-text-primary">
          {note.title}
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-3.5 py-2.5">
        {rawExcerpt ? (
          <p className="text-[11.5px] leading-relaxed text-ragnar-text-secondary line-clamp-4">
            {rawExcerpt}
          </p>
        ) : (
          <p className="text-[11.5px] italic text-ragnar-text-muted">No content yet…</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2.5 border-t border-ragnar-border-subtle px-3.5 py-2 flex-wrap">
        <div className="flex items-center gap-1 text-[10px] text-ragnar-text-muted">
          <Clock size={9} />
          <span>{formatRelativeTime(note.frontmatter.updatedAt)}</span>
        </div>
        <span className="text-ragnar-border text-[10px]">·</span>
        <span className="text-[10px] text-ragnar-text-muted">{readingTime}m read</span>

        {note.frontmatter.tags.length > 0 && (
          <>
            <span className="text-ragnar-border text-[10px]">·</span>
            <div className="flex items-center gap-1 text-[10px] text-ragnar-text-muted">
              <Hash size={9} />
              <span>{note.frontmatter.tags.slice(0, 2).join(", ")}</span>
              {note.frontmatter.tags.length > 2 && <span>+{note.frontmatter.tags.length - 2}</span>}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
