import { useRef, useCallback, useEffect } from "react";
import { useEditorStore } from "@stores/editorStore";
import { useAppStore } from "@stores/appStore";
import { useAutoSave } from "@hooks/useAutoSave";
import { useKeyboardShortcut } from "@hooks/useKeyboardShortcut";
import { normalizeAIPaste } from "@utils/markdown";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * MarkdownEditor — Raw Markdown textarea editor (Stage 3)
 *
 * Stage 3 enhancements:
 *  - Cmd+B / Cmd+I / Cmd+` keyboard shortcuts for inline formatting
 *  - Toolbar format actions via custom event system
 *  - Auto-close brackets/quotes: (, [, {, ", `
 *  - Smart enter: continue lists (- or 1.)
 *  - Improved zen mode typography
 * ───────────────────────────────────────────────────────────── */

export function MarkdownEditor() {
  const draftContent = useEditorStore((s) => s.draftContent);
  const setDraftContent = useEditorStore((s) => s.setDraftContent);
  const updateCounts = useEditorStore((s) => s.updateCounts);
  const mode = useEditorStore((s) => s.mode);
  const preferences = useAppStore((s) => s.preferences);

  const isZen = mode === "zen";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutoSave();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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

  useEffect(() => {
    function handleFormat(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.action === "wrap") {
        insertAt(detail.before, detail.after || "");
      } else if (detail.action === "prefix") {
        prefixLine(detail.before);
      } else if (detail.action === "insert") {
        insertAt(detail.before, detail.after || "");
      }
    }
    window.addEventListener("ragnar-format", handleFormat);
    return () => window.removeEventListener("ragnar-format", handleFormat);
  }, [insertAt, prefixLine]);

  useKeyboardShortcut("cmd+b", () => insertAt("**", "**"));
  useKeyboardShortcut("cmd+i", () => insertAt("*", "*"));
  useKeyboardShortcut("cmd+`", () => insertAt("`", "`"));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setDraftContent(val);
      updateCounts(val);
    },
    [setDraftContent, updateCounts],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = textareaRef.current;
      if (!ta) return;

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

      if (e.key === "Enter" && !e.shiftKey) {
        const start = ta.selectionStart;
        const lineStart = draftContent.lastIndexOf("\n", start - 1) + 1;
        const currentLine = draftContent.slice(lineStart, start);

        const ulMatch = currentLine.match(/^(\s*)([-*+])\s(.+)/);
        if (ulMatch) {
          e.preventDefault();
          const indent = ulMatch[1];
          const bullet = ulMatch[2];
          const newText = draftContent.slice(0, start) + `\n${indent}${bullet} ` + draftContent.slice(start);
          setDraftContent(newText);
          requestAnimationFrame(() => {
            const pos = start + indent.length + 3;
            ta.selectionStart = pos;
            ta.selectionEnd = pos;
          });
          return;
        }

        const olMatch = currentLine.match(/^(\s*)(\d+)\.\s(.+)/);
        if (olMatch) {
          e.preventDefault();
          const indent = olMatch[1];
          const num = parseInt(olMatch[2], 10) + 1;
          const newText = draftContent.slice(0, start) + `\n${indent}${num}. ` + draftContent.slice(start);
          setDraftContent(newText);
          requestAnimationFrame(() => {
            const pos = start + indent.length + String(num).length + 3;
            ta.selectionStart = pos;
            ta.selectionEnd = pos;
          });
          return;
        }

        const taskMatch = currentLine.match(/^(\s*)- \[[ x]\]\s(.+)/);
        if (taskMatch) {
          e.preventDefault();
          const indent = taskMatch[1];
          const newText = draftContent.slice(0, start) + `\n${indent}- [ ] ` + draftContent.slice(start);
          setDraftContent(newText);
          requestAnimationFrame(() => {
            const pos = start + indent.length + 7;
            ta.selectionStart = pos;
            ta.selectionEnd = pos;
          });
          return;
        }

        const bqMatch = currentLine.match(/^(\s*>)\s(.+)/);
        if (bqMatch) {
          e.preventDefault();
          const prefix = bqMatch[1];
          const newText = draftContent.slice(0, start) + `\n${prefix} ` + draftContent.slice(start);
          setDraftContent(newText);
          requestAnimationFrame(() => {
            const pos = start + prefix.length + 2;
            ta.selectionStart = pos;
            ta.selectionEnd = pos;
          });
          return;
        }
      }

      const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}", '"': '"', "`": "`" };
      if (pairs[e.key]) {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = draftContent.slice(start, end);
        if (selected) {
          e.preventDefault();
          const newText = draftContent.slice(0, start) + e.key + selected + pairs[e.key] + draftContent.slice(end);
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
      const newVal = draftContent.slice(0, start) + normalized + draftContent.slice(end);
      setDraftContent(newVal);
      updateCounts(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = start + normalized.length;
        ta.selectionEnd = start + normalized.length;
      });
    },
    [draftContent, setDraftContent, updateCounts],
  );

  const fontSizePx = isZen ? Math.max(preferences.fontSize + 2, 16) : preferences.fontSize;

  return (
    <div className={cn("flex flex-1 overflow-hidden", isZen && "w-full max-w-[740px]")}>
      <textarea
        ref={textareaRef}
        value={draftContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        spellCheck={preferences.spellCheck}
        style={{
          fontSize: `${fontSizePx}px`,
          lineHeight: isZen ? preferences.lineHeight + 0.2 : preferences.lineHeight,
          tabSize: 2,
        }}
        className={cn(
          "flex-1 resize-none bg-transparent outline-none",
          "font-mono text-ragnar-text-primary",
          "overflow-y-auto",
          isZen ? "px-0 py-0" : "px-10 py-8",
          "placeholder:text-ragnar-text-muted",
          "caret-ragnar-accent",
          "selection:bg-ragnar-accent/20",
        )}
        placeholder="Start writing… Markdown supported"
      />
    </div>
  );
}
