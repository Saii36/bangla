import React from 'react';
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  FileText,
  Grid2x2,
  Keyboard,
  Play,
  Sparkles,
} from 'lucide-react';
import { getAllLayouts } from '../core/layouts/registry';
import { computeProgressAnalytics } from '../core/stats';
import type { AppRoute, AppStorageData, LayoutId } from '../types';

interface PopupViewProps {
  data: AppStorageData;
  onChangeLayout: (layoutId: LayoutId) => void;
  onNavigate: (route: AppRoute, mode?: 'timed' | 'weak') => void;
  isEmbeddedPreview?: boolean;
}

export const PopupView: React.FC<PopupViewProps> = ({
  data,
  onChangeLayout,
  onNavigate,
  isEmbeddedPreview = false,
}) => {
  const analytics = computeProgressAnalytics(data.sessions, data.charMistakeTotals);
  const allLayouts = getAllLayouts();

  return (
    <div
      className={`${
        isEmbeddedPreview ? 'w-full max-w-[360px]' : 'w-[360px]'
      } bg-white dark:bg-[#121A26] text-slate-900 dark:text-slate-100 p-4 space-y-4 ${
        isEmbeddedPreview
          ? 'rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl'
          : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bangla-siliguri font-bold text-lg">
            ব
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Bangla Typing Master</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Firefox Quick Access · Offline
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('practice')}
          title="Open Full Dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline whitespace-nowrap shrink-0"
        >
          Full App
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Snapshot Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Best WPM</p>
          <p className="text-lg font-bold font-mono-tabular text-teal-700 dark:text-teal-300">
            {analytics.bestWpm}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Accuracy</p>
          <p className="text-lg font-bold font-mono-tabular text-emerald-600 dark:text-emerald-400">
            {analytics.averageAccuracy}%
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Sessions</p>
          <p className="text-lg font-bold font-mono-tabular text-slate-900 dark:text-slate-100">
            {analytics.totalSessions}
          </p>
        </div>
      </div>

      {/* Active Layout Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Keyboard className="w-3.5 h-3.5" />
          Active Bangla Layout
        </label>
        <select
          value={data.settings.layoutId}
          onChange={(e) => onChangeLayout(e.target.value as LayoutId)}
          className="w-full h-9 px-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
        >
          {allLayouts.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.type === 'phonetic' ? 'Phonetic' : l.type === 'fixed' ? 'Fixed' : 'OS IME'})
            </option>
          ))}
        </select>
      </div>

      {/* Primary Quick Action */}
      <button
        type="button"
        onClick={() => onNavigate('practice', 'timed')}
        className="w-full h-10 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
      >
        <Play className="w-3.5 h-3.5" />
        Start 60-Second Timed Sprint
      </button>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          onClick={() => onNavigate('characters')}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left transition-colors"
        >
          <Grid2x2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="font-medium truncate">Character Drills</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('practice', 'weak')}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left transition-colors"
        >
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="font-medium truncate">Weak Chars</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('lessons')}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left transition-colors"
        >
          <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="font-medium truncate">Lessons</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('custom')}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left transition-colors"
        >
          <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="font-medium truncate">Custom Text</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => onNavigate('progress')}
        className="w-full py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 inline-flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3"
      >
        <BarChart3 className="w-3.5 h-3.5" />
        View Full Progress Dashboard
      </button>
    </div>
  );
};
