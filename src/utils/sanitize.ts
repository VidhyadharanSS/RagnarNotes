/**
 * sanitize.ts — Stage 5: Input sanitization & XSS prevention
 *
 * Provides utilities to sanitize user input before rendering
 * as HTML. Used by the markdown preview and export pipelines.
 *
 * Security measures:
 *  1. HTML entity encoding for untrusted text
 *  2. Script tag stripping from rendered HTML
 *  3. Event handler attribute removal
 *  4. Safe URL validation (no javascript: links)
 */

/** Encode HTML entities to prevent XSS */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Strip dangerous HTML: <script>, <iframe>, on* attributes */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their contents
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove iframes
  clean = clean.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "");

  // Remove on* event handler attributes
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Remove javascript: links
  clean = clean.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"');

  // Remove data: URIs in src attributes (potential XSS vector)
  clean = clean.replace(
    /src\s*=\s*(?:"data:text\/html[^"]*"|'data:text\/html[^']*')/gi,
    'src=""',
  );

  return clean;
}

/** Validate a URL is safe (http/https only) */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "https://localhost");
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Sanitize a file name for safe file system usage */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200)
    || "untitled";
}

/** Rate limiter for preventing rapid repeated operations */
export function createRateLimiter(maxOps: number, windowMs: number) {
  const timestamps: number[] = [];

  return {
    canProceed(): boolean {
      const now = Date.now();
      // Remove timestamps outside the window
      while (timestamps.length > 0 && timestamps[0] < now - windowMs) {
        timestamps.shift();
      }
      if (timestamps.length >= maxOps) return false;
      timestamps.push(now);
      return true;
    },
    reset() {
      timestamps.length = 0;
    },
  };
}
