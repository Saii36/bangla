import { categorizeBanglaGrapheme } from '../data/banglaData';
import { countWords } from './unicode';
import type {
  LayoutId,
  PracticeMode,
  SpeedMetricPreference,
  TypingEvaluationResult,
  TypingSessionResult,
} from '../types';

export interface LiveMetrics {
  wpmStandard: number;
  wpmNet: number;
  wpmWords: number;
  cpm: number;
  accuracy: number;
  completionPercent: number;
}

/**
 * Consistent typing speed & accuracy calculation.
 *
 * Methodology:
 * - Standard WPM (Gross): (Total Typed Graphemes / 5) / elapsedMinutes
 * - Net WPM: max(0, ((Total Typed Graphemes / 5) - Uncorrected Errors) / elapsedMinutes)
 * - Actual Word WPM: Actual completed words / elapsedMinutes
 * - CPM: Correct Bangla graphemes per minute
 * - Accuracy: (Correct Graphemes / (Correct + Incorrect)) * 100
 */
export function calculateLiveMetrics(
  evaluation: TypingEvaluationResult,
  typedText: string,
  elapsedSeconds: number
): LiveMetrics {
  const safeSeconds = Math.max(elapsedSeconds, 1);
  const minutes = safeSeconds / 60;

  const evaluatedCount = evaluation.correctCount + evaluation.incorrectCount;
  const accuracy =
    evaluatedCount > 0 ? Math.round((evaluation.correctCount / evaluatedCount) * 1000) / 10 : 100;

  const wpmStandard = Math.round((evaluation.correctCount / 5) / minutes);
  const netRaw = (evaluatedCount / 5 - evaluation.incorrectCount) / minutes;
  const wpmNet = Math.max(0, Math.round(netRaw));

  const wordsTyped = countWords(typedText);
  const wpmWords = Math.round(wordsTyped / minutes);

  const cpm = Math.round(evaluation.correctCount / minutes);

  const completionPercent =
    evaluation.totalGraphemes > 0
      ? Math.min(100, Math.round((evaluatedCount / evaluation.totalGraphemes) * 100))
      : 0;

  return {
    wpmStandard,
    wpmNet,
    wpmWords,
    cpm,
    accuracy,
    completionPercent,
  };
}

export function getPrimarySpeedValue(
  metrics: { wpmStandard: number; wpmWords: number; cpm: number },
  pref: SpeedMetricPreference
): { value: number; unit: string; label: string } {
  if (pref === 'cpm') {
    return { value: metrics.cpm, unit: 'CPM', label: 'Chars / Min' };
  }
  if (pref === 'wpm-words') {
    return { value: metrics.wpmWords, unit: 'WPM', label: 'Words / Min (Actual)' };
  }
  return { value: metrics.wpmStandard, unit: 'WPM', label: 'Words / Min (5-char)' };
}

export function createSessionRecord(params: {
  mode: PracticeMode;
  layoutId: LayoutId;
  lessonId?: string;
  lessonTitle: string;
  evaluation: TypingEvaluationResult;
  typedText: string;
  durationSeconds: number;
  totalKeyMistakes: number;
  sessionMistakeMap: Record<string, number>;
  keyEvents?: import('../types').PhysicalKeyEvent[];
}): TypingSessionResult {
  const now = Date.now();
  const dateObj = new Date(now);
  const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(
    dateObj.getDate()
  ).padStart(2, '0')}`;

  const live = calculateLiveMetrics(params.evaluation, params.typedText, params.durationSeconds);

  // Merge unresolved evaluation mistakes with session keystroke mistakes
  const mergedMistakes: Record<string, number> = { ...params.sessionMistakeMap };
  for (const [ch, cnt] of Object.entries(params.evaluation.mistakesByGrapheme)) {
    mergedMistakes[ch] = Math.max(mergedMistakes[ch] || 0, cnt);
  }

  const mistakesByCategory: Record<string, number> = {};
  for (const [grapheme, count] of Object.entries(mergedMistakes)) {
    const cat = categorizeBanglaGrapheme(grapheme);
    mistakesByCategory[cat] = (mistakesByCategory[cat] || 0) + count;
  }

  const keyEvents = params.keyEvents ?? [];
  const hasBangla = keyEvents.some((e) => e.script === 'bangla');
  const hasEnglish = keyEvents.some((e) => e.script === 'english');
  const languageMix: TypingSessionResult['languageMix'] =
    hasBangla && hasEnglish ? 'mixed' : hasEnglish ? 'english' : 'bangla';

  return {
    id: `sess-${now}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now,
    dateKey,
    mode: params.mode,
    layoutId: params.layoutId,
    lessonId: params.lessonId,
    lessonTitle: params.lessonTitle,
    wpmStandard: live.wpmStandard,
    wpmNet: live.wpmNet,
    wpmWords: live.wpmWords,
    cpm: live.cpm,
    accuracy: live.accuracy,
    totalMistakes: Math.max(params.totalKeyMistakes, params.evaluation.incorrectCount),
    correctChars: params.evaluation.correctCount,
    incorrectChars: params.evaluation.incorrectCount,
    totalChars: params.evaluation.totalGraphemes,
    completionPercent: live.completionPercent,
    durationSeconds: Math.max(1, Math.round(params.durationSeconds)),
    mistakesByChar: mergedMistakes,
    mistakesByCategory,
    keyEvents,
    languageMix,
  };
}

export interface ProgressAnalytics {
  totalSessions: number;
  totalPracticeSeconds: number;
  totalCharsTyped: number;
  bestWpm: number;
  bestCpm: number;
  bestAccuracy: number;
  averageWpm: number;
  averageAccuracy: number;
  currentStreakDays: number;
  dailyActivity: Array<{ dateKey: string; sessions: number; minutes: number; avgWpm: number }>;
  weeklySummary: { sessions: number; minutes: number; avgWpm: number; avgAccuracy: number };
  monthlySummary: { sessions: number; minutes: number; avgWpm: number; avgAccuracy: number };
  layoutBreakdown: Array<{
    layoutId: LayoutId;
    sessions: number;
    avgWpm: number;
    bestWpm: number;
    avgAccuracy: number;
    totalMinutes: number;
  }>;
  weakestCharacters: Array<{ char: string; mistakes: number; category: string }>;
  weakestCategories: Array<{ category: string; mistakes: number }>;
  recommendations: Array<{
    title: string;
    detail: string;
    actionLabel: string;
    actionType: 'weak-mode' | 'accuracy-mode' | 'conjuncts' | 'timed-mode';
    chars?: string[];
  }>;
}

export function computeProgressAnalytics(
  sessions: TypingSessionResult[],
  charMistakeTotals: Record<string, number>
): ProgressAnalytics {
  const sorted = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
  const totalSessions = sorted.length;
  const totalPracticeSeconds = sorted.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalCharsTyped = sorted.reduce((acc, s) => acc + s.correctChars + s.incorrectChars, 0);

  const bestWpm = sorted.reduce((m, s) => Math.max(m, s.wpmStandard), 0);
  const bestCpm = sorted.reduce((m, s) => Math.max(m, s.cpm), 0);
  const bestAccuracy = sorted.reduce((m, s) => Math.max(m, s.accuracy), 0);
  const averageWpm =
    totalSessions > 0
      ? Math.round(sorted.reduce((acc, s) => acc + s.wpmStandard, 0) / totalSessions)
      : 0;
  const averageAccuracy =
    totalSessions > 0
      ? Math.round((sorted.reduce((acc, s) => acc + s.accuracy, 0) / totalSessions) * 10) / 10
      : 0;

  // Daily activity for last 28 days
  const dailyMap = new Map<string, { sessions: number; seconds: number; wpmSum: number }>();
  for (const s of sorted) {
    const existing = dailyMap.get(s.dateKey) ?? { sessions: 0, seconds: 0, wpmSum: 0 };
    existing.sessions += 1;
    existing.seconds += s.durationSeconds;
    existing.wpmSum += s.wpmStandard;
    dailyMap.set(s.dateKey, existing);
  }

  const dailyActivity: ProgressAnalytics['dailyActivity'] = [];
  const today = new Date();
  for (let offset = 27; offset >= 0; offset--) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const entry = dailyMap.get(key);
    dailyActivity.push({
      dateKey: key,
      sessions: entry?.sessions ?? 0,
      minutes: entry ? Math.max(1, Math.round(entry.seconds / 60)) : 0,
      avgWpm: entry ? Math.round(entry.wpmSum / entry.sessions) : 0,
    });
  }

  // Current streak
  let currentStreakDays = 0;
  for (let i = dailyActivity.length - 1; i >= 0; i--) {
    if (dailyActivity[i].sessions > 0) {
      currentStreakDays++;
    } else if (i < dailyActivity.length - 1) {
      break;
    }
  }

  // Weekly & Monthly summaries
  const now = Date.now();
  const weekCutoff = now - 7 * 86400 * 1000;
  const monthCutoff = now - 30 * 86400 * 1000;

  const summarize = (list: TypingSessionResult[]) => {
    if (list.length === 0) return { sessions: 0, minutes: 0, avgWpm: 0, avgAccuracy: 0 };
    return {
      sessions: list.length,
      minutes: Math.max(1, Math.round(list.reduce((a, s) => a + s.durationSeconds, 0) / 60)),
      avgWpm: Math.round(list.reduce((a, s) => a + s.wpmStandard, 0) / list.length),
      avgAccuracy:
        Math.round((list.reduce((a, s) => a + s.accuracy, 0) / list.length) * 10) / 10,
    };
  };

  const weeklySummary = summarize(sorted.filter((s) => s.timestamp >= weekCutoff));
  const monthlySummary = summarize(sorted.filter((s) => s.timestamp >= monthCutoff));

  // Layout breakdown
  const layoutGroups = new Map<LayoutId, TypingSessionResult[]>();
  for (const s of sorted) {
    const list = layoutGroups.get(s.layoutId) ?? [];
    list.push(s);
    layoutGroups.set(s.layoutId, list);
  }

  const layoutBreakdown = Array.from(layoutGroups.entries()).map(([layoutId, list]) => ({
    layoutId,
    sessions: list.length,
    avgWpm: Math.round(list.reduce((a, s) => a + s.wpmStandard, 0) / list.length),
    bestWpm: list.reduce((m, s) => Math.max(m, s.wpmStandard), 0),
    avgAccuracy: Math.round((list.reduce((a, s) => a + s.accuracy, 0) / list.length) * 10) / 10,
    totalMinutes: Math.max(1, Math.round(list.reduce((a, s) => a + s.durationSeconds, 0) / 60)),
  }));

  // Weakest characters
  const weakestCharacters = Object.entries(charMistakeTotals)
    .filter(([ch, count]) => count > 0 && ch.trim().length > 0)
    .map(([char, mistakes]) => ({
      char,
      mistakes,
      category: categorizeBanglaGrapheme(char),
    }))
    .sort((a, b) => b.mistakes - a.mistakes)
    .slice(0, 12);

  // Weakest categories
  const catTotals: Record<string, number> = {};
  for (const item of weakestCharacters) {
    catTotals[item.category] = (catTotals[item.category] || 0) + item.mistakes;
  }
  const weakestCategories = Object.entries(catTotals)
    .map(([category, mistakes]) => ({ category, mistakes }))
    .sort((a, b) => b.mistakes - a.mistakes);

  // Actionable recommendations
  const recommendations: ProgressAnalytics['recommendations'] = [];

  if (weakestCharacters.length >= 3) {
    const topWeak = weakestCharacters.slice(0, 5).map((w) => w.char);
    recommendations.push({
      title: `Target frequently mistyped characters: ${topWeak.join(' ')}`,
      detail: `These ${topWeak.length} graphemes account for your highest error counts across recent sessions. Short targeted drills rapidly correct muscle memory.`,
      actionLabel: 'Practice Weak Characters',
      actionType: 'weak-mode',
      chars: topWeak,
    });
  }

  if (totalSessions > 0 && averageAccuracy < 93) {
    recommendations.push({
      title: 'Prioritize accuracy before pushing speed',
      detail: `Your current average accuracy is ${averageAccuracy}%. Aiming for 96%+ in Accuracy Mode reduces backspace overhead and naturally raises net WPM.`,
      actionLabel: 'Launch Accuracy Mode',
      actionType: 'accuracy-mode',
    });
  }

  if (weakestCategories[0]?.category.includes('যুক্তবর্ণ')) {
    recommendations.push({
      title: 'Strengthen conjunct consonant (যুক্তবর্ণ) fluency',
      detail:
        'Conjunct clusters are your most common hesitation point. Practicing key conjuncts like ক্ষ, জ্ঞ, ক্ত, স্ত, and প্র in isolation builds smooth finger transitions.',
      actionLabel: 'Drill Conjuncts',
      actionType: 'conjuncts',
      chars: ['ক্ষ', 'জ্ঞ', 'ক্ত', 'ন্ত', 'স্ত', 'ষ্ট', 'প্র', 'স্ব'],
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Build sustained rhythm with a 60-second timed sprint',
      detail:
        'Consistent short daily sessions build reliable Bangla touch-typing speed across vowels, consonants, and complex conjuncts.',
      actionLabel: 'Start 60s Timed Test',
      actionType: 'timed-mode',
    });
  }

  return {
    totalSessions,
    totalPracticeSeconds,
    totalCharsTyped,
    bestWpm,
    bestCpm,
    bestAccuracy,
    averageWpm,
    averageAccuracy,
    currentStreakDays,
    dailyActivity,
    weeklySummary,
    monthlySummary,
    layoutBreakdown,
    weakestCharacters,
    weakestCategories,
    recommendations,
  };
}
