import { motion } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { useNotesStore } from "@stores/notesStore";
import { cn } from "@utils/cn";
import type { SidebarRoute } from "@/types";
import { FolderTree } from "@components/features/FolderTree";

/* ─────────────────────────────────────────────────────────────
 * Sidebar — Left navigation panel
 *
 * Features:
 *  - Frosted-glass background (glass-surface utility)
 *  - Primary nav routes (All Notes, Favorites, Tags, Trash)
 *  - Folder tree (FolderTree component)
 *  - New folder / new note CTAs
 * ───────────────────────────────────────────────────────────── */

interface NavItem {
  id: SidebarRoute;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function Sidebar() {
  const sidebarRoute = useAppStore((s) => s.sidebarRoute);
  const setSidebarRoute = useAppStore((s) => s.setSidebarRoute);
  const openCommandPalette = useAppStore((s) => s.openCommandPalette);
  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);

  const allCount = Object.keys(notes).length - trashedNoteIds.length;
  const pinnedCount = useNotesStore((s) => s.pinnedNoteIds.length);
  const trashCount = trashedNoteIds.length;

  const navItems: NavItem[] = [
    { id: "all-notes", label: "All Notes", icon: <NotesIcon />, badge: allCount || undefined },
    { id: "favorites", label: "Pinned", icon: <StarIcon />, badge: pinnedCount || undefined },
    { id: "tags", label: "Tags", icon: <TagIcon /> },
    { id: "trash", label: "Trash", icon: <TrashIcon />, badge: trashCount || undefined },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-ragnar-border-subtle",
        "bg-ragnar-sidebar-bg glass-surface",
      )}
    >
      {/* Search button */}
      <div className="px-3 pt-3 pb-2">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCommandPalette}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2",
            "bg-ragnar-bg-hover text-ragnar-text-muted",
            "text-[13px] transition-colors hover:text-ragnar-text-primary",
            "border border-ragnar-border-subtle",
          )}
        >
          <SearchIcon />
          <span>Search…</span>
          <span className="ml-auto font-mono text-[11px] opacity-60">⌘K</span>
        </motion.button>
      </div>

      {/* Primary navigation */}
      <nav className="px-2 py-1">
        {navItems.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            isActive={sidebarRoute === item.id}
            onClick={() => setSidebarRoute(item.id)}
          />
        ))}
      </nav>

      <Divider />

      {/* Folder tree */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        <SectionLabel label="Folders" />
        <FolderTree />
      </div>

      {/* Bottom CTAs */}
      <div className="border-t border-ragnar-border-subtle p-2">
        <NewNoteButton />
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function NavRow({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left",
        "text-[13px] font-medium transition-colors",
        isActive
          ? "bg-ragnar-sidebar-active text-ragnar-accent"
          : "text-ragnar-text-secondary hover:bg-ragnar-sidebar-hover hover:text-ragnar-text-primary",
      )}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span
          className={cn(
            "min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold",
            isActive
              ? "bg-ragnar-accent/20 text-ragnar-accent"
              : "bg-ragnar-bg-tertiary text-ragnar-text-muted",
          )}
        >
          {item.badge}
        </span>
      )}
    </motion.button>
  );
}

function NewNoteButton() {
  // Will wire to file system creation in Stage 4
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg py-2",
        "bg-ragnar-accent text-white text-[13px] font-semibold",
        "transition-opacity hover:opacity-90",
      )}
    >
      <PlusIcon />
      New Note
    </motion.button>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-1 px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
      {label}
    </p>
  );
}

function Divider() {
  return <div className="mx-3 my-1 h-px bg-ragnar-border-subtle" />;
}

/* ── Inline Icons ── */
function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="5.5" cy="5.5" r="4" />
      <line x1="9" y1="9" x2="12" y2="12" />
    </svg>
  );
}
function NotesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="1" width="10" height="12" rx="1.5" />
      <line x1="4.5" y1="4.5" x2="9.5" y2="4.5" />
      <line x1="4.5" y1="7" x2="9.5" y2="7" />
      <line x1="4.5" y1="9.5" x2="7.5" y2="9.5" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="7,1.5 8.8,5.5 13,5.9 9.9,8.8 10.9,13 7,10.8 3.1,13 4.1,8.8 1,5.9 5.2,5.5" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 1.5h4.5l6 6-4.5 4.5-6-6V1.5z" />
      <circle cx="4" cy="4" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,3.5 13,3.5" />
      <path d="M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1" />
      <path d="M2.5 3.5l.8 8a1 1 0 001 .9h5.4a1 1 0 001-.9l.8-8" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="6.5" y1="1" x2="6.5" y2="12" />
      <line x1="1" y1="6.5" x2="12" y2="6.5" />
    </svg>
  );
}
