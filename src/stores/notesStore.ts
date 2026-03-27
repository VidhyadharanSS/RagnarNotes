import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Note, NoteId, Folder, FolderId } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * Notes Store — Notes & folder tree state
 *
 * Manages: all notes, folder tree, CRUD operations,
 *          search index, and trash.
 * ───────────────────────────────────────────────────────────── */

interface NotesState {
  // ── Data ──
  notes: Record<NoteId, Note>;
  folders: Record<FolderId, Folder>;
  rootFolderIds: FolderId[];
  trashedNoteIds: NoteId[];
  pinnedNoteIds: NoteId[];

  // ── Loading ──
  isLoading: boolean;
  vaultPath: string;

  // ── Actions: Notes ──
  setNotes: (notes: Note[]) => void;
  upsertNote: (note: Note) => void;
  deleteNote: (id: NoteId) => void;
  trashNote: (id: NoteId) => void;
  restoreNote: (id: NoteId) => void;
  pinNote: (id: NoteId, pinned: boolean) => void;

  // ── Actions: Folders ──
  setFolders: (folders: Folder[]) => void;
  upsertFolder: (folder: Folder) => void;
  deleteFolder: (id: FolderId) => void;
  toggleFolderExpanded: (id: FolderId) => void;

  // ── Actions: System ──
  setVaultPath: (path: string) => void;
  setLoading: (loading: boolean) => void;

  // ── Selectors ──
  getNotesByFolder: (folderId: FolderId) => Note[];
  getNotesFlat: () => Note[];
}

export const useNotesStore = create<NotesState>()(
  devtools(
    (set, get) => ({
      // ── Initial state ──
      notes: {},
      folders: {},
      rootFolderIds: [],
      trashedNoteIds: [],
      pinnedNoteIds: [],
      isLoading: false,
      vaultPath: "",

      // ── Note actions ──
      setNotes: (notes) =>
        set(
          { notes: Object.fromEntries(notes.map((n) => [n.id, n])) },
          false,
          "setNotes",
        ),

      upsertNote: (note) =>
        set(
          (s) => ({ notes: { ...s.notes, [note.id]: note } }),
          false,
          "upsertNote",
        ),

      deleteNote: (id) =>
        set(
          (s) => {
            const { [id]: _, ...rest } = s.notes;
            return {
              notes: rest,
              trashedNoteIds: s.trashedNoteIds.filter((tid) => tid !== id),
              pinnedNoteIds: s.pinnedNoteIds.filter((pid) => pid !== id),
            };
          },
          false,
          "deleteNote",
        ),

      trashNote: (id) =>
        set(
          (s) => ({
            trashedNoteIds: s.trashedNoteIds.includes(id)
              ? s.trashedNoteIds
              : [...s.trashedNoteIds, id],
          }),
          false,
          "trashNote",
        ),

      restoreNote: (id) =>
        set(
          (s) => ({
            trashedNoteIds: s.trashedNoteIds.filter((tid) => tid !== id),
          }),
          false,
          "restoreNote",
        ),

      pinNote: (id, pinned) =>
        set(
          (s) => ({
            pinnedNoteIds: pinned
              ? s.pinnedNoteIds.includes(id)
                ? s.pinnedNoteIds
                : [...s.pinnedNoteIds, id]
              : s.pinnedNoteIds.filter((pid) => pid !== id),
          }),
          false,
          "pinNote",
        ),

      // ── Folder actions ──
      setFolders: (folders) =>
        set(
          {
            folders: Object.fromEntries(folders.map((f) => [f.id, f])),
            rootFolderIds: folders
              .filter((f) => f.parentId === null)
              .map((f) => f.id),
          },
          false,
          "setFolders",
        ),

      upsertFolder: (folder) =>
        set(
          (s) => {
            const isNew = !(folder.id in s.folders);
            return {
              folders: { ...s.folders, [folder.id]: folder },
              rootFolderIds:
                isNew && folder.parentId === null
                  ? [...s.rootFolderIds, folder.id]
                  : s.rootFolderIds,
            };
          },
          false,
          "upsertFolder",
        ),

      deleteFolder: (id) =>
        set(
          (s) => {
            const { [id]: _, ...rest } = s.folders;
            return {
              folders: rest,
              rootFolderIds: s.rootFolderIds.filter((rid) => rid !== id),
            };
          },
          false,
          "deleteFolder",
        ),

      toggleFolderExpanded: (id) =>
        set(
          (s) => ({
            folders: {
              ...s.folders,
              [id]: { ...s.folders[id], isExpanded: !s.folders[id].isExpanded },
            },
          }),
          false,
          "toggleFolderExpanded",
        ),

      // ── System ──
      setVaultPath: (path) => set({ vaultPath: path }, false, "setVaultPath"),
      setLoading: (loading) => set({ isLoading: loading }, false, "setLoading"),

      // ── Selectors ──
      getNotesByFolder: (folderId) =>
        Object.values(get().notes).filter((n) => n.folderId === folderId),

      getNotesFlat: () => Object.values(get().notes),
    }),
    { name: "RagnarNotes/Notes" },
  ),
);
