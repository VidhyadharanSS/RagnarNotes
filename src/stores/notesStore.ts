import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Note, NoteId, Folder, FolderId, NoteColor } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * Notes Store — Stage 6 (Final)
 *
 * CHANGE: Added `persist` middleware. All notes, folders, pins,
 * and trash are now persisted to localStorage. This is a LOCAL
 * app — data must survive page reloads and app restarts.
 * ───────────────────────────────────────────────────────────── */

interface NotesState {
  // ── Data ──
  notes: Record<NoteId, Note>;
  folders: Record<FolderId, Folder>;
  rootFolderIds: FolderId[];
  trashedNoteIds: NoteId[];
  pinnedNoteIds: NoteId[];
  noteColors: Record<NoteId, NoteColor>;

  // ── Loading ──
  isLoading: boolean;
  vaultPath: string;
  _hasHydrated: boolean;

  // ── Actions: Notes ──
  colorNote: (id: NoteId, color: NoteColor) => void;
  setNotes: (notes: Note[]) => void;
  upsertNote: (note: Note) => void;
  deleteNote: (id: NoteId) => void;
  trashNote: (id: NoteId) => void;
  restoreNote: (id: NoteId) => void;
  pinNote: (id: NoteId, pinned: boolean) => void;
  bulkTrash: (ids: NoteId[]) => void;
  bulkDelete: (ids: NoteId[]) => void;
  bulkRestore: (ids: NoteId[]) => void;
  importNotes: (notes: Note[]) => void;

  // ── Actions: Folders ──
  setFolders: (folders: Folder[]) => void;
  upsertFolder: (folder: Folder) => void;
  deleteFolder: (id: FolderId) => void;
  toggleFolderExpanded: (id: FolderId) => void;

  // ── Actions: System ──
  setVaultPath: (path: string) => void;
  setLoading: (loading: boolean) => void;
  clearAllData: () => void;

  // ── Selectors ──
  getNotesByFolder: (folderId: FolderId) => Note[];
  getNotesFlat: () => Note[];
  getStorageSize: () => number;
}

export const useNotesStore = create<NotesState>()(
  devtools(
    persist(
      (set, get) => ({
        // ── Initial state ──
        notes: {},
        folders: {},
        rootFolderIds: [],
        trashedNoteIds: [],
        pinnedNoteIds: [],
        noteColors: {},
        isLoading: false,
        vaultPath: "",
        _hasHydrated: false,

        // ── Note actions ──
        colorNote: (id, color) =>
          set(
            (s) => ({
              noteColors: color === 'none'
                ? Object.fromEntries(Object.entries(s.noteColors).filter(([k]) => k !== id))
                : { ...s.noteColors, [id]: color },
            }),
            false,
            'colorNote',
          ),

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
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        // ── Bulk operations ──
        bulkTrash: (ids) =>
          set(
            (s) => {
              const newTrashed = new Set(s.trashedNoteIds);
              ids.forEach((id) => newTrashed.add(id));
              return { trashedNoteIds: Array.from(newTrashed) };
            },
            false,
            "bulkTrash",
          ),

        bulkDelete: (ids) =>
          set(
            (s) => {
              const remaining = { ...s.notes };
              ids.forEach((id) => delete remaining[id]);
              return {
                notes: remaining,
                trashedNoteIds: s.trashedNoteIds.filter((tid) => !ids.includes(tid)),
                pinnedNoteIds: s.pinnedNoteIds.filter((pid) => !ids.includes(pid)),
              };
            },
            false,
            "bulkDelete",
          ),

        bulkRestore: (ids) =>
          set(
            (s) => ({
              trashedNoteIds: s.trashedNoteIds.filter((tid) => !ids.includes(tid)),
            }),
            false,
            "bulkRestore",
          ),

        importNotes: (notes) =>
          set(
            (s) => {
              const merged = { ...s.notes };
              notes.forEach((n) => { merged[n.id] = n; });
              return { notes: merged };
            },
            false,
            "importNotes",
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
        clearAllData: () =>
          set(
            {
              notes: {},
              folders: {},
              rootFolderIds: [],
              trashedNoteIds: [],
              pinnedNoteIds: [],
              noteColors: {},
              vaultPath: "",
            },
            false,
            "clearAllData",
          ),

        // ── Selectors ──
        getNotesByFolder: (folderId) =>
          Object.values(get().notes).filter((n) => n.folderId === folderId),

        getNotesFlat: () => Object.values(get().notes),

        getStorageSize: () => {
          try {
            const data = localStorage.getItem("ragnar-notes-store");
            return data ? new Blob([data]).size : 0;
          } catch {
            return 0;
          }
        },
      }),
      {
        name: "ragnar-notes-store",
        partialize: (s) => ({
          notes: s.notes,
          folders: s.folders,
          rootFolderIds: s.rootFolderIds,
          trashedNoteIds: s.trashedNoteIds,
          pinnedNoteIds: s.pinnedNoteIds,
          vaultPath: s.vaultPath,
        }),
        onRehydrateStorage: () => () => {
          useNotesStore.setState({ _hasHydrated: true });
        },
      },
    ),
    { name: "RagnarNotes/Notes" },
  ),
);
