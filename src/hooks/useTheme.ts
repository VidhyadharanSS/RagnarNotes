import { useEffect } from "react";
import { useAppStore } from "@stores/appStore";
import { getFontCssValue, getAccentColor } from "@utils/fonts";

/**
 * useTheme — v1.1.0
 *
 * Applies:
 *  - dark/light class on <html>
 *  - Custom font family via --font-sans CSS variable
 *  - Accent color CSS variables
 *  - Editor max-width
 */
export function useTheme() {
  const theme = useAppStore((s) => s.preferences.theme);
  const fontFamily = useAppStore((s) => s.preferences.fontFamily);
  const accentColor = useAppStore((s) => s.preferences.accentColor);

  // ── Apply theme (dark/light) ──
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

  // ── Apply font family ──
  useEffect(() => {
    const cssValue = getFontCssValue(fontFamily);
    document.documentElement.style.setProperty("--font-sans", cssValue);
    document.body.style.fontFamily = cssValue;
  }, [fontFamily]);

  // ── Apply accent color ──
  useEffect(() => {
    const root = document.documentElement;
    const accent = getAccentColor(accentColor);
    const isDark = root.classList.contains("dark");

    const accentMain = isDark ? accent.dark : accent.light;
    const accentHover = isDark ? accent.darkHover : accent.lightHover;
    const accentMuted = isDark ? accent.darkMuted : accent.lightMuted;

    root.style.setProperty("--ragnar-accent", accentMain);
    root.style.setProperty("--ragnar-accent-hover", accentHover);
    root.style.setProperty("--ragnar-accent-muted", accentMuted);

    // Sidebar active uses muted variant
    root.style.setProperty("--ragnar-sidebar-active", accentMuted);

    // Selection color
    const style = document.getElementById("ragnar-selection-style") || document.createElement("style");
    style.id = "ragnar-selection-style";
    style.textContent = `::selection { background: ${accentMuted}; }`;
    if (!style.parentNode) document.head.appendChild(style);
  }, [accentColor, theme]);
}
