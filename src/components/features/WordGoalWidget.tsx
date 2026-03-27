import { useState } from "react";
import { motion } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { cn } from "@utils/cn";
import { Target, Trophy } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * WordGoalWidget — Stage 5: Set + track a daily word goal
 *
 * Shows a compact progress ring in the StatusBar.
 * Click to set a custom word goal target.
 * ───────────────────────────────────────────────────────────── */

interface WordGoalWidgetProps {
  compact?: boolean;
}

export function WordGoalWidget({ compact = true }: WordGoalWidgetProps) {
  const wordCount = useEditorStore((s) => s.wordCount);
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem("ragnar-word-goal");
    return saved ? parseInt(saved, 10) : 500;
  });
  const [showPicker, setShowPicker] = useState(false);

  const progress = goal > 0 ? Math.min((wordCount / goal) * 100, 100) : 0;
  const isComplete = progress >= 100;
  const circumference = 2 * Math.PI * 10;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  function handleGoalChange(newGoal: number) {
    setGoal(newGoal);
    localStorage.setItem("ragnar-word-goal", String(newGoal));
    setShowPicker(false);
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          title={`Word goal: ${wordCount}/${goal}`}
          className={cn(
            "flex items-center gap-1.5 rounded px-1.5 py-0.5",
            "text-ragnar-text-muted transition-colors",
            "hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
          )}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.15"
            />
            <motion.circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke={isComplete ? "#30d158" : "var(--ragnar-accent)"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              transform="rotate(-90 12 12)"
            />
            {isComplete && (
              <motion.text
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                x="12"
                y="12.5"
                textAnchor="middle"
                fontSize="8"
                fill="#30d158"
                fontWeight="bold"
              >
                ✓
              </motion.text>
            )}
          </svg>
          <span className="text-[10px]">
            {wordCount}/{goal}
          </span>
        </button>

        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "absolute bottom-full right-0 mb-2 z-50",
              "rounded-xl border border-ragnar-border bg-ragnar-bg-secondary/95",
              "glass-surface shadow-lg p-3 min-w-[160px]",
            )}
          >
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-ragnar-text-primary">
              <Target size={11} />
              Word Goal
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[100, 250, 500, 1000, 2000, 5000].map((g) => (
                <button
                  key={g}
                  onClick={() => handleGoalChange(g)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all",
                    goal === g
                      ? "bg-ragnar-accent text-white"
                      : "bg-ragnar-bg-tertiary text-ragnar-text-muted hover:text-ragnar-text-primary",
                  )}
                >
                  {g >= 1000 ? `${g / 1000}k` : g}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-ragnar-bg-hover/60 p-3">
      <div className="flex-shrink-0">
        {isComplete ? (
          <Trophy size={18} className="text-emerald-400" />
        ) : (
          <Target size={18} className="text-ragnar-accent" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-[12px] font-semibold text-ragnar-text-primary">
            {isComplete ? "Goal reached! 🎉" : "Daily Goal"}
          </p>
          <span className="text-[10px] text-ragnar-text-muted">
            {wordCount.toLocaleString()} / {goal.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ragnar-bg-tertiary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              isComplete ? "bg-emerald-500" : "bg-ragnar-accent",
            )}
          />
        </div>
      </div>
    </div>
  );
}
