/**
 * Font & Accent Color Configuration — v1.1.0
 *
 * Defines available font families and accent color palettes
 * with their CSS values and Google Fonts import URLs.
 */

import type { FontFamily, AccentColor } from "@/types";

/* ─── Font Definitions ─── */

export interface FontOption {
  id: FontFamily;
  name: string;
  category: "sans-serif" | "serif" | "monospace";
  cssValue: string;
  preview: string;
  googleFamily?: string; // Google Fonts family param
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "inter",
    name: "Inter",
    category: "sans-serif",
    cssValue: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "Inter:wght@300;400;500;600;700",
  },
  {
    id: "system",
    name: "System Default",
    category: "sans-serif",
    cssValue: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    preview: "The quick brown fox jumps over the lazy dog",
  },
  {
    id: "geist",
    name: "Geist",
    category: "sans-serif",
    cssValue: '"Geist", "Inter", -apple-system, sans-serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "Geist:wght@300;400;500;600;700",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    category: "sans-serif",
    cssValue: '"DM Sans", -apple-system, sans-serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "DM+Sans:wght@300;400;500;600;700",
  },
  {
    id: "nunito",
    name: "Nunito",
    category: "sans-serif",
    cssValue: '"Nunito", -apple-system, sans-serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "Nunito:wght@300;400;500;600;700",
  },
  {
    id: "source-sans",
    name: "Source Sans 3",
    category: "sans-serif",
    cssValue: '"Source Sans 3", -apple-system, sans-serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "Source+Sans+3:wght@300;400;500;600;700",
  },
  {
    id: "ibm-plex",
    name: "IBM Plex Sans",
    category: "sans-serif",
    cssValue: '"IBM Plex Sans", -apple-system, sans-serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "IBM+Plex+Sans:wght@300;400;500;600;700",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    category: "sans-serif",
    cssValue: '"Space Grotesk", -apple-system, sans-serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "Space+Grotesk:wght@300;400;500;600;700",
  },
  {
    id: "merriweather",
    name: "Merriweather",
    category: "serif",
    cssValue: '"Merriweather", Georgia, "Times New Roman", serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "Merriweather:wght@300;400;700",
  },
  {
    id: "lora",
    name: "Lora",
    category: "serif",
    cssValue: '"Lora", Georgia, serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "Lora:wght@400;500;600;700",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    category: "serif",
    cssValue: '"Playfair Display", Georgia, serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "Playfair+Display:wght@400;500;600;700",
  },
  {
    id: "crimson-pro",
    name: "Crimson Pro",
    category: "serif",
    cssValue: '"Crimson Pro", Georgia, serif',
    preview: "The quick brown fox jumps over the lazy dog",
    googleFamily: "Crimson+Pro:wght@300;400;600;700",
  },
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    category: "monospace",
    cssValue: '"JetBrains Mono", "SF Mono", "Fira Code", Menlo, monospace',
    preview: "const fn = () => { return 42; }",
    googleFamily: "JetBrains+Mono:wght@400;500;600",
  },
  {
    id: "fira-code",
    name: "Fira Code",
    category: "monospace",
    cssValue: '"Fira Code", "JetBrains Mono", Menlo, monospace',
    preview: "const fn = () => { return 42; }",
    googleFamily: "Fira+Code:wght@400;500;600",
  },
];

export function getFontCssValue(fontId: FontFamily): string {
  const found = FONT_OPTIONS.find((f) => f.id === fontId);
  return found?.cssValue ?? FONT_OPTIONS[0].cssValue;
}

export function getFontOption(fontId: FontFamily): FontOption {
  return FONT_OPTIONS.find((f) => f.id === fontId) ?? FONT_OPTIONS[0];
}

/* ─── Accent Color Definitions ─── */

export interface AccentColorOption {
  id: AccentColor;
  name: string;
  light: string;
  dark: string;
  lightHover: string;
  darkHover: string;
  lightMuted: string;
  darkMuted: string;
  swatch: string;
}

export const ACCENT_COLORS: AccentColorOption[] = [
  {
    id: "blue",
    name: "Blue",
    dark: "#0a84ff",
    light: "#007aff",
    darkHover: "#409cff",
    lightHover: "#0063cc",
    darkMuted: "rgba(10, 132, 255, 0.2)",
    lightMuted: "rgba(0, 122, 255, 0.15)",
    swatch: "#0a84ff",
  },
  {
    id: "purple",
    name: "Purple",
    dark: "#bf5af2",
    light: "#a855f7",
    darkHover: "#d68ff7",
    lightHover: "#7c3aed",
    darkMuted: "rgba(191, 90, 242, 0.2)",
    lightMuted: "rgba(168, 85, 247, 0.15)",
    swatch: "#a855f7",
  },
  {
    id: "indigo",
    name: "Indigo",
    dark: "#6366f1",
    light: "#4f46e5",
    darkHover: "#818cf8",
    lightHover: "#4338ca",
    darkMuted: "rgba(99, 102, 241, 0.2)",
    lightMuted: "rgba(79, 70, 229, 0.15)",
    swatch: "#6366f1",
  },
  {
    id: "green",
    name: "Green",
    dark: "#30d158",
    light: "#16a34a",
    darkHover: "#65e388",
    lightHover: "#15803d",
    darkMuted: "rgba(48, 209, 88, 0.2)",
    lightMuted: "rgba(22, 163, 74, 0.15)",
    swatch: "#30d158",
  },
  {
    id: "teal",
    name: "Teal",
    dark: "#2dd4bf",
    light: "#0891b2",
    darkHover: "#5eead4",
    lightHover: "#0e7490",
    darkMuted: "rgba(45, 212, 191, 0.2)",
    lightMuted: "rgba(8, 145, 178, 0.15)",
    swatch: "#2dd4bf",
  },
  {
    id: "cyan",
    name: "Cyan",
    dark: "#22d3ee",
    light: "#0e7490",
    darkHover: "#67e8f9",
    lightHover: "#155e75",
    darkMuted: "rgba(34, 211, 238, 0.2)",
    lightMuted: "rgba(14, 116, 144, 0.15)",
    swatch: "#22d3ee",
  },
  {
    id: "orange",
    name: "Orange",
    dark: "#ff9f0a",
    light: "#ea580c",
    darkHover: "#ffb340",
    lightHover: "#c2410c",
    darkMuted: "rgba(255, 159, 10, 0.2)",
    lightMuted: "rgba(234, 88, 12, 0.15)",
    swatch: "#ff9f0a",
  },
  {
    id: "rose",
    name: "Rose",
    dark: "#ff375f",
    light: "#e11d48",
    darkHover: "#ff6b88",
    lightHover: "#be123c",
    darkMuted: "rgba(255, 55, 95, 0.2)",
    lightMuted: "rgba(225, 29, 72, 0.15)",
    swatch: "#e11d48",
  },
  {
    id: "pink",
    name: "Pink",
    dark: "#f472b6",
    light: "#db2777",
    darkHover: "#f9a8d4",
    lightHover: "#9d174d",
    darkMuted: "rgba(244, 114, 182, 0.2)",
    lightMuted: "rgba(219, 39, 119, 0.15)",
    swatch: "#f472b6",
  },
  {
    id: "amber",
    name: "Amber",
    dark: "#fbbf24",
    light: "#d97706",
    darkHover: "#fcd34d",
    lightHover: "#b45309",
    darkMuted: "rgba(251, 191, 36, 0.2)",
    lightMuted: "rgba(217, 119, 6, 0.15)",
    swatch: "#fbbf24",
  },
];

export function getAccentColor(id: AccentColor): AccentColorOption {
  return ACCENT_COLORS.find((c) => c.id === id) ?? ACCENT_COLORS[0];
}

/** Build a Google Fonts URL for all custom fonts. */
export function getGoogleFontsUrl(): string {
  const families = FONT_OPTIONS
    .filter((f) => f.googleFamily)
    .map((f) => `family=${f.googleFamily}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
