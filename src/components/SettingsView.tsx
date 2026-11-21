import React, { useMemo, useRef, useState } from 'react';
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
} from 'lucide-react';
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
  onRestoreBackup: (nextData: AppStorageData) => void;
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [verifyReport, setVerifyReport] = useState<OfflineVerificationReport | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleRunOfflineVerification = async () => {
    setVerifying(true);
    try {
      const report = await runOfflineVerificationSuite();
      setVerifyReport(report);
    } finally {
      setVerifying(false);
    }
  };

  const handleExportBackup = () => {
    const json = exportFullBackupJson(data);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`bangla-typing-master-backup-${stamp}.json`, json, 'application/json');
    setNotice('Exported full local backup (settings, lessons, custom sets, and progress).');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseBackupJson(String(reader.result || ''));
        onRestoreBackup(parsed);
        setNotice(`Restored backup successfully (${parsed.sessions.length} sessions loaded).`);
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

      {/* Firefox WebExtension, IndexedDB Storage & Privacy Backup */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Firefox Extension, IndexedDB Offline Storage &amp; Backups
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manifest V3 · Primary DB:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {diagnostics.engine} ({diagnostics.dbName})
              </strong>
              {isRunningInExtension() ? ' + Firefox browser.storage.local sync' : ''} · Zero cloud sync or telemetry.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPopupPreview}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <PanelTop className="w-4 h-4" />
            Preview Firefox Popup
          </button>
        </div>

        {/* IndexedDB Diagnostics Grid */}
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

        <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            Installing in Firefox (Manifest V3) &amp; Linux Desktop Architecture
          </p>
          <p>
            1. Build the extension with <code className="font-mono-tabular">npm run build</code> to generate the self-contained <code className="font-mono-tabular">dist/</code> bundle (<code className="font-mono-tabular">manifest.json</code>, <code className="font-mono-tabular">popup.html</code>, <code className="font-mono-tabular">background.js</code>, <code className="font-mono-tabular">index.html</code>).
          </p>
          <p>
            2. Open <code className="font-mono-tabular">about:debugging#/runtime/this-firefox</code> in Firefox, click <strong>Load Temporary Add-on</strong>, and select <code className="font-mono-tabular">dist/manifest.json</code>.
          </p>
          <p>
            3. All core engines (Unicode, Avro, Fixed Layouts, Heatmap, Finger Analytics, IndexedDB) live in platform-independent TypeScript modules ready to wrap inside <strong>Tauri</strong> for native Linux <strong>AppImage</strong> and <strong>.deb</strong> packaging.
          </p>
        </div>

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
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Restore Backup
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
              <li>IndexedDB local persistence, JSON/TXT lesson import/export, and Web Audio sound</li>
            </ul>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Requires Initial Install or External OS Software
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Initial extension/package download or Linux Bangla font packages (<code className="font-mono-tabular">fonts-noto-core</code> / <code className="font-mono-tabular">fonts-beng</code>)</li>
              <li>Optional system-wide IME mode requires local Linux <code className="font-mono-tabular">IBus</code>, <code className="font-mono-tabular">Fcitx5</code>, or <code className="font-mono-tabular">OpenBangla Keyboard</code></li>
              <li>Optional Google Web Fonts gracefully fall back to local Linux Bangla system fonts offline</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
