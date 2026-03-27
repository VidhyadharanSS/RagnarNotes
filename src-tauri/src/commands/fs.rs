/*!
 * File System Commands — Stage 4 fully implements these.
 *
 * Stage 1 provides:
 *  - Full, correct signatures (match TS types)
 *  - Stub bodies that return empty/ok results
 *  - Complete error handling framework
 *
 * Stage 4 will fill in the walkdir + gray_matter parsing logic.
 */

use crate::error::{AppError, CmdResult};
use crate::models::{
    CreateNotePayload, FolderModel, NoteModel, VaultSnapshot, WriteNotePayload,
};
use std::path::Path;
use uuid::Uuid;

// ── Read vault ──────────────────────────────────────────────────────────────

/// Scan the vault directory and return all notes + folder tree.
/// Stage 4: implement with `walkdir` + frontmatter parsing.
#[tauri::command]
pub async fn read_vault(vault_path: String) -> CmdResult<VaultSnapshot> {
    let path = Path::new(&vault_path);

    if !path.exists() {
        return Err(AppError::not_found(&vault_path));
    }

    // Stage 1 stub: return empty vault
    Ok(VaultSnapshot {
        notes: vec![],
        folders: vec![],
    })
}

// ── Read single note ────────────────────────────────────────────────────────

/// Read a single .md file and parse its frontmatter + body.
#[tauri::command]
pub async fn read_note(file_path: String) -> CmdResult<NoteModel> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Err(AppError::not_found(&file_path));
    }

    let raw = std::fs::read_to_string(path)?;

    // Stage 1 stub: return minimal model
    Ok(NoteModel {
        id: Uuid::new_v4().to_string(),
        title: path
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string(),
        content: raw,
        file_path: file_path.clone(),
        folder_id: String::new(),
        is_unsaved: false,
        frontmatter: crate::models::NoteFrontmatterModel {
            title: String::new(),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
            tags: vec![],
            pinned: false,
            aliases: vec![],
        },
    })
}

// ── Write note ───────────────────────────────────────────────────────────────

/// Atomically write note content (with frontmatter) to disk.
#[tauri::command]
pub async fn write_note(payload: WriteNotePayload) -> CmdResult<()> {
    let path = Path::new(&payload.file_path);

    let frontmatter_yaml = format!(
        "---\ntitle: {}\ncreatedAt: {}\nupdatedAt: {}\ntags: [{}]\npinned: {}\naliases: [{}]\n---\n",
        payload.frontmatter.title,
        payload.frontmatter.created_at,
        chrono::Utc::now().to_rfc3339(), // always update updatedAt
        payload.frontmatter.tags.join(", "),
        payload.frontmatter.pinned,
        payload.frontmatter.aliases.join(", "),
    );

    let full_content = format!("{}{}", frontmatter_yaml, payload.content);

    // Atomic write: write to a temp file then rename
    let tmp_path = path.with_extension("md.tmp");
    std::fs::write(&tmp_path, &full_content)?;
    std::fs::rename(&tmp_path, path)?;

    Ok(())
}

// ── Create note ──────────────────────────────────────────────────────────────

/// Create a new .md file in the given folder.
#[tauri::command]
pub async fn create_note(payload: CreateNotePayload) -> CmdResult<NoteModel> {
    let id = Uuid::new_v4().to_string();
    let safe_title = sanitize_filename(&payload.title);
    let file_name = format!("{safe_title}.md");
    let file_path = Path::new(&payload.folder_path).join(&file_name);
    let now = chrono::Utc::now().to_rfc3339();

    let frontmatter = format!(
        "---\ntitle: {}\ncreatedAt: {}\nupdatedAt: {}\ntags: []\npinned: false\naliases: []\n---\n\n",
        payload.title, now, now
    );

    std::fs::write(&file_path, &frontmatter)?;

    Ok(NoteModel {
        id,
        title: payload.title.clone(),
        content: String::new(),
        file_path: file_path.to_string_lossy().to_string(),
        folder_id: payload.folder_id,
        is_unsaved: false,
        frontmatter: crate::models::NoteFrontmatterModel {
            title: payload.title,
            created_at: now.clone(),
            updated_at: now,
            tags: vec![],
            pinned: false,
            aliases: vec![],
        },
    })
}

// ── Delete note ──────────────────────────────────────────────────────────────

/// Move a note file to the OS trash (macOS: uses `trash` API in Stage 4).
/// Stage 1 stub: just removes the file.
#[tauri::command]
pub async fn delete_note(file_path: String) -> CmdResult<()> {
    let path = Path::new(&file_path);
    if path.exists() {
        std::fs::remove_file(path)?;
    }
    Ok(())
}

// ── Create folder ────────────────────────────────────────────────────────────

/// Create a new directory in the vault.
#[tauri::command]
pub async fn create_folder(
    parent_path: String,
    name: String,
) -> CmdResult<FolderModel> {
    let safe_name = sanitize_filename(&name);
    let folder_path = Path::new(&parent_path).join(&safe_name);

    std::fs::create_dir_all(&folder_path)?;

    Ok(FolderModel {
        id: Uuid::new_v4().to_string(),
        name,
        path: folder_path.to_string_lossy().to_string(),
        parent_id: None,
        children: vec![],
        is_expanded: false,
    })
}

// ── Rename item ──────────────────────────────────────────────────────────────

/// Rename a file or folder.
#[tauri::command]
pub async fn rename_item(old_path: String, new_name: String) -> CmdResult<String> {
    let old = Path::new(&old_path);
    let parent = old.parent().ok_or_else(|| AppError::invalid_path(&old_path))?;
    let new_path = parent.join(sanitize_filename(&new_name));

    std::fs::rename(old, &new_path)?;
    Ok(new_path.to_string_lossy().to_string())
}

// ── Move item ────────────────────────────────────────────────────────────────

/// Move a file or folder to a new parent directory.
#[tauri::command]
pub async fn move_item(source_path: String, dest_dir: String) -> CmdResult<String> {
    let src = Path::new(&source_path);
    let file_name = src.file_name().ok_or_else(|| AppError::invalid_path(&source_path))?;
    let dest = Path::new(&dest_dir).join(file_name);

    std::fs::rename(src, &dest)?;
    Ok(dest.to_string_lossy().to_string())
}

// ── Helpers ──────────────────────────────────────────────────────────────────

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '-',
            c => c,
        })
        .collect::<String>()
        .trim()
        .to_string()
}
