import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { useClickOutside } from "@hooks/useClickOutside";
import { FONT_OPTIONS, ACCENT_COLORS } from "@utils/fonts";
import { toast } from "@components/ui/Toast";
import { cn } from "@utils/cn";
import {
  X,
  Settings,
  Type,
  Palette,
  Moon,
  Sun,
  Monitor,
  RotateCcw,
  HardDrive,
  Sliders,
  Eye,
  AlignJustify,
  ZapOff,
  Check,
} from "lucide-react";
import type { AppPreferences } from "@/types";

/* ─────────────────────────────────────────────────────────────
 * SettingsPanel — v1.1.0
 *
 * Sections:
 *  ① Appearance  — Theme (Dark / Light / System)
 *  ② Typography  — 14 font families (sans, serif, mono) + size + line-height
 *  ③ Accent Color — 10 color swatches
 *  ④ Editor      — Max width, spell check, compact mode, word count
 *  ⑤ Data        — Auto-save interval, Storage manager shortcut
 * ───────────────────────────────────────────────────────────── */

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

  function update<K extends keyof AppPreferences>(key: K, val: AppPreferences[K]) {
    updatePreferences({ [key]: val });
  }

  function handleReset() {
    resetPreferences();
    toast.success("Settings reset to defaults");
  }

  const sansSerif = FONT_OPTIONS.filter((f) => f.category === "sans-serif");
  const serif = FONT_OPTIONS.filter((f) => f.category === "serif");
  const mono = FONT_OPTIONS.filter((f) => f.category === "monospace");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[150] bg-black"
            onClick={onClose}
          />

          <motion.div
            key="settings-panel"
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className={cn(
              "fixed right-0 top-0 z-[151] h-full w-full max-w-[420px]",
              "border-l border-ragnar-border",
              "bg-ragnar-bg-secondary",
              "shadow-[-24px_0_80px_rgba(0,0,0,0.45)]",
              "flex flex-col overflow-hidden",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ragnar-border-subtle px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ragnar-accent/10">
                  <Settings size={15} className="text-ragnar-accent" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-ragnar-text-primary">Settings</h2>
                  <p className="text-[11px] text-ragnar-text-muted">Customize your experience</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  title="Reset to defaults"
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary"
                >
                  <RotateCcw size={11} />
                  Reset
                </motion.button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-ragnar-text-muted transition-colors hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-7">

              {/* ── Section 1: Appearance ── */}
              <Section icon={<Sun size={13} />} title="Appearance">
                <label className="mb-2 block text-[11px] font-medium text-ragnar-text-muted">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["dark", "light", "system"] as const).map((t) => (
                    <ThemeButton
                      key={t}
                      id={t}
                      active={preferences.theme === t}
                      onClick={() => update("theme", t)}
                    />
                  ))}
                </div>
              </Section>

              {/* ── Section 2: Typography ── */}
              <Section icon={<Type size={13} />} title="Typography">
                <label className="mb-2 block text-[11px] font-medium text-ragnar-text-muted">Font Family</label>

                <FontCategoryLabel label="Sans-serif" />
                <div className="mb-3 grid grid-cols-2 gap-1.5">
                  {sansSerif.map((font) => (
                    <FontCard
                      key={font.id}
                      name={font.name}
                      preview={font.preview}
                      cssValue={font.cssValue}
                      active={preferences.fontFamily === font.id}
                      onClick={() => update("fontFamily", font.id as AppPreferences["fontFamily"])}
                    />
                  ))}
                </div>

                <FontCategoryLabel label="Serif" />
                <div className="mb-3 grid grid-cols-2 gap-1.5">
                  {serif.map((font) => (
                    <FontCard
                      key={font.id}
                      name={font.name}
                      preview={font.preview}
                      cssValue={font.cssValue}
                      active={preferences.fontFamily === font.id}
                      onClick={() => update("fontFamily", font.id as AppPreferences["fontFamily"])}
                    />
                  ))}
                </div>

                <FontCategoryLabel label="Monospace" />
                <div className="mb-4 grid grid-cols-2 gap-1.5">
                  {mono.map((font) => (
                    <FontCard
                      key={font.id}
                      name={font.name}
                      preview={font.preview}
                      cssValue={font.cssValue}
                      active={preferences.fontFamily === font.id}
                      onClick={() => update("fontFamily", font.id as AppPreferences["fontFamily"])}
                    />
                  ))}
                </div>

                {/* Font size */}
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[11px] font-medium text-ragnar-text-muted">Font Size</label>
                    <span className="text-[12px] font-semibold text-ragnar-text-primary">{preferences.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={22}
                    step={1}
                    value={preferences.fontSize}
                    onChange={(e) => update("fontSize", Number(e.target.value))}
                    className="range-slider w-full"
                    style={{
                      background: `linear-gradient(to right, var(--ragnar-accent) 0%, var(--ragnar-accent) ${((preferences.fontSize - 12) / 10) * 100}%, var(--ragnar-bg-tertiary) ${((preferences.fontSize - 12) / 10) * 100}%, var(--ragnar-bg-tertiary) 100%)`,
                    }}
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-ragnar-text-muted/60">
                    <span>12px</span><span>22px</span>
                  </div>
                </div>

                {/* Line height */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[11px] font-medium text-ragnar-text-muted">Line Height</label>
                    <span className="text-[12px] font-semibold text-ragnar-text-primary">{preferences.lineHeight.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={1.3}
                    max={2.4}
                    step={0.05}
                    value={preferences.lineHeight}
                    onChange={(e) => update("lineHeight", Number(e.target.value))}
                    className="range-slider w-full"
                    style={{
                      background: `linear-gradient(to right, var(--ragnar-accent) 0%, var(--ragnar-accent) ${((preferences.lineHeight - 1.3) / 1.1) * 100}%, var(--ragnar-bg-tertiary) ${((preferences.lineHeight - 1.3) / 1.1) * 100}%, var(--ragnar-bg-tertiary) 100%)`,
                    }}
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-ragnar-text-muted/60">
                    <span>Compact</span><span>Spacious</span>
                  </div>
                </div>
              </Section>

              {/* ── Section 3: Accent Color ── */}
              <Section icon={<Palette size={13} />} title="Accent Color">
                <label className="mb-3 block text-[11px] font-medium text-ragnar-text-muted">
                  Choose an accent color
                </label>
                <div className="grid grid-cols-5 gap-2.5">
                  {ACCENT_COLORS.map((color) => (
                    <motion.button
                      key={color.id}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => update("accentColor", color.id as AppPreferences["accentColor"])}
                      title={color.name}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <div
                        className="relative h-8 w-8 rounded-full shadow-sm transition-shadow hover:shadow-md"
                        style={{ backgroundColor: color.swatch }}
                      >
                        {preferences.accentColor === color.id && (
                          <>
                            <motion.div
                              layoutId="accent-check"
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Check size={14} className="text-white drop-shadow" strokeWidth={3} />
                            </motion.div>
                            <div
                              className="absolute -inset-1 rounded-full border-2 opacity-60"
                              style={{ borderColor: color.swatch }}
                            />
                          </>
                        )}
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium leading-none transition-colors",
                        preferences.accentColor === color.id
                          ? "text-ragnar-text-primary"
                          : "text-ragnar-text-muted group-hover:text-ragnar-text-secondary",
                      )}>
                        {color.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </Section>

              {/* ── Section 4: Editor ── */}
              <Section icon={<Sliders size={13} />} title="Editor">
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[11px] font-medium text-ragnar-text-muted">Editor Width (Zen mode)</label>
                    <span className="text-[12px] font-semibold text-ragnar-text-primary">{preferences.editorMaxWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={1100}
                    step={20}
                    value={preferences.editorMaxWidth}
                    onChange={(e) => update("editorMaxWidth", Number(e.target.value))}
                    className="range-slider w-full"
                    style={{
                      background: `linear-gradient(to right, var(--ragnar-accent) 0%, var(--ragnar-accent) ${((preferences.editorMaxWidth - 500) / 600) * 100}%, var(--ragnar-bg-tertiary) ${((preferences.editorMaxWidth - 500) / 600) * 100}%, var(--ragnar-bg-tertiary) 100%)`,
                    }}
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-ragnar-text-muted/60">
                    <span>Narrow</span><span>Wide</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <ToggleRow
                    icon={<Eye size={13} />}
                    label="Spell Check"
                    description="Underline misspelled words"
                    value={preferences.spellCheck}
                    onChange={(v) => update("spellCheck", v)}
                  />
                  <ToggleRow
                    icon={<AlignJustify size={13} />}
                    label="Show Word Count"
                    description="Display word count in status bar"
                    value={preferences.showWordCount}
                    onChange={(v) => update("showWordCount", v)}
                  />
                  <ToggleRow
                    icon={<ZapOff size={13} />}
                    label="Compact Mode"
                    description="Reduce note list item spacing"
                    value={preferences.compactMode}
                    onChange={(v) => update("compactMode", v)}
                  />
                </div>
              </Section>

              {/* ── Section 5: Saving & Data ── */}
              <Section icon={<HardDrive size={13} />} title="Saving & Data">
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[11px] font-medium text-ragnar-text-muted">Auto-save delay</label>
                    <span className="text-[12px] font-semibold text-ragnar-text-primary">
                      {(preferences.autoSaveIntervalMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={500}
                    value={preferences.autoSaveIntervalMs}
                    onChange={(e) => update("autoSaveIntervalMs", Number(e.target.value))}
                    className="range-slider w-full"
                    style={{
                      background: `linear-gradient(to right, var(--ragnar-accent) 0%, var(--ragnar-accent) ${((preferences.autoSaveIntervalMs - 500) / 9500) * 100}%, var(--ragnar-bg-tertiary) ${((preferences.autoSaveIntervalMs - 500) / 9500) * 100}%, var(--ragnar-bg-tertiary) 100%)`,
                    }}
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-ragnar-text-muted/60">
                    <span>0.5s (instant)</span><span>10s (slow)</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    setTimeout(() => window.dispatchEvent(new Event("ragnar-open-storage")), 150);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border",
                    "border-ragnar-border-subtle px-4 py-3",
                    "text-ragnar-text-secondary transition-all",
                    "hover:border-ragnar-border hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <HardDrive size={14} className="text-ragnar-accent" />
                    <div className="text-left">
                      <p className="text-[13px] font-medium">Storage Manager</p>
                      <p className="text-[11px] text-ragnar-text-muted">View usage, import/export, clear data</p>
                    </div>
                  </div>
                  <span className="text-ragnar-text-muted text-[14px]">→</span>
                </motion.button>
              </Section>

            </div>

            {/* Footer */}
            <div className="border-t border-ragnar-border-subtle px-5 py-3">
              <p className="text-center text-[11px] text-ragnar-text-muted/50">
                Ragnar Notes v1.1.0 · Local-first · No cloud sync
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Sub-components ── */

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-ragnar-accent">{icon}</span>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-ragnar-text-muted">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FontCategoryLabel({ label }: { label: string }) {
  return (
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ragnar-text-muted/50">
      {label}
    </p>
  );
}

function FontCard({
  name,
  preview,
  cssValue,
  active,
  onClick,
}: {
  name: string;
  preview: string;
  cssValue: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-1 rounded-xl border p-2.5 text-left transition-all",
        active
          ? "border-ragnar-accent bg-ragnar-accent/8"
          : "border-ragnar-border-subtle hover:border-ragnar-border hover:bg-ragnar-bg-hover",
      )}
    >
      {active && (
        <motion.div
          layoutId="font-active-dot"
          className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ragnar-accent"
        />
      )}
      <span className="text-[11px] font-semibold text-ragnar-text-primary leading-none">{name}</span>
      <span
        className="truncate text-[10px] text-ragnar-text-muted leading-snug opacity-80"
        style={{ fontFamily: cssValue }}
      >
        {preview.slice(0, 30)}
      </span>
    </motion.button>
  );
}

function ThemeButton({ id, active, onClick }: { id: "dark" | "light" | "system"; active: boolean; onClick: () => void }) {
  const icons = { dark: <Moon size={15} />, light: <Sun size={15} />, system: <Monitor size={15} /> };
  const labels = { dark: "Dark", light: "Light", system: "Auto" };
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all",
        active
          ? "border-ragnar-accent bg-ragnar-accent/8 text-ragnar-accent"
          : "border-ragnar-border-subtle text-ragnar-text-muted hover:border-ragnar-border hover:bg-ragnar-bg-hover",
      )}
    >
      {icons[id]}
      <span className="text-[11px] font-medium">{labels[id]}</span>
    </motion.button>
  );
}

function ToggleRow({
  icon, label, description, value, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ragnar-border-subtle px-3.5 py-2.5 transition-colors hover:bg-ragnar-bg-hover/50">
      <div className="flex items-center gap-2.5">
        <span className="text-ragnar-text-muted">{icon}</span>
        <div>
          <p className="text-[12px] font-medium text-ragnar-text-primary">{label}</p>
          <p className="text-[10px] text-ragnar-text-muted">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-checked={value}
        role="switch"
        className={cn(
          "relative h-5 w-9 flex-shrink-0 rounded-full transition-all duration-200",
          value ? "bg-ragnar-accent" : "bg-ragnar-bg-tertiary",
        )}
      >
        <motion.span
          animate={{ x: value ? 16 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
          style={{ left: 0 }}
        />
      </button>
    </div>
  );
}
