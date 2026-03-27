import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { SearchResult, NoteId } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * Search Store — Global full-text search state
 * ───────────────────────────────────────────────────────────── */

interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  recentNoteIds: NoteId[]; // MRU list for palette empty state

  setQuery: (q: string) => void;
  setResults: (results: SearchResult[]) => void;
  setIsSearching: (v: boolean) => void;
  clearSearch: () => void;
  addRecentNote: (id: NoteId) => void;
}

const MAX_RECENT = 8;

export const useSearchStore = create<SearchState>()(
  devtools(
    (set) => ({
      query: "",
      results: [],
      isSearching: false,
      recentNoteIds: [],

      setQuery: (q) => set({ query: q }, false, "setQuery"),
      setResults: (results) => set({ results }, false, "setResults"),
      setIsSearching: (v) => set({ isSearching: v }, false, "setIsSearching"),
      clearSearch: () =>
        set({ query: "", results: [], isSearching: false }, false, "clearSearch"),

      addRecentNote: (id) =>
        set(
          (s) => ({
            recentNoteIds: [
              id,
              ...s.recentNoteIds.filter((r) => r !== id),
            ].slice(0, MAX_RECENT),
          }),
          false,
          "addRecentNote",
        ),
    }),
    { name: "RagnarNotes/Search" },
  ),
);
