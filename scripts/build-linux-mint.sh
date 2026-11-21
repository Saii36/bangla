#!/usr/bin/env bash
set -euo pipefail

# Bangla Typing Master — Reproducible Linux Mint 22.3 (Zena) x86_64 Build Script
# Builds standalone offline Tauri 2 AppImage and DEB packages.

echo "=== Checking required system packages for Linux Mint 22.3 / Ubuntu 24.04 ==="
MISSING=()
for pkg in libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf; do
  dpkg -s "$pkg" >/dev/null 2>&1 || MISSING+=("$pkg")
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "Missing system libraries: ${MISSING[*]}"
  echo "Install them once with:"
  echo "  sudo apt update && sudo apt install -y build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev libwebkit2gtk-4.1-dev libgtk-3-dev pkg-config patchelf squashfs-tools"
  exit 1
fi

command -v cargo >/dev/null 2>&1 || {
  echo "Rust toolchain (cargo) not found. Install via: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
  exit 1
}

echo "=== Running Rust persistence & desktop integration tests ==="
cargo test --manifest-path src-tauri/Cargo.toml

echo "=== Installing frontend dependencies (if needed) ==="
[[ -d node_modules ]] || npm install

echo "=== Building Tauri 2 Linux x86_64 AppImage & DEB ==="
npm run tauri:build -- --bundles deb,appimage

mkdir -p release-linux
cp -fv src-tauri/target/release/bundle/appimage/*.AppImage release-linux/
cp -fv src-tauri/target/release/bundle/deb/*.deb release-linux/

echo ""
echo "=== Build complete ==="
ls -lh release-linux/
echo ""
echo "To integrate the AppImage into your Cinnamon Menu (no sudo required):"
echo "  ./scripts/install-cinnamon-launcher.sh release-linux/*.AppImage --desktop-shortcut"
