import { useMemo } from "react";
import { motion } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { cn } from "@utils/cn";
import { Clock, FileEdit } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * NoteHistory — Stage 5: Display note creation/update timeline
 *
 * Shows a clean timeline of the active note's metadata.
 * In a full implementation this would track edit snapshots;
 * for now it surfaces the created/updated dates nicely.
 * ───────────────────────────────────────────────────────────── */

export function NoteHistory() {
  const activeNote = useEditorStore((s) => s.activeNote);

  const events = useMemo(() => {
    if (!activeNote) return [];

    const created = new Date(activeNote.frontmatter.createdAt);
    const updated = new Date(activeNote.frontmatter.updatedAt);
    const items = [
      { label: "Created", date: created, icon: <FileEdit size={11} /> },
    ];

    if (updated.getTime() !== created.getTime()) {
      items.push({ label: "Last edited", date: updated, icon: <Clock size={11} /> });
    }

    return items;
  }, [activeNote]);

  if (!activeNote || events.length === 0) return null;

  return (
    <div className="border-t border-ragnar-border-subtle px-4 py-2">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
        History
      </p>
      <div className="space-y-2">
        {events.map((ev, i) => (
          <motion.div
            key={ev.label}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2"
          >
            <span className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full",
              "bg-ragnar-bg-tertiary text-ragnar-text-muted",
            )}>
              {ev.icon}
            </span>
            <div className="flex-1">
              <span className="text-[11px] text-ragnar-text-secondary">{ev.label}</span>
              <span className="ml-2 text-[10px] text-ragnar-text-muted">
                {ev.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                at{" "}
                {ev.date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
