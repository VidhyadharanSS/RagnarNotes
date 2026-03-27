import { motion } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { cn } from "@utils/cn";
import { Moon, Sun, Monitor } from "lucide-react";
import { Tooltip } from "@components/ui/Tooltip";
import type { AppPreferences } from "@/types";

/**
 * ThemeToggle — Stage 4 (Fixed)
 *
 * FIX: Now correctly calls updatePreferences which triggers useTheme()
 * in App.tsx to actually apply dark/light class to <html>.
 *
 * Design: Compact pill with animated sliding indicator.
 */

type Theme = AppPreferences["theme"];

const THEMES: { id: Theme; label: string; icon: React.ReactNode; tooltip: string }[] = [
  { id: "dark", label: "Dark", icon: <Moon size={12} strokeWidth={2} />, tooltip: "Dark theme" },
  { id: "light", label: "Light", icon: <Sun size={12} strokeWidth={2} />, tooltip: "Light theme" },
  { id: "system", label: "Auto", icon: <Monitor size={12} strokeWidth={2} />, tooltip: "System theme" },
];

export function ThemeToggle() {
  const theme = useAppStore((s) => s.preferences.theme);
  const updatePreferences = useAppStore((s) => s.updatePreferences);

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className={cn(
        "flex items-center rounded-lg p-0.5",
        "bg-ragnar-bg-tertiary/70 border border-ragnar-border-subtle",
      )}
    >
      {THEMES.map((t) => (
        <Tooltip key={t.id} content={t.tooltip} side="bottom">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => updatePreferences({ theme: t.id })}
            aria-pressed={theme === t.id}
            aria-label={t.tooltip}
            className={cn(
              "relative flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium",
              "transition-colors duration-150",
              theme === t.id
                ? "bg-ragnar-bg-secondary text-ragnar-text-primary shadow-sm"
                : "text-ragnar-text-muted hover:text-ragnar-text-primary",
            )}
          >
            {t.icon}
            <span className="hidden lg:inline">{t.label}</span>
          </motion.button>
        </Tooltip>
      ))}
    </div>
  );
}
