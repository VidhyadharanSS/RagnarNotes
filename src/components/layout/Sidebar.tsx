import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { useNotesStore } from "@stores/notesStore";
import { useEditorStore } from "@stores/editorStore";
import { Tooltip } from "@components/ui/Tooltip";
import { FolderTree } from "@components/features/FolderTree";
import { toast } from "@components/ui/Toast";
import { cn } from "@utils/cn";
import {
  FileText,
  Pin,
  Tag,
  Trash2,
  Search,
  Plus,
  FolderPlus,
  Vault,
  ChevronDown,
  Download,
  Settings,
} from "lucide-react";
import type { SidebarRoute } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * Sidebar — Stage 4: Export & settings actions, improved polish
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
  const pinnedNoteIds = useNotesStore((s) => s.pinnedNoteIds);
  const setActiveNote = useEditorStore((s) => s.setActiveNote);
  const upsertNote = useNotesStore((s) => s.upsertNote);

  const allCount = Object.keys(notes).length - trashedNoteIds.length;
  const pinnedCount = pinnedNoteIds.length;
  const trashCount = trashedNoteIds.length;

  const navItems: NavItem[] = [
    { id: "all-notes", label: "All Notes", icon: <FileText size={15} />, badge: allCount || undefined },
    { id: "favorites", label: "Pinned", icon: <Pin size={15} />, badge: pinnedCount || undefined },
    { id: "tags", label: "Tags", icon: <Tag size={15} /> },
    { id: "trash", label: "Trash", icon: <Trash2 size={15} />, badge: trashCount || undefined },
  ];

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
    toast.success("New note created");
  }

  const vaultName = "Demo Vault";

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden",
        "border-r border-ragnar-border-subtle",
        "bg-ragnar-sidebar-bg glass-surface",
        "transition-colors duration-200",
      )}
    >
      {/* Vault header */}
      <div className="flex items-center gap-2.5 border-b border-ragnar-border-subtle px-3 py-2.5">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ragnar-accent/20 to-ragnar-accent/5">
          <Vault size={14} className="text-ragnar-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-[13px] font-semibold text-ragnar-text-primary">{vaultName}</p>
          <p className="text-[10px] text-ragnar-text-muted">{allCount} notes</p>
        </div>
        <ChevronDown size={12} className="text-ragnar-text-muted" />
      </div>

      {/* Search shortcut */}
      <div className="px-3 pt-2.5 pb-1.5">
        <Tooltip content="Search notes & commands" shortcut="⌘K" side="right">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCommandPalette}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2",
              "bg-ragnar-bg-hover/80 text-ragnar-text-muted",
              "text-[13px] border border-ragnar-border-subtle",
              "transition-all hover:text-ragnar-text-primary hover:border-ragnar-border",
              "hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
            )}
          >
            <Search size={13} />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="font-mono text-[11px] opacity-50 rounded bg-ragnar-bg-tertiary px-1.5 py-0.5">⌘K</kbd>
          </motion.button>
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-1 space-y-0.5">
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
      <div className="flex-1 overflow-y-auto px-2 py-1 no-scrollbar">
        <div className="mb-1 flex items-center justify-between px-3 pt-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ragnar-text-muted">Folders</p>
          <Tooltip content="New Folder" side="right">
            <button className="rounded p-0.5 text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary">
              <FolderPlus size={12} />
            </button>
          </Tooltip>
        </div>
        <FolderTree />
      </div>

      <Divider />

      {/* Bottom actions */}
      <div className="p-2 space-y-1.5">
        <Tooltip content="Create a new note" shortcut="⌘N" side="top">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNewNote}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-2.5",
              "bg-gradient-to-r from-ragnar-accent to-blue-600 text-white text-[13px] font-semibold",
              "shadow-[0_2px_12px_rgba(10,132,255,0.3)]",
              "transition-all hover:shadow-[0_4px_20px_rgba(10,132,255,0.45)]",
              "active:scale-[0.98]",
            )}
          >
            <Plus size={15} strokeWidth={2.5} />
            New Note
          </motion.button>
        </Tooltip>

        {/* Quick actions row */}
        <div className="flex items-center gap-1">
          <Tooltip content="Export current note" shortcut="⌘⇧E" side="top">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => window.dispatchEvent(new Event("ragnar-open-export"))}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2",
                "text-[11px] font-medium text-ragnar-text-muted",
                "border border-ragnar-border-subtle",
                "transition-all hover:border-ragnar-border hover:text-ragnar-text-primary hover:bg-ragnar-bg-hover",
              )}
            >
              <Download size={12} />
              Export
            </motion.button>
          </Tooltip>

          <Tooltip content="Settings" side="top">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => window.dispatchEvent(new Event("ragnar-open-settings"))}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2",
                "text-[11px] font-medium text-ragnar-text-muted",
                "border border-ragnar-border-subtle",
                "transition-all hover:border-ragnar-border hover:text-ragnar-text-primary hover:bg-ragnar-bg-hover",
              )}
            >
              <Settings size={12} />
              Settings
            </motion.button>
          </Tooltip>
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
        "text-[13px] font-medium transition-all duration-150",
        isActive
          ? "bg-ragnar-sidebar-active text-ragnar-accent"
          : "text-ragnar-text-secondary hover:bg-ragnar-sidebar-hover hover:text-ragnar-text-primary",
      )}
    >
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
          key={item.badge}
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
  return <div className="mx-3 my-1.5 h-px bg-ragnar-border-subtle" />;
}
