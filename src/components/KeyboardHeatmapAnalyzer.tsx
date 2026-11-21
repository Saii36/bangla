import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Filter,
  Hand,
  Info,
  Keyboard,
  Layers,
  Play,
  SlidersHorizontal,
} from 'lucide-react';
import {
  analyzeKeyboardAndFingerPerformance,
  FINGER_META,
  getCodesForFinger,
  getHeatmapIntensity,
  getKeyHeatColorClasses,
  getLegendsForPhysicalKey,
  getPhysicalKeyDef,
  mapCodesToPracticeTokens,
  PHYSICAL_KEYBOARD_ROWS,
} from '../core/heatmapEngine';
import { getAllLayouts } from '../core/layouts/registry';
import type {
  FingerId,
  HeatmapFilters,
  HeatmapMetricMode,
  HeatmapTimeRange,
  HeatmapViewMode,
  InputMethodType,
  LayoutId,
  TypingSessionResult,
} from '../types';
import { HandDiagram } from './HandDiagram';

interface KeyboardHeatmapAnalyzerProps {
  sessions: TypingSessionResult[];
  activeLayoutId: LayoutId;
  onPracticeWeakChars: (chars: string[], title?: string) => void;
}

const FINGER_ACCENT_BAR: Record<FingerId, string> = {
  lp: 'bg-rose-400/75 dark:bg-rose-500/70',
  lr: 'bg-amber-400/75 dark:bg-amber-500/70',
  lm: 'bg-emerald-400/75 dark:bg-emerald-500/70',
  li: 'bg-teal-500/75 dark:bg-teal-400/70',
  lthumb: 'bg-slate-400/75 dark:bg-slate-500/70',
  rthumb: 'bg-slate-400/75 dark:bg-slate-500/70',
  ri: 'bg-sky-500/75 dark:bg-sky-400/70',
  rm: 'bg-indigo-400/75 dark:bg-indigo-400/70',
  rr: 'bg-violet-400/75 dark:bg-violet-400/70',
  rp: 'bg-fuchsia-400/75 dark:bg-fuchsia-500/70',
};

export const KeyboardHeatmapAnalyzer: React.FC<KeyboardHeatmapAnalyzerProps> = ({
  sessions,
  activeLayoutId,
  onPracticeWeakChars,
}) => {
  const [viewMode, setViewMode] = useState<HeatmapViewMode>('combined');
  const [filters, setFilters] = useState<HeatmapFilters>({
    timeRange: 'all',
    customStartDate: '',
    customEndDate: '',
    sessionId: sessions[sessions.length - 1]?.id ?? '',
    inputMethod: 'all',
    layoutId: 'all',
    script: 'all',
    metric: 'error-frequency',
    displayLayout: activeLayoutId,
  });

  const [selectedKeyCode, setSelectedKeyCode] = useState<string | null>(null);
  const [hoveredKeyCode, setHoveredKeyCode] = useState<string | null>(null);
  const [selectedFinger, setSelectedFinger] = useState<FingerId | null>(null);
  const [hoveredFinger, setHoveredFinger] = useState<FingerId | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  const allLayouts = useMemo(() => getAllLayouts(), []);

  const analysis = useMemo(
    () => analyzeKeyboardAndFingerPerformance(sessions, filters),
    [sessions, filters]
  );

  // Max values for heatmap normalization
  const { maxKeyIncorrect, maxKeyAttempts } = useMemo(() => {
    const vals = Object.values(analysis.keyStats);
    return {
      maxKeyIncorrect: vals.reduce((m, s) => Math.max(m, s.incorrect), 1),
      maxKeyAttempts: vals.reduce((m, s) => Math.max(m, s.attempts), 1),
    };
  }, [analysis.keyStats]);

  // Linked finger when hovering a key, and linked keys when hovering/selecting a finger
  const linkedFingerFromKey: FingerId | null = useMemo(() => {
    const targetCode = hoveredKeyCode ?? selectedKeyCode;
    if (!targetCode) return null;
    const def = getPhysicalKeyDef(targetCode);
    return def?.finger ?? null;
  }, [hoveredKeyCode, selectedKeyCode]);

  const highlightedKeyCodesForFinger = useMemo(() => {
    const activeF = hoveredFinger ?? selectedFinger;
    if (!activeF) return new Set<string>();
    return new Set(getCodesForFinger(activeF));
  }, [hoveredFinger, selectedFinger]);

  const selectedKeyStat = selectedKeyCode ? analysis.keyStats[selectedKeyCode] : undefined;
  const selectedKeyDef = selectedKeyCode ? getPhysicalKeyDef(selectedKeyCode) : undefined;
  const selectedFingerStat = selectedFinger ? analysis.fingerStats[selectedFinger] : undefined;

  const hoveredKeyStat = hoveredKeyCode ? analysis.keyStats[hoveredKeyCode] : undefined;

  const updateFilter = <K extends keyof HeatmapFilters>(key: K, value: HeatmapFilters[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Keep display layout synced when user filters to a specific layout
      ...(key === 'layoutId' && value !== 'all' ? { displayLayout: value as LayoutId } : {}),
    }));
  };

  const drillLayout: LayoutId =
    filters.layoutId !== 'all'
      ? filters.layoutId
      : filters.displayLayout !== 'english'
      ? filters.displayLayout
      : activeLayoutId;

  const handleSelectKey = (code: string) => {
    setSelectedKeyCode(code);
    setSelectedFinger(null);
  };

  const handleSelectFinger = (finger: FingerId) => {
    setSelectedFinger(finger);
    setSelectedKeyCode(null);
  };

  return (
    <div className="space-y-5">
      {/* Header & Interactive View Mode Switcher */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Interactive Keyboard Heatmap &amp; Finger Analyzer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect physical key error density and finger accuracy separately from Bangla Unicode characters. Click any key or finger for drill-down metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Segmented View Mode Switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900">
              {(
                [
                  { id: 'keyboard', label: 'Keyboard View', icon: Keyboard },
                  { id: 'finger', label: 'Finger View', icon: Hand },
                  { id: 'combined', label: 'Combined View', icon: Layers },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewMode(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === id
                      ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
        </div>

        {/* Comprehensive Filter Controls */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
              {/* Time Range */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Time Window
                </label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => updateFilter('timeRange', e.target.value as HeatmapTimeRange)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="custom">Custom Date Range</option>
                  <option value="session">Selected Session</option>
                </select>
              </div>

              {/* Input Method */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Input Method
                </label>
                <select
                  value={filters.inputMethod}
                  onChange={(e) =>
                    updateFilter('inputMethod', e.target.value as InputMethodType | 'all')
                  }
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Methods</option>
                  <option value="phonetic">Phonetic (Avro)</option>
                  <option value="fixed">Fixed Layouts</option>
                  <option value="system">OS / System IME</option>
                </select>
              </div>

              {/* Layout Data Filter */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Layout Data
                </label>
                <select
                  value={filters.layoutId}
                  onChange={(e) => updateFilter('layoutId', e.target.value as LayoutId | 'all')}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Layouts</option>
                  {allLayouts.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Script (Bangla vs English) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Language / Script
                </label>
                <select
                  value={filters.script}
                  onChange={(e) =>
                    updateFilter('script', e.target.value as HeatmapFilters['script'])
                  }
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">Bangla &amp; English</option>
                  <option value="bangla">Bangla Typing Only</option>
                  <option value="english">English Typing Only</option>
                </select>
              </div>

              {/* Heatmap Metric */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Heatmap Metric
                </label>
                <select
                  value={filters.metric}
                  onChange={(e) => updateFilter('metric', e.target.value as HeatmapMetricMode)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="error-frequency">Error Frequency</option>
                  <option value="accuracy">Accuracy Percentage</option>
                  <option value="total-presses">Total Key Presses</option>
                  <option value="error-ratio">Error-to-Attempt Ratio</option>
                </select>
              </div>

              {/* Key Legends Display */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Keyboard Labels
                </label>
                <select
                  value={filters.displayLayout}
                  onChange={(e) =>
                    updateFilter('displayLayout', e.target.value as LayoutId | 'english')
                  }
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  {allLayouts
                    .filter((l) => l.id !== 'system-ime')
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  <option value="english">English QWERTY</option>
                </select>
              </div>
            </div>

            {/* Conditional Custom Date Range or Session Picker */}
            {filters.timeRange === 'custom' && (
              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Date range:
                </span>
                <input
                  type="date"
                  value={filters.customStartDate}
                  onChange={(e) => updateFilter('customStartDate', e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-tabular"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={filters.customEndDate}
                  onChange={(e) => updateFilter('customEndDate', e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-tabular"
                />
              </div>
            )}

            {filters.timeRange === 'session' && (
              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                <span className="text-slate-500 dark:text-slate-400">Select session:</span>
                <select
                  value={filters.sessionId}
                  onChange={(e) => updateFilter('sessionId', e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 max-w-md"
                >
                  {sessions.length === 0 ? (
                    <option value="">No sessions recorded yet</option>
                  ) : (
                    [...sessions].reverse().map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.dateKey} · {s.lessonTitle} ({s.wpmStandard} WPM, {s.accuracy}%)
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Summary Telemetry Strip + Accessible Color Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300 font-mono-tabular">
            <span>
              Presses: <strong className="text-slate-900 dark:text-slate-100">{analysis.totalKeyEvents}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>
              Correct: <strong className="text-emerald-600 dark:text-emerald-400">{analysis.totalCorrectPresses}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>
              Errors: <strong className="text-rose-600 dark:text-rose-400">{analysis.totalIncorrectPresses}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>
              Key Accuracy: <strong className="text-teal-700 dark:text-teal-300">{analysis.overallKeyAccuracy}%</strong>
            </span>
          </div>

          {/* Accessible Color Scale Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Scale:</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600" />
              Untested
            </span>
            {filters.metric === 'total-presses' ? (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-sky-100 dark:bg-sky-900 border border-sky-400" />
                  Low
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-teal-300 dark:bg-teal-700 border border-teal-500" />
                  Medium
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-teal-600 border border-teal-700" />
                  High
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-emerald-100 dark:bg-emerald-900 border border-emerald-400" />
                  Optimal (97–100%)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-amber-100 dark:bg-amber-900 border border-amber-400" />
                  Moderate
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-orange-200 dark:bg-orange-900 border border-orange-500" />
                  Elevated
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-rose-200 dark:bg-rose-900 border border-rose-500" />
                  Hotspot
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Empty Telemetry Notice */}
      {analysis.totalKeyEvents === 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            No physical keystroke telemetry matches the active filters yet. Complete a session in the <strong>Typing Studio</strong> (using Avro Phonetic, Bijoy Classic, Bijoy Compatible, Jatiya, Probhat, or English mode) — every physical key press and finger assignment will populate this heatmap automatically. You can still click any key or finger below to inspect layout assignments.
          </p>
        </div>
      )}

      {analysis.hasUnmappedImeEvents && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Some recorded sessions used external OS / System IME mode where physical finger mappings cannot be verified. Those keystrokes are excluded from finger attribution rather than estimated.
          </span>
        </div>
      )}

      {/* Main Visualization Canvas (Keyboard View / Finger View / Combined View) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 space-y-5">
          {/* Interactive Visual Keyboard */}
          {(viewMode === 'keyboard' || viewMode === 'combined') && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-4 sm:p-5 space-y-3">
              {/* Live Hover Status Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs min-h-[22px]">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Physical Keyboard Heatmap
                </span>
                {hoveredKeyCode ? (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono-tabular">
                    <span className="font-semibold text-teal-700 dark:text-teal-300 font-bangla-siliguri">
                      {getLegendsForPhysicalKey(hoveredKeyCode, filters.displayLayout).primary}
                    </span>
                    <span>({hoveredKeyCode})</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {FINGER_META[getPhysicalKeyDef(hoveredKeyCode)?.finger ?? 'ri'].label}
                    </span>
                    <span aria-hidden="true">·</span>
                    {hoveredKeyStat ? (
                      <span>
                        {hoveredKeyStat.accuracy}% acc ({hoveredKeyStat.correct}✓ / {hoveredKeyStat.incorrect}✕)
                      </span>
                    ) : (
                      <span className="text-slate-400">No presses yet</span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">
                    Hover or click any physical key to inspect stats &amp; finger link
                  </span>
                )}
              </div>

              {/* Realistic Keyboard Chassis */}
              <div className="overflow-x-auto pb-1">
                <div className="min-w-[720px] rounded-xl bg-slate-100/90 dark:bg-[#0B111B] border border-slate-200/90 dark:border-slate-800 p-2.5 space-y-1.5">
                  {PHYSICAL_KEYBOARD_ROWS.map((row, rIdx) => (
                    <div key={rIdx} className="flex items-stretch gap-1">
                      {row.map((keyDef) => {
                        const stat = analysis.keyStats[keyDef.code];
                        const intensity = getHeatmapIntensity(
                          filters.metric,
                          stat,
                          maxKeyIncorrect,
                          maxKeyAttempts
                        );
                        const colors = getKeyHeatColorClasses(intensity, filters.metric);
                        const legends = getLegendsForPhysicalKey(
                          keyDef.code,
                          filters.displayLayout
                        );
                        const isSelected = selectedKeyCode === keyDef.code;
                        const isFingerLinked = highlightedKeyCodesForFinger.has(keyDef.code);

                        const metricReadout =
                          stat && stat.attempts > 0
                            ? filters.metric === 'error-frequency'
                              ? `${stat.incorrect}✕`
                              : filters.metric === 'total-presses'
                              ? `${stat.attempts}`
                              : filters.metric === 'error-ratio'
                              ? `${Math.round(stat.errorRatio)}%`
                              : `${Math.round(stat.accuracy)}%`
                            : '';

                        return (
                          <button
                            key={keyDef.code}
                            type="button"
                            onClick={() => handleSelectKey(keyDef.code)}
                            onMouseEnter={() => setHoveredKeyCode(keyDef.code)}
                            onMouseLeave={() => setHoveredKeyCode(null)}
                            style={{ flex: `${keyDef.width} 1 0%` }}
                            title={`${legends.primary} (${keyDef.en}) · ${FINGER_META[keyDef.finger].label}${
                              stat
                                ? ` · ${stat.accuracy}% accuracy (${stat.correct} correct, ${stat.incorrect} errors)`
                                : ' · No data yet'
                            }`}
                            className={[
                              'relative h-[52px] px-1.5 py-1 rounded-lg border text-left flex flex-col justify-between transition-all duration-150 focus-visible:outline-2 focus-visible:outline-teal-600 overflow-hidden',
                              colors.bg,
                              colors.text,
                              isSelected
                                ? 'border-teal-600 dark:border-teal-300 ring-2 ring-teal-500/40 z-10'
                                : isFingerLinked
                                ? 'border-teal-500 dark:border-teal-400 ring-1 ring-teal-500/35'
                                : colors.border,
                            ].join(' ')}
                          >
                            {/* Top row: Latin legend + Shifted Bangla or Metric badge */}
                            <div className="flex items-start justify-between w-full leading-none gap-0.5">
                              <span className="text-[9px] font-mono-tabular opacity-60 truncate">
                                {!keyDef.isModifier && keyDef.code !== 'Space' ? legends.latin : ''}
                              </span>
                              <span className="text-[10px] font-bangla-siliguri opacity-70 truncate">
                                {legends.secondary}
                              </span>
                            </div>

                            {/* Center / Bottom row: Primary legend + Heatmap numeric figure */}
                            <div className="flex items-end justify-between w-full leading-none gap-0.5">
                              <span
                                className={`font-bangla-siliguri font-semibold truncate ${
                                  keyDef.isModifier || keyDef.code === 'Space'
                                    ? 'text-[10px] font-sans'
                                    : 'text-sm'
                                }`}
                              >
                                {legends.primary}
                              </span>
                              {metricReadout && (
                                <span className="text-[9px] font-mono-tabular font-semibold opacity-85 shrink-0">
                                  {metricReadout}
                                </span>
                              )}
                            </div>

                            {/* Tactile Home Row ridge (F / J) */}
                            {keyDef.isHome && (keyDef.code === 'KeyF' || keyDef.code === 'KeyJ') && (
                              <span
                                aria-hidden="true"
                                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-current opacity-40"
                              />
                            )}

                            {/* Subtle Finger Zone Color Strip along bottom edge */}
                            <span
                              aria-hidden="true"
                              className={`absolute inset-x-0 bottom-0 h-[3px] ${FINGER_ACCENT_BAR[keyDef.finger]}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Visual Finger Mapping (Illustrated Hands) */}
          {(viewMode === 'finger' || viewMode === 'combined') && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Ergonomic Hand &amp; Finger Performance Map
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 ml-2">
                    Click or hover any finger to highlight its assigned keys
                  </span>
                </div>
                {linkedFingerFromKey && viewMode === 'combined' && (
                  <span className="text-teal-700 dark:text-teal-300 font-medium">
                    Linked: {FINGER_META[linkedFingerFromKey].label}
                  </span>
                )}
              </div>

              <HandDiagram
                fingerStats={analysis.fingerStats}
                metric={filters.metric}
                selectedFinger={selectedFinger}
                hoveredFinger={hoveredFinger}
                linkedFinger={linkedFingerFromKey}
                onSelectFinger={handleSelectFinger}
                onHoverFinger={setHoveredFinger}
              />
            </div>
          )}
        </div>

        {/* Right 4 Columns: Detailed Key / Finger Inspector + Top Mistyped Keys */}
        <div className="xl:col-span-4 space-y-5">
          {/* Interactive Detail Panel */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-4">
            {selectedKeyCode && selectedKeyDef ? (
              <>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Physical Key Inspector · {FINGER_META[selectedKeyDef.finger].label}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
                      <span className="font-bangla-siliguri text-2xl text-teal-700 dark:text-teal-300">
                        {getLegendsForPhysicalKey(selectedKeyCode, filters.displayLayout).primary}
                      </span>
                      <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                        ({selectedKeyDef.en.toUpperCase()} · {selectedKeyCode})
                      </span>
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const tokens = mapCodesToPracticeTokens([selectedKeyCode], drillLayout);
                      onPracticeWeakChars(
                        tokens,
                        `Key Drill: ${getLegendsForPhysicalKey(selectedKeyCode, filters.displayLayout).primary}`
                      );
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 text-white whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3 h-3" />
                    Drill Key
                  </button>
                </div>

                {selectedKeyStat && selectedKeyStat.attempts > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3">
                        <p className="text-slate-500 dark:text-slate-400">Total Attempts</p>
                        <p className="text-xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-0.5">
                          {selectedKeyStat.attempts}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3">
                        <p className="text-slate-500 dark:text-slate-400">Accuracy</p>
                        <p
                          className={`text-xl font-bold font-mono-tabular mt-0.5 ${
                            selectedKeyStat.accuracy >= 95
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : selectedKeyStat.accuracy >= 85
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {selectedKeyStat.accuracy}%
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3">
                        <p className="text-slate-500 dark:text-slate-400">Correct Presses</p>
                        <p className="text-lg font-bold font-mono-tabular text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {selectedKeyStat.correct}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3">
                        <p className="text-slate-500 dark:text-slate-400">Incorrect Presses</p>
                        <p className="text-lg font-bold font-mono-tabular text-rose-600 dark:text-rose-400 mt-0.5">
                          {selectedKeyStat.incorrect}
                          <span className="text-[11px] text-slate-400 font-normal ml-1">
                            ({selectedKeyStat.errorRatio}%)
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Resulting Outputs (Especially informative for Avro Phonetic) */}
                    {selectedKeyStat.producedOutputs.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Resulting Character Outputs
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedKeyStat.producedOutputs.map((o) => (
                            <span
                              key={o.output}
                              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bangla-siliguri"
                            >
                              {o.output}{' '}
                              <span className="font-mono-tabular text-slate-400">×{o.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Common Mistakes */}
                    {selectedKeyStat.commonMistakes.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Most Common Typing Mistakes
                        </h4>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {selectedKeyStat.commonMistakes.map((m, idx) => (
                            <div key={idx} className="py-1.5 flex items-center justify-between">
                              <span className="font-bangla-siliguri">
                                Expected <strong>{m.expected}</strong> → typed{' '}
                                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                  {m.actual}
                                </span>
                              </span>
                              <span className="font-mono-tabular text-slate-500">×{m.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Performance History */}
                    {selectedKeyStat.recentHistory.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Recent Session History
                        </h4>
                        <div className="flex items-end gap-1.5 h-16 pt-2">
                          {selectedKeyStat.recentHistory.map((h) => (
                            <div
                              key={h.sessionId}
                              title={`${h.dateKey}: ${h.accuracy}% (${h.attempts} presses)`}
                              className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                            >
                              <div
                                className={`w-full rounded-t ${
                                  h.accuracy >= 95
                                    ? 'bg-emerald-500/80'
                                    : h.accuracy >= 85
                                    ? 'bg-amber-500/80'
                                    : 'bg-rose-500/80'
                                }`}
                                style={{ height: `${Math.max(12, h.accuracy)}%` }}
                              />
                              <span className="text-[9px] font-mono-tabular text-slate-400">
                                {h.accuracy}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
                    No keystrokes recorded for this key under the current filters yet.
                  </p>
                )}
              </>
            ) : selectedFinger && selectedFingerStat ? (
              <>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      Finger Inspector · {selectedFingerStat.hand} hand
                    </p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {selectedFingerStat.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Status:{' '}
                      <strong
                        className={
                          selectedFingerStat.status === 'underperforming'
                            ? 'text-rose-600 dark:text-rose-400'
                            : selectedFingerStat.status === 'overused'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {selectedFingerStat.status === 'underperforming'
                          ? 'Underperforming'
                          : selectedFingerStat.status === 'overused'
                          ? 'Overused'
                          : selectedFingerStat.status === 'optimal'
                          ? 'Balanced'
                          : 'Untested'}
                      </strong>{' '}
                      · {selectedFingerStat.usageShare}% workload share
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const codes =
                        selectedFingerStat.topMistypedKeys.length > 0
                          ? selectedFingerStat.topMistypedKeys.map((k) => k.code)
                          : getCodesForFinger(selectedFinger);
                      const tokens = mapCodesToPracticeTokens(codes, drillLayout);
                      onPracticeWeakChars(tokens, `${selectedFingerStat.label} Targeted Drill`);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 text-white whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3 h-3" />
                    Drill Finger
                  </button>
                </div>

                {selectedFingerStat.attempts > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3">
                        <p className="text-slate-500 dark:text-slate-400">Assigned Presses</p>
                        <p className="text-xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-0.5">
                          {selectedFingerStat.attempts}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3">
                        <p className="text-slate-500 dark:text-slate-400">Accuracy</p>
                        <p className="text-xl font-bold font-mono-tabular text-teal-700 dark:text-teal-300 mt-0.5">
                          {selectedFingerStat.accuracy}%
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3">
                        <p className="text-slate-500 dark:text-slate-400">Correct</p>
                        <p className="text-lg font-bold font-mono-tabular text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {selectedFingerStat.correct}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3">
                        <p className="text-slate-500 dark:text-slate-400">Incorrect</p>
                        <p className="text-lg font-bold font-mono-tabular text-rose-600 dark:text-rose-400 mt-0.5">
                          {selectedFingerStat.incorrect}
                        </p>
                      </div>
                    </div>

                    {selectedFingerStat.topMistypedKeys.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Most Mistyped Keys for {selectedFingerStat.label}
                        </h4>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {selectedFingerStat.topMistypedKeys.map((k) => (
                            <button
                              key={k.code}
                              type="button"
                              onClick={() => handleSelectKey(k.code)}
                              className="w-full py-1.5 flex items-center justify-between hover:text-teal-700 dark:hover:text-teal-300"
                            >
                              <span className="font-bangla-siliguri font-medium">
                                {getLegendsForPhysicalKey(k.code, filters.displayLayout).primary}{' '}
                                <span className="font-mono-tabular text-slate-400">
                                  ({k.latin.toUpperCase()})
                                </span>
                              </span>
                              <span className="font-mono-tabular text-rose-600 dark:text-rose-400">
                                {k.incorrect} err · {k.accuracy}%
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedFingerStat.recentHistory.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Performance Trend
                        </h4>
                        <div className="flex items-end gap-1.5 h-16 pt-2">
                          {selectedFingerStat.recentHistory.map((h) => (
                            <div
                              key={h.sessionId}
                              title={`${h.dateKey}: ${h.accuracy}% (${h.attempts} presses)`}
                              className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                            >
                              <div
                                className={`w-full rounded-t ${
                                  h.accuracy >= 95
                                    ? 'bg-emerald-500/80'
                                    : h.accuracy >= 85
                                    ? 'bg-amber-500/80'
                                    : 'bg-rose-500/80'
                                }`}
                                style={{ height: `${Math.max(12, h.accuracy)}%` }}
                              />
                              <span className="text-[9px] font-mono-tabular text-slate-400">
                                {h.accuracy}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
                    No keystrokes attributed to {selectedFingerStat.label} under the active filters yet.
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Key &amp; Finger Inspector
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Click any physical key on the keyboard or any finger on the hand diagram to inspect exact press counts, accuracy trends, Avro Latin-to-Bangla mappings, and common mistakes.
                </p>

                {/* Top Mistyped Keys Leaderboard */}
                {analysis.topMistypedKeys.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Most Frequently Mistyped Physical Keys
                    </h4>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {analysis.topMistypedKeys.slice(0, 6).map((k) => {
                        const leg = getLegendsForPhysicalKey(k.code, filters.displayLayout);
                        return (
                          <button
                            key={k.code}
                            type="button"
                            onClick={() => handleSelectKey(k.code)}
                            className="w-full py-2 flex items-center justify-between hover:text-teal-700 dark:hover:text-teal-300"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-bangla-siliguri font-semibold text-sm">
                                {leg.primary}
                              </span>
                              <span className="font-mono-tabular text-slate-400">
                                ({leg.latin})
                              </span>
                            </span>
                            <span className="font-mono-tabular text-rose-600 dark:text-rose-400">
                              {k.incorrect} err · {k.accuracy}%
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Personalized Key & Finger Recommendations */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Ergonomic &amp; Key Recommendations
            </h3>
            {analysis.recommendations.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Finish a couple of typing sessions to unlock personalized hand-balance, keyboard-row, and Bangla-combination diagnostics.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {analysis.recommendations.map((rec) => (
                  <div key={rec.id} className="py-3 first:pt-1 last:pb-0 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-bangla-siliguri leading-snug">
                      {rec.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {rec.detail}
                    </p>
                    <button
                      type="button"
                      onClick={() => onPracticeWeakChars(rec.targetChars, rec.actionLabel)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline pt-0.5"
                    >
                      {rec.actionLabel}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
