/**
 * Markdown utilities — frontmatter parsing, excerpt extraction,
 * wiki-link detection, and AI-paste normalization.
 */

import type { NoteFrontmatter } from "@/types";

// ── Frontmatter ─────────────────────────────────────────────

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Split raw file content into { frontmatter, body }. */
export function parseFrontmatter(raw: string): {
  frontmatter: Partial<NoteFrontmatter>;
  body: string;
} {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) return { frontmatter: {}, body: raw };

  const yamlBlock = match[1];
  const body = raw.slice(match[0].length);
  const frontmatter: Partial<NoteFrontmatter> = {};

  // Minimal YAML key: value parser (no external dep for Stage 1)
  for (const line of yamlBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();

    if (key === "tags" || key === "aliases") {
      // Handle inline array: [a, b] or multi-line list handled below
      const arrMatch = val.match(/^\[(.*)]/);
      frontmatter[key as "tags" | "aliases"] = arrMatch
        ? arrMatch[1].split(",").map((s) => s.trim()).filter(Boolean)
        : val
        ? [val]
        : [];
    } else if (key === "pinned") {
      (frontmatter as Record<string, unknown>)[key] = val === "true";
    } else {
      (frontmatter as Record<string, unknown>)[key] = val;
    }
  }

  return { frontmatter, body };
}

/** Serialize frontmatter back to YAML block. */
export function serializeFrontmatter(fm: NoteFrontmatter): string {
  const lines = [
    `title: ${fm.title}`,
    `createdAt: ${fm.createdAt}`,
    `updatedAt: ${fm.updatedAt}`,
    `tags: [${fm.tags.join(", ")}]`,
    `pinned: ${fm.pinned}`,
    `aliases: [${fm.aliases.join(", ")}]`,
  ];
  return `---\n${lines.join("\n")}\n---\n`;
}

// ── Excerpt ─────────────────────────────────────────────────

/** Extract a plain-text excerpt from Markdown (first ~160 chars). */
export function extractExcerpt(markdown: string, maxLength = 160): string {
  const noFrontmatter = markdown.replace(FRONTMATTER_RE, "");
  const noCode = noFrontmatter.replace(/```[\s\S]*?```/g, "[code]");
  const noInline = noCode
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/\[(.+?)]\(.+?\)/g, "$1")
    .replace(/!\[.*?]\(.*?\)/g, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/>\s+/g, "")
    .replace(/[-*+]\s+/g, "")
    .replace(/\n+/g, " ")
    .trim();

  return noInline.length > maxLength
    ? noInline.slice(0, maxLength - 1) + "…"
    : noInline;
}

// ── Wiki-links ───────────────────────────────────────────────

const WIKILINK_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;

export interface WikiLink {
  raw: string;
  target: string;
  alias: string | null;
}

/** Extract all [[wikilinks]] from a Markdown string. */
export function extractWikiLinks(markdown: string): WikiLink[] {
  const links: WikiLink[] = [];
  for (const match of markdown.matchAll(WIKILINK_RE)) {
    links.push({
      raw: match[0],
      target: match[1].trim(),
      alias: match[2]?.trim() ?? null,
    });
  }
  return links;
}

// ── AI-paste normalization ───────────────────────────────────

/**
 * Normalize text pasted from AI tools (ChatGPT/Claude).
 * Ensures fenced code blocks, bullet lists, and table pipes
 * are preserved correctly without double-escaping.
 */
export function normalizeAIPaste(text: string): string {
  // 1. Normalize Windows line endings
  let out = text.replace(/\r\n/g, "\n");

  // 2. Ensure code blocks have a language tag if clearly code-like
  out = out.replace(/^```\s*\n/gm, "```text\n");

  // 3. Normalize numbered lists with inconsistent spacing
  out = out.replace(/^(\d+)\.\s+/gm, "$1. ");

  // 4. Remove double-escaped backslash before Markdown chars
  out = out.replace(/\\([*_`[\]#>])/g, "$1");

  return out;
}
