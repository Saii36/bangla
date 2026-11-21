#!/usr/bin/env bash
set -euo pipefail

# Bangla Typing Master — Linux Mint (Cinnamon) User-Level AppImage Integrator
# Requires normal user permissions only (no sudo).
# Usage: ./scripts/install-cinnamon-launcher.sh /path/to/Bangla\ Typing\ Master_*.AppImage [--desktop-shortcut]

APPIMAGE_SRC="${1:-}"
CREATE_DESKTOP="${2:-}"

if [[ -z "$APPIMAGE_SRC" ]]; then
  # Auto-discover built AppImage in src-tauri/target/release/bundle/appimage
  CANDIDATE=$(find "$(dirname "$0")/../src-tauri/target/release/bundle/appimage" -maxdepth 1 -name '*.AppImage' 2>/dev/null | head -n 1 || true)
  if [[ -n "$CANDIDATE" ]]; then
    APPIMAGE_SRC="$CANDIDATE"
  else
    echo "Usage: $0 /path/to/Bangla-Typing-Master.AppImage [--desktop-shortcut]"
    exit 1
  fi
fi

if [[ ! -f "$APPIMAGE_SRC" ]]; then
  echo "Error: AppImage not found at: $APPIMAGE_SRC"
  exit 1
fi

INSTALL_DIR="${HOME}/Applications"
APPIMAGE_DEST="${INSTALL_DIR}/Bangla-Typing-Master-x86_64.AppImage"
XDG_DATA="${XDG_DATA_HOME:-${HOME}/.local/share}"
APPS_DIR="${XDG_DATA}/applications"
ICON_DIR="${XDG_DATA}/icons/hicolor/256x256/apps"
ICON_SRC="$(dirname "$0")/../src-tauri/icons/128x128@2x.png"

mkdir -p "$INSTALL_DIR" "$APPS_DIR" "$ICON_DIR"

cp -f "$APPIMAGE_SRC" "$APPIMAGE_DEST"
chmod +x "$APPIMAGE_DEST"

if [[ -f "$ICON_SRC" ]]; then
  cp -f "$ICON_SRC" "${ICON_DIR}/bangla-typing-master.png"
fi

DESKTOP_CONTENT="[Desktop Entry]
Name=Bangla Typing Master
GenericName=Bangla Typing Tutor
Comment=Offline Bangla typing tutor with Avro Phonetic, Bijoy, Jatiya, Probhat & Keyboard Heatmap
Exec=\"${APPIMAGE_DEST}\" %U
Icon=bangla-typing-master
Terminal=false
Type=Application
Categories=Education;Utility;
Keywords=Bangla;Bengali;Typing;Avro;Bijoy;Jatiya;Probhat;Keyboard;Heatmap;Tutor;
StartupNotify=true
StartupWMClass=bangla-typing-master
"

printf '%s' "$DESKTOP_CONTENT" > "${APPS_DIR}/bangla-typing-master.desktop"
chmod +x "${APPS_DIR}/bangla-typing-master.desktop"

if [[ "$CREATE_DESKTOP" == "--desktop-shortcut" && -d "${HOME}/Desktop" ]]; then
  printf '%s' "$DESKTOP_CONTENT" > "${HOME}/Desktop/Bangla Typing Master.desktop"
  chmod +x "${HOME}/Desktop/Bangla Typing Master.desktop"
  echo "Desktop launcher created: ${HOME}/Desktop/Bangla Typing Master.desktop"
fi

command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$APPS_DIR" || true
command -v gtk-update-icon-cache >/dev/null 2>&1 && gtk-update-icon-cache -f -t "${XDG_DATA}/icons/hicolor" || true

echo "Installed Bangla Typing Master AppImage to: ${APPIMAGE_DEST}"
echo "Cinnamon menu entry created at: ${APPS_DIR}/bangla-typing-master.desktop"
echo "You can now launch 'Bangla Typing Master' directly from the Cinnamon Menu (Education)."
