import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { SidebarRoute, AppPreferences } from "@/types";

/**
 * App Store — v1.1.0
 *
 * Changes:
 *  - Added fontFamily, accentColor, editorMaxWidth, showWordCount, compactMode to preferences
 */

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
  resetPreferences: () => void;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: "dark",
  fontSize: 15,
  lineHeight: 1.75,
  spellCheck: true,
  vaultPath: "",
  autoSaveIntervalMs: 2000,
  fontFamily: "inter",
  accentColor: "blue",
  editorMaxWidth: 740,
  showWordCount: true,
  compactMode: false,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
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

        resetPreferences: () =>
          set({ preferences: DEFAULT_PREFERENCES }, false, "resetPreferences"),
      }),
      {
        name: "ragnar-app-store",
        partialize: (s) => ({
          isSidebarVisible: s.isSidebarVisible,
          sidebarRoute: s.sidebarRoute,
          preferences: s.preferences,
        }),
      },
    ),
    { name: "RagnarNotes/App" },
  ),
);
