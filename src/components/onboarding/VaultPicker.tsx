import { motion } from "framer-motion";
import { useAppStore } from "@stores/appStore";
import { useNotesStore } from "@stores/notesStore";
import { SEED_NOTES, SEED_FOLDERS } from "@lib/seedData";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * VaultPicker — First-launch onboarding screen
 *
 * Shown when no vault path is configured.
 * In browser/dev mode, the "Open Demo Vault" button seeds the
 * store with sample data so the UI has content to show.
 *
 * Stage 4 will wire this to the real Tauri folder-picker dialog.
 * ───────────────────────────────────────────────────────────── */

export function VaultPicker() {
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const setNotes = useNotesStore((s) => s.setNotes);
  const setFolders = useNotesStore((s) => s.setFolders);

  function loadDemoVault() {
    setFolders(SEED_FOLDERS);
    setNotes(SEED_NOTES);
    const pinnedNoteIds = SEED_NOTES.filter((n) => n.frontmatter.pinned).map(
      (n) => n.id,
    );
    useNotesStore.setState({ pinnedNoteIds });
    updatePreferences({ vaultPath: "/demo-vault" });
  }

  async function openVaultDialog() {
    // In browser mode, fall back to demo vault
    // Stage 4 replaces this with: await invoke("open_vault_dialog")
    loadDemoVault();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-screen flex-col items-center justify-center bg-ragnar-bg-primary px-8"
    >
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--ragnar-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--ragnar-text-primary) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] bg-ragnar-accent/10 shadow-[0_0_60px_rgba(10,132,255,0.15)]"
        >
          <RagnarMark />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2 text-4xl font-bold tracking-tight text-ragnar-text-primary"
        >
          Ragnar Notes
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mb-10 max-w-sm text-[15px] leading-relaxed text-ragnar-text-secondary"
        >
          The note-taking app built for the way you think. Local-first,
          Markdown-native, beautifully fast.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="flex w-full flex-col gap-3"
        >
          <button
            onClick={openVaultDialog}
            className={cn(
              "flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4",
              "bg-ragnar-accent text-white text-[15px] font-semibold",
              "shadow-[0_4px_24px_rgba(10,132,255,0.35)]",
              "transition-all duration-150 hover:bg-ragnar-accent-hover hover:shadow-[0_4px_32px_rgba(10,132,255,0.5)]",
              "active:scale-[0.98]",
            )}
          >
            <FolderOpenIcon />
            Open Vault Folder
          </button>

          <button
            onClick={loadDemoVault}
            className={cn(
              "flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3.5",
              "border border-ragnar-border bg-ragnar-bg-secondary text-[14px] font-medium text-ragnar-text-secondary",
              "transition-all duration-150 hover:border-ragnar-border hover:bg-ragnar-bg-hover hover:text-ragnar-text-primary",
              "active:scale-[0.98]",
            )}
          >
            <BeakerIcon />
            Try with Demo Vault
          </button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {[
            "Plain .md files",
            "YAML frontmatter",
            "Offline-first",
            "Wiki links",
            "Cloud sync",
          ].map((feat) => (
            <span
              key={feat}
              className="rounded-full border border-ragnar-border-subtle bg-ragnar-bg-secondary px-3 py-1 text-[12px] text-ragnar-text-muted"
            >
              {feat}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Icons ── */

function RagnarMark() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      stroke="var(--ragnar-accent)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 6h22l10 10v30H10V6z" />
      <path d="M32 6v10h10" />
      <line x1="18" y1="24" x2="34" y2="24" />
      <line x1="18" y1="30" x2="34" y2="30" />
      <line x1="18" y1="36" x2="26" y2="36" />
    </svg>
  );
}

function FolderOpenIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 5h5.5L9 3h7a1.5 1.5 0 011.5 1.5V7H.5" />
      <path d=".5 7l2 8h15l2-8H.5z" />
    </svg>
  );
}

function BeakerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2v5L2 13a1 1 0 00.9 1.4h10.2A1 1 0 0014 13L10 7V2" />
      <line x1="5" y1="2" x2="11" y2="2" />
    </svg>
  );
}
