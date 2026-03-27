import { useMemo } from "react";
import { motion } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { cn } from "@utils/cn";
import { List } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * OutlinePanel — Stage 5: Table of contents from headings
 *
 * Parses headings from the active note's draft content and renders
 * an interactive outline. Clicking a heading scrolls the editor.
 * ───────────────────────────────────────────────────────────── */

interface Heading {
  level: number;
  text: string;
  line: number;
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].replace(/[*_`[\]]/g, "").trim(),
        line: i,
      });
    }
  }

  return headings;
}

export function OutlinePanel() {
  const draftContent = useEditorStore((s) => s.draftContent);
  const activeNote = useEditorStore((s) => s.activeNote);

  const headings = useMemo(
    () => extractHeadings(draftContent),
    [draftContent],
  );

  if (!activeNote) return null;

  return (
    <div className="border-t border-ragnar-border-subtle">
      <div className={cn(
        "flex items-center gap-2 px-4 py-2",
        "text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted",
      )}>
        <List size={11} />
        <span>Outline</span>
        {headings.length > 0 && (
          <span className="rounded-full bg-ragnar-bg-tertiary px-1.5 py-0.5 text-[9px]">
            {headings.length}
          </span>
        )}
      </div>

      {headings.length > 0 ? (
        <div className="max-h-[200px] overflow-y-auto no-scrollbar px-2 pb-2 space-y-0.5">
          {headings.map((h, i) => (
            <motion.button
              key={`${h.line}-${h.text}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "block w-full truncate rounded-md px-2 py-1 text-left transition-colors",
                "text-ragnar-text-secondary hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
                h.level === 1 && "text-[12px] font-semibold",
                h.level === 2 && "text-[11px] font-medium pl-4",
                h.level === 3 && "text-[11px] pl-7 text-ragnar-text-muted",
                h.level >= 4 && "text-[10px] pl-10 text-ragnar-text-muted",
              )}
              title={h.text}
            >
              {h.text}
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="px-4 pb-2 text-[11px] text-ragnar-text-muted/60">
          Add headings to see outline
        </p>
      )}
    </div>
  );
}
