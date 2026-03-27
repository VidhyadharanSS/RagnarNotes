import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { EditorMode, Note, NoteId } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * Editor Store — Active note & editor state
 *
 * Manages: active note, editor mode (edit/readonly/zen),
 *          unsaved changes tracking, and selection state.
 * ───────────────────────────────────────────────────────────── */

interface EditorState {
  // ── Active note ──
  activeNoteId: NoteId | null;
  activeNote: Note | null;
  draftContent: string; // live in-editor content (before save)
  isUnsaved: boolean;

  // ── Editor mode ──
  mode: EditorMode;
  previousMode: EditorMode; // for zen-mode restore

  // ── Split screen ──
  isSplitView: boolean;

  // ── Word / char counts ──
  wordCount: number;
  charCount: number;

  // ── Actions ──
  setActiveNote: (note: Note | null) => void;
  setDraftContent: (content: string) => void;
  markSaved: () => void;
  setMode: (mode: EditorMode) => void;
  toggleZen: () => void;
  toggleSplitView: () => void;
  updateCounts: (text: string) => void;
}

function countWords(text: string): number {
  const clean = text.replace(/```[\s\S]*?```/g, "").trim();
  return clean.length === 0 ? 0 : clean.split(/\s+/).length;
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set) => ({
      // ── Initial state ──
      activeNoteId: null,
      activeNote: null,
      draftContent: "",
      isUnsaved: false,
      mode: "edit",
      previousMode: "edit",
      isSplitView: false,
      wordCount: 0,
      charCount: 0,

      // ── Actions ──
      setActiveNote: (note) =>
        set(
          {
            activeNote: note,
            activeNoteId: note?.id ?? null,
            draftContent: note?.content ?? "",
            isUnsaved: false,
            wordCount: note ? countWords(note.content) : 0,
            charCount: note?.content.length ?? 0,
          },
          false,
          "setActiveNote",
        ),

      setDraftContent: (content) =>
        set(
          (s) => ({
            draftContent: content,
            isUnsaved: content !== (s.activeNote?.content ?? ""),
          }),
          false,
          "setDraftContent",
        ),

      markSaved: () =>
        set(
          (s) => ({
            isUnsaved: false,
            activeNote: s.activeNote
              ? { ...s.activeNote, content: s.draftContent }
              : null,
          }),
          false,
          "markSaved",
        ),

      setMode: (mode) =>
        set(
          (s) => ({ mode, previousMode: s.mode }),
          false,
          "setMode",
        ),

      toggleZen: () =>
        set(
          (s) =>
            s.mode === "zen"
              ? { mode: s.previousMode, previousMode: "zen" }
              : { mode: "zen", previousMode: s.mode },
          false,
          "toggleZen",
        ),

      toggleSplitView: () =>
        set((s) => ({ isSplitView: !s.isSplitView }), false, "toggleSplitView"),

      updateCounts: (text) =>
        set(
          { wordCount: countWords(text), charCount: text.length },
          false,
          "updateCounts",
        ),
    }),
    { name: "RagnarNotes/Editor" },
  ),
);
