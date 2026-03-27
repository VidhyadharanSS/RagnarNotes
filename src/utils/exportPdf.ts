/**
 * PDF Export Utility — Stage 4
 *
 * Renders the current note's Markdown to a beautifully styled PDF
 * using html2pdf.js (which wraps jsPDF + html2canvas).
 *
 * Supports:
 *  - Full markdown → HTML rendering via `marked`
 *  - Syntax highlighted code blocks
 *  - Custom print-optimized stylesheet
 *  - Configurable filename, margins, page size
 */

import html2pdf from "html2pdf.js";
import { Marked } from "marked";
import hljs from "highlight.js";
import type { Note } from "@/types";

const marked = new Marked({ gfm: true, breaks: true });

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre style="background:#1e1e2e;border-radius:8px;padding:14px 18px;overflow-x:auto;margin:12px 0;border:1px solid #313244"><code style="font-family:'JetBrains Mono','Fira Code',monospace;font-size:12px;line-height:1.6;color:#cdd6f4">${highlighted}</code></pre>`;
    },
  },
});

function buildPdfHtml(note: Note, content: string): string {
  const htmlBody = marked.parse(content) as string;
  const dateStr = new Date(note.frontmatter.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const tags = note.frontmatter.tags.map((t) => `<span style="display:inline-block;background:#e0e7ff;color:#3730a3;border-radius:12px;padding:2px 10px;font-size:11px;font-weight:600;margin-right:6px">#${t}</span>`).join("");

  return `
    <div style="font-family:'Inter','Segoe UI','Helvetica Neue',sans-serif;color:#1a1a2e;max-width:100%;padding:0">
      <!-- Header -->
      <div style="border-bottom:2px solid #e5e7eb;padding-bottom:16px;margin-bottom:24px">
        <h1 style="font-size:28px;font-weight:800;margin:0 0 8px 0;letter-spacing:-0.02em;color:#111827">${note.title}</h1>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span style="font-size:12px;color:#6b7280">${dateStr}</span>
          ${tags ? `<span style="font-size:12px;color:#9ca3af">·</span>${tags}` : ""}
        </div>
      </div>

      <!-- Body -->
      <div style="font-size:14px;line-height:1.8;color:#374151">
        ${htmlBody}
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #e5e7eb;margin-top:32px;padding-top:12px;text-align:center">
        <span style="font-size:10px;color:#9ca3af">Exported from Ragnar Notes · ${dateStr}</span>
      </div>
    </div>
  `;
}

export interface PdfExportOptions {
  filename?: string;
  pageSize?: "a4" | "letter" | "legal";
  margin?: number;
  imageQuality?: number;
}

export async function exportNoteToPdf(
  note: Note,
  options: PdfExportOptions = {},
): Promise<void> {
  const {
    filename = `${note.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`,
    pageSize = "a4",
    margin = 15,
    imageQuality = 2,
  } = options;

  // Strip frontmatter from content
  const content = note.content.replace(/^---[\s\S]*?---\n?/, "");
  const html = buildPdfHtml(note, content);

  // Create a temporary container
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.width = "210mm";
  container.style.padding = `${margin}mm`;
  container.style.background = "white";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";

  // Style overrides for print
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    h1, h2, h3, h4, h5, h6 { color: #111827 !important; font-weight: 700; margin-top: 1.4em; margin-bottom: 0.5em; }
    h1 { font-size: 24px; }
    h2 { font-size: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    h3 { font-size: 17px; }
    p { margin: 0 0 10px 0; }
    ul, ol { padding-left: 24px; margin-bottom: 12px; }
    li { margin-bottom: 4px; }
    blockquote { border-left: 3px solid #6366f1; padding-left: 14px; margin: 12px 0; color: #6b7280; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    th { background: #f3f4f6; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #e5e7eb; }
    td { padding: 8px 12px; border: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    a { color: #4f46e5; text-decoration: underline; }
    strong { font-weight: 700; color: #111827; }
    code { background: #f3f4f6; border-radius: 3px; padding: 1px 5px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #e11d48; }
    pre code { background: none; padding: 0; color: #cdd6f4; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    img { max-width: 100%; border-radius: 6px; }
    .hljs-keyword { color: #cba6f7; }
    .hljs-string { color: #a6e3a1; }
    .hljs-comment { color: #6c7086; font-style: italic; }
    .hljs-number { color: #fab387; }
    .hljs-function .hljs-title { color: #89b4fa; }
    .hljs-built_in { color: #f38ba8; }
    .hljs-type { color: #f9e2af; }
    .hljs-attr { color: #89dceb; }
  `;
  container.prepend(styleTag);
  document.body.appendChild(container);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts: any = {
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: imageQuality,
        useCORS: true,
        logging: false,
        letterRendering: true,
      },
      jsPDF: {
        unit: "mm",
        format: pageSize,
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await html2pdf()
      .set(opts)
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

/** Export note content as a Markdown file download */
export function exportNoteAsMarkdown(note: Note): void {
  const blob = new Blob([note.content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export note content as an HTML file download */
export function exportNoteAsHtml(note: Note): void {
  const content = note.content.replace(/^---[\s\S]*?---\n?/, "");
  const htmlBody = marked.parse(content) as string;
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${note.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; max-width: 720px; margin: 0 auto; padding: 40px 24px; color: #1a1a2e; line-height: 1.8; }
    h1, h2, h3 { font-weight: 700; letter-spacing: -0.02em; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    pre { background: #1e1e2e; border-radius: 8px; padding: 16px; overflow-x: auto; color: #cdd6f4; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 0.9em; }
    :not(pre)>code { background: #f3f4f6; border-radius: 4px; padding: 2px 6px; color: #e11d48; }
    blockquote { border-left: 3px solid #6366f1; padding-left: 16px; margin-left: 0; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    a { color: #4f46e5; }
    img { max-width: 100%; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  ${htmlBody}
  <hr>
  <p style="font-size: 12px; color: #9ca3af; text-align: center;">Exported from Ragnar Notes</p>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
