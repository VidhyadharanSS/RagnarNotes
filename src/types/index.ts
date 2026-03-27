/* ─────────────────────────────────────────────────────────────
 * Ragnar Notes — Core Type Definitions
 * ───────────────────────────────────────────────────────────── */

/** Unique identifier for notes and folders (UUID v4). */
export type NoteId = string;
export type FolderId = string;

/** YAML frontmatter metadata attached to every note. */
export interface NoteFrontmatter {
  title: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  tags: string[];
  pinned: boolean;
  aliases: string[];
  [key: string]: unknown; // extensible
}

/** Represents a single Markdown note. */
export interface Note {
  id: NoteId;
  title: string;
  content: string; // raw Markdown body (without frontmatter)
  frontmatter: NoteFrontmatter;
  filePath: string; // absolute path on disk
  folderId: FolderId;
  isUnsaved: boolean;
}

/** Represents a folder in the note hierarchy. */
export interface Folder {
  id: FolderId;
  name: string;
  path: string; // absolute path on disk
  parentId: FolderId | null;
  children: FolderId[];
  isExpanded: boolean;
}

/** The three distinct editor modes. */
export type EditorMode = "edit" | "readonly" | "zen";

/** A single command exposed in the Cmd+K palette. */
export interface PaletteCommand {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  section: "navigation" | "editor" | "file" | "view" | "system";
  action: () => void;
}

/** Sidebar navigation routes. */
export type SidebarRoute = "all-notes" | "favorites" | "tags" | "trash";

/** Search result hit. */
export interface SearchResult {
  noteId: NoteId;
  title: string;
  excerpt: string;
  matchPositions: Array<{ start: number; end: number }>;
}

/** Asset file metadata. */
export interface Asset {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  linkedNoteIds: NoteId[];
}

/** Application-level preferences. */
export interface AppPreferences {
  theme: "dark" | "light" | "system";
  fontSize: number;
  lineHeight: number;
  spellCheck: boolean;
  vaultPath: string; // root directory for all notes
  autoSaveIntervalMs: number;
}
