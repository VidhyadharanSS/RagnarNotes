import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { useNotesStore } from "@stores/notesStore";
import { useEditorStore } from "@stores/editorStore";
import { Tooltip } from "@components/ui/Tooltip";
import { FolderTree } from "@components/features/FolderTree";
import { cn } from "@utils/cn";
import type { SidebarRoute } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * Sidebar — Left navigation panel (Stage 2)
 *
 * Stage 2 additions:
 *  - Tooltips on all action buttons
 *  - "New Note" wires to notesStore.createNew (stub)
 *  - Folder count badge on Folders section
 *  - Smooth entrance animations per nav item
 *  - User avatar / vault name at the bottom
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
  const vaultPath = useAppStore((s) => s.preferences.vaultPath);
  const notes = useNotesStore((s) => s.notes);
  const trashedNoteIds = useNotesStore((s) => s.trashedNoteIds);
  const pinnedNoteIds = useNotesStore((s) => s.pinnedNoteIds);
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const upsertNote = useNotesStore((s) => s.upsertNote);

  const allCount = Object.keys(notes).length - trashedNoteIds.length;
  const pinnedCount = pinnedNoteIds.length;
  const trashCount = trashedNoteIds.length;

  const navItems: NavItem[] = [
    { id: "all-notes", label: "All Notes", icon: <NotesIcon />, badge: allCount || undefined },
    { id: "favorites", label: "Pinned", icon: <StarIcon />, badge: pinnedCount || undefined },
    { id: "tags", label: "Tags", icon: <TagIcon /> },
    { id: "trash", label: "Trash", icon: <TrashIcon />, badge: trashCount || undefined },
  ];

  function handleNewNote() {
    const id = `note-${Date.now()}`;
    const now = new Date().toISOString();
    const newNote = {
      id,
      title: "Untitled",
      content: "# Untitled\n\n",
      folderId: "folder-work",
      filePath: `/vault/untitled-${Date.now()}.md`,
      isUnsaved: true,
      frontmatter: {
        title: "Untitled",
        createdAt: now,
        updatedAt: now,
        tags: [],
        pinned: false,
        aliases: [],
      },
    };
    upsertNote(newNote);
    setActiveNote(newNote);
    setSidebarRoute("all-notes");
  }

  const vaultName = vaultPath
    ? vaultPath.split("/").filter(Boolean).pop() ?? "My Vault"
    : "Demo Vault";

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden",
        "border-r border-ragnar-border-subtle",
        "bg-ragnar-sidebar-bg glass-surface",
      )}
    >
      {/* Search shortcut button */}
      <div className="px-3 pt-3 pb-2">
        <Tooltip content="Search or run a command" shortcut="⌘K" side="right">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCommandPalette}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2",
              "bg-ragnar-bg-hover text-ragnar-text-muted",
              "text-[13px] border border-ragnar-border-subtle",
              "transition-colors hover:text-ragnar-text-primary hover:border-ragnar-border",
            )}
          >
            <SearchIcon />
            <span className="flex-1 text-left">Search…</span>
            <span className="font-mono text-[11px] opacity-50">⌘K</span>
          </motion.button>
        </Tooltip>
      </div>

      {/* Primary navigation */}
      <nav className="px-2 py-1">
        {navItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
          >
            <NavRow
              item={item}
              isActive={sidebarRoute === item.id}
              onClick={() => setSidebarRoute(item.id)}
            />
          </motion.div>
        ))}
      </nav>

      <Divider />

      {/* Folder tree */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        <div className="mb-1 flex items-center justify-between px-3 pt-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">
            Folders
          </p>
          <Tooltip content="New Folder" side="right">
            <button className="rounded p-0.5 text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary">
              <PlusIcon size={10} />
            </button>
          </Tooltip>
        </div>
        <FolderTree />
      </div>

      <Divider />

      {/* Vault info + new note */}
      <div className="p-2 space-y-2">
        {/* New Note button */}
        <Tooltip content="Create a new note" shortcut="⌘N" side="top">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNewNote}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg py-2",
              "bg-ragnar-accent text-white text-[13px] font-semibold",
              "shadow-[0_2px_12px_rgba(10,132,255,0.25)]",
              "transition-all hover:bg-ragnar-accent-hover hover:shadow-[0_2px_16px_rgba(10,132,255,0.4)]",
            )}
          >
            <PlusIcon />
            New Note
          </motion.button>
        </Tooltip>

        {/* Vault name footer */}
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-ragnar-accent/20">
            <VaultIcon />
          </div>
          <span className="truncate text-[11px] text-ragnar-text-muted">
            {vaultName}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── NavRow ── */

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
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left",
        "text-[13px] font-medium transition-colors",
        isActive
          ? "bg-ragnar-sidebar-active text-ragnar-accent"
          : "text-ragnar-text-secondary hover:bg-ragnar-sidebar-hover hover:text-ragnar-text-primary",
      )}
    >
      {/* Active indicator bar */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            layoutId="nav-indicator"
            className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-ragnar-accent"
            initial={false}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>

      <span className="flex-shrink-0">{item.icon}</span>
      <span className="flex-1 truncate">{item.label}</span>

      {item.badge !== undefined && item.badge > 0 && (
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={cn(
            "min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold",
            isActive
              ? "bg-ragnar-accent/20 text-ragnar-accent"
              : "bg-ragnar-bg-tertiary text-ragnar-text-muted",
          )}
        >
          {item.badge > 99 ? "99+" : item.badge}
        </motion.span>
      )}
    </motion.button>
  );
}

function Divider() {
  return <div className="mx-3 my-1 h-px bg-ragnar-border-subtle" />;
}

/* ── Icons ── */
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
function PlusIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="6.5" y1="1" x2="6.5" y2="12" />
      <line x1="1" y1="6.5" x2="12" y2="6.5" />
    </svg>
  );
}
function VaultIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--ragnar-accent)" strokeWidth="1.4" strokeLinecap="round">
      <rect x="1" y="1" width="8" height="8" rx="1.5" />
      <circle cx="5" cy="5" r="1.5" />
    </svg>
  );
}
