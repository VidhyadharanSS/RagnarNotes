import { describe, it, expect } from "vitest";
import {
  parseFrontmatter,
  serializeFrontmatter,
  extractExcerpt,
  extractWikiLinks,
  normalizeAIPaste,
} from "@utils/markdown";

describe("parseFrontmatter", () => {
  it("parses YAML frontmatter correctly", () => {
    const raw = `---
title: My Note
tags: [work, ideas]
pinned: true
---
# Hello World`;

    const { frontmatter, body } = parseFrontmatter(raw);
    expect(frontmatter.title).toBe("My Note");
    expect(frontmatter.tags).toEqual(["work", "ideas"]);
    expect(frontmatter.pinned).toBe(true);
    expect(body).toBe("# Hello World");
  });

  it("returns empty frontmatter for content without frontmatter", () => {
    const raw = "# Just a heading\nSome content";
    const { frontmatter, body } = parseFrontmatter(raw);
    expect(frontmatter).toEqual({});
    expect(body).toBe(raw);
  });

  it("handles empty tags", () => {
    const raw = `---
title: Note
tags:
---
Body`;

    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.tags).toEqual([]);
  });

  it("handles aliases", () => {
    const raw = `---
title: Note
aliases: [alias1, alias2]
---
Body`;

    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.aliases).toEqual(["alias1", "alias2"]);
  });
});

describe("serializeFrontmatter", () => {
  it("serializes frontmatter to YAML", () => {
    const fm = {
      title: "Test Note",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
      tags: ["test", "example"],
      pinned: false,
      aliases: ["tn"],
    };

    const result = serializeFrontmatter(fm);
    expect(result).toContain("title: Test Note");
    expect(result).toContain("tags: [test, example]");
    expect(result).toContain("pinned: false");
    expect(result).toContain("aliases: [tn]");
    expect(result).toMatch(/^---\n/);
    expect(result).toMatch(/\n---\n$/);
  });
});

describe("extractExcerpt", () => {
  it("extracts plain text from markdown", () => {
    const md = "# Title\n\n**Bold** and *italic* text.";
    const excerpt = extractExcerpt(md);
    expect(excerpt).toContain("Bold and italic text.");
  });

  it("removes frontmatter", () => {
    const md = "---\ntitle: Test\n---\n# Heading\nContent here.";
    const excerpt = extractExcerpt(md);
    expect(excerpt).toContain("Content here.");
    expect(excerpt).not.toContain("title:");
  });

  it("truncates long content", () => {
    const md = "A".repeat(200);
    const excerpt = extractExcerpt(md, 100);
    expect(excerpt.length).toBeLessThanOrEqual(100);
    expect(excerpt.endsWith("…")).toBe(true);
  });

  it("replaces code blocks with [code]", () => {
    const md = "Before\n```js\nconsole.log('hi');\n```\nAfter";
    const excerpt = extractExcerpt(md);
    expect(excerpt).toContain("[code]");
    expect(excerpt).not.toContain("console.log");
  });

  it("removes images", () => {
    const md = "Text ![alt](image.jpg) more text.";
    const excerpt = extractExcerpt(md);
    expect(excerpt).not.toContain("![");
    expect(excerpt).toContain("Text");
  });
});

describe("extractWikiLinks", () => {
  it("extracts [[wikilinks]]", () => {
    const md = "See [[My Note]] for details.";
    const links = extractWikiLinks(md);
    expect(links).toHaveLength(1);
    expect(links[0].target).toBe("My Note");
    expect(links[0].alias).toBeNull();
  });

  it("extracts [[target|alias]] links", () => {
    const md = "Check [[Long Note Name|link]] here.";
    const links = extractWikiLinks(md);
    expect(links).toHaveLength(1);
    expect(links[0].target).toBe("Long Note Name");
    expect(links[0].alias).toBe("link");
  });

  it("extracts multiple links", () => {
    const md = "See [[Note A]] and [[Note B|alias]].";
    const links = extractWikiLinks(md);
    expect(links).toHaveLength(2);
  });

  it("returns empty array when no links", () => {
    const md = "No links here.";
    expect(extractWikiLinks(md)).toEqual([]);
  });
});

describe("normalizeAIPaste", () => {
  it("normalizes Windows line endings", () => {
    expect(normalizeAIPaste("line1\r\nline2")).toBe("line1\nline2");
  });

  it("adds language tag to bare code blocks", () => {
    expect(normalizeAIPaste("```\ncode\n```")).toContain("```text\n");
  });

  it("normalizes numbered list spacing", () => {
    expect(normalizeAIPaste("1.  Item one")).toBe("1. Item one");
  });

  it("removes double-escaped markdown chars", () => {
    expect(normalizeAIPaste("\\*bold\\*")).toBe("*bold*");
    expect(normalizeAIPaste("\\#heading")).toBe("#heading");
  });

  it("preserves already-correct content", () => {
    const good = "# Title\n\n- List item\n- Another";
    expect(normalizeAIPaste(good)).toBe(good);
  });
});
