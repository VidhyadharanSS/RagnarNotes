import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { useClickOutside } from "@hooks/useClickOutside";
import { toast } from "@components/ui/Toast";
import { cn } from "@utils/cn";
import {
  X,
  Settings,
  Type,
  AlignLeft,
  SpellCheck,
  Clock,
  Palette,
  Moon,
  Sun,
  Monitor,
  RotateCcw,
  Info,
} from "lucide-react";
import type { AppPreferences } from "@/types";

/**
 * SettingsPanel — Stage 4
 *
 * Improvements over Stage 3:
 *  - Reset to defaults button with toast confirmation
 *  - Version info footer
 *  - Better section organization
 *  - Keyboard shortcut to close (Escape)
 *  - Smooth entrance animation from right
 */

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const preferences = useAppStore((s) => s.preferences);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const resetPreferences = useAppStore((s) => s.resetPreferences);

  useClickOutside(panelRef, isOpen ? onClose : () => {});

  function handleReset() {
    resetPreferences();
    toast.info("Settings reset to defaults");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[150] bg-black"
          />

          {/* Panel */}
          <motion.div
            key="settings-panel"
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className={cn(
              "fixed right-0 top-0 z-[151] h-full w-full max-w-[380px]",
              "border-l border-ragnar-border bg-ragnar-bg-secondary",
              "shadow-[-20px_0_60px_rgba(0,0,0,0.35)]",
              "flex flex-col overflow-hidden",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ragnar-accent/10">
                  <Settings size={15} className="text-ragnar-accent" />
                </div>
                <h2 className="text-[15px] font-bold text-ragnar-text-primary">
                  Settings
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-7">

              {/* ── Appearance ── */}
              <SettingSection
                icon={<Palette size={14} />}
                title="Appearance"
                description="Color theme"
              >
                <div className="grid grid-cols-3 gap-2">
                  {(["dark", "light", "system"] as const).map((th) => (
                    <ThemeCard
                      key={th}
                      theme={th}
                      isActive={preferences.theme === th}
                      onClick={() => {
                        updatePreferences({ theme: th });
                        toast.info(`Theme set to ${th}`);
                      }}
                    />
                  ))}
                </div>
              </SettingSection>

              {/* ── Font Size ── */}
              <SettingSection
                icon={<Type size={14} />}
                title="Editor Font Size"
                description={`${preferences.fontSize}px`}
              >
                <RangeSlider
                  value={preferences.fontSize}
                  min={12}
                  max={22}
                  step={1}
                  onChange={(v) => updatePreferences({ fontSize: v })}
                  labels={["12px", "17px", "22px"]}
                />
              </SettingSection>

              {/* ── Line Height ── */}
              <SettingSection
                icon={<AlignLeft size={14} />}
                title="Line Height"
                description={`${preferences.lineHeight}× spacing`}
              >
                <RangeSlider
                  value={preferences.lineHeight}
                  min={1.3}
                  max={2.2}
                  step={0.05}
                  onChange={(v) =>
                    updatePreferences({ lineHeight: Math.round(v * 20) / 20 })
                  }
                  labels={["Tight", "Normal", "Loose"]}
                />
              </SettingSection>

              {/* ── Spell Check ── */}
              <SettingSection
                icon={<SpellCheck size={14} />}
                title="Spell Check"
                description="Browser-native spell checking"
              >
                <ToggleSwitch
                  checked={preferences.spellCheck}
                  onChange={(v) => {
                    updatePreferences({ spellCheck: v });
                    toast.info(`Spell check ${v ? "enabled" : "disabled"}`);
                  }}
                />
              </SettingSection>

              {/* ── Auto-Save ── */}
              <SettingSection
                icon={<Clock size={14} />}
                title="Auto-Save Interval"
                description={`Saves every ${preferences.autoSaveIntervalMs / 1000}s`}
              >
                <div className="flex gap-2 flex-wrap">
                  {[500, 1000, 2000, 5000, 10000].map((ms) => (
                    <motion.button
                      key={ms}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        updatePreferences({ autoSaveIntervalMs: ms });
                        toast.info(`Auto-save set to ${ms / 1000}s`);
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all",
                        preferences.autoSaveIntervalMs === ms
                          ? "border-ragnar-accent bg-ragnar-accent/8 text-ragnar-accent"
                          : "border-ragnar-border-subtle text-ragnar-text-muted hover:border-ragnar-border hover:text-ragnar-text-primary",
                      )}
                    >
                      {ms < 1000 ? `${ms}ms` : `${ms / 1000}s`}
                    </motion.button>
                  ))}
                </div>
              </SettingSection>

              {/* ── Keyboard Reference ── */}
              <SettingSection
                icon={<Info size={14} />}
                title="Keyboard Shortcuts"
                description="Global keybindings"
              >
                <div className="space-y-1.5 rounded-xl bg-ragnar-bg-hover/60 p-3">
                  {[
                    { key: "⌘K", action: "Command Palette" },
                    { key: "⌘N", action: "New Note" },
                    { key: "⌘.", action: "Focus / Zen Mode" },
                    { key: "⌘/", action: "Toggle Sidebar" },
                    { key: "⌘E", action: "Edit Mode" },
                    { key: "⌘⇧P", action: "Preview Mode" },
                    { key: "⌘⇧S", action: "Split View" },
                    { key: "⌘⇧E", action: "Export Note" },
                    { key: "⌘B", action: "Bold" },
                    { key: "⌘I", action: "Italic" },
                  ].map((s) => (
                    <div
                      key={s.key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[12px] text-ragnar-text-secondary">
                        {s.action}
                      </span>
                      <kbd className="rounded bg-ragnar-bg-tertiary px-2 py-0.5 font-mono text-[11px] text-ragnar-text-muted">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </SettingSection>
            </div>

            {/* Footer */}
            <div className="border-t border-ragnar-border-subtle px-5 py-3 space-y-2">
              {/* Reset */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl border",
                  "border-ragnar-border-subtle py-2 text-[12px] font-medium",
                  "text-ragnar-text-muted transition-all",
                  "hover:border-red-400/30 hover:text-red-400 hover:bg-red-500/5",
                )}
              >
                <RotateCcw size={12} />
                Reset to Defaults
              </motion.button>

              <p className="text-center text-[10px] text-ragnar-text-muted/50">
                Ragnar Notes v1.0.0 · Final Stage ·{" "}
                <a
                  href="https://github.com/VidhyadharanSS/RagnarNotes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-ragnar-text-muted transition-colors"
                >
                  GitHub
                </a>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Setting Section ── */
function SettingSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 text-ragnar-text-muted">{icon}</span>
        <div>
          <p className="text-[13px] font-semibold text-ragnar-text-primary">
            {title}
          </p>
          {description && (
            <p className="text-[11px] text-ragnar-text-muted">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Theme card ── */
function ThemeCard({
  theme,
  isActive,
  onClick,
}: {
  theme: AppPreferences["theme"];
  isActive: boolean;
  onClick: () => void;
}) {
  const config: Record<
    AppPreferences["theme"],
    { icon: React.ReactNode; label: string; bg: string }
  > = {
    dark: {
      icon: <Moon size={15} />,
      label: "Dark",
      bg: "#1c1c1e",
    },
    light: {
      icon: <Sun size={15} />,
      label: "Light",
      bg: "#f5f5f7",
    },
    system: {
      icon: <Monitor size={15} />,
      label: "Auto",
      bg: "linear-gradient(135deg, #1c1c1e 50%, #f5f5f7 50%)",
    },
  };

  const c = config[theme];

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
        isActive
          ? "border-ragnar-accent bg-ragnar-accent/8 shadow-sm"
          : "border-ragnar-border-subtle hover:border-ragnar-border hover:bg-ragnar-bg-hover",
      )}
    >
      <div
        className="flex h-10 w-full items-center justify-center rounded-lg border border-ragnar-border-subtle"
        style={{ background: c.bg }}
      >
        <span
          style={{
            color: theme === "light" ? "#1d1d1f" : theme === "dark" ? "#f5f5f7" : "#a1a1a6",
          }}
        >
          {c.icon}
        </span>
      </div>
      <span
        className={cn(
          "text-[11px] font-semibold",
          isActive ? "text-ragnar-accent" : "text-ragnar-text-muted",
        )}
      >
        {c.label}
      </span>
    </motion.button>
  );
}

/* ── Range slider ── */
function RangeSlider({
  value,
  min,
  max,
  step,
  onChange,
  labels,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  labels?: [string, string, string];
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="range-slider w-full"
        style={{
          background: `linear-gradient(to right, var(--ragnar-accent) 0%, var(--ragnar-accent) ${percentage}%, var(--ragnar-bg-tertiary) ${percentage}%, var(--ragnar-bg-tertiary) 100%)`,
        }}
      />
      {labels && (
        <div className="mt-1.5 flex justify-between text-[10px] text-ragnar-text-muted">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Toggle switch ── */
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <motion.button
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        checked ? "bg-ragnar-accent" : "bg-ragnar-bg-tertiary",
      )}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md"
      />
    </motion.button>
  );
}
