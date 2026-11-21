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
        text: 'বাংলা Unicode এবং Firefox Extension ব্যবহার করে অফলাইনেই বাংলা টাইপিং অনুশীলন করা যায়। প্রতিদিন ১০ মিনিট সময় দিলে WPM ও নির্ভুলতা দ্রুত বৃদ্ধি পায়।',
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
 * Offline-first data loader:
 * 1. Reads from IndexedDB (`BanglaTypingMasterDB`) as primary structured offline database.
 * 2. Falls back to Firefox `browser.storage.local` or `localStorage` and migrates automatically into IndexedDB.
 */
export async function loadAppData(): Promise<AppStorageData> {
  try {
    const idbData = await readFromIndexedDB();
    if (idbData) {
      return mergeWithDefaults(idbData);
    }

    const extStorage = getExtensionStorage();
    if (extStorage) {
      const res = await extStorage.get([STORAGE_KEY]);
      if (res && res[STORAGE_KEY]) {
        const merged = mergeWithDefaults(res[STORAGE_KEY]);
        await writeToIndexedDB(merged);
        return merged;
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const merged = mergeWithDefaults(JSON.parse(raw));
        await writeToIndexedDB(merged);
        return merged;
      }
    }
  } catch {
    // Fallback cleanly to defaults
  }
  return createInitialStorageData();
}

/**
 * Saves application data into IndexedDB (primary) and mirrors lightweight snapshot
 * into Firefox `browser.storage.local` / `localStorage` so extension popup stays in sync.
 */
export async function saveAppData(data: AppStorageData): Promise<void> {
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
    // Ignore quota errors on secondary mirror; IndexedDB holds the full history
  }
}

export function exportFullBackupJson(data: AppStorageData): string {
  return JSON.stringify(
    {
      app: 'Bangla Typing Master',
      storageEngine: 'IndexedDB',
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
