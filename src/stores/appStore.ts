import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { SidebarRoute, AppPreferences } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * App Store — Global application state
 *
 * Manages: sidebar visibility, current route, preferences,
 *          command palette toggle, and global UI flags.
 * ───────────────────────────────────────────────────────────── */

interface AppState {
  // ── Sidebar ──
  isSidebarVisible: boolean;
  sidebarRoute: SidebarRoute;

  // ── Command palette ──
  isCommandPaletteOpen: boolean;

  // ── Preferences ──
  preferences: AppPreferences;

  // ── Actions ──
  toggleSidebar: () => void;
  setSidebarRoute: (route: SidebarRoute) => void;
  toggleCommandPalette: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  updatePreferences: (partial: Partial<AppPreferences>) => void;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: "dark",
  fontSize: 16,
  lineHeight: 1.7,
  spellCheck: true,
  vaultPath: "",
  autoSaveIntervalMs: 2000,
};

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // ── Initial state ──
      isSidebarVisible: true,
      sidebarRoute: "all-notes",
      isCommandPaletteOpen: false,
      preferences: DEFAULT_PREFERENCES,

      // ── Actions ──
      toggleSidebar: () =>
        set((s) => ({ isSidebarVisible: !s.isSidebarVisible }), false, "toggleSidebar"),

      setSidebarRoute: (route) =>
        set({ sidebarRoute: route }, false, "setSidebarRoute"),

      toggleCommandPalette: () =>
        set(
          (s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen }),
          false,
          "toggleCommandPalette",
        ),

      openCommandPalette: () =>
        set({ isCommandPaletteOpen: true }, false, "openCommandPalette"),

      closeCommandPalette: () =>
        set({ isCommandPaletteOpen: false }, false, "closeCommandPalette"),

      updatePreferences: (partial) =>
        set(
          (s) => ({ preferences: { ...s.preferences, ...partial } }),
          false,
          "updatePreferences",
        ),
    }),
    { name: "RagnarNotes/App" },
  ),
);
