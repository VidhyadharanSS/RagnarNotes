import { useRef, useCallback, useEffect } from "react";
import { useEditorStore } from "@stores/editorStore";
import { useAppStore } from "@stores/appStore";
import { useAutoSave } from "@hooks/useAutoSave";
import { normalizeAIPaste } from "@utils/markdown";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * MarkdownEditor — Raw Markdown textarea editor (Stage 2)
 *
 * Stage 2 additions:
 *  - Respects preferences.fontSize from appStore
 *  - Respects preferences.lineHeight from appStore
 *  - Spellcheck toggle via preferences.spellCheck
 *  - Zen mode: larger type + wider max-width
 *  - Tab → 2-space indent (preserved from Stage 1)
 *  - AI-paste normalization on paste (preserved)
 * ───────────────────────────────────────────────────────────── */

export function MarkdownEditor() {
  const draftContent = useEditorStore((s) => s.draftContent);
  const setDraftContent = useEditorStore((s) => s.setDraftContent);
  const updateCounts = useEditorStore((s) => s.updateCounts);
  const mode = useEditorStore((s) => s.mode);
  const preferences = useAppStore((s) => s.preferences);

  const isZen = mode === "zen";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save (Stage 4 will pass actual Tauri write fn)
  useAutoSave();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal =
          draftContent.slice(0, start) + "  " + draftContent.slice(end);
        setDraftContent(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = start + 2;
          ta.selectionEnd = start + 2;
        });
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
      const newVal =
        draftContent.slice(0, start) + normalized + draftContent.slice(end);
      setDraftContent(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = start + normalized.length;
        ta.selectionEnd = start + normalized.length;
      });
    },
    [draftContent, setDraftContent],
  );

  const fontSizePx = isZen
    ? Math.max(preferences.fontSize + 2, 16)
    : preferences.fontSize;

  return (
    <div
      className={cn(
        "flex flex-1 overflow-hidden",
        isZen && "w-full max-w-[740px]",
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
          lineHeight: isZen
            ? preferences.lineHeight + 0.2
            : preferences.lineHeight,
        }}
        className={cn(
          "flex-1 resize-none bg-transparent outline-none",
          "font-mono text-ragnar-text-primary",
          "overflow-y-auto",
          isZen
            ? "px-0 py-0"
            : "px-10 py-8",
          "placeholder:text-ragnar-text-muted",
          // Soft caret color
          "caret-ragnar-accent",
        )}
        placeholder="Start writing… Markdown supported"
      />
    </div>
  );
}
