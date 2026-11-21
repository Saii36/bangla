import {
  isTauriDesktop,
  loadNativePersistentData,
  saveNativePersistentData,
} from './desktopBridge';
import { readFromIndexedDB, writeToIndexedDB } from './indexedDb';
import type {
  AppStorageData,
  CustomCharSet,
  Lesson,
  SavedCustomText,
  TypingSessionResult,
  UserSettings,
} from '../types';

const STORAGE_KEY = 'bangla_typing_master_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  layoutId: 'avro',
  difficulty: 'beginner',
  testDurationSec: 60,
  fontSize: 26,
  fontFamily: 'siliguri',
  colorPreset: 'default',
  soundEnabled: true,
  keyboardSoundEnabled: true,
  autoPunctuation: true,
  highlightErrors: true,
  showVirtualKeyboard: true,
  showKeyHints: true,
  speedMetric: 'wpm-standard',
  accuracyModeMaxErrors: 5,
};

export const DEFAULT_CUSTOM_CHAR_SETS: CustomCharSet[] = [
  {
    id: 'set-k-borgo',
    name: 'ক-বর্গ (ক খ গ ঘ ঙ)',
    chars: ['ক', 'খ', 'গ', 'ঘ', 'ঙ'],
    includeCombinations: true,
    randomize: true,
    repeatDifficult: true,
    createdAt: 1700000001000,
  },
  {
    id: 'set-complex-words',
    name: 'জটিল শব্দ সেট (বিশ্ববিদ্যালয়, প্রযুক্তি...)',
    chars: ['বিশ্ববিদ্যালয়', 'প্রযুক্তি', 'স্বাধীনতা', 'দৃষ্টিভঙ্গি', 'প্রতিযোগিতা', 'গুরুত্বপূর্ণ'],
    includeCombinations: false,
    randomize: true,
    repeatDifficult: true,
    createdAt: 1700000002000,
  },
];

export function createInitialStorageData(): AppStorageData {
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    sessions: [],
    customLessons: [],
    customCharSets: [...DEFAULT_CUSTOM_CHAR_SETS],
    savedCustomTexts: [
      {
        id: 'ct-sample-1',
        title: 'বাংলা ও ইংরেজি মিশ্র অনুচ্ছেদ',
        text: 'বাংলা Unicode ব্যবহার করে অফলাইনেই বাংলা টাইপিং অনুশীলন করা যায়। প্রতিদিন ১০ মিনিট সময় দিলে WPM ও নির্ভুলতা দ্রুত বৃদ্ধি পায়।',
        createdAt: 1700000001000,
      },
    ],
    charMistakeTotals: {},
    charAttemptTotals: {},
  };
}

interface ExtensionStorageAPI {
  get: (keys: string[]) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
}

/**
 * Detects Firefox WebExtension `browser.storage.local` (or Chromium `chrome.storage.local`).
 */
function getExtensionStorage(): ExtensionStorageAPI | null {
  const g = globalThis as unknown as {
    browser?: { storage?: { local?: ExtensionStorageAPI } };
    chrome?: {
      storage?: {
        local?: {
          get: (keys: string[], cb: (res: Record<string, unknown>) => void) => void;
          set: (items: Record<string, unknown>, cb: () => void) => void;
        };
      };
    };
  };

  if (g.browser?.storage?.local) {
    return g.browser.storage.local;
  }

  if (g.chrome?.storage?.local) {
    const local = g.chrome.storage.local;
    return {
      get: (keys) =>
        new Promise((resolve) => {
          local.get(keys, (res) => resolve(res || {}));
        }),
      set: (items) =>
        new Promise((resolve) => {
          local.set(items, () => resolve());
        }),
    };
  }

  return null;
}

export function isRunningInExtension(): boolean {
  return getExtensionStorage() !== null;
}

function mergeWithDefaults(raw: unknown): AppStorageData {
  const base = createInitialStorageData();
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Partial<AppStorageData>;
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS, ...(obj.settings || {}) },
    sessions: Array.isArray(obj.sessions) ? obj.sessions : [],
    customLessons: Array.isArray(obj.customLessons) ? obj.customLessons : [],
    customCharSets:
      Array.isArray(obj.customCharSets) && obj.customCharSets.length > 0
        ? obj.customCharSets
        : base.customCharSets,
    savedCustomTexts: Array.isArray(obj.savedCustomTexts)
      ? obj.savedCustomTexts
      : base.savedCustomTexts,
    charMistakeTotals:
      obj.charMistakeTotals && typeof obj.charMistakeTotals === 'object'
        ? obj.charMistakeTotals
        : {},
    charAttemptTotals:
      obj.charAttemptTotals && typeof obj.charAttemptTotals === 'object'
        ? obj.charAttemptTotals
        : {},
  };
}

/**
 * Non-destructive merge used when importing a Firefox JSON backup into the Desktop app
 * (or reconciling WebView IndexedDB with native persistent XDG storage).
 * Never drops existing sessions, custom lessons, custom character sets, or saved texts.
 */
export function mergeBackupData(
  existing: AppStorageData,
  incoming: AppStorageData
): AppStorageData {
  const sessionMap = new Map<string, TypingSessionResult>();
  for (const s of existing.sessions) sessionMap.set(s.id, s);
  for (const s of incoming.sessions) {
    if (!sessionMap.has(s.id)) sessionMap.set(s.id, s);
  }
  const mergedSessions = Array.from(sessionMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const lessonMap = new Map<string, Lesson>();
  for (const l of existing.customLessons) lessonMap.set(l.id, l);
  for (const l of incoming.customLessons) {
    const prev = lessonMap.get(l.id);
    if (!prev || l.updatedAt > prev.updatedAt) {
      lessonMap.set(l.id, l);
    }
  }
  const mergedLessons = Array.from(lessonMap.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  const charSetMap = new Map<string, CustomCharSet>();
  for (const c of existing.customCharSets) charSetMap.set(c.id, c);
  for (const c of incoming.customCharSets) {
    if (!charSetMap.has(c.id)) charSetMap.set(c.id, c);
  }

  const textMap = new Map<string, SavedCustomText>();
  for (const t of existing.savedCustomTexts) textMap.set(t.id, t);
  for (const t of incoming.savedCustomTexts) {
    if (!textMap.has(t.id)) textMap.set(t.id, t);
  }

  // Recompute mistake totals conservatively so merged sessions are reflected accurately
  const mergedMistakes: Record<string, number> = { ...existing.charMistakeTotals };
  for (const [ch, cnt] of Object.entries(incoming.charMistakeTotals)) {
    mergedMistakes[ch] = Math.max(mergedMistakes[ch] || 0, cnt);
  }
  const mergedAttempts: Record<string, number> = { ...existing.charAttemptTotals };
  for (const [ch, cnt] of Object.entries(incoming.charAttemptTotals)) {
    mergedAttempts[ch] = Math.max(mergedAttempts[ch] || 0, cnt);
  }

  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS, ...incoming.settings, ...existing.settings },
    sessions: mergedSessions,
    customLessons: mergedLessons,
    customCharSets: Array.from(charSetMap.values()),
    savedCustomTexts: Array.from(textMap.values()),
    charMistakeTotals: mergedMistakes,
    charAttemptTotals: mergedAttempts,
  };
}

/**
 * Offline-first crash-safe data loader:
 * 1. In Tauri Linux Desktop: loads native persistent XDG file (`user-data.json`) AND WebView IndexedDB.
 *    If both exist with distinct records, merges safely; if only IndexedDB exists, migrates to XDG file.
 * 2. In Firefox / Browser: reads from IndexedDB (`BanglaTypingMasterDB`) and migrates from
 *    `browser.storage.local` or `localStorage` automatically.
 */
export async function loadAppData(): Promise<AppStorageData> {
  try {
    const idbRaw = await readFromIndexedDB();
    const idbData = idbRaw ? mergeWithDefaults(idbRaw) : null;

    if (isTauriDesktop()) {
      let nativeData: AppStorageData | null = null;
      try {
        const rawNative = await loadNativePersistentData();
        if (rawNative) {
          nativeData = mergeWithDefaults(JSON.parse(rawNative));
        }
      } catch {
        // If native file read fails, fall back safely to IndexedDB without losing data
      }

      if (nativeData && idbData) {
        // Reconcile non-destructively in case IndexedDB has any newer un-synced sessions
        const reconciled =
          idbData.sessions.length > nativeData.sessions.length ||
          idbData.customLessons.length > nativeData.customLessons.length
            ? mergeBackupData(nativeData, idbData)
            : nativeData;
        await writeToIndexedDB(reconciled);
        if (reconciled !== nativeData) {
          await saveNativePersistentData(JSON.stringify(reconciled), false).catch(() => undefined);
        }
        return reconciled;
      }

      if (nativeData) {
        await writeToIndexedDB(nativeData);
        return nativeData;
      }

      if (idbData) {
        // First desktop migration: persist existing IndexedDB data into native XDG directory
        await saveNativePersistentData(JSON.stringify(idbData), false).catch(() => undefined);
        return idbData;
      }
    }

    if (idbData) {
      return idbData;
    }

    const extStorage = getExtensionStorage();
    if (extStorage) {
      const res = await extStorage.get([STORAGE_KEY]);
      if (res && res[STORAGE_KEY]) {
        const merged = mergeWithDefaults(res[STORAGE_KEY]);
        await writeToIndexedDB(merged);
        if (isTauriDesktop()) {
          await saveNativePersistentData(JSON.stringify(merged), false).catch(() => undefined);
        }
        return merged;
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const merged = mergeWithDefaults(JSON.parse(raw));
        await writeToIndexedDB(merged);
        if (isTauriDesktop()) {
          await saveNativePersistentData(JSON.stringify(merged), false).catch(() => undefined);
        }
        return merged;
      }
    }
  } catch {
    // Fallback cleanly to defaults
  }
  return createInitialStorageData();
}

/**
 * Saves application data atomically into:
 * - Tauri native persistent XDG app data file (when running as Linux Desktop app)
 * - IndexedDB (`BanglaTypingMasterDB`)
 * - Firefox `browser.storage.local` / `localStorage` mirror
 */
export async function saveAppData(
  data: AppStorageData,
  options?: { allowDestructive?: boolean }
): Promise<void> {
  if (isTauriDesktop()) {
    try {
      await saveNativePersistentData(
        JSON.stringify(data),
        Boolean(options?.allowDestructive)
      );
    } catch {
      // IndexedDB still stores the current state; guard errors protect against silent wipes
    }
  }

  try {
    await writeToIndexedDB(data);
  } catch {
    // Continue to mirrors
  }

  try {
    const extStorage = getExtensionStorage();
    if (extStorage) {
      await extStorage.set({ [STORAGE_KEY]: data });
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // Ignore quota errors on secondary mirror; primary storage holds the full history
  }
}

export function exportFullBackupJson(data: AppStorageData): string {
  return JSON.stringify(
    {
      app: 'Bangla Typing Master',
      storageEngine: isTauriDesktop() ? 'TauriXdgFile+IndexedDB' : 'IndexedDB',
      exportedAt: new Date().toISOString(),
      data,
    },
    null,
    2
  );
}

export function parseBackupJson(rawJson: string): AppStorageData {
  const parsed = JSON.parse(rawJson);
  const payload = parsed?.data ? parsed.data : parsed;
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid backup format.');
  }
  return mergeWithDefaults(payload);
}

export function downloadTextFile(filename: string, content: string, mime = 'application/json'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function recordSessionInData(
  prev: AppStorageData,
  session: TypingSessionResult
): AppStorageData {
  const nextMistakes = { ...prev.charMistakeTotals };
  for (const [ch, cnt] of Object.entries(session.mistakesByChar)) {
    nextMistakes[ch] = (nextMistakes[ch] || 0) + cnt;
  }
  return {
    ...prev,
    sessions: [...prev.sessions, session],
    charMistakeTotals: nextMistakes,
  };
}

export type { CustomCharSet, Lesson, SavedCustomText };
