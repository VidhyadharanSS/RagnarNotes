import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore, DEFAULT_PREFERENCES } from "@stores/appStore";

describe("appStore", () => {
  beforeEach(() => {
    useAppStore.setState({
      isSidebarVisible: true,
      sidebarRoute: "all-notes",
      isCommandPaletteOpen: false,
      preferences: { ...DEFAULT_PREFERENCES },
    });
  });

  describe("sidebar", () => {
    it("toggles sidebar visibility", () => {
      expect(useAppStore.getState().isSidebarVisible).toBe(true);
      useAppStore.getState().toggleSidebar();
      expect(useAppStore.getState().isSidebarVisible).toBe(false);
      useAppStore.getState().toggleSidebar();
      expect(useAppStore.getState().isSidebarVisible).toBe(true);
    });

    it("sets sidebar route", () => {
      useAppStore.getState().setSidebarRoute("favorites");
      expect(useAppStore.getState().sidebarRoute).toBe("favorites");

      useAppStore.getState().setSidebarRoute("trash");
      expect(useAppStore.getState().sidebarRoute).toBe("trash");
    });
  });

  describe("command palette", () => {
    it("opens command palette", () => {
      useAppStore.getState().openCommandPalette();
      expect(useAppStore.getState().isCommandPaletteOpen).toBe(true);
    });

    it("closes command palette", () => {
      useAppStore.getState().openCommandPalette();
      useAppStore.getState().closeCommandPalette();
      expect(useAppStore.getState().isCommandPaletteOpen).toBe(false);
    });

    it("toggles command palette", () => {
      useAppStore.getState().toggleCommandPalette();
      expect(useAppStore.getState().isCommandPaletteOpen).toBe(true);
      useAppStore.getState().toggleCommandPalette();
      expect(useAppStore.getState().isCommandPaletteOpen).toBe(false);
    });
  });

  describe("preferences", () => {
    it("updates individual preferences", () => {
      useAppStore.getState().updatePreferences({ fontSize: 18 });
      expect(useAppStore.getState().preferences.fontSize).toBe(18);
      // Other preferences unchanged
      expect(useAppStore.getState().preferences.theme).toBe("dark");
    });

    it("updates multiple preferences at once", () => {
      useAppStore.getState().updatePreferences({
        theme: "light",
        fontSize: 20,
        spellCheck: false,
      });

      const prefs = useAppStore.getState().preferences;
      expect(prefs.theme).toBe("light");
      expect(prefs.fontSize).toBe(20);
      expect(prefs.spellCheck).toBe(false);
    });

    it("resets preferences to defaults", () => {
      useAppStore.getState().updatePreferences({ theme: "light", fontSize: 22 });
      useAppStore.getState().resetPreferences();

      const prefs = useAppStore.getState().preferences;
      expect(prefs.theme).toBe(DEFAULT_PREFERENCES.theme);
      expect(prefs.fontSize).toBe(DEFAULT_PREFERENCES.fontSize);
    });

    it("preserves default auto-save interval", () => {
      expect(useAppStore.getState().preferences.autoSaveIntervalMs).toBe(2000);
    });
  });
});
