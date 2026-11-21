use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

const DATA_FILENAME: &str = "user-data.json";
const TEMP_FILENAME: &str = "user-data.json.tmp";
const BACKUPS_DIR: &str = "backups";
const AUTO_BACKUP_PREFIX: &str = "auto-snapshot-";
const MAX_AUTO_SNAPSHOTS: usize = 8;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupFileInfo {
    pub filename: String,
    pub full_path: String,
    pub size_bytes: u64,
    pub modified_ms: u64,
    pub is_auto: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveResult {
    pub data_file: String,
    pub bytes_written: usize,
    pub backup_created: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageStatus {
    pub data_dir: String,
    pub data_file: String,
    pub backups_dir: String,
    pub exists: bool,
    pub size_bytes: u64,
    pub backup_count: usize,
}

pub struct PersistentDataStore {
    root_dir: PathBuf,
}

impl PersistentDataStore {
    pub fn new(root_dir: PathBuf) -> Result<Self, String> {
        fs::create_dir_all(&root_dir)
            .map_err(|e| format!("Failed to create app data directory {:?}: {}", root_dir, e))?;
        let backups = root_dir.join(BACKUPS_DIR);
        fs::create_dir_all(&backups)
            .map_err(|e| format!("Failed to create backups directory {:?}: {}", backups, e))?;
        Ok(Self { root_dir })
    }

    pub fn data_file_path(&self) -> PathBuf {
        self.root_dir.join(DATA_FILENAME)
    }

    pub fn backups_dir_path(&self) -> PathBuf {
        self.root_dir.join(BACKUPS_DIR)
    }

    pub fn status(&self) -> StorageStatus {
        let data_file = self.data_file_path();
        let meta = fs::metadata(&data_file).ok();
        let backup_count = self.list_backups().map(|v| v.len()).unwrap_or(0);
        StorageStatus {
            data_dir: self.root_dir.to_string_lossy().to_string(),
            data_file: data_file.to_string_lossy().to_string(),
            backups_dir: self.backups_dir_path().to_string_lossy().to_string(),
            exists: meta.is_some(),
            size_bytes: meta.map(|m| m.len()).unwrap_or(0),
            backup_count,
        }
    }

    /// Loads user-data.json. If the primary file is corrupt, safely falls back to the newest valid backup
    /// rather than silently discarding user progress.
    pub fn load_data(&self) -> Result<Option<String>, String> {
        let primary = self.data_file_path();
        if primary.exists() {
            match fs::read_to_string(&primary) {
                Ok(content) if is_valid_app_payload(&content) => return Ok(Some(content)),
                Ok(_) | Err(_) => {
                    // Attempt non-destructive recovery from most recent valid backup
                    if let Ok(backups) = self.list_backups() {
                        for b in backups {
                            if let Ok(content) = fs::read_to_string(&b.full_path) {
                                if is_valid_app_payload(&content) {
                                    return Ok(Some(content));
                                }
                            }
                        }
                    }
                    return Err(
                        "Primary data file is unreadable and no valid backup was found.".to_string()
                    );
                }
            }
        }
        Ok(None)
    }

    /// Atomically saves validated JSON to user-data.json.
    /// Guards against accidental silent data loss: refuses to replace non-empty sessions/lessons
    /// with an empty dataset unless `allow_destructive` is explicitly true.
    pub fn save_data(&self, json_payload: &str, allow_destructive: bool) -> Result<SaveResult, String> {
        let incoming: Value = serde_json::from_str(json_payload)
            .map_err(|e| format!("Invalid JSON payload: {}", e))?;
        if !incoming.is_object() {
            return Err("Application data payload must be a JSON object.".to_string());
        }

        let primary = self.data_file_path();
        let mut backup_created = false;

        if primary.exists() {
            if let Ok(existing_raw) = fs::read_to_string(&primary) {
                if let Ok(existing_val) = serde_json::from_str::<Value>(&existing_raw) {
                    let prev_records = count_meaningful_records(&existing_val);
                    let next_records = count_meaningful_records(&incoming);

                    if prev_records > 0 && next_records == 0 && !allow_destructive {
                        return Err(format!(
                            "Safety guard prevented overwriting {} existing records with an empty dataset. Use explicit reset or restore if intended.",
                            prev_records
                        ));
                    }

                    // Keep a rolling automatic backup whenever existing content differs
                    if existing_raw != json_payload {
                        let latest_auto = self.backups_dir_path().join("auto-latest.json");
                        let _ = write_atomic(&latest_auto, existing_raw.as_bytes());
                        if next_records != prev_records {
                            let stamp = now_epoch_secs();
                            let snap = self
                                .backups_dir_path()
                                .join(format!("{}{}.json", AUTO_BACKUP_PREFIX, stamp));
                            if write_atomic(&snap, existing_raw.as_bytes()).is_ok() {
                                backup_created = true;
                                self.prune_auto_snapshots();
                            }
                        }
                    }
                }
            }
        }

        write_atomic(&primary, json_payload.as_bytes())?;

        Ok(SaveResult {
            data_file: primary.to_string_lossy().to_string(),
            bytes_written: json_payload.len(),
            backup_created,
        })
    }

    pub fn create_manual_backup(&self, json_payload: &str) -> Result<BackupFileInfo, String> {
        let parsed: Value = serde_json::from_str(json_payload)
            .map_err(|e| format!("Invalid backup JSON: {}", e))?;
        if !parsed.is_object() {
            return Err("Backup JSON must be an object.".to_string());
        }

        let stamp = now_epoch_secs();
        let filename = format!("bangla-typing-master-backup-{}.json", stamp);
        let target = self.backups_dir_path().join(&filename);
        write_atomic(&target, json_payload.as_bytes())?;

        let meta = fs::metadata(&target)
            .map_err(|e| format!("Failed to inspect created backup: {}", e))?;
        Ok(BackupFileInfo {
            filename,
            full_path: target.to_string_lossy().to_string(),
            size_bytes: meta.len(),
            modified_ms: modified_ms(&meta),
            is_auto: false,
        })
    }

    pub fn list_backups(&self) -> Result<Vec<BackupFileInfo>, String> {
        let dir = self.backups_dir_path();
        let entries = fs::read_dir(&dir)
            .map_err(|e| format!("Failed to read backups directory: {}", e))?;

        let mut list = Vec::new();
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_file() {
                continue;
            }
            let Some(name) = path.file_name().and_then(|n| n.to_str()) else {
                continue;
            };
            if !name.ends_with(".json") {
                continue;
            }
            if let Ok(meta) = entry.metadata() {
                list.push(BackupFileInfo {
                    filename: name.to_string(),
                    full_path: path.to_string_lossy().to_string(),
                    size_bytes: meta.len(),
                    modified_ms: modified_ms(&meta),
                    is_auto: name.starts_with("auto-"),
                });
            }
        }

        list.sort_by(|a, b| b.modified_ms.cmp(&a.modified_ms));
        Ok(list)
    }

    pub fn read_backup_file(&self, filename: &str) -> Result<String, String> {
        if filename.is_empty()
            || filename.contains('/')
            || filename.contains('\\')
            || filename.contains("..")
            || !filename.ends_with(".json")
        {
            return Err("Invalid backup filename.".to_string());
        }
        let target = self.backups_dir_path().join(filename);
        if !target.exists() {
            return Err(format!("Backup file '{}' does not exist.", filename));
        }
        fs::read_to_string(&target)
            .map_err(|e| format!("Failed to read backup '{}': {}", filename, e))
    }

    fn prune_auto_snapshots(&self) {
        if let Ok(backups) = self.list_backups() {
            let auto_snaps: Vec<BackupFileInfo> = backups
                .into_iter()
                .filter(|b| b.filename.starts_with(AUTO_BACKUP_PREFIX))
                .collect();
            if auto_snaps.len() > MAX_AUTO_SNAPSHOTS {
                for old in auto_snaps.iter().skip(MAX_AUTO_SNAPSHOTS) {
                    let _ = fs::remove_file(&old.full_path);
                }
            }
        }
    }
}

fn is_valid_app_payload(raw: &str) -> bool {
    serde_json::from_str::<Value>(raw)
        .map(|v| v.is_object())
        .unwrap_or(false)
}

fn count_meaningful_records(val: &Value) -> usize {
    let sessions = val
        .get("sessions")
        .and_then(|v| v.as_array())
        .map(|a| a.len())
        .unwrap_or(0);
    let lessons = val
        .get("customLessons")
        .and_then(|v| v.as_array())
        .map(|a| a.len())
        .unwrap_or(0);
    sessions + lessons
}

fn now_epoch_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn modified_ms(meta: &fs::Metadata) -> u64 {
    meta.modified()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

fn write_atomic(target: &Path, bytes: &[u8]) -> Result<(), String> {
    let parent = target
        .parent()
        .ok_or_else(|| "Target file has no parent directory".to_string())?;
    let tmp_name = format!(
        ".{}.{}",
        target
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or(TEMP_FILENAME),
        now_epoch_secs()
    );
    let tmp_path = parent.join(tmp_name);

    {
        let mut f = File::create(&tmp_path)
            .map_err(|e| format!("Failed to create temporary file {:?}: {}", tmp_path, e))?;
        f.write_all(bytes)
            .map_err(|e| format!("Failed to write temporary file {:?}: {}", tmp_path, e))?;
        f.sync_all()
            .map_err(|e| format!("Failed to fsync temporary file {:?}: {}", tmp_path, e))?;
    }

    fs::rename(&tmp_path, target)
        .map_err(|e| format!("Failed to atomically commit {:?}: {}", target, e))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_store(name: &str) -> (PersistentDataStore, PathBuf) {
        let dir = std::env::temp_dir().join(format!("btm-test-{}-{}", name, now_epoch_secs()));
        let _ = fs::remove_dir_all(&dir);
        let store = PersistentDataStore::new(dir.clone()).expect("init store");
        (store, dir)
    }

    #[test]
    fn atomic_save_and_reload_persists_data() {
        let (store, dir) = temp_store("persist");
        assert!(store.load_data().unwrap().is_none());

        let payload = r#"{"version":1,"sessions":[{"id":"s1","wpmStandard":42}],"customLessons":[]}"#;
        let saved = store.save_data(payload, false).expect("save");
        assert_eq!(saved.bytes_written, payload.len());

        let reloaded = store.load_data().expect("load").expect("some");
        assert_eq!(reloaded, payload);
        let _ = fs::remove_dir_all(dir);
    }

    #[test]
    fn refuses_silent_wipe_unless_destructive_flag_set() {
        let (store, dir) = temp_store("guard");
        let rich = r#"{"version":1,"sessions":[{"id":"s1"},{"id":"s2"}],"customLessons":[]}"#;
        store.save_data(rich, false).expect("initial save");

        let empty = r#"{"version":1,"sessions":[],"customLessons":[]}"#;
        let err = store.save_data(empty, false);
        assert!(err.is_err(), "expected safety guard error");

        // Verify original data remained intact
        assert_eq!(store.load_data().unwrap().unwrap(), rich);

        // Explicit reset works when allow_destructive = true
        store.save_data(empty, true).expect("explicit reset");
        assert_eq!(store.load_data().unwrap().unwrap(), empty);
        let _ = fs::remove_dir_all(dir);
    }

    #[test]
    fn recovers_from_corrupted_primary_using_backup() {
        let (store, dir) = temp_store("recover");
        let v1 = r#"{"version":1,"sessions":[{"id":"s1"}],"customLessons":[]}"#;
        let v2 = r#"{"version":1,"sessions":[{"id":"s1"},{"id":"s2"}],"customLessons":[]}"#;
        store.save_data(v1, false).unwrap();
        store.save_data(v2, false).unwrap();

        // Corrupt primary file
        fs::write(store.data_file_path(), "{corrupted-json").unwrap();

        let recovered = store.load_data().expect("should recover from backup").unwrap();
        assert_eq!(recovered, v1);
        let _ = fs::remove_dir_all(dir);
    }

    #[test]
    fn rejects_path_traversal_on_backup_read() {
        let (store, dir) = temp_store("traversal");
        assert!(store.read_backup_file("../user-data.json").is_err());
        assert!(store.read_backup_file("/etc/passwd").is_err());
        assert!(store.read_backup_file("notes.txt").is_err());
        let _ = fs::remove_dir_all(dir);
    }
}
