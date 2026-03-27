use crate::error::CmdResult;
use tauri::api::dialog::blocking::FileDialogBuilder;

/// Return the application version from Cargo.toml.
#[tauri::command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Open a native folder-picker dialog and return the selected path.
/// Used on first launch to let the user choose their vault directory.
#[tauri::command]
pub fn open_vault_dialog() -> CmdResult<Option<String>> {
    let path = FileDialogBuilder::new()
        .set_title("Choose your Ragnar Notes vault folder")
        .pick_folder();

    Ok(path.map(|p| p.to_string_lossy().to_string()))
}
