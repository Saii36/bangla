use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

const ICON_NAME: &str = "bangla-typing-master";
const DESKTOP_ENTRY_FILENAME: &str = "bangla-typing-master.desktop";
const EMBEDDED_ICON_PNG: &[u8] = include_bytes!("../icons/128x128@2x.png");

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopIntegrationResult {
    pub executable_path: String,
    pub menu_entry_path: String,
    pub icon_path: String,
    pub desktop_shortcut_path: Option<String>,
    pub package_format: String,
}

/// Detects the real launch path on Linux:
/// - If running from an AppImage, `$APPIMAGE` points to the persistent `.AppImage` file path.
/// - Otherwise falls back to `std::env::current_exe()`.
pub fn detect_launch_executable() -> Result<(PathBuf, String), String> {
    if let Ok(appimage) = env::var("APPIMAGE") {
        let trimmed = appimage.trim();
        if !trimmed.is_empty() {
            return Ok((PathBuf::from(trimmed), "AppImage".to_string()));
        }
    }
    let exe = env::current_exe().map_err(|e| format!("Failed to locate executable: {}", e))?;
    let exe_str = exe.to_string_lossy();
    let format = if exe_str.starts_with("/usr/bin/") || exe_str.starts_with("/usr/local/bin/") {
        "DEB / System Package".to_string()
    } else {
        "Native Binary".to_string()
    };
    Ok((exe, format))
}

pub fn build_desktop_entry_content(exec_path: &Path) -> String {
    let escaped_exec = exec_path.to_string_lossy().replace('"', "\\\"");
    format!(
        "[Desktop Entry]\n\
Name=Bangla Typing Master\n\
GenericName=Bangla Typing Tutor\n\
Comment=Offline Bangla typing tutor with Avro Phonetic, Bijoy, Jatiya, Probhat & Keyboard Heatmap\n\
Exec=\"{}\" %U\n\
Icon={}\n\
Terminal=false\n\
Type=Application\n\
Categories=Education;Utility;\n\
Keywords=Bangla;Bengali;Typing;Avro;Bijoy;Jatiya;Probhat;Keyboard;Heatmap;Tutor;\n\
StartupNotify=true\n\
StartupWMClass=bangla-typing-master\n",
        escaped_exec, ICON_NAME
    )
}

/// Installs Cinnamon / Freedesktop user-level menu entry, icon, and optional Desktop shortcut
/// using normal user permissions (no sudo required).
pub fn install_user_desktop_integration(
    create_desktop_shortcut: bool,
) -> Result<DesktopIntegrationResult, String> {
    let home = env::var("HOME")
        .map(PathBuf::from)
        .map_err(|_| "Could not resolve HOME directory.".to_string())?;
    let xdg_data_home = env::var("XDG_DATA_HOME")
        .ok()
        .filter(|s| !s.trim().is_empty())
        .map(PathBuf::from)
        .unwrap_or_else(|| home.join(".local/share"));

    let (exec_path, package_format) = detect_launch_executable()?;
    install_into_paths(&home, &xdg_data_home, &exec_path, &package_format, create_desktop_shortcut)
}

pub fn install_into_paths(
    home: &Path,
    xdg_data_home: &Path,
    exec_path: &Path,
    package_format: &str,
    create_desktop_shortcut: bool,
) -> Result<DesktopIntegrationResult, String> {
    let apps_dir = xdg_data_home.join("applications");
    let icons_dir = xdg_data_home.join("icons/hicolor/256x256/apps");

    fs::create_dir_all(&apps_dir)
        .map_err(|e| format!("Failed to create applications dir {:?}: {}", apps_dir, e))?;
    fs::create_dir_all(&icons_dir)
        .map_err(|e| format!("Failed to create icons dir {:?}: {}", icons_dir, e))?;

    let icon_path = icons_dir.join(format!("{}.png", ICON_NAME));
    fs::write(&icon_path, EMBEDDED_ICON_PNG)
        .map_err(|e| format!("Failed to write application icon {:?}: {}", icon_path, e))?;

    let desktop_content = build_desktop_entry_content(exec_path);
    let menu_entry_path = apps_dir.join(DESKTOP_ENTRY_FILENAME);
    fs::write(&menu_entry_path, &desktop_content)
        .map_err(|e| format!("Failed to write Cinnamon menu entry {:?}: {}", menu_entry_path, e))?;

    #[cfg(unix)]
    {
        let _ = fs::set_permissions(&menu_entry_path, fs::Permissions::from_mode(0o755));
    }

    let mut desktop_shortcut_path = None;
    if create_desktop_shortcut {
        let desktop_dir = home.join("Desktop");
        if desktop_dir.exists() {
            let shortcut = desktop_dir.join("Bangla Typing Master.desktop");
            fs::write(&shortcut, &desktop_content)
                .map_err(|e| format!("Failed to create Desktop launcher {:?}: {}", shortcut, e))?;
            #[cfg(unix)]
            {
                let _ = fs::set_permissions(&shortcut, fs::Permissions::from_mode(0o755));
            }
            desktop_shortcut_path = Some(shortcut.to_string_lossy().to_string());
        }
    }

    // Refresh desktop database and icon cache if tools exist on Linux Mint
    let _ = Command::new("update-desktop-database")
        .arg(&apps_dir)
        .status();
    let _ = Command::new("gtk-update-icon-cache")
        .args(["-f", "-t"])
        .arg(xdg_data_home.join("icons/hicolor"))
        .status();

    Ok(DesktopIntegrationResult {
        executable_path: exec_path.to_string_lossy().to_string(),
        menu_entry_path: menu_entry_path.to_string_lossy().to_string(),
        icon_path: icon_path.to_string_lossy().to_string(),
        desktop_shortcut_path,
        package_format: package_format.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn generates_valid_cinnamon_desktop_entry_and_icon() {
        let stamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let base = std::env::temp_dir().join(format!("btm-desktop-int-{}", stamp));
        let home = base.join("home");
        let xdg = home.join(".local/share");
        fs::create_dir_all(home.join("Desktop")).unwrap();

        let fake_appimage = PathBuf::from("/home/user/Applications/Bangla-Typing-Master.AppImage");
        let res = install_into_paths(&home, &xdg, &fake_appimage, "AppImage", true)
            .expect("install desktop integration");

        assert!(Path::new(&res.menu_entry_path).exists());
        assert!(Path::new(&res.icon_path).exists());
        assert!(res.desktop_shortcut_path.is_some());

        let content = fs::read_to_string(&res.menu_entry_path).unwrap();
        assert!(content.contains("Name=Bangla Typing Master"));
        assert!(content.contains("Bangla-Typing-Master.AppImage"));
        assert!(content.contains("Categories=Education;Utility;"));

        let _ = fs::remove_dir_all(base);
    }
}
