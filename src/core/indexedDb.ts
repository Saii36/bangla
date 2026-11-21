import type { AppStorageData, Lesson, TypingSessionResult } from '../types';

const DB_NAME = 'BanglaTypingMasterDB';
const DB_VERSION = 1;
const STORE_KV = 'kv';
const STORE_SESSIONS = 'sessions';
const STORE_LESSONS = 'customLessons';

export interface StorageDiagnostics {
  engine: 'IndexedDB' | 'localStorage-fallback';
  dbName: string;
  dbVersion: number;
  sessionCount: number;
  keyEventCount: number;
  customLessonCount: number;
  estimatedBytes: number;
  online: boolean;
}

function hasIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDB()) {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV);
      }
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const sStore = db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
        sStore.createIndex('timestamp', 'timestamp', { unique: false });
        sStore.createIndex('dateKey', 'dateKey', { unique: false });
        sStore.createIndex('layoutId', 'layoutId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_LESSONS)) {
        const lStore = db.createObjectStore(STORE_LESSONS, { keyPath: 'id' });
        lStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'));
  });
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

/**
 * Loads the complete local application dataset from IndexedDB.
 * Returns null if the database has never been initialized yet.
 */
export async function readFromIndexedDB(): Promise<Partial<AppStorageData> | null> {
  if (!hasIndexedDB()) return null;
  let db: IDBDatabase | null = null;
  try {
    db = await openDatabase();
    const tx = db.transaction([STORE_KV, STORE_SESSIONS, STORE_LESSONS], 'readonly');
    const kv = tx.objectStore(STORE_KV);
    const sessionsStore = tx.objectStore(STORE_SESSIONS);
    const lessonsStore = tx.objectStore(STORE_LESSONS);

    const [
      initialized,
      settings,
      customCharSets,
      savedCustomTexts,
      charMistakeTotals,
      charAttemptTotals,
      sessions,
      customLessons,
    ] = await Promise.all([
      reqToPromise(kv.get('initialized')),
      reqToPromise(kv.get('settings')),
      reqToPromise(kv.get('customCharSets')),
      reqToPromise(kv.get('savedCustomTexts')),
      reqToPromise(kv.get('charMistakeTotals')),
      reqToPromise(kv.get('charAttemptTotals')),
      reqToPromise<TypingSessionResult[]>(sessionsStore.getAll()),
      reqToPromise<Lesson[]>(lessonsStore.getAll()),
    ]);

    if (!initialized && sessions.length === 0 && customLessons.length === 0 && !settings) {
      return null;
    }

    sessions.sort((a, b) => a.timestamp - b.timestamp);
    customLessons.sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      version: 1,
      settings,
      sessions,
      customLessons,
      customCharSets,
      savedCustomTexts,
      charMistakeTotals,
      charAttemptTotals,
    };
  } catch {
    return null;
  } finally {
    db?.close();
  }
}

/**
 * Persists the complete application state atomically into IndexedDB stores.
 */
export async function writeToIndexedDB(data: AppStorageData): Promise<boolean> {
  if (!hasIndexedDB()) return false;
  let db: IDBDatabase | null = null;
  try {
    db = await openDatabase();
    const tx = db.transaction([STORE_KV, STORE_SESSIONS, STORE_LESSONS], 'readwrite');
    const kv = tx.objectStore(STORE_KV);
    const sessionsStore = tx.objectStore(STORE_SESSIONS);
    const lessonsStore = tx.objectStore(STORE_LESSONS);

    kv.put(true, 'initialized');
    kv.put(data.settings, 'settings');
    kv.put(data.customCharSets, 'customCharSets');
    kv.put(data.savedCustomTexts, 'savedCustomTexts');
    kv.put(data.charMistakeTotals, 'charMistakeTotals');
    kv.put(data.charAttemptTotals, 'charAttemptTotals');

    sessionsStore.clear();
    for (const s of data.sessions) {
      sessionsStore.put(s);
    }

    lessonsStore.clear();
    for (const l of data.customLessons) {
      lessonsStore.put(l);
    }

    await txDone(tx);
    return true;
  } catch {
    return false;
  } finally {
    db?.close();
  }
}

/**
 * Verifies IndexedDB read/write/delete round-trip for the Offline Verification Suite.
 */
export async function testIndexedDBRoundTrip(): Promise<{ ok: boolean; detail: string }> {
  if (!hasIndexedDB()) {
    return { ok: false, detail: 'IndexedDB API unavailable in current runtime.' };
  }
  let db: IDBDatabase | null = null;
  try {
    db = await openDatabase();
    const testKey = '__offline_probe__';
    const probeVal = `ok-${Date.now()}`;

    const writeTx = db.transaction([STORE_KV], 'readwrite');
    writeTx.objectStore(STORE_KV).put(probeVal, testKey);
    await txDone(writeTx);

    const readTx = db.transaction([STORE_KV], 'readonly');
    const readVal = await reqToPromise(readTx.objectStore(STORE_KV).get(testKey));

    const cleanTx = db.transaction([STORE_KV], 'readwrite');
    cleanTx.objectStore(STORE_KV).delete(testKey);
    await txDone(cleanTx);

    if (readVal === probeVal) {
      return {
        ok: true,
        detail: `IndexedDB (${DB_NAME} v${DB_VERSION}) read/write/delete succeeded locally.`,
      };
    }
    return { ok: false, detail: 'IndexedDB value mismatch on round-trip read.' };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : 'IndexedDB test failed.',
    };
  } finally {
    db?.close();
  }
}

export function computeStorageDiagnostics(data: AppStorageData): StorageDiagnostics {
  const keyEventCount = data.sessions.reduce(
    (sum, s) => sum + (s.keyEvents ? s.keyEvents.length : 0),
    0
  );
  const serialized = JSON.stringify(data);
  const estimatedBytes = new Blob([serialized]).size;

  return {
    engine: hasIndexedDB() ? 'IndexedDB' : 'localStorage-fallback',
    dbName: DB_NAME,
    dbVersion: DB_VERSION,
    sessionCount: data.sessions.length,
    keyEventCount,
    customLessonCount: data.customLessons.length,
    estimatedBytes,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
}
