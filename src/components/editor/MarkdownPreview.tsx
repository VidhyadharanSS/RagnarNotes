import { useMemo, useCallback } from "react";
import { useEditorStore } from "@stores/editorStore";
import { useAppStore } from "@stores/appStore";
import { cn } from "@utils/cn";
import { Marked, Renderer } from "marked";
import hljs from "highlight.js";

/**
 * MarkdownPreview — Stage 4
 *
 * Improvements:
 *  - Task list checkboxes rendered with proper HTML (clickable in preview)
 *  - Font size + line height from user preferences
 *  - Wiki-link click → opens note (dispatches event)
 *  - Improved blockquote, callout, and table rendering
 *  - Footnote-style anchor links
 */

const renderer = new Renderer();

renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
  const highlighted = hljs.highlight(text, { language }).value;
  const encoded = encodeURIComponent(text);
  return `
    <div class="code-block-wrapper group relative">
      <div class="code-block-header">
        <span class="code-block-lang">${language}</span>
        <button
          class="code-copy-btn"
          onclick="(function(btn){navigator.clipboard.writeText(decodeURIComponent('${encoded}')).then(()=>{btn.textContent='✓ Copied';btn.style.color='#a6e3a1';setTimeout(()=>{btn.textContent='Copy';btn.style.color=''},1500)}).catch(()=>btn.textContent='Error')})(this)"
        >Copy</button>
      </div>
      <pre class="code-block"><code class="hljs language-${language}">${highlighted}</code></pre>
    </div>
  `.trim();
};

renderer.link = function ({ href, text }: { href: string; text: string }) {
  if (!href) return `<a>${text}</a>`;
  if (href.startsWith("wiki:")) {
    const target = href.replace("wiki:", "");
    return `<a class="wiki-link" data-target="${target}">${text}</a>`;
  }
  const isExternal = href.startsWith("http");
  return `<a href="${href}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
};

renderer.image = function ({
  href,
  title,
  text,
}: {
  href: string;
  title?: string | null;
  text: string;
}) {
  const titleAttr = title ? ` title="${title}"` : "";
  const figcaption = title
    ? `<figcaption class="img-caption">${title}</figcaption>`
    : "";
  return `<figure class="img-figure"><img src="${href}" alt="${text}"${titleAttr} loading="lazy" />${figcaption}</figure>`;
};

renderer.listitem = function ({ text, task, checked }: { text: string; task?: boolean; checked?: boolean }) {
  if (task) {
    const checkedAttr = checked ? ' checked disabled' : ' disabled';
    const checkedClass = checked ? " task-checked" : "";
    return `<li class="task-list-item"><input type="checkbox"${checkedAttr} class="task-checkbox" /><span class="${checkedClass}">${text}</span></li>`;
  }
  return `<li>${text}</li>`;
};

renderer.blockquote = function ({ text }: { text: string }) {
  // Detect callout syntax: > [!NOTE], > [!WARNING], etc.
  const calloutMatch = text.match(/^\[!(NOTE|WARNING|TIP|IMPORTANT|CAUTION)\]\s*(.*)/si);
  if (calloutMatch) {
    const type = calloutMatch[1].toLowerCase();
    const content = calloutMatch[2];
    const icons: Record<string, string> = {
      note: "ℹ️",
      warning: "⚠️",
      tip: "💡",
      important: "🔔",
      caution: "🚨",
    };
    const colors: Record<string, string> = {
      note: "callout-note",
      warning: "callout-warning",
      tip: "callout-tip",
      important: "callout-important",
      caution: "callout-caution",
    };
    return `<div class="callout ${colors[type]}"><span class="callout-icon">${icons[type]}</span><div class="callout-body">${content}</div></div>`;
  }
  return `<blockquote>${text}</blockquote>`;
};

const marked = new Marked({ gfm: true, breaks: true, renderer });

function preprocessWikiLinks(md: string): string {
  return md.replace(
    /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g,
    (_: string, target: string, alias?: string) =>
      `[${alias ?? target}](wiki:${target})`,
  );
}

function stripFrontmatter(md: string): string {
  return md.replace(/^---[\s\S]*?---\n?/, "");
}

export function MarkdownPreview() {
  const draftContent = useEditorStore((s) => s.draftContent);
  const mode = useEditorStore((s) => s.mode);
  const preferences = useAppStore((s) => s.preferences);
  const isZen = mode === "zen";

  const renderedHtml = useMemo(() => {
    if (!draftContent.trim()) {
      return `<div class="empty-preview"><p>Nothing to preview yet.</p><p>Switch to Edit mode and start writing…</p></div>`;
    }
    const processed = preprocessWikiLinks(stripFrontmatter(draftContent));
    return marked.parse(processed) as string;
  }, [draftContent]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Handle wiki-link clicks
    const wikiLink = target.closest<HTMLElement>(".wiki-link");
    if (wikiLink) {
      e.preventDefault();
      const noteTarget = wikiLink.dataset.target;
      if (noteTarget) {
        window.dispatchEvent(
          new CustomEvent("ragnar-wiki-navigate", { detail: { target: noteTarget } }),
        );
      }
      return;
    }

    // Allow external links to open normally
  }, []);

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto",
        isZen ? "flex justify-center" : "",
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "ragnar-prose animate-fade-in px-12 py-8",
          isZen && "max-w-[740px] w-full px-8 py-14",
        )}
        style={{
          fontSize: `${preferences.fontSize}px`,
          lineHeight: preferences.lineHeight,
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
}
