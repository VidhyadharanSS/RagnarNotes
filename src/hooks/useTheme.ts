import { useEffect } from "react";
import { useAppStore } from "@stores/appStore";

/* ─────────────────────────────────────────────────────────────
 * useTheme — Syncs the Zustand theme preference to the DOM
 *
 * Applies "dark" / light class to <html> element.
 * Watches system preference when theme = "system".
 * ───────────────────────────────────────────────────────────── */

export function useTheme() {
  const theme = useAppStore((s) => s.preferences.theme);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(dark: boolean) {
      if (dark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      applyTheme(theme === "dark");
    }
  }, [theme]);
}
