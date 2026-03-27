/**
 * Tauri API Bridge — typed wrappers around all Rust commands.
 *
 * In development (browser-only), the `invoke` calls will be no-ops
 * since `@tauri-apps/api` is only available inside the Tauri shell.
 * We use a safe fallback so the React UI can still run in Vite's dev server.
 */

import type { Note, Folder } from "@/types";

/* ── Tauri availability guard ── */

const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI__" in window;

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) {
    console.debug(`[Tauri stub] invoke("${cmd}", ${JSON.stringify(args)})`);
    return undefined as unknown as T;
  }
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/tauri");
  return tauriInvoke<T>(cmd, args);
}

/* ── Vault ── */

export interface VaultSnapshot {
  notes: Note[];
  folders: Folder[];
}

export async function readVault(vaultPath: string): Promise<VaultSnapshot> {
  return invoke<VaultSnapshot>("read_vault", { vaultPath });
}

/* ── Notes ── */

export async function readNote(filePath: string): Promise<Note> {
  return invoke<Note>("read_note", { filePath });
}

export async function writeNote(payload: {
  filePath: string;
  content: string;
  frontmatter: Note["frontmatter"];
}): Promise<void> {
  return invoke<void>("write_note", { payload });
}

export async function createNote(payload: {
  folderId: string;
  folderPath: string;
  title: string;
}): Promise<Note> {
  return invoke<Note>("create_note", { payload });
}

export async function deleteNote(filePath: string): Promise<void> {
  return invoke<void>("delete_note", { filePath });
}

/* ── Folders ── */

export async function createFolder(
  parentPath: string,
  name: string,
): Promise<Folder> {
  return invoke<Folder>("create_folder", { parentPath, name });
}

export async function renameItem(
  oldPath: string,
  newName: string,
): Promise<string> {
  return invoke<string>("rename_item", { oldPath, newName });
}

export async function moveItem(
  sourcePath: string,
  destDir: string,
): Promise<string> {
  return invoke<string>("move_item", { sourcePath, destDir });
}

/* ── App ── */

export async function getAppVersion(): Promise<string> {
  return invoke<string>("get_app_version");
}

export async function openVaultDialog(): Promise<string | null> {
  return invoke<string | null>("open_vault_dialog");
}
