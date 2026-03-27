// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod error;

use tracing_subscriber::{fmt, EnvFilter};

fn main() {
    // Initialize structured logging
    fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // File system commands (fully implemented in Stage 4)
            commands::fs::read_vault,
            commands::fs::read_note,
            commands::fs::write_note,
            commands::fs::create_note,
            commands::fs::delete_note,
            commands::fs::create_folder,
            commands::fs::rename_item,
            commands::fs::move_item,
            // App commands
            commands::app::get_app_version,
            commands::app::open_vault_dialog,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Ragnar Notes");
}
