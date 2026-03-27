import { useEffect } from "react";
import { useAppStore } from "@stores/appStore";

/**
 * useTheme — Stage 4 (Fixed)
 *
 * Subscribes to the theme preference in appStore and applies
 * the correct CSS class + color-scheme to <html> immediately.
 *
 * FIX: This hook MUST be called in App.tsx at the root level.
 * Previous bug: it was never called, so theme changes had no effect.
 *
 * Features:
 *  1. Adds/removes "dark" / "light" class on <html>
 *  2. Sets color-scheme on <html> (native scrollbars, inputs)
 *  3. Updates <meta name="color-scheme"> for browser chrome
 *  4. Listens to system preference changes when theme === "system"
 *  5. Persists the resolved theme to localStorage for instant apply on reload
 */
export function useTheme() {
  const theme = useAppStore((s) => s.preferences.theme);

  useEffect(() => {
    const root = document.documentElement;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');

    function applyDark(isDark: boolean) {
      if (isDark) {
        root.classList.add("dark");
        root.classList.remove("light");
        root.style.colorScheme = "dark";
        document.body.style.backgroundColor = "#1c1c1e";
        if (meta) meta.content = "dark";
        localStorage.setItem("ragnar-theme-resolved", "dark");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
        root.style.colorScheme = "light";
        document.body.style.backgroundColor = "#ffffff";
        if (meta) meta.content = "light";
        localStorage.setItem("ragnar-theme-resolved", "light");
      }
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyDark(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyDark(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }

    applyDark(theme === "dark");
  }, [theme]);
}
