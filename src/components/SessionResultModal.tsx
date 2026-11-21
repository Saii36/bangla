import React from 'react';
import { BarChart3, RotateCcw, Sparkles, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getLayoutById } from '../core/layouts/registry';
import { getPrimarySpeedValue } from '../core/stats';
import type { SpeedMetricPreference, TypingSessionResult } from '../types';

interface SessionResultModalProps {
  result: TypingSessionResult;
  bestWpm: number;
  averageWpm: number;
  speedMetric: SpeedMetricPreference;
  endedReason?: 'completed' | 'time-up' | 'accuracy-limit';
  onRetry: () => void;
  onNext: () => void;
  onPracticeWeak: (chars: string[]) => void;
  onViewProgress: () => void;
}

export const SessionResultModal: React.FC<SessionResultModalProps> = ({
  result,
  bestWpm,
  averageWpm,
  speedMetric,
  endedReason = 'completed',
  onRetry,
  onNext,
  onPracticeWeak,
  onViewProgress,
}) => {
  const layout = getLayoutById(result.layoutId);
  const primary = getPrimarySpeedValue(result, speedMetric);
  const isNewRecord = result.wpmStandard > 0 && result.wpmStandard >= bestWpm;

  const mistypedEntries = Object.entries(result.mistakesByChar)
    .filter(([ch, cnt]) => cnt > 0 && ch.trim().length > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Session Results"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-6 sm:p-8 shadow-xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{layout.name}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{result.mode} mode</span>
              <span aria-hidden="true">·</span>
              <span>{result.durationSeconds}s elapsed</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {endedReason === 'accuracy-limit' ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Accuracy Threshold Reached</span>
                </>
              ) : endedReason === 'time-up' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Time Complete — Session Summary</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Session Complete</span>
                </>
              )}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 font-bangla-siliguri">
              {result.lessonTitle}
            </p>
          </div>
          {isNewRecord && (
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 whitespace-nowrap shrink-0">
              Personal Best
            </span>
          )}
        </div>

        {/* Primary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{primary.label}</p>
            <p className="text-3xl font-bold font-mono-tabular text-teal-700 dark:text-teal-300 mt-1">
              {primary.value}
              <span className="text-sm font-medium ml-1 text-slate-500 dark:text-slate-400">
                {primary.unit}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Accuracy</p>
            <p
              className={`text-3xl font-bold font-mono-tabular mt-1 ${
                result.accuracy >= 95
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : result.accuracy >= 85
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {result.accuracy}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Characters / Min</p>
            <p className="text-3xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-1">
              {result.cpm}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Completion</p>
            <p className="text-3xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-1">
              {result.completionPercent}%
            </p>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 py-5 border-b border-slate-100 dark:border-slate-800 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Standard WPM</span>
            <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
              {result.wpmStandard}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Net WPM</span>
            <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
              {result.wpmNet}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Actual Words WPM</span>
            <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
              {result.wpmWords}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Correct Graphemes</span>
            <span className="font-mono-tabular font-semibold text-emerald-600 dark:text-emerald-400">
              {result.correctChars}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Incorrect / Mistakes</span>
            <span className="font-mono-tabular font-semibold text-rose-600 dark:text-rose-400">
              {result.incorrectChars} / {result.totalMistakes}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Best / Avg WPM</span>
            <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
              {bestWpm} / {averageWpm}
            </span>
          </div>
        </div>

        {/* Mistyped Characters */}
        {mistypedEntries.length > 0 && (
          <div className="py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Characters Needing Practice
              </h3>
              <button
                type="button"
                onClick={() => onPracticeWeak(mistypedEntries.slice(0, 8).map(([ch]) => ch))}
                className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Drill these characters
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {mistypedEntries.slice(0, 10).map(([ch, cnt]) => (
                <div
                  key={ch}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30"
                >
                  <span className="font-bangla-siliguri text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {ch}
                  </span>
                  <span className="text-xs font-mono-tabular text-rose-700 dark:text-rose-300">
                    ×{cnt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WPM Formula Transparency */}
        <p className="text-xs text-slate-500 dark:text-slate-400 py-4 leading-relaxed">
          Counting method: 1 Standard Word equals 5 Bangla orthographic grapheme clusters (conjuncts like ক্ষ or syllables like বি count as 1 grapheme). Standard WPM = (Correct Graphemes ÷ 5) ÷ Minutes. You can switch your primary metric between Standard WPM, Actual Words WPM, and CPM in Settings.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onViewProgress}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <BarChart3 className="w-4 h-4" />
            Progress Dashboard
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition-colors whitespace-nowrap shrink-0"
          >
            New Exercise
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
