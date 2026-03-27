/**
 * PDF / Markdown / HTML Export — Stage 5 (Theme-aware)
 *
 * FIX: Reads current dark/light mode and applies appropriate
 * colors to exported PDF, HTML, and code blocks.
 */
import html2pdf from "html2pdf.js";
import { Marked } from "marked";
import hljs from "highlight.js";
import type { Note } from "@/types";

const marked = new Marked({ gfm: true, breaks: true });

function isDarkMode(): boolean {
  return document.documentElement.classList.contains("dark");
}

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      const dark = isDarkMode();
      const bg = dark ? "#1e1e2e" : "#f6f8fa";
      const border = dark ? "#313244" : "#d0d7de";
      const color = dark ? "#cdd6f4" : "#24292f";
      return `<pre style="background:${bg};border-radius:8px;padding:14px 18px;overflow-x:auto;margin:12px 0;border:1px solid ${border}"><code style="font-family:'JetBrains Mono','Fira Code',monospace;font-size:12px;line-height:1.6;color:${color}">${highlighted}</code></pre>`;
    },
  },
});

function buildPdfHtml(note: Note, content: string): string {
  const htmlBody = marked.parse(content) as string;
  const dark = isDarkMode();
  const dateStr = new Date(note.frontmatter.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const tp = dark ? "#f5f5f7" : "#111827";
  const ts = dark ? "#a1a1a6" : "#374151";
  const tm = dark ? "#6e6e73" : "#6b7280";
  const bg = dark ? "#1c1c1e" : "#ffffff";
  const bc = dark ? "#3a3a3c" : "#e5e7eb";
  const tgBg = dark ? "#312e81" : "#e0e7ff";
  const tgTx = dark ? "#a5b4fc" : "#3730a3";
  const tags = note.frontmatter.tags.map((t) => `<span style="display:inline-block;background:${tgBg};color:${tgTx};border-radius:12px;padding:2px 10px;font-size:11px;font-weight:600;margin-right:6px">#${t}</span>`).join("");

  return `<div style="font-family:'Inter','Segoe UI',sans-serif;color:${ts};padding:0;background:${bg}">
    <div style="border-bottom:2px solid ${bc};padding-bottom:16px;margin-bottom:24px">
      <h1 style="font-size:28px;font-weight:800;margin:0 0 8px;color:${tp}">${note.title}</h1>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:12px;color:${tm}">${dateStr}</span>${tags ? `<span style="font-size:12px;color:${tm}">·</span>${tags}` : ""}</div>
    </div>
    <div style="font-size:14px;line-height:1.8;color:${ts}">${htmlBody}</div>
    <div style="border-top:1px solid ${bc};margin-top:32px;padding-top:12px;text-align:center"><span style="font-size:10px;color:${tm}">Exported from Ragnar Notes · ${dateStr}</span></div>
  </div>`;
}

function buildPrintStyles(): string {
  const dark = isDarkMode();
  const tp = dark ? "#f5f5f7" : "#111827";
  const tb = dark ? "#a1a1a6" : "#374151";
  const bc = dark ? "#3a3a3c" : "#e5e7eb";
  const ciBg = dark ? "#2c2c2e" : "#f3f4f6";
  const ciTx = dark ? "#f472b6" : "#e11d48";
  const cbTx = dark ? "#cdd6f4" : "#24292f";
  const thBg = dark ? "#3a3a3c" : "#f3f4f6";
  const trBg = dark ? "#2c2c2e" : "#f9fafb";
  return `h1,h2,h3,h4,h5,h6{color:${tp}!important;font-weight:700;margin-top:1.4em;margin-bottom:.5em}
h1{font-size:24px}h2{font-size:20px;border-bottom:1px solid ${bc};padding-bottom:6px}h3{font-size:17px}
p{margin:0 0 10px;color:${tb}}ul,ol{padding-left:24px;margin-bottom:12px}li{margin-bottom:4px}
blockquote{border-left:3px solid #6366f1;padding-left:14px;margin:12px 0;color:${tb};font-style:italic}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}
th{background:${thBg};font-weight:600;text-align:left;padding:8px 12px;border:1px solid ${bc};color:${tp}}
td{padding:8px 12px;border:1px solid ${bc};color:${tb}}tr:nth-child(even) td{background:${trBg}}
a{color:#4f46e5;text-decoration:underline}strong{font-weight:700;color:${tp}}
code{background:${ciBg};border-radius:3px;padding:1px 5px;font-family:'JetBrains Mono',monospace;font-size:12px;color:${ciTx}}
pre code{background:none;padding:0;color:${cbTx}}hr{border:none;border-top:1px solid ${bc};margin:20px 0}img{max-width:100%;border-radius:6px}
${dark?`.hljs-keyword{color:#cba6f7}.hljs-string{color:#a6e3a1}.hljs-comment{color:#6c7086;font-style:italic}.hljs-number{color:#fab387}.hljs-built_in{color:#f38ba8}`:`.hljs-keyword{color:#a626a4}.hljs-string{color:#50a14f}.hljs-comment{color:#a0a1a7;font-style:italic}.hljs-number{color:#986801}.hljs-built_in{color:#c18401}`}`;
}

export interface PdfExportOptions {
  filename?: string;
  pageSize?: "a4" | "letter" | "legal";
  margin?: number;
  imageQuality?: number;
}

export async function exportNoteToPdf(note: Note, options: PdfExportOptions = {}): Promise<void> {
  const { filename = `${note.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`, pageSize = "a4", margin = 15, imageQuality = 2 } = options;
  const content = note.content.replace(/^---[\s\S]*?---\n?/, "");
  const html = buildPdfHtml(note, content);
  const dark = isDarkMode();
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.cssText = `width:210mm;padding:${margin}mm;background:${dark?"#1c1c1e":"#fff"};position:absolute;left:-9999px;top:0`;
  const styleTag = document.createElement("style");
  styleTag.textContent = buildPrintStyles();
  container.prepend(styleTag);
  document.body.appendChild(container);
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts: any = { margin: 0, filename, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: imageQuality, useCORS: true, logging: false, letterRendering: true, backgroundColor: dark ? "#1c1c1e" : "#ffffff" }, jsPDF: { unit: "mm", format: pageSize, orientation: "portrait" }, pagebreak: { mode: ["avoid-all", "css", "legacy"] } };
    await html2pdf().set(opts).from(container).save();
  } finally { document.body.removeChild(container); }
}

export function exportNoteAsMarkdown(note: Note): void {
  const blob = new Blob([note.content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${note.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

export function exportNoteAsHtml(note: Note): void {
  const content = note.content.replace(/^---[\s\S]*?---\n?/, "");
  const dark = isDarkMode();
  const htmlBody = marked.parse(content) as string;
  const bg = dark ? "#1c1c1e" : "#fff";
  const tx = dark ? "#f5f5f7" : "#1a1a2e";
  const ts = dark ? "#a1a1a6" : "#374151";
  const bc = dark ? "#3a3a3c" : "#e5e7eb";
  const cbg = dark ? "#1e1e2e" : "#f6f8fa";
  const ciBg = dark ? "#2c2c2e" : "#f3f4f6";
  const ciTx = dark ? "#f472b6" : "#e11d48";
  const cbTx = dark ? "#cdd6f4" : "#24292f";
  const thBg = dark ? "#3a3a3c" : "#f3f4f6";
  const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${note.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}body{font-family:'Inter',sans-serif;max-width:720px;margin:0 auto;padding:40px 24px;color:${tx};line-height:1.8;background:${bg}}h1,h2,h3{font-weight:700;color:${tx}}h1{font-size:2em}h2{font-size:1.5em;border-bottom:1px solid ${bc};padding-bottom:8px}p{color:${ts}}pre{background:${cbg};border-radius:8px;padding:16px;overflow-x:auto;color:${cbTx}}code{font-family:'JetBrains Mono',monospace;font-size:.9em}:not(pre)>code{background:${ciBg};border-radius:4px;padding:2px 6px;color:${ciTx}}blockquote{border-left:3px solid #4f46e5;padding-left:16px;margin-left:0;color:${ts}}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:8px 12px;border:1px solid ${bc};text-align:left}th{background:${thBg};font-weight:600;color:${tx}}a{color:#4f46e5}img{max-width:100%;border-radius:8px}strong{color:${tx}}</style></head>
<body><h1>${note.title}</h1>${htmlBody}<hr style="border:none;border-top:1px solid ${bc};margin:32px 0"><p style="font-size:12px;color:${dark?"#6e6e73":"#9ca3af"};text-align:center">Exported from Ragnar Notes</p></body></html>`;
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${note.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
