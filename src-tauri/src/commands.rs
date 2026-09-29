use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize, Debug, PartialEq)]
pub struct WorkspaceFile {
    pub name: String,
    pub path: String,
    pub size_bytes: u64,
}

#[derive(Serialize, Debug, PartialEq)]
#[serde(tag = "type", content = "message")]
pub enum WorkspaceError {
    NotFound(String),
    PermissionDenied(String),
    Unknown(String),
}

/// Scans a directory on the local filesystem and returns structured metadata.
/// Distinguishes permission and missing-folder errors to prevent silent UI failures.
#[tauri::command]
pub fn scan_workspace_folder(folder_path: String) -> Result<Vec<WorkspaceFile>, WorkspaceError> {
    let path = Path::new(&folder_path);

    if !path.exists() {
        return Err(WorkspaceError::NotFound(format!(
            "Directory path does not exist: {}",
            folder_path
        )));
    }

    let entries = fs::read_dir(path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            WorkspaceError::PermissionDenied(format!(
                "OS permission denied when accessing: {}",
                folder_path
            ))
        } else {
            WorkspaceError::Unknown(e.to_string())
        }
    })?;

    let mut files = Vec::new();
    for entry in entries.flatten() {
        if let Ok(metadata) = entry.metadata() {
            if metadata.is_file() {
                files.push(WorkspaceFile {
                    name: entry.file_name().to_string_lossy().to_string(),
                    path: entry.path().to_string_lossy().to_string(),
                    size_bytes: metadata.len(),
                });
            }
        }
    }

    Ok(files)
}
