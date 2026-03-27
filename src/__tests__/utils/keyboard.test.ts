import { describe, it, expect } from "vitest";
import { parseShortcut, matchesShortcut, formatShortcut } from "@utils/keyboard";

describe("parseShortcut", () => {
  it("parses simple key", () => {
    const shortcut = parseShortcut("k");
    expect(shortcut.key).toBe("k");
    expect(shortcut.modifiers).toEqual([]);
  });

  it("parses cmd+k", () => {
    const shortcut = parseShortcut("cmd+k");
    expect(shortcut.key).toBe("k");
    expect(shortcut.modifiers).toContain("meta");
  });

  it("parses cmd+shift+e", () => {
    const shortcut = parseShortcut("cmd+shift+e");
    expect(shortcut.key).toBe("e");
    expect(shortcut.modifiers).toContain("meta");
    expect(shortcut.modifiers).toContain("shift");
  });

  it("parses alt/opt modifier", () => {
    const shortcut = parseShortcut("opt+a");
    expect(shortcut.modifiers).toContain("alt");
  });

  it("parses ctrl modifier", () => {
    const shortcut = parseShortcut("ctrl+c");
    expect(shortcut.modifiers).toContain("ctrl");
  });
});

describe("matchesShortcut", () => {
  it("matches cmd+k", () => {
    const shortcut = parseShortcut("cmd+k");
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
    });
    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("does not match when modifier is missing", () => {
    const shortcut = parseShortcut("cmd+k");
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: false,
    });
    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("does not match wrong key", () => {
    const shortcut = parseShortcut("cmd+k");
    const event = new KeyboardEvent("keydown", {
      key: "j",
      metaKey: true,
    });
    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("does not match when extra modifier is pressed", () => {
    const shortcut = parseShortcut("cmd+k");
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      shiftKey: true,
    });
    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("matches Ctrl as Cmd fallback", () => {
    const shortcut = parseShortcut("cmd+k");
    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
    });
    expect(matchesShortcut(event, shortcut)).toBe(true);
  });
});

describe("formatShortcut", () => {
  it("formats cmd+k as ⌘K", () => {
    const shortcut = parseShortcut("cmd+k");
    expect(formatShortcut(shortcut)).toBe("⌘K");
  });

  it("formats cmd+shift+e as ⌘⇧E", () => {
    const shortcut = parseShortcut("cmd+shift+e");
    expect(formatShortcut(shortcut)).toBe("⌘⇧E");
  });

  it("formats alt+a as ⌥A", () => {
    const shortcut = parseShortcut("alt+a");
    expect(formatShortcut(shortcut)).toBe("⌥A");
  });

  it("formats ctrl+c as ⌃C", () => {
    const shortcut = parseShortcut("ctrl+c");
    expect(formatShortcut(shortcut)).toBe("⌃C");
  });
});
