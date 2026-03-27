import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  sanitizeHtml,
  isSafeUrl,
  sanitizeFileName,
  createRateLimiter,
} from "@utils/sanitize";

describe("escapeHtml", () => {
  it("escapes HTML entities", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;",
    );
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('He said "hello"')).toBe("He said &quot;hello&quot;");
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("leaves safe text unchanged", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });
});

describe("sanitizeHtml", () => {
  it("removes script tags", () => {
    const html = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain("<script>");
    expect(result).toContain("<p>Hello</p>");
    expect(result).toContain("<p>World</p>");
  });

  it("removes iframe tags", () => {
    const html = '<iframe src="http://evil.com"></iframe>';
    expect(sanitizeHtml(html)).not.toContain("<iframe");
  });

  it("removes on* event handlers", () => {
    const html = '<img src="test.jpg" onerror="alert(1)">';
    const result = sanitizeHtml(html);
    expect(result).not.toContain("onerror");
  });

  it("replaces javascript: links", () => {
    const html = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain("javascript:");
  });

  it("removes data:text/html URIs", () => {
    const html = '<img src="data:text/html,<script>alert(1)</script>">';
    const result = sanitizeHtml(html);
    expect(result).not.toContain("data:text/html");
  });

  it("preserves safe HTML", () => {
    const html = '<p>Hello <strong>World</strong></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });
});

describe("isSafeUrl", () => {
  it("accepts http URLs", () => {
    expect(isSafeUrl("http://example.com")).toBe(true);
  });

  it("accepts https URLs", () => {
    expect(isSafeUrl("https://example.com")).toBe(true);
  });

  it("rejects javascript: URLs", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects data: URLs", () => {
    expect(isSafeUrl("data:text/html,<h1>hi</h1>")).toBe(false);
  });

  it("accepts relative paths (resolved against localhost)", () => {
    expect(isSafeUrl("/path/to/file")).toBe(true);
  });

  it("rejects ftp: URLs", () => {
    expect(isSafeUrl("ftp://example.com")).toBe(false);
  });
});

describe("sanitizeFileName", () => {
  it("removes dangerous characters", () => {
    expect(sanitizeFileName('file<>:"/\\|?*name')).toBe("filename");
  });

  it("replaces spaces with hyphens", () => {
    expect(sanitizeFileName("my great note")).toBe("my-great-note");
  });

  it("collapses multiple hyphens", () => {
    expect(sanitizeFileName("my---note")).toBe("my-note");
  });

  it("trims leading/trailing hyphens", () => {
    expect(sanitizeFileName("-my-note-")).toBe("my-note");
  });

  it("limits length to 200", () => {
    const longName = "a".repeat(300);
    expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(200);
  });

  it("returns 'untitled' for empty result", () => {
    expect(sanitizeFileName("")).toBe("untitled");
    expect(sanitizeFileName('***')).toBe("untitled");
  });
});

describe("createRateLimiter", () => {
  it("allows operations within the limit", () => {
    const limiter = createRateLimiter(3, 1000);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
  });

  it("blocks operations beyond the limit", () => {
    const limiter = createRateLimiter(2, 1000);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(false);
  });

  it("resets correctly", () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(false);
    limiter.reset();
    expect(limiter.canProceed()).toBe(true);
  });
});
