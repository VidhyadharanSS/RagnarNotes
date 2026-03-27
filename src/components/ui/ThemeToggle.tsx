import { motion } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { cn } from "@utils/cn";
import { Moon, Sun, Monitor } from "lucide-react";
import type { AppPreferences } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * ThemeToggle — Stage 3: Compact pill-shaped theme selector
 * ───────────────────────────────────────────────────────────── */

type Theme = AppPreferences["theme"];

const THEMES: { id: Theme; label: string; icon: React.ReactNode }[] = [
  { id: "dark", label: "Dark", icon: <Moon size={11} /> },
  { id: "light", label: "Light", icon: <Sun size={11} /> },
  { id: "system", label: "Auto", icon: <Monitor size={11} /> },
];

export function ThemeToggle() {
  const theme = useAppStore((s) => s.preferences.theme);
  const updatePreferences = useAppStore((s) => s.updatePreferences);

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-ragnar-bg-tertiary/60 p-0.5">
      {THEMES.map((t) => (
        <motion.button
          key={t.id}
          whileTap={{ scale: 0.93 }}
          onClick={() => updatePreferences({ theme: t.id })}
          title={`${t.label} theme`}
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all",
            theme === t.id
              ? "bg-ragnar-bg-secondary text-ragnar-text-primary shadow-sm"
              : "text-ragnar-text-muted hover:text-ragnar-text-primary",
          )}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
