import { motion } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { cn } from "@utils/cn";
import type { AppPreferences } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * ThemeToggle — Dark / Light / System theme picker
 * ───────────────────────────────────────────────────────────── */

type Theme = AppPreferences["theme"];

const THEMES: { id: Theme; label: string; icon: React.ReactNode }[] = [
  { id: "dark", label: "Dark", icon: <MoonIcon /> },
  { id: "light", label: "Light", icon: <SunIcon /> },
  { id: "system", label: "System", icon: <SystemIcon /> },
];

export function ThemeToggle() {
  const theme = useAppStore((s) => s.preferences.theme);
  const updatePreferences = useAppStore((s) => s.updatePreferences);

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-ragnar-bg-tertiary p-0.5">
      {THEMES.map((t) => (
        <motion.button
          key={t.id}
          whileTap={{ scale: 0.93 }}
          onClick={() => updatePreferences({ theme: t.id })}
          title={`${t.label} theme`}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-all",
            theme === t.id
              ? "bg-ragnar-bg-secondary text-ragnar-text-primary shadow-sm"
              : "text-ragnar-text-muted hover:text-ragnar-text-primary",
          )}
        >
          {t.icon}
          <span>{t.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Icons ── */
function MoonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M10 6.5A5 5 0 015.5 2a5 5 0 100 8 5 5 0 004.5-3.5z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="2" />
      <line x1="6" y1="1" x2="6" y2="2.5" />
      <line x1="6" y1="9.5" x2="6" y2="11" />
      <line x1="1" y1="6" x2="2.5" y2="6" />
      <line x1="9.5" y1="6" x2="11" y2="6" />
    </svg>
  );
}
function SystemIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="1.5" width="10" height="7" rx="1.5" />
      <line x1="4" y1="10.5" x2="8" y2="10.5" />
      <line x1="6" y1="8.5" x2="6" y2="10.5" />
    </svg>
  );
}
