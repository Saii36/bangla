import { invoke } from '@tauri-apps/api/core';

export interface DesktopStorageStatus {
  dataDir: string;
  dataFile: string;
  backupsDir: string;
  exists: boolean;
  sizeBytes: number;
  backupCount: number;
}

export interface DesktopRuntimeInfo {
  appName: string;
  appVersion: string;
  os: string;
  arch: string;
  packageFormat: string;
  executablePath: string;
  storage: DesktopStorageStatus;
}

export interface DesktopBackupFileInfo {
  filename: string;
  fullPath: string;
  sizeBytes: number;
  modifiedMs: number;
  isAuto: boolean;
}

export interface DesktopSaveResult {
  dataFile: string;
  bytesWritten: number;
  backupCreated: boolean;
}

export interface DesktopIntegrationResult {
  executablePath: string;
  menuEntryPath: string;
  iconPath: string;
  desktopShortcutPath: string | null;
  packageFormat: string;
}

/**
 * Reliable runtime detection for Tauri 2 desktop window vs Firefox Extension / Web browser.
 */
export function isTauriDesktop(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean((window as unknown as Record<string, unknown>).__TAURI_INTERNALS__)
  );
}

export async function getDesktopRuntimeInfo(): Promise<DesktopRuntimeInfo | null> {
  if (!isTauriDesktop()) return null;
  try {
    return await invoke<DesktopRuntimeInfo>('get_desktop_info');
  } catch {
    return null;
  }
}

export async function loadNativePersistentData(): Promise<string | null> {
  if (!isTauriDesktop()) return null;
  return invoke<string | null>('load_persistent_data');
}

export async function saveNativePersistentData(
  payload: string,
  allowDestructive = false
): Promise<DesktopSaveResult | null> {
  if (!isTauriDesktop()) return null;
  return invoke<DesktopSaveResult>('save_persistent_data', {
    payload,
    allowDestructive,
  });
}

export async function createNativeBackup(
  payload: string
): Promise<DesktopBackupFileInfo | null> {
  if (!isTauriDesktop()) return null;
  return invoke<DesktopBackupFileInfo>('create_local_backup', { payload });
}

export async function listNativeBackups(): Promise<DesktopBackupFileInfo[]> {
  if (!isTauriDesktop()) return [];
  try {
    return await invoke<DesktopBackupFileInfo[]>('list_local_backups');
  } catch {
    return [];
  }
}

export async function readNativeBackup(filename: string): Promise<string> {
  return invoke<string>('read_local_backup', { filename });
}

export async function installCinnamonDesktopLauncher(
  createDesktopShortcut: boolean
): Promise<DesktopIntegrationResult> {
  return invoke<DesktopIntegrationResult>('install_cinnamon_launcher', {
    createDesktopShortcut,
  });
}
