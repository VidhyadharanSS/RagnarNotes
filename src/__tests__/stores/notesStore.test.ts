import { describe, it, expect, beforeEach } from "vitest";
import { useNotesStore } from "@stores/notesStore";
import type { Note, Folder } from "@/types";

function createMockNote(overrides: Partial<Note> = {}): Note {
  const id = `note-${Date.now()}-${Math.random()}`;
  return {
    id,
    title: "Test Note",
    content: "# Test\n\nContent here.",
    folderId: "folder-1",
    filePath: `/vault/test-${id}.md`,
    isUnsaved: false,
    frontmatter: {
      title: "Test Note",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["test"],
      pinned: false,
      aliases: [],
    },
    ...overrides,
  };
}

function createMockFolder(overrides: Partial<Folder> = {}): Folder {
  return {
    id: "folder-1",
    name: "Test Folder",
    path: "/vault/Test",
    parentId: null,
    children: [],
    isExpanded: false,
    ...overrides,
  };
}

describe("notesStore", () => {
  beforeEach(() => {
    useNotesStore.setState({
      notes: {},
      folders: {},
      rootFolderIds: [],
      trashedNoteIds: [],
      pinnedNoteIds: [],
      isLoading: false,
      vaultPath: "",
    });
  });

  describe("note operations", () => {
    it("sets notes from array", () => {
      const note1 = createMockNote({ id: "n1" });
      const note2 = createMockNote({ id: "n2" });
      useNotesStore.getState().setNotes([note1, note2]);

      const { notes } = useNotesStore.getState();
      expect(Object.keys(notes)).toHaveLength(2);
      expect(notes["n1"]).toBeDefined();
      expect(notes["n2"]).toBeDefined();
    });

    it("upserts a note", () => {
      const note = createMockNote({ id: "n1" });
      useNotesStore.getState().upsertNote(note);

      expect(useNotesStore.getState().notes["n1"]).toBeDefined();
      expect(useNotesStore.getState().notes["n1"].title).toBe("Test Note");

      // Update the same note
      useNotesStore.getState().upsertNote({ ...note, title: "Updated" });
      expect(useNotesStore.getState().notes["n1"].title).toBe("Updated");
    });

    it("deletes a note and cleans up references", () => {
      const note = createMockNote({ id: "n1" });
      useNotesStore.getState().upsertNote(note);
      useNotesStore.getState().pinNote("n1", true);
      useNotesStore.getState().trashNote("n1");

      useNotesStore.getState().deleteNote("n1");

      expect(useNotesStore.getState().notes["n1"]).toBeUndefined();
      expect(useNotesStore.getState().pinnedNoteIds).not.toContain("n1");
      expect(useNotesStore.getState().trashedNoteIds).not.toContain("n1");
    });

    it("trashes and restores a note", () => {
      const note = createMockNote({ id: "n1" });
      useNotesStore.getState().upsertNote(note);

      useNotesStore.getState().trashNote("n1");
      expect(useNotesStore.getState().trashedNoteIds).toContain("n1");

      useNotesStore.getState().restoreNote("n1");
      expect(useNotesStore.getState().trashedNoteIds).not.toContain("n1");
    });

    it("does not duplicate trashed IDs", () => {
      useNotesStore.getState().trashNote("n1");
      useNotesStore.getState().trashNote("n1");
      expect(useNotesStore.getState().trashedNoteIds.filter((id) => id === "n1")).toHaveLength(1);
    });

    it("pins and unpins a note", () => {
      useNotesStore.getState().pinNote("n1", true);
      expect(useNotesStore.getState().pinnedNoteIds).toContain("n1");

      useNotesStore.getState().pinNote("n1", false);
      expect(useNotesStore.getState().pinnedNoteIds).not.toContain("n1");
    });

    it("does not duplicate pinned IDs", () => {
      useNotesStore.getState().pinNote("n1", true);
      useNotesStore.getState().pinNote("n1", true);
      expect(useNotesStore.getState().pinnedNoteIds.filter((id) => id === "n1")).toHaveLength(1);
    });
  });

  describe("bulk operations", () => {
    it("bulk trashes multiple notes", () => {
      useNotesStore.getState().bulkTrash(["n1", "n2", "n3"]);
      const { trashedNoteIds } = useNotesStore.getState();
      expect(trashedNoteIds).toContain("n1");
      expect(trashedNoteIds).toContain("n2");
      expect(trashedNoteIds).toContain("n3");
    });

    it("bulk deletes multiple notes", () => {
      const n1 = createMockNote({ id: "n1" });
      const n2 = createMockNote({ id: "n2" });
      const n3 = createMockNote({ id: "n3" });
      useNotesStore.getState().setNotes([n1, n2, n3]);
      useNotesStore.getState().pinNote("n1", true);
      useNotesStore.getState().trashNote("n2");

      useNotesStore.getState().bulkDelete(["n1", "n2"]);

      expect(useNotesStore.getState().notes["n1"]).toBeUndefined();
      expect(useNotesStore.getState().notes["n2"]).toBeUndefined();
      expect(useNotesStore.getState().notes["n3"]).toBeDefined();
      expect(useNotesStore.getState().pinnedNoteIds).not.toContain("n1");
      expect(useNotesStore.getState().trashedNoteIds).not.toContain("n2");
    });

    it("bulk restores multiple notes", () => {
      useNotesStore.getState().bulkTrash(["n1", "n2", "n3"]);
      useNotesStore.getState().bulkRestore(["n1", "n3"]);

      const { trashedNoteIds } = useNotesStore.getState();
      expect(trashedNoteIds).not.toContain("n1");
      expect(trashedNoteIds).toContain("n2");
      expect(trashedNoteIds).not.toContain("n3");
    });

    it("imports notes", () => {
      const n1 = createMockNote({ id: "n1" });
      useNotesStore.getState().upsertNote(n1);

      const imported = [
        createMockNote({ id: "n2", title: "Imported 1" }),
        createMockNote({ id: "n3", title: "Imported 2" }),
      ];
      useNotesStore.getState().importNotes(imported);

      expect(Object.keys(useNotesStore.getState().notes)).toHaveLength(3);
      expect(useNotesStore.getState().notes["n2"].title).toBe("Imported 1");
    });
  });

  describe("folder operations", () => {
    it("sets folders from array", () => {
      const f1 = createMockFolder({ id: "f1" });
      const f2 = createMockFolder({ id: "f2", parentId: "f1" });
      useNotesStore.getState().setFolders([f1, f2]);

      expect(Object.keys(useNotesStore.getState().folders)).toHaveLength(2);
      expect(useNotesStore.getState().rootFolderIds).toContain("f1");
      expect(useNotesStore.getState().rootFolderIds).not.toContain("f2");
    });

    it("toggles folder expansion", () => {
      const f1 = createMockFolder({ id: "f1", isExpanded: false });
      useNotesStore.getState().setFolders([f1]);

      useNotesStore.getState().toggleFolderExpanded("f1");
      expect(useNotesStore.getState().folders["f1"].isExpanded).toBe(true);

      useNotesStore.getState().toggleFolderExpanded("f1");
      expect(useNotesStore.getState().folders["f1"].isExpanded).toBe(false);
    });

    it("deletes a folder", () => {
      const f1 = createMockFolder({ id: "f1" });
      useNotesStore.getState().setFolders([f1]);

      useNotesStore.getState().deleteFolder("f1");
      expect(useNotesStore.getState().folders["f1"]).toBeUndefined();
      expect(useNotesStore.getState().rootFolderIds).not.toContain("f1");
    });
  });

  describe("selectors", () => {
    it("gets notes by folder", () => {
      const n1 = createMockNote({ id: "n1", folderId: "f1" });
      const n2 = createMockNote({ id: "n2", folderId: "f2" });
      useNotesStore.getState().setNotes([n1, n2]);

      const folderNotes = useNotesStore.getState().getNotesByFolder("f1");
      expect(folderNotes).toHaveLength(1);
      expect(folderNotes[0].id).toBe("n1");
    });

    it("gets flat note list", () => {
      const n1 = createMockNote({ id: "n1" });
      const n2 = createMockNote({ id: "n2" });
      useNotesStore.getState().setNotes([n1, n2]);

      const flat = useNotesStore.getState().getNotesFlat();
      expect(flat).toHaveLength(2);
    });
  });

  describe("system operations", () => {
    it("clears all data", () => {
      const n1 = createMockNote({ id: "n1" });
      useNotesStore.getState().setNotes([n1]);
      useNotesStore.getState().pinNote("n1", true);

      useNotesStore.getState().clearAllData();

      expect(Object.keys(useNotesStore.getState().notes)).toHaveLength(0);
      expect(useNotesStore.getState().pinnedNoteIds).toHaveLength(0);
      expect(useNotesStore.getState().trashedNoteIds).toHaveLength(0);
    });
  });
});
