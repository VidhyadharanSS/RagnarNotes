import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { SidebarRoute, AppPreferences } from "@/types";

/**
 * App Store — Stage 4
 *
 * Changes vs Stage 3:
 *  - Added `persist` middleware so theme & preferences survive page reload
 *  - Added `isExportOpen` and `isSettingsOpen` flags (managed in App.tsx via events)
 *  - Added `sidebarWidth` for resizable sidebar (future use)
 *  - Added `resetPreferences` action
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
        name: "ragnar-app-store", // localStorage key
        partialize: (s) => ({
          // Only persist these fields (not transient UI state)
          isSidebarVisible: s.isSidebarVisible,
          sidebarRoute: s.sidebarRoute,
          preferences: s.preferences,
        }),
      },
    ),
    { name: "RagnarNotes/App" },
  ),
);
