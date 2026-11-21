import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  PanelTop,
  Sun,
  Moon,
  Monitor,
  Database,
  CheckCircle2,
  XCircle,
  Play,
  Cpu,
  HardDrive,
  FolderCheck,
  Layers,
} from 'lucide-react';
import {
  createNativeBackup,
  DesktopBackupFileInfo,
  DesktopRuntimeInfo,
  getDesktopRuntimeInfo,
  installCinnamonDesktopLauncher,
  isTauriDesktop,
  listNativeBackups,
  readNativeBackup,
} from '../core/desktopBridge';
import { computeStorageDiagnostics } from '../core/indexedDb';
import { getAllLayouts } from '../core/layouts/registry';
import {
  OfflineVerificationReport,
  runOfflineVerificationSuite,
} from '../core/offlineVerifier';
import {
  downloadTextFile,
  exportFullBackupJson,
  isRunningInExtension,
  parseBackupJson,
} from '../core/storage';
import type {
  AppStorageData,
  BanglaFontFamily,
  ColorPreset,
  Difficulty,
  LayoutId,
  SpeedMetricPreference,
  UserSettings,
} from '../types';

interface SettingsViewProps {
  data: AppStorageData;
  onUpdateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  onRestoreBackup: (nextData: AppStorageData, mode: 'merge' | 'replace') => void;
  onResetProgress: () => void;
  onOpenPopupPreview: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  data,
  onUpdateSetting,
  onRestoreBackup,
  onResetProgress,
  onOpenPopupPreview,
}) => {
  const { settings } = data;
  const allLayouts = useMemo(() => getAllLayouts(), []);
  const diagnostics = useMemo(() => computeStorageDiagnostics(data), [data]);
  const inDesktop = isTauriDesktop();
  const fileRef = useRef<HTMLInputElement>(null);
  const importModeRef = useRef<'merge' | 'replace'>('merge');
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [verifyReport, setVerifyReport] = useState<OfflineVerificationReport | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [desktopInfo, setDesktopInfo] = useState<DesktopRuntimeInfo | null>(null);
  const [localBackups, setLocalBackups] = useState<DesktopBackupFileInfo[]>([]);
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);
  const [installingLauncher, setInstallingLauncher] = useState(false);

  const refreshDesktopDiagnostics = async () => {
    if (!inDesktop) return;
    const [info, backups] = await Promise.all([getDesktopRuntimeInfo(), listNativeBackups()]);
    setDesktopInfo(info);
    setLocalBackups(backups);
  };

  useEffect(() => {
    refreshDesktopDiagnostics();
  }, [data.sessions.length, data.customLessons.length]);

  const handleRunOfflineVerification = async () => {
    setVerifying(true);
    try {
      const report = await runOfflineVerificationSuite();
      setVerifyReport(report);
    } finally {
      setVerifying(false);
    }
  };

  const handleExportBackup = async () => {
    const json = exportFullBackupJson(data);
    const stamp = new Date().toISOString().slice(0, 10);
    if (inDesktop) {
      try {
        const saved = await createNativeBackup(json);
        await refreshDesktopDiagnostics();
        if (saved) {
          setNotice(`Saved verified snapshot to ${saved.fullPath}`);
        }
      } catch {
        // Still allow browser download fallback below
      }
    }
    downloadTextFile(`bangla-typing-master-backup-${stamp}.json`, json, 'application/json');
    if (!inDesktop) {
      setNotice('Exported full local backup (settings, lessons, custom sets, and progress).');
    }
  };

  const handleSaveDesktopSnapshotOnly = async () => {
    try {
      const json = exportFullBackupJson(data);
      const saved = await createNativeBackup(json);
      await refreshDesktopDiagnostics();
      if (saved) {
        setNotice(`Snapshot written safely to ${saved.fullPath}`);
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to create local snapshot.');
    }
  };

  const handleRestoreSnapshot = async (filename: string, mode: 'merge' | 'replace') => {
    try {
      const raw = await readNativeBackup(filename);
      const parsed = parseBackupJson(raw);
      onRestoreBackup(parsed, mode);
      setNotice(
        mode === 'merge'
          ? `Merged snapshot ${filename} safely without discarding existing records.`
          : `Restored snapshot ${filename} (${parsed.sessions.length} sessions loaded).`
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to restore local snapshot.');
    }
  };

  const handleInstallCinnamonLauncher = async () => {
    setInstallingLauncher(true);
    try {
      const res = await installCinnamonDesktopLauncher(createDesktopShortcut);
      setNotice(
        `Cinnamon launcher installed at ${res.menuEntryPath}${
          res.desktopShortcutPath ? ` and ${res.desktopShortcutPath}` : ''
        }.`
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to install Cinnamon launcher.');
    } finally {
      setInstallingLauncher(false);
    }
  };

  const triggerBackupImport = (mode: 'merge' | 'replace') => {
    importModeRef.current = mode;
    fileRef.current?.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseBackupJson(String(reader.result || ''));
        const mode = importModeRef.current;
        onRestoreBackup(parsed, mode);
        setNotice(
          mode === 'merge'
            ? `Safely merged backup (${parsed.sessions.length} sessions & ${parsed.customLessons.length} custom lessons combined with existing data).`
            : `Replaced local dataset from backup (${parsed.sessions.length} sessions loaded).`
        );
      } catch (err) {
        setNotice(err instanceof Error ? err.message : 'Failed to import backup JSON.');
      }
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

  const fontPreviewClass: Record<BanglaFontFamily, string> = {
    siliguri: 'font-bangla-siliguri',
    'noto-sans': 'font-bangla-sans',
    'noto-serif': 'font-bangla-serif',
    tiro: 'font-bangla-tiro',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {notice && (
        <div className="flex items-center justify-between text-xs text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl px-4 py-3">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Input & Practice Preferences */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Typing &amp; Input Method Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure default layout, difficulty, timer duration, and speed metric formula.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Bangla Input Method
            </label>
            <select
              value={settings.layoutId}
              onChange={(e) => onUpdateSetting('layoutId', e.target.value as LayoutId)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              {allLayouts.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.badgeLabel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Default Practice Difficulty
            </label>
            <select
              value={settings.difficulty}
              onChange={(e) => onUpdateSetting('difficulty', e.target.value as Difficulty)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Default Timed Test Duration
            </label>
            <select
              value={settings.testDurationSec}
              onChange={(e) => onUpdateSetting('testDurationSec', Number(e.target.value))}
              className="w-full h-10 px-3 text-sm font-mono-tabular rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds (1 min)</option>
              <option value={120}>120 seconds (2 min)</option>
              <option value={180}>180 seconds (3 min)</option>
              <option value={300}>300 seconds (5 min)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Primary Speed Metric
            </label>
            <select
              value={settings.speedMetric}
              onChange={(e) =>
                onUpdateSetting('speedMetric', e.target.value as SpeedMetricPreference)
              }
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="wpm-standard">Standard WPM (5 Bangla graphemes = 1 word)</option>
              <option value="wpm-words">Actual Space-Delimited Words / Min</option>
              <option value="cpm">Characters (Graphemes) Per Minute (CPM)</option>
            </select>
          </div>
        </div>

        {/* Toggle Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Sound effects (error &amp; chime)</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSetting('soundEnabled', e.target.checked)}
              className="w-4 h-4 accent-teal-600"
            />
          </label>
          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Tactile keystroke click sound</span>
            <input
              type="checkbox"
              checked={settings.keyboardSoundEnabled}
              onChange={(e) => onUpdateSetting('keyboardSoundEnabled', e.target.checked)}
              className="w-4 h-4 accent-teal-600"
            />
          </label>
          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Smart punctuation equivalence</span>
            <input
              type="checkbox"
              checked={settings.autoPunctuation}
              onChange={(e) => onUpdateSetting('autoPunctuation', e.target.checked)}
              className="w-4 h-4 accent-teal-600"
            />
          </label>
          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Highlight typing errors</span>
            <input
              type="checkbox"
              checked={settings.highlightErrors}
              onChange={(e) => onUpdateSetting('highlightErrors', e.target.checked)}
              className="w-4 h-4 accent-teal-600"
            />
          </label>
          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Show on-screen virtual keyboard</span>
            <input
              type="checkbox"
              checked={settings.showVirtualKeyboard}
              onChange={(e) => onUpdateSetting('showVirtualKeyboard', e.target.checked)}
              className="w-4 h-4 accent-teal-600"
            />
          </label>
          <label className="flex items-center justify-between gap-3 py-1 cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Show next-character keystroke hint</span>
            <input
              type="checkbox"
              checked={settings.showKeyHints}
              onChange={(e) => onUpdateSetting('showKeyHints', e.target.checked)}
              className="w-4 h-4 accent-teal-600"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Accuracy Mode Mistake Limit
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Maximum mistakes permitted before ending an Accuracy Mode session.
            </p>
          </div>
          <input
            type="number"
            min={1}
            max={25}
            value={settings.accuracyModeMaxErrors}
            onChange={(e) =>
              onUpdateSetting(
                'accuracyModeMaxErrors',
                Math.max(1, Math.min(25, Number(e.target.value) || 5))
              )
            }
            className="w-20 h-9 px-3 text-sm font-mono-tabular text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>
      </section>

      {/* Appearance & Typography */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Appearance &amp; Bangla Typography
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalize light/dark theme, Bangla font family, text size, and reading surface contrast.
          </p>
        </div>

        {/* Theme Switcher */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Theme</span>
          <div className="grid grid-cols-3 gap-2 max-w-sm">
            {(
              [
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Monitor },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onUpdateSetting('theme', id)}
                className={`inline-flex items-center justify-center gap-1.5 h-10 rounded-lg border text-xs font-medium transition-colors ${
                  settings.theme === id
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Bangla Font Family
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) => onUpdateSetting('fontFamily', e.target.value as BanglaFontFamily)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="siliguri">Hind Siliguri (Modern Clean Sans)</option>
              <option value="noto-sans">Noto Sans Bengali (Balanced Unicode)</option>
              <option value="noto-serif">Noto Serif Bengali (Editorial Book)</option>
              <option value="tiro">Tiro Bangla (Classic Literary Serif)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Typing Surface Color Preset
            </label>
            <select
              value={settings.colorPreset}
              onChange={(e) => onUpdateSetting('colorPreset', e.target.value as ColorPreset)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="default">Default Clean Slate</option>
              <option value="paper">Warm Paper Surface</option>
              <option value="high-contrast">High Contrast</option>
              <option value="midnight">Deep Midnight Focus</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="font-size-range" className="font-medium text-slate-700 dark:text-slate-300">
              Practice Text Font Size
            </label>
            <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
              {settings.fontSize}px
            </span>
          </div>
          <input
            id="font-size-range"
            type="range"
            min={18}
            max={40}
            step={1}
            value={settings.fontSize}
            onChange={(e) => onUpdateSetting('fontSize', Number(e.target.value))}
            className="w-full accent-teal-600"
          />
          <div
            style={{ fontSize: `${settings.fontSize}px` }}
            className={`${fontPreviewClass[settings.fontFamily]} p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 leading-relaxed`}
          >
            আমার সোনার বাংলা — বিশ্ববিদ্যালয়, প্রযুক্তি ও স্বাধীনতা।
          </div>
        </div>
      </section>

      {/* Persistent Storage, Desktop Integration & Safe Backups */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              {inDesktop
                ? 'Linux Desktop Persistent Storage & Safe Backups'
                : 'Offline Storage, Firefox Migration & Linux Desktop'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {inDesktop ? (
                <>
                  Native Tauri 2 ({desktopInfo?.packageFormat ?? 'Linux Desktop'}) · Persistent XDG File +{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {diagnostics.engine} ({diagnostics.dbName})
                  </strong>{' '}
                  · Zero cloud sync or telemetry.
                </>
              ) : (
                <>
                  Primary DB:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {diagnostics.engine} ({diagnostics.dbName})
                  </strong>
                  {isRunningInExtension() ? ' + Firefox browser.storage.local sync' : ''} · Zero cloud sync or telemetry.
                </>
              )}
            </p>
          </div>
          {!inDesktop && (
            <button
              type="button"
              onClick={onOpenPopupPreview}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <PanelTop className="w-4 h-4" />
              Preview Firefox Popup
            </button>
          )}
        </div>

        {/* Storage Diagnostics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              Sessions Stored
            </p>
            <p className="text-lg font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-0.5">
              {diagnostics.sessionCount}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
            <p className="text-slate-500 dark:text-slate-400">Keystroke Events</p>
            <p className="text-lg font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-0.5">
              {diagnostics.keyEventCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
            <p className="text-slate-500 dark:text-slate-400">Custom Lessons</p>
            <p className="text-lg font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-0.5">
              {diagnostics.customLessonCount}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
            <p className="text-slate-500 dark:text-slate-400">Local Footprint</p>
            <p className="text-lg font-bold font-mono-tabular text-teal-700 dark:text-teal-300 mt-0.5">
              {(diagnostics.estimatedBytes / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>

        {/* Native Linux Desktop XDG Data Directory & Cinnamon Launcher Controls */}
        {inDesktop && desktopInfo && (
          <div className="rounded-xl border border-teal-200/80 dark:border-teal-900/70 bg-teal-50/40 dark:bg-teal-950/20 p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                Persistent Linux Data Directory ({desktopInfo.os}/{desktopInfo.arch} · {desktopInfo.packageFormat})
              </p>
              <span className="font-mono-tabular text-slate-600 dark:text-slate-400">
                {desktopInfo.storage.backupCount} local snapshot(s)
              </span>
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300 font-mono-tabular break-all">
              <p>Data file: {desktopInfo.storage.dataFile}</p>
              <p>Backups: {desktopInfo.storage.backupsDir}</p>
            </div>

            <div className="pt-2 border-t border-teal-200/60 dark:border-teal-900/50 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createDesktopShortcut}
                  onChange={(e) => setCreateDesktopShortcut(e.target.checked)}
                  className="w-4 h-4 accent-teal-600"
                />
                Also add launcher icon to Desktop
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDesktopSnapshotOnly}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-200 hover:bg-teal-100/60 dark:hover:bg-teal-900/40 font-medium whitespace-nowrap shrink-0"
                >
                  <FolderCheck className="w-3.5 h-3.5" />
                  Save Local Snapshot
                </button>
                <button
                  type="button"
                  disabled={installingLauncher}
                  onClick={handleInstallCinnamonLauncher}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {installingLauncher ? 'Installing...' : 'Add to Cinnamon Menu'}
                </button>
              </div>
            </div>

            {localBackups.length > 0 && (
              <div className="pt-2 border-t border-teal-200/60 dark:border-teal-900/50 space-y-1.5">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Recent Automatic &amp; Manual Snapshots
                </p>
                <div className="max-h-32 overflow-y-auto divide-y divide-slate-200/60 dark:divide-slate-800">
                  {localBackups.slice(0, 6).map((b) => (
                    <div key={b.filename} className="py-1.5 flex items-center justify-between gap-2">
                      <span className="font-mono-tabular text-slate-700 dark:text-slate-300 truncate">
                        {b.filename} ({(b.sizeBytes / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRestoreSnapshot(b.filename, 'merge')}
                        className="text-teal-700 dark:text-teal-300 hover:underline font-medium whitespace-nowrap shrink-0"
                      >
                        Merge Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!inDesktop && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              Migrating Between Firefox &amp; Linux Mint Desktop Application
            </p>
            <p>
              1. Click <strong>Export Full Backup (JSON)</strong> here in Firefox to save all your sessions, heatmap telemetry, custom lessons, and character sets.
            </p>
            <p>
              2. Launch the <strong>Bangla Typing Master</strong> Linux AppImage or DEB application, open <strong>Settings</strong>, and click <strong>Merge Firefox Backup</strong> to import everything without overwriting existing desktop data.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export Full Backup (JSON)
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => triggerBackupImport('merge')}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg border border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Merge Backup (Keep Existing)
            </button>
            <button
              type="button"
              onClick={() => triggerBackupImport('replace')}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Replace With Backup
            </button>
          </div>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Statistics
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-rose-600 dark:text-rose-400 font-medium">Confirm reset?</span>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                  setNotice('Typing statistics and mistake history cleared.');
                }}
                className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Linux Native Offline Verification Suite */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Offline Engine Self-Verification &amp; Linux Procedure
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Disconnect your network (or toggle Firefox &ldquo;Work Offline&rdquo;) and run this live diagnostic to verify 100% local execution.
            </p>
          </div>
          <button
            type="button"
            disabled={verifying}
            onClick={handleRunOfflineVerification}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            {verifying ? 'Running Checks...' : 'Run Offline Verification'}
          </button>
        </div>

        {verifyReport && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <span
                className={`font-semibold ${
                  verifyReport.allPassed
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {verifyReport.allPassed
                  ? `All ${verifyReport.checks.length} offline subsystem checks passed`
                  : 'One or more checks need attention'}
              </span>
              <span className="font-mono-tabular text-slate-500 dark:text-slate-400">
                Network: {verifyReport.isOfflineNow ? 'Offline (Disconnected)' : 'Online'}
              </span>
            </div>
            <div className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs">
              {verifyReport.checks.map((c) => (
                <div key={c.id} className="py-2 flex items-start gap-2.5">
                  {c.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-bangla-siliguri">
                      {c.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="space-y-1.5">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              100% Offline After Installation
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li>All 9 typing modes, custom drills, lessons, and custom text practice</li>
              <li>Built-in Avro Phonetic, Bijoy Classic, UniJoy, Jatiya, and Probhat engines</li>
              <li>Real-time grapheme evaluation, WPM/CPM stats, Keyboard Heatmap &amp; Finger Analyzer</li>
              <li>Persistent Linux XDG storage + IndexedDB, bundled Bangla font, and zero network requests</li>
            </ul>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Optional OS Packages
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Additional Bangla serif/sans fonts (<code className="font-mono-tabular">fonts-noto-core</code> / <code className="font-mono-tabular">fonts-beng</code>) if desired beyond the bundled Lohit Bengali font</li>
              <li>Optional system-wide IME mode uses local Linux <code className="font-mono-tabular">IBus</code>, <code className="font-mono-tabular">Fcitx5</code>, or <code className="font-mono-tabular">OpenBangla Keyboard</code></li>
              <li>Zero external CDN or Google Fonts requests — enforced by strict offline desktop CSP</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
