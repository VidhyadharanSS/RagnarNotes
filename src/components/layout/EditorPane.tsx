import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@stores/editorStore";
import { MarkdownEditor } from "@components/editor/MarkdownEditor";
import { MarkdownPreview } from "@components/editor/MarkdownPreview";
import { EditorToolbar } from "@components/editor/EditorToolbar";
import { StatusBar } from "@components/editor/StatusBar";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * EditorPane — The main content area (right side)
 *
 * Renders differently based on editor mode:
 *  - edit     → MarkdownEditor (full WYSIWYG textarea)
 *  - readonly → MarkdownPreview (beautifully rendered, not editable)
 *  - zen      → MarkdownEditor centered, sidebars hidden, dimmed chrome
 *
 * Also handles split-view: editor | preview side by side.
 * ───────────────────────────────────────────────────────────── */

export function EditorPane() {
  const activeNote = useEditorStore((s) => s.activeNote);
  const mode = useEditorStore((s) => s.mode);
  const isSplitView = useEditorStore((s) => s.isSplitView);
  const isZen = mode === "zen";

  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col overflow-hidden",
        "bg-ragnar-bg-primary",
        isZen && "bg-[#111113]",
      )}
    >
      {!activeNote ? (
        <WelcomeScreen />
      ) : (
        <>
          {/* Toolbar — hidden in zen mode */}
          <AnimatePresence>
            {!isZen && (
              <motion.div
                key="toolbar"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <EditorToolbar />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content area */}
          <div
            className={cn(
              "flex flex-1 overflow-hidden",
              isZen && "items-start justify-center pt-16",
            )}
          >
            {isSplitView && !isZen ? (
              <SplitView />
            ) : mode === "readonly" ? (
              <MarkdownPreview />
            ) : (
              <MarkdownEditor />
            )}
          </div>

          {/* Status bar — hidden in zen mode */}
          <AnimatePresence>
            {!isZen && (
              <motion.div
                key="statusbar"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
              >
                <StatusBar />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/* ── Split view: editor + preview side by side ── */
function SplitView() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-hidden border-r border-ragnar-border-subtle">
        <MarkdownEditor />
      </div>
      <div className="flex-1 overflow-hidden">
        <MarkdownPreview />
      </div>
    </div>
  );
}

/* ── Welcome Screen (no note selected) ── */
function WelcomeScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
    >
      {/* Logo mark */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ragnar-accent/10 text-ragnar-accent">
        <RagnarLogo />
      </div>

      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-ragnar-text-primary">
          Ragnar Notes
        </h1>
        <p className="mt-1.5 max-w-sm text-[14px] text-ragnar-text-secondary">
          The note-taking app built for the way you think. Fast, local-first,
          and beautifully crafted.
        </p>
      </div>

      <div className="mt-2 flex flex-col items-center gap-2">
        <Tip icon="⌘K" text="Open command palette to search or create notes" />
        <Tip icon="⌘N" text="Create a new note instantly" />
        <Tip icon="⌘\\" text="Enter focus / zen mode" />
      </div>
    </motion.div>
  );
}

function Tip({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-ragnar-bg-hover px-4 py-2.5">
      <kbd className="rounded bg-ragnar-bg-tertiary px-2 py-0.5 font-mono text-[12px] text-ragnar-text-secondary">
        {icon}
      </kbd>
      <span className="text-[13px] text-ragnar-text-muted">{text}</span>
    </div>
  );
}

function RagnarLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4h14l6 6v18H6V4z" />
      <path d="M20 4v6h6" />
      <line x1="10" y1="14" x2="22" y2="14" />
      <line x1="10" y1="18" x2="22" y2="18" />
      <line x1="10" y1="22" x2="16" y2="22" />
    </svg>
  );
}
