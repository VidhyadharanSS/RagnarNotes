import { describe, it, expect } from "vitest";
import {
  formatBytes,
  formatRelativeTime,
  formatWordCount,
  truncate,
  titleToFileName,
  generateId,
} from "@utils/format";

describe("formatBytes", () => {
  it("returns '0 B' for zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes correctly", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("respects decimal places", () => {
    expect(formatBytes(1536, 0)).toBe("2 KB");
    expect(formatBytes(1536, 2)).toBe("1.5 KB");
  });
});

describe("formatRelativeTime", () => {
  it("returns 'Just now' for recent timestamps", () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("Just now");
  });

  it("returns minutes ago for recent timestamps", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago for timestamps within 24h", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe("3h ago");
  });

  it("returns 'Yesterday' for 24-36h ago", () => {
    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(yesterday)).toBe("Yesterday");
  });

  it("returns days ago for within a week", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago");
  });

  it("returns formatted date for older timestamps", () => {
    const longAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(longAgo);
    // Should be something like "Dec 15"
    expect(result).toMatch(/\w+ \d+/);
  });
});

describe("formatWordCount", () => {
  it("returns '0 words' for zero", () => {
    expect(formatWordCount(0)).toBe("0 words");
  });

  it("returns '1 word' for one", () => {
    expect(formatWordCount(1)).toBe("1 word");
  });

  it("returns plural form with comma formatting", () => {
    expect(formatWordCount(42)).toBe("42 words");
    expect(formatWordCount(1500)).toBe("1,500 words");
  });
});

describe("truncate", () => {
  it("returns original string if shorter than max", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis when too long", () => {
    expect(truncate("hello world", 8)).toBe("hello w…");
  });

  it("handles exact length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("titleToFileName", () => {
  it("converts title to kebab case", () => {
    expect(titleToFileName("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(titleToFileName("My Note! (Draft)")).toBe("my-note-draft");
  });

  it("handles empty string", () => {
    expect(titleToFileName("")).toBe("untitled");
  });

  it("handles special characters only", () => {
    expect(titleToFileName("!!!")).toBe("untitled");
  });
});

describe("generateId", () => {
  it("returns a string", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("generates unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("generates UUID-like format", () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f-]+$/);
  });
});
