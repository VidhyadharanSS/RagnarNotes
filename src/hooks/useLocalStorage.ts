import { useEffect } from "react";
import { useAppStore } from "@stores/appStore";

/* ─────────────────────────────────────────────────────────────
 * useLocalStorage — Stage 4: Persist preferences to localStorage
 *
 * Loads preferences on mount, saves on every change.
 * ───────────────────────────────────────────────────────────── */

const STORAGE_KEY = "ragnar-preferences";

export function useLocalStorage() {
  const preferences = useAppStore((s) => s.preferences);
  const updatePreferences = useAppStore((s) => s.updatePreferences);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        updatePreferences(parsed);
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // ignore quota errors
    }
  }, [preferences]);
}
