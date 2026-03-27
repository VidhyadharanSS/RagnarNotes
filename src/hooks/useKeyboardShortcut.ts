import { useEffect, useCallback } from "react";
import { matchesShortcut, parseShortcut } from "@utils/keyboard";

/**
 * useKeyboardShortcut
 *
 * Register a global keyboard shortcut. Automatically cleans up
 * the event listener on unmount.
 *
 * @param shortcut - e.g. "cmd+k", "cmd+shift+f"
 * @param callback - called when the shortcut is triggered
 * @param enabled  - set to false to temporarily disable (default: true)
 */
export function useKeyboardShortcut(
  shortcut: string,
  callback: (event: KeyboardEvent) => void,
  enabled = true,
): void {
  const parsed = parseShortcut(shortcut);

  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (matchesShortcut(event, parsed)) {
        event.preventDefault();
        callback(event);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, shortcut, callback],
  );

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}
