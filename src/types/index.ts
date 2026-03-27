/* ─────────────────────────────────────────────────────────────
 * Ragnar Notes — Core Type Definitions  v1.1.0
 * ───────────────────────────────────────────────────────────── */

export type NoteId = string;
export type FolderId = string;

export interface NoteFrontmatter {
  title: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  pinned: boolean;
  aliases: string[];
  [key: string]: unknown;
}

export interface Note {
  id: NoteId;
  title: string;
  content: string;
  frontmatter: NoteFrontmatter;
  filePath: string;
  folderId: FolderId;
  isUnsaved: boolean;
}

export interface Folder {
  id: FolderId;
  name: string;
  path: string;
  parentId: FolderId | null;
  children: FolderId[];
  isExpanded: boolean;
}

export type EditorMode = "edit" | "readonly" | "zen";

export interface PaletteCommand {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  section: "navigation" | "editor" | "file" | "view" | "system";
  action: () => void;
}

export type SidebarRoute = "all-notes" | "favorites" | "tags" | "trash";

export interface SearchResult {
  noteId: NoteId;
  title: string;
  excerpt: string;
  matchPositions: Array<{ start: number; end: number }>;
}

export interface Asset {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  linkedNoteIds: NoteId[];
}

export type FontFamily =
  | "inter"
  | "system"
  | "merriweather"
  | "lora"
  | "crimson-pro"
  | "source-sans"
  | "ibm-plex"
  | "space-grotesk"
  | "jetbrains-mono"
  | "fira-code"
  | "geist"
  | "nunito"
  | "dm-sans"
  | "playfair";

export type AccentColor =
  | "blue"
  | "purple"
  | "indigo"
  | "green"
  | "teal"
  | "orange"
  | "rose"
  | "amber"
  | "pink"
  | "cyan";

export interface AppPreferences {
  theme: "dark" | "light" | "system";
  fontSize: number;
  lineHeight: number;
  spellCheck: boolean;
  vaultPath: string;
  autoSaveIntervalMs: number;
  fontFamily: FontFamily;
  accentColor: AccentColor;
  editorMaxWidth: number;
  showWordCount: boolean;
  compactMode: boolean;
}

/** Note label colors for visual organization */
export type NoteColor = "none" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";
