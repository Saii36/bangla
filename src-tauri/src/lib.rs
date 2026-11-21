mod desktop_integration;
mod storage;

use desktop_integration::{
    detect_launch_executable, install_user_desktop_integration, DesktopIntegrationResult,
};
use serde::Serialize;
use std::sync::Mutex;
use storage::{BackupFileInfo, PersistentDataStore, SaveResult, StorageStatus};
use tauri::{Manager, State};

struct AppState {
    store: Mutex<PersistentDataStore>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopRuntimeInfo {
    app_name: String,
    app_version: String,
    os: String,
    arch: String,
    package_format: String,
    executable_path: String,
    storage: StorageStatus,
}

#[tauri::command]
fn get_desktop_info(state: State<'_, AppState>) -> Result<DesktopRuntimeInfo, String> {
    let store = state
        .store
        .lock()
        .map_err(|_| "Failed to lock persistent storage state.".to_string())?;
    let (exe_path, package_format) = detect_launch_executable()
        .unwrap_or_else(|_| (std::path::PathBuf::from("bangla-typing-master"), "Native".to_string()));
    Ok(DesktopRuntimeInfo {
        app_name: "Bangla Typing Master".to_string(),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        package_format,
        executable_path: exe_path.to_string_lossy().to_string(),
        storage: store.status(),
    })
}

#[tauri::command]
fn load_persistent_data(state: State<'_, AppState>) -> Result<Option<String>, String> {
    let store = state
        .store
        .lock()
        .map_err(|_| "Failed to lock persistent storage state.".to_string())?;
    store.load_data()
}

#[tauri::command]
fn save_persistent_data(
    state: State<'_, AppState>,
    payload: String,
    allow_destructive: Option<bool>,
) -> Result<SaveResult, String> {
    let store = state
        .store
        .lock()
        .map_err(|_| "Failed to lock persistent storage state.".to_string())?;
    store.save_data(&payload, allow_destructive.unwrap_or(false))
}

#[tauri::command]
fn create_local_backup(
    state: State<'_, AppState>,
    payload: String,
) -> Result<BackupFileInfo, String> {
    let store = state
        .store
        .lock()
        .map_err(|_| "Failed to lock persistent storage state.".to_string())?;
    store.create_manual_backup(&payload)
}

#[tauri::command]
fn list_local_backups(state: State<'_, AppState>) -> Result<Vec<BackupFileInfo>, String> {
    let store = state
        .store
        .lock()
        .map_err(|_| "Failed to lock persistent storage state.".to_string())?;
    store.list_backups()
}

#[tauri::command]
fn read_local_backup(state: State<'_, AppState>, filename: String) -> Result<String, String> {
    let store = state
        .store
        .lock()
        .map_err(|_| "Failed to lock persistent storage state.".to_string())?;
    store.read_backup_file(&filename)
}

#[tauri::command]
fn install_cinnamon_launcher(
    create_desktop_shortcut: bool,
) -> Result<DesktopIntegrationResult, String> {
    install_user_desktop_integration(create_desktop_shortcut)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .map_err(|e| format!("Failed to resolve XDG app data directory: {}", e))?;
            let store = PersistentDataStore::new(data_dir)?;
            app.manage(AppState {
                store: Mutex::new(store),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_desktop_info,
            load_persistent_data,
            save_persistent_data,
            create_local_backup,
            list_local_backups,
            read_local_backup,
            install_cinnamon_launcher,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Bangla Typing Master desktop application");
}
