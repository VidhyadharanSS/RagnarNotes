import { useRef, useCallback, useEffect } from "react";
import { useEditorStore } from "@stores/editorStore";
import { useAppStore } from "@stores/appStore";
import { useAutoSave } from "@hooks/useAutoSave";
import { useKeyboardShortcut } from "@hooks/useKeyboardShortcut";
import { normalizeAIPaste } from "@utils/markdown";
import { cn } from "@utils/cn";

/**
 * MarkdownEditor — Stage 4
 *
 * Improvements over Stage 3:
 *  - Font size & line height from user preferences (Settings Panel)
 *  - Ctrl+Z / Ctrl+Y undo-redo awareness (browser native)
 *  - Slightly wider editor area in normal mode
 *  - Better zen mode width handling
 *  - Smarter auto-continue for empty list items (stops continuing)
 */
export function MarkdownEditor() {
  const draftContent = useEditorStore((s) => s.draftContent);
  const setDraftContent = useEditorStore((s) => s.setDraftContent);
  const updateCounts = useEditorStore((s) => s.updateCounts);
  const mode = useEditorStore((s) => s.mode);
  const preferences = useAppStore((s) => s.preferences);

  const isZen = mode === "zen";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutoSave();

  // Focus on mount
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── Inline wrap helper ── */
  const insertAt = useCallback(
    (before: string, after = "") => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = draftContent.slice(start, end);
      const newText =
        draftContent.slice(0, start) + before + selected + after + draftContent.slice(end);
      setDraftContent(newText);
      updateCounts(newText);
      requestAnimationFrame(() => {
        if (selected) {
          ta.selectionStart = start + before.length;
          ta.selectionEnd = start + before.length + selected.length;
        } else {
          ta.selectionStart = start + before.length;
          ta.selectionEnd = start + before.length;
        }
        ta.focus();
      });
    },
    [draftContent, setDraftContent, updateCounts],
  );

  /* ── Line prefix helper ── */
  const prefixLine = useCallback(
    (prefix: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = draftContent.lastIndexOf("\n", start - 1) + 1;
      const newText =
        draftContent.slice(0, lineStart) + prefix + draftContent.slice(lineStart);
      setDraftContent(newText);
      updateCounts(newText);
      requestAnimationFrame(() => {
        ta.selectionStart = start + prefix.length;
        ta.selectionEnd = start + prefix.length;
        ta.focus();
      });
    },
    [draftContent, setDraftContent, updateCounts],
  );

  /* ── Listen to toolbar format events ── */
  useEffect(() => {
    function handleFormat(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.action === "wrap") insertAt(detail.before, detail.after || "");
      else if (detail.action === "prefix") prefixLine(detail.before);
      else if (detail.action === "insert") insertAt(detail.before, detail.after || "");
    }
    window.addEventListener("ragnar-format", handleFormat);
    return () => window.removeEventListener("ragnar-format", handleFormat);
  }, [insertAt, prefixLine]);

  /* ── Keyboard shortcuts ── */
  useKeyboardShortcut("cmd+b", () => insertAt("**", "**"));
  useKeyboardShortcut("cmd+i", () => insertAt("*", "*"));
  useKeyboardShortcut("cmd+`", () => insertAt("`", "`"));
  useKeyboardShortcut("cmd+shift+x", () => insertAt("~~", "~~"));

  /* ── onChange ── */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setDraftContent(val);
      updateCounts(val);
    },
    [setDraftContent, updateCounts],
  );

  /* ── Smart key handling ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = textareaRef.current;
      if (!ta) return;

      // Tab → insert 2 spaces
      if (e.key === "Tab") {
        e.preventDefault();
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = draftContent.slice(0, start) + "  " + draftContent.slice(end);
        setDraftContent(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = start + 2;
          ta.selectionEnd = start + 2;
        });
        return;
      }

      // Smart Enter — continue list items
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const start = ta.selectionStart;
        const lineStart = draftContent.lastIndexOf("\n", start - 1) + 1;
        const currentLine = draftContent.slice(lineStart, start);

        // Unordered list
        const ulMatch = currentLine.match(/^(\s*)([-*+]) (.+)/);
        if (ulMatch) {
          e.preventDefault();
          const [, indent, bullet] = ulMatch;
          const newText =
            draftContent.slice(0, start) +
            `\n${indent}${bullet} ` +
            draftContent.slice(start);
          setDraftContent(newText);
          requestAnimationFrame(() => {
            const pos = start + indent.length + 3;
            ta.selectionStart = pos;
            ta.selectionEnd = pos;
          });
          return;
        }

        // Empty unordered item → break out
        const ulEmpty = currentLine.match(/^(\s*)([-*+]) $/);
        if (ulEmpty) {
          e.preventDefault();
          // Remove the bullet marker, add blank line
          const newText =
            draftContent.slice(0, lineStart) +
            "\n" +
            draftContent.slice(start);
          setDraftContent(newText);
          requestAnimationFrame(() => {
            ta.selectionStart = lineStart + 1;
            ta.selectionEnd = lineStart + 1;
          });
          return;
        }

        // Ordered list
        const olMatch = currentLine.match(/^(\s*)(\d+)\. (.+)/);
        if (olMatch) {
          e.preventDefault();
          const [, indent, numStr] = olMatch;
          const num = parseInt(numStr, 10) + 1;
          const newText =
            draftContent.slice(0, start) +
            `\n${indent}${num}. ` +
            draftContent.slice(start);
          setDraftContent(newText);
          requestAnimationFrame(() => {
            const pos = start + indent.length + String(num).length + 3;
            ta.selectionStart = pos;
            ta.selectionEnd = pos;
          });
          return;
        }

        // Task list
        const taskMatch = currentLine.match(/^(\s*)- \[[ x]\] (.+)/);
        if (taskMatch) {
          e.preventDefault();
          const [, indent] = taskMatch;
          const newText =
            draftContent.slice(0, start) +
            `\n${indent}- [ ] ` +
            draftContent.slice(start);
          setDraftContent(newText);
          requestAnimationFrame(() => {
            const pos = start + indent.length + 7;
            ta.selectionStart = pos;
            ta.selectionEnd = pos;
          });
          return;
        }

        // Blockquote
        const bqMatch = currentLine.match(/^(\s*>) (.+)/);
        if (bqMatch) {
          e.preventDefault();
          const [, prefix] = bqMatch;
          const newText =
            draftContent.slice(0, start) +
            `\n${prefix} ` +
            draftContent.slice(start);
          setDraftContent(newText);
          requestAnimationFrame(() => {
            const pos = start + prefix.length + 2;
            ta.selectionStart = pos;
            ta.selectionEnd = pos;
          });
          return;
        }
      }

      // Auto-close pairs (only when text is selected)
      const pairs: Record<string, string> = {
        "(": ")",
        "[": "]",
        "{": "}",
        '"': '"',
        "`": "`",
        "*": "*",
        "_": "_",
      };
      if (pairs[e.key]) {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = draftContent.slice(start, end);
        if (selected) {
          e.preventDefault();
          const newText =
            draftContent.slice(0, start) +
            e.key +
            selected +
            pairs[e.key] +
            draftContent.slice(end);
          setDraftContent(newText);
          requestAnimationFrame(() => {
            ta.selectionStart = start + 1;
            ta.selectionEnd = start + 1 + selected.length;
          });
        }
      }
    },
    [draftContent, setDraftContent],
  );

  /* ── Paste normalization ── */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const raw = e.clipboardData.getData("text/plain");
      const normalized = normalizeAIPaste(raw);
      if (normalized === raw) return;
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal =
        draftContent.slice(0, start) + normalized + draftContent.slice(end);
      setDraftContent(newVal);
      updateCounts(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = start + normalized.length;
        ta.selectionEnd = start + normalized.length;
      });
    },
    [draftContent, setDraftContent, updateCounts],
  );

  const fontSizePx = isZen
    ? Math.max(preferences.fontSize + 2, 17)
    : preferences.fontSize;

  const lineHeight = isZen
    ? Math.min(preferences.lineHeight + 0.15, 2.2)
    : preferences.lineHeight;

  return (
    <div
      className={cn(
        "flex flex-1 overflow-hidden",
        isZen && "w-full justify-center",
      )}
    >
      <textarea
        ref={textareaRef}
        value={draftContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        spellCheck={preferences.spellCheck}
        style={{
          fontSize: `${fontSizePx}px`,
          lineHeight,
          tabSize: 2,
        }}
        className={cn(
          "flex-1 resize-none bg-transparent outline-none",
          "font-mono text-ragnar-text-primary",
          "overflow-y-auto no-scrollbar",
          isZen
            ? "max-w-[740px] w-full px-8 py-12"
            : "px-10 py-8",
          "placeholder:text-ragnar-text-muted/50",
          "caret-ragnar-accent",
          "selection:bg-ragnar-accent/20",
        )}
        placeholder="Start writing… Markdown is fully supported ✦"
      />
    </div>
  );
}
