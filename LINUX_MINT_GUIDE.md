# Bangla Typing Master — Linux Mint 22.3 (Zena) Desktop Guide

Standalone native Linux x86_64 desktop application powered by **Tauri 2** (GTK3 + WebKit2GTK 4.1) and the existing React + TypeScript Bangla typing engine.

## Quick Launch (AppImage — Recommended, No Root Required)

1. Locate the generated AppImage:
   - `release-linux/Bangla Typing Master_1.0.0_amd64.AppImage` (also in `src-tauri/target/release/bundle/appimage/`)
2. Make it executable and run directly:
   ```bash
   chmod +x "release-linux/Bangla Typing Master_1.0.0_amd64.AppImage"
   "./release-linux/Bangla Typing Master_1.0.0_amd64.AppImage"
   ```
   *(If Linux Mint 22.3 reports missing FUSE v2 for AppImages, install once: `sudo apt install libfuse2t64` — or run with `--appimage-extract-and-run`.)*

## Cinnamon Menu & Desktop Launcher Integration (Normal User Permissions)

Option A — **Inside the App**:
Open **Settings → Linux Desktop Persistent Storage** and click **Add to Cinnamon Menu** (optionally check *Also add launcher icon to Desktop*).

Option B — **Via Included Script**:
```bash
./scripts/install-cinnamon-launcher.sh "release-linux/Bangla Typing Master_1.0.0_amd64.AppImage" --desktop-shortcut
```
This installs:
- AppImage copy: `~/Applications/Bangla-Typing-Master-x86_64.AppImage`
- Cinnamon Menu entry: `~/.local/share/applications/bangla-typing-master.desktop`
- Application icon: `~/.local/share/icons/hicolor/256x256/apps/bangla-typing-master.png`
- Optional Desktop shortcut: `~/Desktop/Bangla Typing Master.desktop`

## Optional DEB Package Installation

```bash
sudo apt install "./release-linux/Bangla Typing Master_1.0.0_amd64.deb"
```
This installs the native binary to `/usr/bin/bangla-typing-master`, registers the Cinnamon menu entry system-wide under **Education**, and installs all application icons automatically.

## Persistent Local Data & Safe Firefox Migration

- **Persistent Data Directory**: `~/.local/share/com.banglatypingmaster.desktop/`
  - Primary database: `~/.local/share/com.banglatypingmaster.desktop/user-data.json` (written atomically via `tmp + fsync + rename`)
  - Automatic & manual snapshots: `~/.local/share/com.banglatypingmaster.desktop/backups/`
  - Mirrors to WebView IndexedDB (`BanglaTypingMasterDB`) automatically.
- **Migrating Existing Firefox Data Safely**:
  1. In Firefox, open Bangla Typing Master → **Settings** → **Export Full Backup (JSON)**.
  2. In the Desktop app, open **Settings** → **Merge Backup (Keep Existing)** and select the exported `.json` file. All sessions, heatmap telemetry, custom lessons, and character sets merge cleanly without overwriting existing desktop data.

## Offline Verification

- Zero cloud services, accounts, external CDNs, Google Fonts, or telemetry.
- Local `Lohit-Bengali.ttf` font is bundled inside the application alongside Linux Mint system Bangla font fallbacks (`Kalpurush`, `SolaimanLipi`, `Noto Sans Bengali`).
- Strict offline Content Security Policy (`default-src 'self'; connect-src 'self'`).
- Disconnect Wi-Fi/Ethernet and run **Settings → Run Offline Verification** inside the app.
