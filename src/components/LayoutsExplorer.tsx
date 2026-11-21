import React, { useMemo, useState } from 'react';
import { Check, Play } from 'lucide-react';
import { getAllLayouts, getLayoutById } from '../core/layouts/registry';
import type { LayoutId } from '../types';
import { VirtualKeyboard } from './VirtualKeyboard';

interface LayoutsExplorerProps {
  activeLayoutId: LayoutId;
  onSelectLayout: (layoutId: LayoutId) => void;
  onStartPracticeWithLayout: (layoutId: LayoutId) => void;
}

export const LayoutsExplorer: React.FC<LayoutsExplorerProps> = ({
  activeLayoutId,
  onSelectLayout,
  onStartPracticeWithLayout,
}) => {
  const [inspectId, setInspectId] = useState<LayoutId>(activeLayoutId);
  const allLayouts = useMemo(() => getAllLayouts(), []);
  const inspected = useMemo(() => getLayoutById(inspectId), [inspectId]);

  const phoneticLayouts = allLayouts.filter((l) => l.type === 'phonetic');
  const fixedLayouts = allLayouts.filter((l) => l.type === 'fixed');
  const systemLayouts = allLayouts.filter((l) => l.type === 'system');

  const renderCard = (layout: (typeof allLayouts)[number]) => {
    const isActive = layout.id === activeLayoutId;
    const isInspected = layout.id === inspectId;

    return (
      <div
        key={layout.id}
        onClick={() => setInspectId(layout.id)}
        className={`rounded-xl border p-4 cursor-pointer transition-colors ${
          isInspected
            ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 dark:border-teal-400'
            : 'bg-white dark:bg-[#121A26] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {layout.name}
            </h3>
            <p className="text-xs font-bangla-siliguri text-slate-500 dark:text-slate-400">
              {layout.nativeName} · {layout.badgeLabel}
            </p>
          </div>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-300 shrink-0">
              <Check className="w-3.5 h-3.5" />
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          {layout.shortDescription}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Architecture Distinction Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Bangla Input Methods &amp; Keyboard Layouts
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Phonetic methods and fixed positional keyboard layouts work differently. Switching layouts never resets your saved progress — every layout tracks its own WPM and accuracy history in your Progress Dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              1. Phonetic Input Method
            </h3>
            <div className="space-y-2.5">{phoneticLayouts.map(renderCard)}</div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              2. Fixed Positional Layouts
            </h3>
            <div className="space-y-2.5">{fixedLayouts.slice(0, 2).map(renderCard)}</div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              3. Standard Fixed &amp; Native OS IME
            </h3>
            <div className="space-y-2.5">
              {fixedLayouts.slice(2).map(renderCard)}
              {systemLayouts.map(renderCard)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Guide for Selected Layout */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{inspected.badgeLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-bangla-siliguri">{inspected.nativeName}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {inspected.name} — Practice Instructions
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {activeLayoutId !== inspected.id && (
              <button
                type="button"
                onClick={() => onSelectLayout(inspected.id)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                Set as Active Layout
              </button>
            )}
            <button
              type="button"
              onClick={() => onStartPracticeWithLayout(inspected.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              Practice with {inspected.name}
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {inspected.mechanismSummary}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              How to Type in {inspected.name}
            </h4>
            <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal pl-4 leading-relaxed">
              {inspected.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pt-2">
              Muscle Memory Tips
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed">
              {inspected.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Keystroke Examples
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 px-4">
              {inspected.examples.map((ex, i) => (
                <div key={i} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono-tabular text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {ex.keys}
                    </p>
                    {ex.note && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {ex.note}
                      </p>
                    )}
                  </div>
                  <span className="font-bangla-siliguri text-lg font-semibold text-teal-700 dark:text-teal-300 shrink-0">
                    {ex.output}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Interactive Keymap Diagram */}
        <div className="pt-2">
          <VirtualKeyboard layoutId={inspected.id} />
        </div>
      </div>

      {/* Linux Mint / Ubuntu Native Input Method Integration & Compatibility Notes */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Linux Native Input Integration (Linux Mint &amp; Ubuntu)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            You do not need to replace your existing Linux keyboard setup. Choose <strong>OS / System IME</strong> to practice with your native Linux Bangla input method, or use our built-in offline engines when no system Bangla IME is installed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              IBus &amp; OpenBangla (Ubuntu / Mint)
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Works directly with <code className="font-mono-tabular">ibus-avro</code>, <code className="font-mono-tabular">ibus-m17n</code> (Probhat / National Jatiya / UniJoy), and <strong>OpenBangla Keyboard</strong> via standard DOM IME composition events.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              Fcitx5 &amp; Native XKB Layouts
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Compatible with <code className="font-mono-tabular">fcitx5-m17n</code>, <code className="font-mono-tabular">fcitx5-openbangla</code>, and built-in X11/Wayland <code className="font-mono-tabular">bn(probhat)</code> and <code className="font-mono-tabular">bn</code> system keyboard layouts.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              Compatibility &amp; Licensing Scope
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Built-in engines are independent clean-room Unicode implementations designed for offline typing practice. They do not bundle proprietary Bijoy ANSI fonts or claim 100% dictionary parity with desktop Avro Keyboard or Bijoy Bayanno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
