import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@stores/editorStore";
import type { Note } from "@/types";

function createMockNote(): Note {
  return {
    id: "test-note",
    title: "Test Note",
    content: "Hello world. This is test content with multiple words.",
    folderId: "f1",
    filePath: "/vault/test.md",
    isUnsaved: false,
    frontmatter: {
      title: "Test Note",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["test"],
      pinned: false,
      aliases: [],
    },
  };
}

describe("editorStore", () => {
  beforeEach(() => {
    useEditorStore.setState({
      activeNoteId: null,
      activeNote: null,
      draftContent: "",
      isUnsaved: false,
      mode: "edit",
      previousMode: "edit",
      isSplitView: false,
      wordCount: 0,
      charCount: 0,
    });
  });

  describe("active note", () => {
    it("sets active note and resets draft", () => {
      const note = createMockNote();
      useEditorStore.getState().setActiveNote(note);

      const state = useEditorStore.getState();
      expect(state.activeNoteId).toBe("test-note");
      expect(state.activeNote).toBeDefined();
      expect(state.draftContent).toBe(note.content);
      expect(state.isUnsaved).toBe(false);
      expect(state.wordCount).toBeGreaterThan(0);
    });

    it("clears active note", () => {
      const note = createMockNote();
      useEditorStore.getState().setActiveNote(note);
      useEditorStore.getState().setActiveNote(null);

      expect(useEditorStore.getState().activeNoteId).toBeNull();
      expect(useEditorStore.getState().activeNote).toBeNull();
      expect(useEditorStore.getState().draftContent).toBe("");
    });
  });

  describe("draft content", () => {
    it("sets draft and marks as unsaved when different from original", () => {
      const note = createMockNote();
      useEditorStore.getState().setActiveNote(note);

      useEditorStore.getState().setDraftContent("Modified content");
      expect(useEditorStore.getState().isUnsaved).toBe(true);
      expect(useEditorStore.getState().draftContent).toBe("Modified content");
    });

    it("marks as saved when draft matches original", () => {
      const note = createMockNote();
      useEditorStore.getState().setActiveNote(note);
      useEditorStore.getState().setDraftContent("Modified");
      expect(useEditorStore.getState().isUnsaved).toBe(true);

      useEditorStore.getState().setDraftContent(note.content);
      expect(useEditorStore.getState().isUnsaved).toBe(false);
    });

    it("marks saved", () => {
      const note = createMockNote();
      useEditorStore.getState().setActiveNote(note);
      useEditorStore.getState().setDraftContent("Changed");
      expect(useEditorStore.getState().isUnsaved).toBe(true);

      useEditorStore.getState().markSaved();
      expect(useEditorStore.getState().isUnsaved).toBe(false);
    });
  });

  describe("editor modes", () => {
    it("sets mode", () => {
      useEditorStore.getState().setMode("readonly");
      expect(useEditorStore.getState().mode).toBe("readonly");
      expect(useEditorStore.getState().previousMode).toBe("edit");
    });

    it("toggles zen mode on", () => {
      useEditorStore.getState().toggleZen();
      expect(useEditorStore.getState().mode).toBe("zen");
      expect(useEditorStore.getState().previousMode).toBe("edit");
    });

    it("toggles zen mode off to previous", () => {
      useEditorStore.getState().setMode("readonly");
      useEditorStore.getState().toggleZen();
      expect(useEditorStore.getState().mode).toBe("zen");

      useEditorStore.getState().toggleZen();
      expect(useEditorStore.getState().mode).toBe("readonly");
    });

    it("toggles split view", () => {
      expect(useEditorStore.getState().isSplitView).toBe(false);
      useEditorStore.getState().toggleSplitView();
      expect(useEditorStore.getState().isSplitView).toBe(true);
      useEditorStore.getState().toggleSplitView();
      expect(useEditorStore.getState().isSplitView).toBe(false);
    });
  });

  describe("word counts", () => {
    it("updates word and char counts", () => {
      useEditorStore.getState().updateCounts("Hello world foo");
      expect(useEditorStore.getState().wordCount).toBe(3);
      expect(useEditorStore.getState().charCount).toBe(15);
    });

    it("handles empty text", () => {
      useEditorStore.getState().updateCounts("");
      expect(useEditorStore.getState().wordCount).toBe(0);
      expect(useEditorStore.getState().charCount).toBe(0);
    });

    it("ignores code blocks in word count", () => {
      const text = "Two words\n```\nignored code block\n```\n";
      useEditorStore.getState().updateCounts(text);
      // Only "Two words" counted (code block stripped)
      expect(useEditorStore.getState().wordCount).toBe(2);
    });
  });
});
