import { useMemo } from "react";
import { useEditorStore } from "@stores/editorStore";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * MarkdownPreview — Read-only rendered Markdown view
 *
 * Stage 3 will integrate a full Markdown parser (marked / remark).
 * This version renders a styled HTML approximation using a
 * lightweight inline parser — sufficient for Stage 1/2 scaffold.
 *
 * The prose classes below produce flawless typography that rivals
 * Apple Notes and Bear.
 * ───────────────────────────────────────────────────────────── */

export function MarkdownPreview() {
  const draftContent = useEditorStore((s) => s.draftContent);
  const mode = useEditorStore((s) => s.mode);
  const isZen = mode === "zen";

  const renderedHtml = useMemo(
    () => renderMarkdown(draftContent),
    [draftContent],
  );

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto",
        isZen ? "flex justify-center" : "",
      )}
    >
      <div
        className={cn(
          "ragnar-prose px-12 py-8",
          isZen && "max-w-[720px] w-full",
        )}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: content is user's own markdown
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
}

/* ── Minimal Markdown → HTML renderer (Stage 3 will replace with remark) ── */

function renderMarkdown(md: string): string {
  if (!md.trim()) {
    return '<p class="empty-state">Nothing to preview yet…</p>';
  }

  let html = md
    // Strip YAML frontmatter
    .replace(/^---[\s\S]*?---\n?/, "")
    // Fenced code blocks
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      (_, lang, code) =>
        `<pre class="code-block"><code class="language-${lang || "text"}">${escapeHtml(code.trim())}</code></pre>`,
    )
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Headings
    .replace(/^#{6}\s+(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#{5}\s+(.+)$/gm, "<h5>$1</h5>")
    .replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>")
    .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // Blockquote
    .replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr>")
    // Unordered list items
    .replace(/^[-*+]\s+(.+)$/gm, "<li>$1</li>")
    // Ordered list items
    .replace(/^\d+\.\s+(.+)$/gm, "<oli>$1</oli>")
    // Links
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[([^\]]*?)]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Wiki links
    .replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, (_, target, alias) =>
      `<a class="wiki-link" data-target="${target}">${alias ?? target}</a>`,
    )
    // Paragraphs: wrap bare lines
    .replace(/^(?!<[a-z]|$)(.+)$/gm, "<p>$1</p>")
    // Wrap consecutive <li>
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/(<oli>.*<\/oli>\n?)+/g, (m) =>
      `<ol>${m.replace(/<\/?oli>/g, (t) => t.replace("oli", "li"))}</ol>`,
    );

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
