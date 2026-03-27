use serde::Serialize;

/// Unified error type for all Tauri commands.
/// Serializes cleanly to the frontend as { code, message }.
#[derive(Debug, Serialize)]
pub struct AppError {
    pub code: &'static str,
    pub message: String,
}

impl AppError {
    pub fn new(code: &'static str, message: impl ToString) -> Self {
        Self { code, message: message.to_string() }
    }

    pub fn io(e: std::io::Error) -> Self {
        Self::new("IO_ERROR", e)
    }

    pub fn not_found(path: &str) -> Self {
        Self::new("NOT_FOUND", format!("Path not found: {path}"))
    }

    pub fn invalid_path(path: &str) -> Self {
        Self::new("INVALID_PATH", format!("Invalid path: {path}"))
    }
}

impl From<anyhow::Error> for AppError {
    fn from(e: anyhow::Error) -> Self {
        Self::new("UNKNOWN", e)
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        Self::io(e)
    }
}

pub type CmdResult<T> = Result<T, AppError>;
