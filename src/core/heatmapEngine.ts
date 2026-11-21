import { getLayoutById } from './layouts/registry';
import type {
  FingerId,
  FingerPerformanceAggregate,
  HeatmapFilters,
  HeatmapMetricMode,
  KeyboardRowName,
  KeyPerformanceAggregate,
  LayoutId,
  PhysicalKeyEvent,
  TypingSessionResult,
} from '../types';

export interface PhysicalKeyDefinition {
  code: string;
  en: string;
  enShift?: string;
  label?: string; // display label for special keys like Backspace, Tab, Shift, Space
  finger: FingerId;
  row: KeyboardRowName;
  width: number; // keycap relative width (1u = standard alpha key)
  isHome?: boolean;
  isModifier?: boolean;
}

export const FINGER_META: Record<
  FingerId,
  { id: FingerId; label: string; shortLabel: string; hand: 'left' | 'right'; idealShare: number }
> = {
  lp: { id: 'lp', label: 'Left Pinky', shortLabel: 'L. Pinky', hand: 'left', idealShare: 9 },
  lr: { id: 'lr', label: 'Left Ring', shortLabel: 'L. Ring', hand: 'left', idealShare: 9 },
  lm: { id: 'lm', label: 'Left Middle', shortLabel: 'L. Middle', hand: 'left', idealShare: 11 },
  li: { id: 'li', label: 'Left Index', shortLabel: 'L. Index', hand: 'left', idealShare: 16 },
  lthumb: { id: 'lthumb', label: 'Left Thumb', shortLabel: 'L. Thumb', hand: 'left', idealShare: 7 },
  rthumb: { id: 'rthumb', label: 'Right Thumb', shortLabel: 'R. Thumb', hand: 'right', idealShare: 9 },
  ri: { id: 'ri', label: 'Right Index', shortLabel: 'R. Index', hand: 'right', idealShare: 16 },
  rm: { id: 'rm', label: 'Right Middle', shortLabel: 'R. Middle', hand: 'right', idealShare: 10 },
  rr: { id: 'rr', label: 'Right Ring', shortLabel: 'R. Ring', hand: 'right', idealShare: 7 },
  rp: { id: 'rp', label: 'Right Pinky', shortLabel: 'R. Pinky', hand: 'right', idealShare: 6 },
};

export const ALL_FINGER_IDS: FingerId[] = [
  'lp',
  'lr',
  'lm',
  'li',
  'lthumb',
  'rthumb',
  'ri',
  'rm',
  'rr',
  'rp',
];

/**
 * Full realistic ANSI 5-row physical keyboard specification with ergonomic touch-typing finger assignments.
 */
export const PHYSICAL_KEYBOARD_ROWS: PhysicalKeyDefinition[][] = [
  // Row 0: Number row
  [
    { code: 'Backquote', en: '`', enShift: '~', finger: 'lp', row: 'number', width: 1 },
    { code: 'Digit1', en: '1', enShift: '!', finger: 'lp', row: 'number', width: 1 },
    { code: 'Digit2', en: '2', enShift: '@', finger: 'lr', row: 'number', width: 1 },
    { code: 'Digit3', en: '3', enShift: '#', finger: 'lm', row: 'number', width: 1 },
    { code: 'Digit4', en: '4', enShift: '$', finger: 'li', row: 'number', width: 1 },
    { code: 'Digit5', en: '5', enShift: '%', finger: 'li', row: 'number', width: 1 },
    { code: 'Digit6', en: '6', enShift: '^', finger: 'ri', row: 'number', width: 1 },
    { code: 'Digit7', en: '7', enShift: '&', finger: 'ri', row: 'number', width: 1 },
    { code: 'Digit8', en: '8', enShift: '*', finger: 'rm', row: 'number', width: 1 },
    { code: 'Digit9', en: '9', enShift: '(', finger: 'rr', row: 'number', width: 1 },
    { code: 'Digit0', en: '0', enShift: ')', finger: 'rp', row: 'number', width: 1 },
    { code: 'Minus', en: '-', enShift: '_', finger: 'rp', row: 'number', width: 1 },
    { code: 'Equal', en: '=', enShift: '+', finger: 'rp', row: 'number', width: 1 },
    { code: 'Backspace', en: 'Backspace', label: 'Bksp', finger: 'rp', row: 'number', width: 2, isModifier: true },
  ],
  // Row 1: Top alpha row
  [
    { code: 'Tab', en: 'Tab', label: 'Tab', finger: 'lp', row: 'top', width: 1.5, isModifier: true },
    { code: 'KeyQ', en: 'q', enShift: 'Q', finger: 'lp', row: 'top', width: 1 },
    { code: 'KeyW', en: 'w', enShift: 'W', finger: 'lr', row: 'top', width: 1 },
    { code: 'KeyE', en: 'e', enShift: 'E', finger: 'lm', row: 'top', width: 1 },
    { code: 'KeyR', en: 'r', enShift: 'R', finger: 'li', row: 'top', width: 1 },
    { code: 'KeyT', en: 't', enShift: 'T', finger: 'li', row: 'top', width: 1 },
    { code: 'KeyY', en: 'y', enShift: 'Y', finger: 'ri', row: 'top', width: 1 },
    { code: 'KeyU', en: 'u', enShift: 'U', finger: 'ri', row: 'top', width: 1 },
    { code: 'KeyI', en: 'i', enShift: 'I', finger: 'rm', row: 'top', width: 1 },
    { code: 'KeyO', en: 'o', enShift: 'O', finger: 'rr', row: 'top', width: 1 },
    { code: 'KeyP', en: 'p', enShift: 'P', finger: 'rp', row: 'top', width: 1 },
    { code: 'BracketLeft', en: '[', enShift: '{', finger: 'rp', row: 'top', width: 1 },
    { code: 'BracketRight', en: ']', enShift: '}', finger: 'rp', row: 'top', width: 1 },
    { code: 'Backslash', en: '\\', enShift: '|', finger: 'rp', row: 'top', width: 1.5 },
  ],
  // Row 2: Home row
  [
    { code: 'CapsLock', en: 'Caps', label: 'Caps', finger: 'lp', row: 'home', width: 1.75, isModifier: true },
    { code: 'KeyA', en: 'a', enShift: 'A', finger: 'lp', row: 'home', width: 1, isHome: true },
    { code: 'KeyS', en: 's', enShift: 'S', finger: 'lr', row: 'home', width: 1, isHome: true },
    { code: 'KeyD', en: 'd', enShift: 'D', finger: 'lm', row: 'home', width: 1, isHome: true },
    { code: 'KeyF', en: 'f', enShift: 'F', finger: 'li', row: 'home', width: 1, isHome: true },
    { code: 'KeyG', en: 'g', enShift: 'G', finger: 'li', row: 'home', width: 1 },
    { code: 'KeyH', en: 'h', enShift: 'H', finger: 'ri', row: 'home', width: 1 },
    { code: 'KeyJ', en: 'j', enShift: 'J', finger: 'ri', row: 'home', width: 1, isHome: true },
    { code: 'KeyK', en: 'k', enShift: 'K', finger: 'rm', row: 'home', width: 1, isHome: true },
    { code: 'KeyL', en: 'l', enShift: 'L', finger: 'rr', row: 'home', width: 1, isHome: true },
    { code: 'Semicolon', en: ';', enShift: ':', finger: 'rp', row: 'home', width: 1, isHome: true },
    { code: 'Quote', en: "'", enShift: '"', finger: 'rp', row: 'home', width: 1 },
    { code: 'Enter', en: 'Enter', label: 'Enter', finger: 'rp', row: 'home', width: 2.25, isModifier: true },
  ],
  // Row 3: Bottom alpha row
  [
    { code: 'ShiftLeft', en: 'Shift', label: 'Shift', finger: 'lp', row: 'bottom', width: 2.25, isModifier: true },
    { code: 'KeyZ', en: 'z', enShift: 'Z', finger: 'lp', row: 'bottom', width: 1 },
    { code: 'KeyX', en: 'x', enShift: 'X', finger: 'lr', row: 'bottom', width: 1 },
    { code: 'KeyC', en: 'c', enShift: 'C', finger: 'lm', row: 'bottom', width: 1 },
    { code: 'KeyV', en: 'v', enShift: 'V', finger: 'li', row: 'bottom', width: 1 },
    { code: 'KeyB', en: 'b', enShift: 'B', finger: 'li', row: 'bottom', width: 1 },
    { code: 'KeyN', en: 'n', enShift: 'N', finger: 'ri', row: 'bottom', width: 1 },
    { code: 'KeyM', en: 'm', enShift: 'M', finger: 'ri', row: 'bottom', width: 1 },
    { code: 'Comma', en: ',', enShift: '<', finger: 'rm', row: 'bottom', width: 1 },
    { code: 'Period', en: '.', enShift: '>', finger: 'rr', row: 'bottom', width: 1 },
    { code: 'Slash', en: '/', enShift: '?', finger: 'rp', row: 'bottom', width: 1 },
    { code: 'ShiftRight', en: 'Shift', label: 'Shift', finger: 'rp', row: 'bottom', width: 2.75, isModifier: true },
  ],
  // Row 4: Spacebar row
  [
    { code: 'ControlLeft', en: 'Ctrl', label: 'Ctrl', finger: 'lp', row: 'space', width: 1.5, isModifier: true },
    { code: 'AltLeft', en: 'Alt', label: 'Alt', finger: 'lthumb', row: 'space', width: 1.5, isModifier: true },
    { code: 'Space', en: ' ', label: 'Space (Thumbs)', finger: 'rthumb', row: 'space', width: 7 },
    { code: 'AltRight', en: 'Alt', label: 'Alt', finger: 'rthumb', row: 'space', width: 1.5, isModifier: true },
    { code: 'ControlRight', en: 'Ctrl', label: 'Ctrl', finger: 'rp', row: 'space', width: 1.5, isModifier: true },
  ],
];

const KEY_DEF_MAP = new Map<string, PhysicalKeyDefinition>();
for (const row of PHYSICAL_KEYBOARD_ROWS) {
  for (const key of row) {
    KEY_DEF_MAP.set(key.code, key);
  }
}

export function getPhysicalKeyDef(code: string): PhysicalKeyDefinition | undefined {
  return KEY_DEF_MAP.get(code);
}

/**
 * Resolves the ergonomic finger assignment for a physical key code.
 * Returns null if the layout is an unverified external system IME or key code is unknown
 * (ensuring we never invent finger assignments when a layout mapping is unavailable).
 */
export function resolveFingerForPhysicalKey(
  code: string,
  layoutId: LayoutId,
  previousHand?: 'left' | 'right'
): FingerId | null {
  if (layoutId === 'system-ime') {
    // External OS IME may run non-standard hardware mappings; only map universal Space/Enter/Backspace if unambiguous
    if (code === 'Space') return previousHand === 'left' ? 'rthumb' : 'lthumb';
    return null;
  }
  const def = KEY_DEF_MAP.get(code);
  if (!def) return null;
  if (code === 'Space') {
    // Alternate thumb attribution based on previous hand for realistic dual-thumb tracking
    return previousHand === 'right' ? 'lthumb' : 'rthumb';
  }
  return def.finger;
}

/**
 * Resolves the display legends (unshifted & shifted) for a physical key under a chosen layout or English.
 */
export function getLegendsForPhysicalKey(
  code: string,
  displayLayout: LayoutId | 'english'
): { primary: string; secondary: string; latin: string } {
  const def = KEY_DEF_MAP.get(code);
  if (!def) return { primary: code, secondary: '', latin: code };
  if (def.isModifier || code === 'Space') {
    return { primary: def.label || def.en, secondary: '', latin: def.en };
  }
  if (displayLayout === 'english') {
    return {
      primary: def.en.toUpperCase(),
      secondary: def.enShift && def.enShift !== def.en.toUpperCase() ? def.enShift : '',
      latin: def.en,
    };
  }

  const layout = getLayoutById(displayLayout);
  // Look up from layout's keyboardRows first (which covers Avro previews as well as Bijoy/Jatiya/Probhat)
  for (const row of layout.keyboardRows) {
    const match = row.find((k) => k.code === code);
    if (match) {
      return {
        primary: match.bn || def.en.toUpperCase(),
        secondary:
          match.bnShift && match.bnShift !== match.enShift && match.bnShift !== match.bn
            ? match.bnShift
            : '',
        latin: def.en.toUpperCase(),
      };
    }
  }
  return { primary: def.en.toUpperCase(), secondary: '', latin: def.en.toUpperCase() };
}

export interface HeatmapRecommendation {
  id: string;
  category: 'finger-imbalance' | 'row-weakness' | 'key-hotspot' | 'bangla-combo' | 'overuse';
  title: string;
  detail: string;
  actionLabel: string;
  targetKeys: string[];
  targetChars: string[];
}

export interface HeatmapAnalysisResult {
  filteredSessionsCount: number;
  totalKeyEvents: number;
  totalCorrectPresses: number;
  totalIncorrectPresses: number;
  overallKeyAccuracy: number;
  keyStats: Record<string, KeyPerformanceAggregate>;
  fingerStats: Record<FingerId, FingerPerformanceAggregate>;
  topMistypedKeys: KeyPerformanceAggregate[];
  rowAccuracy: Record<KeyboardRowName, { attempts: number; incorrect: number; accuracy: number }>;
  recommendations: HeatmapRecommendation[];
  hasUnmappedImeEvents: boolean;
}

function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Aggregates real recorded PhysicalKeyEvent telemetry across sessions according to active filters.
 */
export function analyzeKeyboardAndFingerPerformance(
  sessions: TypingSessionResult[],
  filters: HeatmapFilters
): HeatmapAnalysisResult {
  const now = Date.now();
  const todayKey = getTodayDateKey();

  // 1. Filter sessions by time & layout/input method
  const filteredSessions = sessions.filter((s) => {
    if (filters.timeRange === 'session') {
      if (filters.sessionId && s.id !== filters.sessionId) return false;
    } else if (filters.timeRange === 'today') {
      if (s.dateKey !== todayKey) return false;
    } else if (filters.timeRange === '7d') {
      if (s.timestamp < now - 7 * 86400 * 1000) return false;
    } else if (filters.timeRange === '30d') {
      if (s.timestamp < now - 30 * 86400 * 1000) return false;
    } else if (filters.timeRange === 'custom') {
      if (filters.customStartDate && s.dateKey < filters.customStartDate) return false;
      if (filters.customEndDate && s.dateKey > filters.customEndDate) return false;
    }

    if (filters.layoutId !== 'all' && s.layoutId !== filters.layoutId) return false;
    return true;
  });

  // 2. Collect filtered physical key events
  const keyBuckets = new Map<
    string,
    {
      attempts: number;
      correct: number;
      incorrect: number;
      mistakes: Map<string, { expected: string; actual: string; count: number }>;
      outputs: Map<string, number>;
      perSession: Map<string, { dateKey: string; attempts: number; correct: number }>;
    }
  >();

  const fingerBuckets = new Map<
    FingerId,
    {
      attempts: number;
      correct: number;
      incorrect: number;
      perKey: Map<string, { latin: string; attempts: number; incorrect: number }>;
      perSession: Map<string, { dateKey: string; attempts: number; correct: number }>;
    }
  >();

  for (const fid of ALL_FINGER_IDS) {
    fingerBuckets.set(fid, {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      perKey: new Map(),
      perSession: new Map(),
    });
  }

  const rowTotals: Record<KeyboardRowName, { attempts: number; incorrect: number }> = {
    number: { attempts: 0, incorrect: 0 },
    top: { attempts: 0, incorrect: 0 },
    home: { attempts: 0, incorrect: 0 },
    bottom: { attempts: 0, incorrect: 0 },
    space: { attempts: 0, incorrect: 0 },
  };

  let totalKeyEvents = 0;
  let totalCorrectPresses = 0;
  let totalIncorrectPresses = 0;
  let totalFingerMappedPresses = 0;
  let hasUnmappedImeEvents = false;

  const banglaComboMistakes = new Map<string, number>();

  for (const session of filteredSessions) {
    const events: PhysicalKeyEvent[] = session.keyEvents ?? [];
    for (const ev of events) {
      if (filters.inputMethod !== 'all' && ev.inputMethod !== filters.inputMethod) continue;
      if (filters.layoutId !== 'all' && ev.layoutId !== filters.layoutId) continue;
      if (filters.script !== 'all' && ev.script !== filters.script) continue;

      totalKeyEvents++;
      if (ev.correct) totalCorrectPresses++;
      else totalIncorrectPresses++;

      // Track Bangla multi-codepoint combination mistakes for personalized insights
      if (!ev.correct && ev.script === 'bangla' && ev.expectedOutput && Array.from(ev.expectedOutput).length > 1) {
        banglaComboMistakes.set(
          ev.expectedOutput,
          (banglaComboMistakes.get(ev.expectedOutput) || 0) + 1
        );
      }

      // Per-key bucket
      let kb = keyBuckets.get(ev.code);
      if (!kb) {
        kb = {
          attempts: 0,
          correct: 0,
          incorrect: 0,
          mistakes: new Map(),
          outputs: new Map(),
          perSession: new Map(),
        };
        keyBuckets.set(ev.code, kb);
      }
      kb.attempts++;
      if (ev.correct) kb.correct++;
      else {
        kb.incorrect++;
        const mKey = `${ev.expectedOutput}__${ev.producedOutput || ev.latinKey}`;
        const existingM = kb.mistakes.get(mKey);
        if (existingM) existingM.count++;
        else {
          kb.mistakes.set(mKey, {
            expected: ev.expectedOutput || '—',
            actual: ev.producedOutput || ev.latinKey || '—',
            count: 1,
          });
        }
      }

      if (ev.producedOutput && ev.producedOutput.trim()) {
        kb.outputs.set(ev.producedOutput, (kb.outputs.get(ev.producedOutput) || 0) + 1);
      }

      const ks = kb.perSession.get(session.id) ?? {
        dateKey: session.dateKey,
        attempts: 0,
        correct: 0,
      };
      ks.attempts++;
      if (ev.correct) ks.correct++;
      kb.perSession.set(session.id, ks);

      // Row tracking
      const keyDef = KEY_DEF_MAP.get(ev.code);
      if (keyDef) {
        rowTotals[keyDef.row].attempts++;
        if (!ev.correct) rowTotals[keyDef.row].incorrect++;
      }

      // Per-finger tracking (only when finger mapping is genuinely available)
      if (ev.finger && fingerBuckets.has(ev.finger)) {
        totalFingerMappedPresses++;
        const fb = fingerBuckets.get(ev.finger)!;
        fb.attempts++;
        if (ev.correct) fb.correct++;
        else fb.incorrect++;

        const pk = fb.perKey.get(ev.code) ?? {
          latin: keyDef?.en ?? ev.latinKey,
          attempts: 0,
          incorrect: 0,
        };
        pk.attempts++;
        if (!ev.correct) pk.incorrect++;
        fb.perKey.set(ev.code, pk);

        const fs = fb.perSession.get(session.id) ?? {
          dateKey: session.dateKey,
          attempts: 0,
          correct: 0,
        };
        fs.attempts++;
        if (ev.correct) fs.correct++;
        fb.perSession.set(session.id, fs);
      } else if (ev.inputMethod === 'system') {
        hasUnmappedImeEvents = true;
      }
    }
  }

  // 3. Finalize key aggregates
  const keyStats: Record<string, KeyPerformanceAggregate> = {};
  for (const [code, kb] of keyBuckets.entries()) {
    const accuracy = kb.attempts > 0 ? Math.round((kb.correct / kb.attempts) * 1000) / 10 : 100;
    const errorRatio = kb.attempts > 0 ? Math.round((kb.incorrect / kb.attempts) * 1000) / 10 : 0;
    keyStats[code] = {
      code,
      attempts: kb.attempts,
      correct: kb.correct,
      incorrect: kb.incorrect,
      accuracy,
      errorRatio,
      commonMistakes: Array.from(kb.mistakes.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
      producedOutputs: Array.from(kb.outputs.entries())
        .map(([output, count]) => ({ output, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
      recentHistory: Array.from(kb.perSession.entries())
        .map(([sessionId, v]) => ({
          sessionId,
          dateKey: v.dateKey,
          attempts: v.attempts,
          accuracy: v.attempts > 0 ? Math.round((v.correct / v.attempts) * 100) : 100,
        }))
        .slice(-8),
    };
  }

  const topMistypedKeys = Object.values(keyStats)
    .filter((k) => k.incorrect > 0)
    .sort((a, b) => b.incorrect - a.incorrect || a.accuracy - b.accuracy)
    .slice(0, 8);

  // 4. Finalize finger aggregates
  const fingerStats = {} as Record<FingerId, FingerPerformanceAggregate>;
  for (const fid of ALL_FINGER_IDS) {
    const meta = FINGER_META[fid];
    const fb = fingerBuckets.get(fid)!;
    const accuracy = fb.attempts > 0 ? Math.round((fb.correct / fb.attempts) * 1000) / 10 : 100;
    const errorRatio = fb.attempts > 0 ? Math.round((fb.incorrect / fb.attempts) * 1000) / 10 : 0;
    const usageShare =
      totalFingerMappedPresses > 0
        ? Math.round((fb.attempts / totalFingerMappedPresses) * 1000) / 10
        : 0;

    let status: FingerPerformanceAggregate['status'] = 'untested';
    if (fb.attempts > 0) {
      if (fb.attempts >= 5 && accuracy < 88) {
        status = 'underperforming';
      } else if (totalFingerMappedPresses >= 25 && usageShare > meta.idealShare * 1.85) {
        status = 'overused';
      } else {
        status = 'optimal';
      }
    }

    const topMistyped = Array.from(fb.perKey.entries())
      .filter(([, v]) => v.incorrect > 0)
      .map(([code, v]) => ({
        code,
        latin: v.latin,
        incorrect: v.incorrect,
        accuracy: v.attempts > 0 ? Math.round(((v.attempts - v.incorrect) / v.attempts) * 100) : 100,
      }))
      .sort((a, b) => b.incorrect - a.incorrect)
      .slice(0, 5);

    fingerStats[fid] = {
      finger: fid,
      label: meta.label,
      hand: meta.hand,
      attempts: fb.attempts,
      correct: fb.correct,
      incorrect: fb.incorrect,
      accuracy,
      errorRatio,
      usageShare,
      status,
      topMistypedKeys: topMistyped,
      recentHistory: Array.from(fb.perSession.entries())
        .map(([sessionId, v]) => ({
          sessionId,
          dateKey: v.dateKey,
          attempts: v.attempts,
          accuracy: v.attempts > 0 ? Math.round((v.correct / v.attempts) * 100) : 100,
        }))
        .slice(-8),
    };
  }

  // 5. Row accuracy
  const rowAccuracy = {} as HeatmapAnalysisResult['rowAccuracy'];
  (['number', 'top', 'home', 'bottom', 'space'] as KeyboardRowName[]).forEach((r) => {
    const t = rowTotals[r];
    rowAccuracy[r] = {
      attempts: t.attempts,
      incorrect: t.incorrect,
      accuracy: t.attempts > 0 ? Math.round(((t.attempts - t.incorrect) / t.attempts) * 1000) / 10 : 100,
    };
  });

  // 6. Personalized Recommendations
  const recommendations: HeatmapRecommendation[] = [];
  const activeLayoutForDrill: LayoutId =
    filters.layoutId !== 'all'
      ? filters.layoutId
      : filters.displayLayout !== 'english'
      ? filters.displayLayout
      : 'avro';

  // Left vs Right symmetric finger imbalance check
  const pairs: Array<[FingerId, FingerId, string]> = [
    ['li', 'ri', 'index'],
    ['lm', 'rm', 'middle'],
    ['lr', 'rr', 'ring'],
    ['lp', 'rp', 'pinky'],
  ];
  for (const [leftId, rightId, pairName] of pairs) {
    const lf = fingerStats[leftId];
    const rf = fingerStats[rightId];
    if (lf.attempts >= 5 && rf.attempts >= 5 && Math.abs(lf.accuracy - rf.accuracy) >= 6) {
      const weaker = lf.accuracy < rf.accuracy ? lf : rf;
      const stronger = lf.accuracy < rf.accuracy ? rf : lf;
      const weakKeyCodes = weaker.topMistypedKeys.map((k) => k.code);
      recommendations.push({
        id: `imbalance-${pairName}`,
        category: 'finger-imbalance',
        title: `Your ${weaker.label.toLowerCase()} has lower accuracy (${weaker.accuracy}%) than your ${stronger.label.toLowerCase()} (${stronger.accuracy}%).`,
        detail: `Focus on steadying ${weaker.label.toLowerCase()} reaches (${weaker.incorrect} mistakes out of ${weaker.attempts} presses) to balance hand rhythm.`,
        actionLabel: `Drill ${weaker.label} Keys`,
        targetKeys: weakKeyCodes,
        targetChars: mapCodesToPracticeTokens(
          weakKeyCodes.length > 0 ? weakKeyCodes : getCodesForFinger(weaker.finger),
          activeLayoutForDrill
        ),
      });
      break;
    }
  }

  // Row weakness check
  const testedRows = (['number', 'top', 'home', 'bottom'] as KeyboardRowName[])
    .filter((r) => rowAccuracy[r].attempts >= 6 && rowAccuracy[r].incorrect >= 2)
    .sort((a, b) => rowAccuracy[a].accuracy - rowAccuracy[b].accuracy);

  if (testedRows.length > 0 && rowAccuracy[testedRows[0]].accuracy < 94) {
    const weakestRow = testedRows[0];
    const rowLabelMap: Record<KeyboardRowName, string> = {
      number: 'number row',
      top: 'upper keyboard row',
      home: 'home row',
      bottom: 'bottom keyboard row',
      space: 'spacebar row',
    };
    const rowCodes = PHYSICAL_KEYBOARD_ROWS.flat()
      .filter((k) => k.row === weakestRow && !k.isModifier)
      .map((k) => k.code);

    recommendations.push({
      id: `row-${weakestRow}`,
      category: 'row-weakness',
      title: `You frequently mistype keys in the ${rowLabelMap[weakestRow]} (${rowAccuracy[weakestRow].accuracy}% accuracy).`,
      detail: `${rowAccuracy[weakestRow].incorrect} errors recorded across ${rowAccuracy[weakestRow].attempts} presses on this row. Short reach drills improve spatial accuracy without looking down.`,
      actionLabel: `Practice ${rowLabelMap[weakestRow]}`,
      targetKeys: rowCodes,
      targetChars: mapCodesToPracticeTokens(rowCodes.slice(0, 8), activeLayoutForDrill),
    });
  }

  // Bangla character combinations weakness check
  const topCombos = Array.from(banglaComboMistakes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([ch]) => ch);

  if (topCombos.length >= 2) {
    recommendations.push({
      id: 'bangla-combos',
      category: 'bangla-combo',
      title: `Your accuracy decreases when typing specific Bangla character combinations: ${topCombos.slice(0, 4).join(' ')}`,
      detail:
        'Multi-keystroke syllables and conjunct clusters require deliberate transition timing. Practice these exact combinations in isolation.',
      actionLabel: 'Practice Weak Combinations',
      targetKeys: [],
      targetChars: topCombos,
    });
  }

  // Top key hotspot check
  if (topMistypedKeys.length > 0) {
    const hotCodes = topMistypedKeys.slice(0, 5).map((k) => k.code);
    const hotLabels = hotCodes
      .map((c) => getLegendsForPhysicalKey(c, filters.displayLayout).primary)
      .join(', ');
    recommendations.push({
      id: 'key-hotspots',
      category: 'key-hotspot',
      title: `Most error-prone physical keys: ${hotLabels}`,
      detail: `These ${hotCodes.length} keys account for the highest mistake density in your selected filter window.`,
      actionLabel: 'Practice Hotspot Keys',
      targetKeys: hotCodes,
      targetChars: mapCodesToPracticeTokens(hotCodes, activeLayoutForDrill),
    });
  }

  const overallKeyAccuracy =
    totalKeyEvents > 0
      ? Math.round((totalCorrectPresses / totalKeyEvents) * 1000) / 10
      : 100;

  return {
    filteredSessionsCount: filteredSessions.length,
    totalKeyEvents,
    totalCorrectPresses,
    totalIncorrectPresses,
    overallKeyAccuracy,
    keyStats,
    fingerStats,
    topMistypedKeys,
    rowAccuracy,
    recommendations,
    hasUnmappedImeEvents,
  };
}

export function getCodesForFinger(finger: FingerId): string[] {
  return PHYSICAL_KEYBOARD_ROWS.flat()
    .filter((k) => {
      if (k.code === 'Space' && (finger === 'lthumb' || finger === 'rthumb')) return true;
      return k.finger === finger && !k.isModifier;
    })
    .map((k) => k.code);
}

/**
 * Translates physical key codes into concrete typeable Bangla practice tokens
 * according to the active layout's actual mapping.
 */
export function mapCodesToPracticeTokens(codes: string[], layoutId: LayoutId): string[] {
  const layout = getLayoutById(layoutId);
  const tokens: string[] = [];

  for (const code of codes) {
    const def = KEY_DEF_MAP.get(code);
    if (!def || def.isModifier || code === 'Space') continue;

    if (layout.keymap && layout.keymap[def.en]) {
      const ch = layout.keymap[def.en];
      if (ch && ch !== '্') {
        tokens.push(ch);
        continue;
      }
    }

    // Avro / fallback: look up layout keyboardRows preview
    for (const row of layout.keyboardRows) {
      const match = row.find((k) => k.code === code);
      if (match?.bn) {
        const clean = match.bn.split('/')[0].trim();
        if (clean && clean !== '্') {
          tokens.push(clean);
        }
        break;
      }
    }
  }

  const unique = Array.from(new Set(tokens)).filter(Boolean);
  return unique.length > 0 ? unique : ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
}

/**
 * Computes normalized intensity (0 to 1) for a key or finger based on the active heatmap metric.
 * 0 = best / cool, 1 = worst / hot (or highest press volume in total-presses mode).
 */
export function getHeatmapIntensity(
  metric: HeatmapMetricMode,
  stat: { attempts: number; incorrect: number; accuracy: number; errorRatio: number } | undefined,
  maxIncorrect: number,
  maxAttempts: number
): number | null {
  if (!stat || stat.attempts === 0) return null;

  switch (metric) {
    case 'error-frequency':
      if (stat.incorrect === 0) return 0;
      return Math.min(1, stat.incorrect / Math.max(1, maxIncorrect));
    case 'accuracy':
      // 100% -> 0 (emerald), <=70% -> 1 (crimson)
      return Math.max(0, Math.min(1, (100 - stat.accuracy) / 30));
    case 'error-ratio':
      return Math.max(0, Math.min(1, stat.errorRatio / 35));
    case 'total-presses':
      return Math.min(1, stat.attempts / Math.max(1, maxAttempts));
    default:
      return 0;
  }
}

/**
 * Accessible dual-theme heatmap surface & border classes for keyboard keys.
 */
export function getKeyHeatColorClasses(
  intensity: number | null,
  metric: HeatmapMetricMode
): { bg: string; text: string; border: string; hex: string } {
  if (intensity === null) {
    return {
      bg: 'bg-slate-50 dark:bg-slate-900/75',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700/80',
      hex: '#94A3B8',
    };
  }

  if (metric === 'total-presses') {
    if (intensity < 0.25) {
      return {
        bg: 'bg-sky-50 dark:bg-sky-950/50',
        text: 'text-sky-900 dark:text-sky-200',
        border: 'border-sky-300 dark:border-sky-800',
        hex: '#38BDF8',
      };
    }
    if (intensity < 0.55) {
      return {
        bg: 'bg-teal-100 dark:bg-teal-950/70',
        text: 'text-teal-950 dark:text-teal-100',
        border: 'border-teal-400 dark:border-teal-700',
        hex: '#14B8A6',
      };
    }
    if (intensity < 0.8) {
      return {
        bg: 'bg-teal-300/70 dark:bg-teal-800/80',
        text: 'text-teal-950 dark:text-white',
        border: 'border-teal-500 dark:border-teal-500',
        hex: '#0D9488',
      };
    }
    return {
      bg: 'bg-teal-600 dark:bg-teal-600',
      text: 'text-white',
      border: 'border-teal-700 dark:border-teal-400',
      hex: '#0F766E',
    };
  }

  // Error / Accuracy scale (Emerald -> Teal/Lime -> Amber -> Orange -> Crimson)
  if (intensity <= 0.08) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/55',
      text: 'text-emerald-950 dark:text-emerald-200',
      border: 'border-emerald-300 dark:border-emerald-800',
      hex: '#10B981',
    };
  }
  if (intensity <= 0.35) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      text: 'text-amber-950 dark:text-amber-200',
      border: 'border-amber-300 dark:border-amber-700',
      hex: '#F59E0B',
    };
  }
  if (intensity <= 0.65) {
    return {
      bg: 'bg-orange-100 dark:bg-orange-950/70',
      text: 'text-orange-950 dark:text-orange-100',
      border: 'border-orange-400 dark:border-orange-700',
      hex: '#F97316',
    };
  }
  return {
    bg: 'bg-rose-100 dark:bg-rose-950/80',
    text: 'text-rose-950 dark:text-rose-100',
    border: 'border-rose-500 dark:border-rose-600',
    hex: '#E11D48',
  };
}
