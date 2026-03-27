import { useEffect, useRef } from "react";
import { useEditorStore } from "@stores/editorStore";
import { useAppStore } from "@stores/appStore";

/**
 * useAutoSave
 *
 * Debounced auto-save hook. Fires `onSave` after the debounce
 * interval whenever `draftContent` changes and `isUnsaved` is true.
 *
 * In Stage 4, `onSave` will invoke the Tauri file-write command.
 * For now, it just calls markSaved() to track state.
 */
export function useAutoSave(
  onSave?: (content: string) => Promise<void>,
): void {
  const draftContent = useEditorStore((s) => s.draftContent);
  const isUnsaved = useEditorStore((s) => s.isUnsaved);
  const markSaved = useEditorStore((s) => s.markSaved);
  const intervalMs = useAppStore((s) => s.preferences.autoSaveIntervalMs);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(draftContent);
  contentRef.current = draftContent;

  useEffect(() => {
    if (!isUnsaved) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (onSave) {
        await onSave(contentRef.current);
      }
      markSaved();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draftContent, isUnsaved, intervalMs, onSave, markSaved]);
}
