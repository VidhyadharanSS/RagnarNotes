use serde::{Deserialize, Serialize};

/// Corresponds to the TypeScript `Note` interface.
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteModel {
    pub id: String,
    pub title: String,
    pub content: String,
    pub file_path: String,
    pub folder_id: String,
    pub frontmatter: NoteFrontmatterModel,
    pub is_unsaved: bool,
}

/// Corresponds to the TypeScript `NoteFrontmatter` interface.
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteFrontmatterModel {
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
    pub tags: Vec<String>,
    pub pinned: bool,
    pub aliases: Vec<String>,
}

/// Corresponds to the TypeScript `Folder` interface.
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FolderModel {
    pub id: String,
    pub name: String,
    pub path: String,
    pub parent_id: Option<String>,
    pub children: Vec<String>,
    pub is_expanded: bool,
}

/// The full vault snapshot sent to the frontend on load.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultSnapshot {
    pub notes: Vec<NoteModel>,
    pub folders: Vec<FolderModel>,
}

/// Payload for creating a new note.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNotePayload {
    pub folder_id: String,
    pub folder_path: String,
    pub title: String,
}

/// Payload for writing note content.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WriteNotePayload {
    pub file_path: String,
    pub content: String,
    pub frontmatter: NoteFrontmatterModel,
}
