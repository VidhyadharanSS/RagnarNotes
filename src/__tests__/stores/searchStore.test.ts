import { describe, it, expect, beforeEach } from "vitest";
import { useSearchStore } from "@stores/searchStore";

describe("searchStore", () => {
  beforeEach(() => {
    useSearchStore.setState({
      query: "",
      results: [],
      isSearching: false,
      recentNoteIds: [],
    });
  });

  it("sets query", () => {
    useSearchStore.getState().setQuery("hello");
    expect(useSearchStore.getState().query).toBe("hello");
  });

  it("clears search", () => {
    useSearchStore.getState().setQuery("test");
    useSearchStore.getState().setIsSearching(true);
    useSearchStore.getState().clearSearch();

    expect(useSearchStore.getState().query).toBe("");
    expect(useSearchStore.getState().results).toEqual([]);
    expect(useSearchStore.getState().isSearching).toBe(false);
  });

  it("adds recent note IDs (MRU)", () => {
    useSearchStore.getState().addRecentNote("n1");
    useSearchStore.getState().addRecentNote("n2");
    useSearchStore.getState().addRecentNote("n3");

    const { recentNoteIds } = useSearchStore.getState();
    expect(recentNoteIds[0]).toBe("n3"); // Most recent first
    expect(recentNoteIds[1]).toBe("n2");
    expect(recentNoteIds[2]).toBe("n1");
  });

  it("deduplicates recent notes", () => {
    useSearchStore.getState().addRecentNote("n1");
    useSearchStore.getState().addRecentNote("n2");
    useSearchStore.getState().addRecentNote("n1"); // Reopen n1

    const { recentNoteIds } = useSearchStore.getState();
    expect(recentNoteIds).toHaveLength(2);
    expect(recentNoteIds[0]).toBe("n1"); // n1 moved to front
  });

  it("limits recent notes to 8", () => {
    for (let i = 0; i < 12; i++) {
      useSearchStore.getState().addRecentNote(`n${i}`);
    }
    expect(useSearchStore.getState().recentNoteIds).toHaveLength(8);
  });
});
