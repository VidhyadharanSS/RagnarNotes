import { useRef, useCallback, useEffect } from "react";
import { useEditorStore } from "@stores/editorStore";
import { useAutoSave } from "@hooks/useAutoSave";
import { normalizeAIPaste } from "@utils/markdown";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * MarkdownEditor — Raw Markdown textarea editor
 *
 * Stage 3 will replace this with the full Tiptap/Milkdown WYSIWYG.
 * This textarea-based editor provides:
 *  - Correct Tab-key indentation
 *  - AI-paste normalization on paste event
 *  - Auto-save via useAutoSave hook
 *  - Word/char count updates
 *  - Zen mode centered layout
 * ───────────────────────────────────────────────────────────── */

export function MarkdownEditor() {
  const draftContent = useEditorStore((s) => s.draftContent);
  const setDraftContent = useEditorStore((s) => s.setDraftContent);
  const updateCounts = useEditorStore((s) => s.updateCounts);
  const mode = useEditorStore((s) => s.mode);
  const isZen = mode === "zen";

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save (stub — Stage 4 will pass the actual Tauri write fn)
  useAutoSave();

  // Focus the textarea when the editor mounts or the active note changes
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

  /** Handle Tab key: insert 2 spaces instead of losing focus */
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
        // Restore cursor position after React re-render
        requestAnimationFrame(() => {
          ta.selectionStart = start + 2;
          ta.selectionEnd = start + 2;
        });
      }
    },
    [draftContent, setDraftContent],
  );

  /** Normalize pasted text (AI paste handling) */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const raw = e.clipboardData.getData("text/plain");
      const normalized = normalizeAIPaste(raw);

      // Only intercept if normalization changed something
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

  return (
    <div
      className={cn(
        "flex flex-1 overflow-hidden",
        isZen && "max-w-[720px] w-full",
      )}
    >
      <textarea
        ref={textareaRef}
        value={draftContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        spellCheck={false}
        className={cn(
          "flex-1 resize-none bg-transparent outline-none",
          "font-mono text-[14px] leading-[1.8] text-ragnar-text-primary",
          "px-12 py-8",
          // Zen mode: slightly larger text, more breathing room
          isZen && "text-[15px] leading-[2] px-0 py-0",
          "placeholder:text-ragnar-text-muted",
          // Custom scrollbar via globals.css
          "overflow-y-auto",
        )}
        placeholder="Start writing… (Markdown supported)"
      />
    </div>
  );
}
