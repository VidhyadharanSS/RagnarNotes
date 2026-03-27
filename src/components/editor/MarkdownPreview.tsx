import { useMemo, useCallback } from "react";
import { useEditorStore } from "@stores/editorStore";
import { cn } from "@utils/cn";
import { Marked } from "marked";
import hljs from "highlight.js";

/* ─────────────────────────────────────────────────────────────
 * MarkdownPreview — Full-featured rendered Markdown view (Stage 3)
 *
 * Powered by `marked` + `highlight.js` for:
 *  - Proper GFM rendering (tables, task lists, strikethrough)
 *  - Syntax-highlighted code blocks (150+ languages)
 *  - Wiki-link rendering [[target|alias]]
 *  - Copy button on code blocks
 *  - Beautiful typography (ragnar-prose)
 * ───────────────────────────────────────────────────────────── */

const marked = new Marked({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      return `
        <div class="code-block-wrapper group relative">
          <div class="code-block-header">
            <span class="code-block-lang">${language}</span>
            <button class="code-copy-btn" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(text)}'));this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)">Copy</button>
          </div>
          <pre class="code-block"><code class="hljs language-${language}">${highlighted}</code></pre>
        </div>
      `;
    },

    link({ href, text }: { href: string; text: string }) {
      if (href.startsWith("wiki:")) {
        const target = href.replace("wiki:", "");
        return `<a class="wiki-link" data-target="${target}">${text}</a>`;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    },

    image({ href, title, text }: { href: string; title: string | null; text: string }) {
      const titleAttr = title ? ` title="${title}"` : "";
      return `<img src="${href}" alt="${text}"${titleAttr} loading="lazy" class="rounded-lg" />`;
    },
  },
});

function preprocessWikiLinks(md: string): string {
  return md.replace(
    /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g,
    (_, target, alias) => `[${alias ?? target}](wiki:${target})`,
  );
}

function stripFrontmatter(md: string): string {
  return md.replace(/^---[\s\S]*?---\n?/, "");
}

export function MarkdownPreview() {
  const draftContent = useEditorStore((s) => s.draftContent);
  const mode = useEditorStore((s) => s.mode);
  const isZen = mode === "zen";

  const renderedHtml = useMemo(() => {
    if (!draftContent.trim()) {
      return '<div class="empty-state"><p>Nothing to preview yet…</p><p style="font-size:0.75em;margin-top:0.5em;opacity:0.5">Start writing in edit mode</p></div>';
    }
    const processed = preprocessWikiLinks(stripFrontmatter(draftContent));
    return marked.parse(processed) as string;
  }, [draftContent]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const wikiLink = target.closest(".wiki-link") as HTMLElement;
    if (wikiLink) {
      e.preventDefault();
      const noteTarget = wikiLink.dataset.target;
      if (noteTarget) {
        console.log("Wiki-link clicked:", noteTarget);
      }
    }
  }, []);

  return (
    <div
      className={cn("flex-1 overflow-y-auto", isZen ? "flex justify-center" : "")}
      onClick={handleClick}
    >
      <div
        className={cn(
          "ragnar-prose animate-fade-in px-12 py-8",
          isZen && "max-w-[720px] w-full",
        )}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
}
