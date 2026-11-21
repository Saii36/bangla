import React, { useMemo, useState } from 'react';
import { Play, Sparkles, ArrowRight, BarChart3, Keyboard } from 'lucide-react';
import { getLayoutById } from '../core/layouts/registry';
import { computeProgressAnalytics } from '../core/stats';
import type { LayoutId, PracticeMode, TypingSessionResult } from '../types';
import { KeyboardHeatmapAnalyzer } from './KeyboardHeatmapAnalyzer';

interface ProgressDashboardProps {
  sessions: TypingSessionResult[];
  charMistakeTotals: Record<string, number>;
  activeLayoutId: LayoutId;
  onLaunchWeakChars: (chars: string[], title?: string) => void;
  onLaunchMode: (mode: PracticeMode) => void;
}

interface LinePoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

const TrendChart: React.FC<{
  title: string;
  unit: string;
  values: Array<{ label: string; value: number }>;
  strokeClass: string;
  fillId: string;
  fillColor: string;
  minY?: number;
  maxY?: number;
}> = ({ title, unit, values, strokeClass, fillId, fillColor, minY = 0, maxY }) => {
  const width = 520;
  const height = 165;
  const padX = 34;
  const padY = 18;

  const computedMax = useMemo(() => {
    if (maxY !== undefined) return maxY;
    const peak = values.reduce((m, v) => Math.max(m, v.value), 10);
    return Math.max(10, Math.ceil(peak / 10) * 10);
  }, [values, maxY]);

  const points: LinePoint[] = useMemo(() => {
    if (values.length === 0) return [];
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;
    return values.map((v, idx) => {
      const x =
        values.length === 1
          ? padX + innerW / 2
          : padX + (idx / (values.length - 1)) * innerW;
      const clamped = Math.max(minY, Math.min(computedMax, v.value));
      const ratio = computedMax > minY ? (clamped - minY) / (computedMax - minY) : 0;
      const y = height - padY - ratio * innerH;
      return { x, y, value: v.value, label: v.label };
    });
  }, [values, computedMax, minY]);

  const pathD = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height - padY} L ${points[0].x.toFixed(1)} ${height - padY} Z`
      : '';

  const latest = values[values.length - 1];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5">
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {latest ? (
          <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
            Latest: <strong className="text-slate-900 dark:text-slate-100">{latest.value}{unit}</strong>
          </span>
        ) : (
          <span className="text-xs text-slate-400">No sessions yet</span>
        )}
      </div>

      {points.length === 0 ? (
        <div className="h-[165px] flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          Complete a typing session to plot your progression curve.
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[165px] overflow-visible">
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Horizontal guides */}
          {[0, 0.5, 1].map((t) => {
            const y = padY + t * (height - padY * 2);
            const labelVal = Math.round(computedMax - t * (computedMax - minY));
            return (
              <g key={t}>
                <line
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="1"
                  strokeDasharray={t === 1 ? undefined : '3 3'}
                />
                <text
                  x={padX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {areaD && <path d={areaD} fill={`url(#${fillId})`} />}
          {points.length > 1 && (
            <path d={pathD} fill="none" className={strokeClass} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" className="fill-white dark:fill-[#121A26]" />
              <circle cx={p.x} cy={p.y} r="3.5" fill="none" className={strokeClass} strokeWidth="2">
                <title>{`${p.label}: ${p.value}${unit}`}</title>
              </circle>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
};

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  sessions,
  charMistakeTotals,
  activeLayoutId,
  onLaunchWeakChars,
  onLaunchMode,
}) => {
  const [dashboardSection, setDashboardSection] = useState<'overview' | 'heatmap'>('overview');
  const [range, setRange] = useState<'all' | '30d' | '7d'>('all');

  const filteredSessions = useMemo(() => {
    if (range === 'all') return sessions;
    const days = range === '7d' ? 7 : 30;
    const cutoff = Date.now() - days * 86400 * 1000;
    return sessions.filter((s) => s.timestamp >= cutoff);
  }, [sessions, range]);

  const analytics = useMemo(
    () => computeProgressAnalytics(filteredSessions, charMistakeTotals),
    [filteredSessions, charMistakeTotals]
  );

  const recentPlotSessions = useMemo(
    () => [...filteredSessions].sort((a, b) => a.timestamp - b.timestamp).slice(-20),
    [filteredSessions]
  );

  const wpmSeries = recentPlotSessions.map((s, idx) => ({
    label: `#${idx + 1} (${s.dateKey})`,
    value: s.wpmStandard,
  }));

  const accuracySeries = recentPlotSessions.map((s, idx) => ({
    label: `#${idx + 1} (${s.dateKey})`,
    value: Math.round(s.accuracy),
  }));

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m ${sec % 60}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Section Switcher & Range Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setDashboardSection('overview')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              dashboardSection === 'overview'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Overview &amp; Progression
          </button>
          <button
            type="button"
            onClick={() => setDashboardSection('heatmap')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              dashboardSection === 'heatmap'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Keyboard Heatmap &amp; Fingers
          </button>
        </div>

        {dashboardSection === 'overview' && (
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900">
            {(['7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  range === r
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        )}
      </div>

      {dashboardSection === 'heatmap' ? (
        <KeyboardHeatmapAnalyzer
          sessions={sessions}
          activeLayoutId={activeLayoutId}
          onPracticeWeakChars={onLaunchWeakChars}
        />
      ) : (
        <>
          {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Best Speed</p>
          <p className="text-2xl font-bold font-mono-tabular text-teal-700 dark:text-teal-300 mt-1">
            {analytics.bestWpm}
            <span className="text-xs font-medium text-slate-400 ml-1">WPM</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono-tabular">
            Peak {analytics.bestCpm} CPM
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Average Speed</p>
          <p className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-1">
            {analytics.averageWpm}
            <span className="text-xs font-medium text-slate-400 ml-1">WPM</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono-tabular">
            {analytics.totalSessions} sessions
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Average Accuracy</p>
          <p className="text-2xl font-bold font-mono-tabular text-emerald-600 dark:text-emerald-400 mt-1">
            {analytics.averageAccuracy}%
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono-tabular">
            Best {analytics.bestAccuracy}%
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Practice Time</p>
          <p className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-1">
            {formatDuration(analytics.totalPracticeSeconds)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono-tabular">
            {analytics.currentStreakDays} day streak
          </p>
        </div>

        <div className="col-span-2 lg:col-span-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Graphemes Typed</p>
          <p className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-1">
            {analytics.totalCharsTyped.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Bangla &amp; mixed
          </p>
        </div>
      </div>

      {/* Empty State CTA if 0 sessions */}
      {sessions.length === 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-8 text-center space-y-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Start Your First Bangla Typing Session
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your speed progression charts, weakest Bangla characters, layout comparisons, and daily streak will populate automatically as soon as you finish your first drill.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onLaunchMode('word')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white"
            >
              <Play className="w-3.5 h-3.5" />
              Start Word Drill
            </button>
            <button
              type="button"
              onClick={() => onLaunchMode('timed')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              60s Timed Test
            </button>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TrendChart
          title="Typing Speed Progression (WPM)"
          unit=" WPM"
          values={wpmSeries}
          strokeClass="stroke-teal-600 dark:stroke-teal-400"
          fillId="wpmGrad"
          fillColor="#0D9488"
        />
        <TrendChart
          title="Accuracy Progression (%)"
          unit="%"
          values={accuracySeries}
          strokeClass="stroke-emerald-600 dark:stroke-emerald-400"
          fillId="accGrad"
          fillColor="#059669"
          minY={50}
          maxY={100}
        />
      </div>

      {/* Daily Activity + Weekly/Monthly Summary + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Activity Calendar (28 Days) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Daily Typing Activity (Last 28 Days)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Weekly: <strong className="font-mono-tabular text-slate-800 dark:text-slate-200">{analytics.weeklySummary.sessions}</strong> sessions · Monthly: <strong className="font-mono-tabular text-slate-800 dark:text-slate-200">{analytics.monthlySummary.sessions}</strong>
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {analytics.dailyActivity.map((day) => {
              const intensity =
                day.sessions === 0
                  ? 'bg-slate-100 dark:bg-slate-900 border-slate-200/70 dark:border-slate-800'
                  : day.sessions === 1
                  ? 'bg-teal-100 dark:bg-teal-950/80 border-teal-300 dark:border-teal-800'
                  : day.sessions <= 3
                  ? 'bg-teal-400/70 dark:bg-teal-700/70 border-teal-500 dark:border-teal-600'
                  : 'bg-teal-700 dark:bg-teal-500 border-teal-800 dark:border-teal-400 text-white';

              return (
                <div
                  key={day.dateKey}
                  title={`${day.dateKey}: ${day.sessions} session(s), ${day.minutes}m, avg ${day.avgWpm} WPM`}
                  className={`h-12 rounded-lg border p-1.5 flex flex-col justify-between text-[10px] font-mono-tabular ${intensity}`}
                >
                  <span className="opacity-70">{day.dateKey.slice(5)}</span>
                  <span className="font-semibold text-right">
                    {day.sessions > 0 ? `${day.sessions}×` : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Weekly vs Monthly Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Last 7 Days</p>
              <p className="text-slate-500 dark:text-slate-400 font-mono-tabular">
                {analytics.weeklySummary.avgWpm} avg WPM · {analytics.weeklySummary.avgAccuracy}% acc · {analytics.weeklySummary.minutes}m
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Last 30 Days</p>
              <p className="text-slate-500 dark:text-slate-400 font-mono-tabular">
                {analytics.monthlySummary.avgWpm} avg WPM · {analytics.monthlySummary.avgAccuracy}% acc · {analytics.monthlySummary.minutes}m
              </p>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Targeted Practice Recommendations
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {analytics.recommendations.map((rec, idx) => (
              <div key={idx} className="py-3 first:pt-1 last:pb-0 space-y-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-bangla-siliguri">
                  {rec.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {rec.detail}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (rec.chars && rec.chars.length > 0) {
                      onLaunchWeakChars(rec.chars);
                    } else if (rec.actionType === 'accuracy-mode') {
                      onLaunchMode('accuracy');
                    } else if (rec.actionType === 'timed-mode') {
                      onLaunchMode('timed');
                    } else {
                      onLaunchMode('weak');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                >
                  {rec.actionLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weakest Characters & Weakest Groups + Per-Layout Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Most Frequently Mistyped Characters
            </h3>
            {analytics.weakestCharacters.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  onLaunchWeakChars(analytics.weakestCharacters.slice(0, 8).map((w) => w.char))
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Practice Weak Set
              </button>
            )}
          </div>

          {analytics.weakestCharacters.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
              No mistyped characters recorded yet. Mistakes during practice are tracked automatically here.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {analytics.weakestCharacters.map((item) => (
                  <div
                    key={item.char}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 flex items-center justify-between"
                  >
                    <span className="font-bangla-siliguri text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {item.char}
                    </span>
                    <span className="text-xs font-mono-tabular text-rose-600 dark:text-rose-400 font-semibold">
                      {item.mistakes}×
                    </span>
                  </div>
                ))}
              </div>

              {analytics.weakestCategories.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Weakest Character Groups
                  </p>
                  <div className="space-y-1.5">
                    {analytics.weakestCategories.slice(0, 4).map((cat) => {
                      const maxVal = analytics.weakestCategories[0].mistakes || 1;
                      const pct = Math.round((cat.mistakes / maxVal) * 100);
                      return (
                        <div key={cat.category} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-bangla-siliguri text-slate-700 dark:text-slate-300">
                              {cat.category}
                            </span>
                            <span className="font-mono-tabular text-slate-500 dark:text-slate-400">
                              {cat.mistakes} mistakes
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-rose-500/80 dark:bg-rose-400/80"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Per-Layout Performance Table */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Progress by Keyboard Layout
          </h3>
          {analytics.layoutBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
              Switch between Avro Phonetic, Bijoy Classic, Jatiya, or Probhat to compare your performance across layouts.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 text-left font-medium">Layout</th>
                    <th className="py-2 text-right font-medium">Sessions</th>
                    <th className="py-2 text-right font-medium">Avg WPM</th>
                    <th className="py-2 text-right font-medium">Best WPM</th>
                    <th className="py-2 text-right font-medium">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {analytics.layoutBreakdown.map((row) => {
                    const layout = getLayoutById(row.layoutId);
                    return (
                      <tr key={row.layoutId}>
                        <td className="py-2.5 font-medium text-slate-900 dark:text-slate-100">
                          {layout.name}
                        </td>
                        <td className="py-2.5 text-right font-mono-tabular text-slate-600 dark:text-slate-300">
                          {row.sessions}
                        </td>
                        <td className="py-2.5 text-right font-mono-tabular text-slate-900 dark:text-slate-100 font-semibold">
                          {row.avgWpm}
                        </td>
                        <td className="py-2.5 text-right font-mono-tabular text-teal-700 dark:text-teal-300 font-semibold">
                          {row.bestWpm}
                        </td>
                        <td className="py-2.5 text-right font-mono-tabular text-emerald-600 dark:text-emerald-400">
                          {row.avgAccuracy}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Session & Lesson Completion History */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recent Session &amp; Lesson History
          </h3>
          <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
            Showing latest {Math.min(15, filteredSessions.length)} of {filteredSessions.length}
          </span>
        </div>
        {filteredSessions.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
            Completed lessons and practice sessions will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2 text-left font-medium">Session / Lesson</th>
                  <th className="py-2 text-left font-medium">Mode</th>
                  <th className="py-2 text-left font-medium">Layout</th>
                  <th className="py-2 text-right font-medium">WPM</th>
                  <th className="py-2 text-right font-medium">CPM</th>
                  <th className="py-2 text-right font-medium">Accuracy</th>
                  <th className="py-2 text-right font-medium">Time</th>
                  <th className="py-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[...filteredSessions]
                  .reverse()
                  .slice(0, 15)
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-slate-100 font-bangla-siliguri max-w-[240px] truncate">
                        {s.lessonTitle}
                      </td>
                      <td className="py-2.5 pr-3 capitalize text-slate-600 dark:text-slate-400">
                        {s.mode}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {getLayoutById(s.layoutId).name}
                      </td>
                      <td className="py-2.5 text-right font-mono-tabular font-semibold text-teal-700 dark:text-teal-300">
                        {s.wpmStandard}
                      </td>
                      <td className="py-2.5 text-right font-mono-tabular text-slate-600 dark:text-slate-300">
                        {s.cpm}
                      </td>
                      <td className="py-2.5 text-right font-mono-tabular text-emerald-600 dark:text-emerald-400">
                        {s.accuracy}%
                      </td>
                      <td className="py-2.5 text-right font-mono-tabular text-slate-600 dark:text-slate-400">
                        {s.durationSeconds}s
                      </td>
                      <td className="py-2.5 text-right font-mono-tabular text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {s.dateKey}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
