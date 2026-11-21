import React from 'react';
import { getKeyHintForGrapheme, getLayoutById } from '../core/layouts/registry';
import type { KeyCapSpec, LayoutId } from '../types';

interface VirtualKeyboardProps {
  layoutId: LayoutId;
  activeTargetGrapheme?: string;
  pressedCode?: string | null;
  shiftActive?: boolean;
  onVirtualKeyClick?: (key: string) => void;
}

const FINGER_BORDER: Record<KeyCapSpec['finger'], string> = {
  lp: 'border-b-rose-400/60 dark:border-b-rose-500/40',
  lr: 'border-b-amber-400/60 dark:border-b-amber-500/40',
  lm: 'border-b-emerald-400/60 dark:border-b-emerald-500/40',
  li: 'border-b-teal-500/60 dark:border-b-teal-400/45',
  ri: 'border-b-sky-500/60 dark:border-b-sky-400/45',
  rm: 'border-b-indigo-400/60 dark:border-b-indigo-400/45',
  rr: 'border-b-violet-400/60 dark:border-b-violet-400/45',
  rp: 'border-b-slate-400/60 dark:border-b-slate-500/45',
  thumb: 'border-b-slate-400/50',
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  layoutId,
  activeTargetGrapheme,
  pressedCode,
  shiftActive = false,
  onVirtualKeyClick,
}) => {
  const layout = getLayoutById(layoutId);
  const hint = activeTargetGrapheme
    ? getKeyHintForGrapheme(layoutId, activeTargetGrapheme)
    : null;

  // Determine which physical key(s) should be highlighted for the current target
  const hintKeys = new Set<string>();
  let needsShift = false;
  if (hint?.keys) {
    const tokens = hint.keys.split('+').map((t) => t.trim());
    for (const tok of tokens) {
      if (tok.toLowerCase() === 'shift') {
        needsShift = true;
      } else if (tok.length === 1) {
        hintKeys.add(tok.toLowerCase());
      } else if (tok.includes('/')) {
        tok.split('/').forEach((p) => {
          const clean = p.trim();
          if (clean.length === 1) hintKeys.add(clean.toLowerCase());
        });
      }
    }
  }

  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-4 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {layout.name}
          </span>
          <span aria-hidden="true">·</span>
          <span>{layout.badgeLabel}</span>
        </div>
        {activeTargetGrapheme && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span>Next target:</span>
            <span className="font-bangla-siliguri text-base font-semibold text-teal-700 dark:text-teal-300">
              {activeTargetGrapheme === ' '
                ? 'Space'
                : activeTargetGrapheme === '\n'
                ? 'Enter'
                : activeTargetGrapheme}
            </span>
            {hint && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular font-medium text-slate-900 dark:text-slate-100">
                  {hint.keys}
                </span>
                {hint.note && (
                  <span className="text-slate-500 dark:text-slate-400">({hint.note})</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1.5 overflow-x-auto pb-1">
        {layout.keyboardRows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex items-center justify-center gap-1 min-w-[640px]"
            style={{
              paddingLeft: rowIdx === 1 ? '18px' : rowIdx === 2 ? '28px' : rowIdx === 3 ? '46px' : '0px',
            }}
          >
            {row.map((keySpec) => {
              const isPressed = pressedCode === keySpec.code;
              const isHinted = hintKeys.has(keySpec.en.toLowerCase());

              return (
                <button
                  key={keySpec.code}
                  type="button"
                  onClick={() => {
                    if (onVirtualKeyClick) {
                      onVirtualKeyClick(shiftActive && keySpec.enShift ? keySpec.enShift : keySpec.en);
                    }
                  }}
                  title={`${keySpec.en.toUpperCase()} → ${keySpec.bn ?? ''} (Shift: ${keySpec.bnShift ?? ''})`}
                  className={[
                    'relative flex flex-col justify-between h-12 w-12 px-1.5 py-1 rounded-lg border border-b-2 text-left transition-all duration-100 focus-visible:outline-2 focus-visible:outline-teal-600',
                    FINGER_BORDER[keySpec.finger],
                    isPressed
                      ? 'bg-teal-600 text-white border-teal-700 scale-95'
                      : isHinted
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 dark:border-teal-400 text-teal-950 dark:text-teal-100 ring-1 ring-teal-500/40'
                      : 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between w-full leading-none">
                    <span
                      className={`text-[10px] font-mono-tabular ${
                        isPressed
                          ? 'text-teal-100'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {keySpec.en.toUpperCase()}
                    </span>
                    <span
                      className={`font-bangla-siliguri text-[11px] leading-none ${
                        isPressed
                          ? 'text-teal-100'
                          : shiftActive || (isHinted && needsShift)
                          ? 'text-teal-700 dark:text-teal-300 font-semibold'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {keySpec.bnShift !== keySpec.enShift ? keySpec.bnShift : ''}
                    </span>
                  </div>
                  <div className="flex items-end justify-between w-full leading-none">
                    <span
                      className={`font-bangla-siliguri text-sm font-semibold leading-none ${
                        isPressed
                          ? 'text-white'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {keySpec.bn}
                    </span>
                    {keySpec.isHome && (
                      <span
                        aria-hidden="true"
                        className="w-2.5 h-0.5 rounded-full bg-slate-400/70 dark:bg-slate-500/70 mb-0.5"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        {/* Bottom Space + Shift row */}
        <div className="flex items-center justify-center gap-2 min-w-[640px] pt-0.5">
          <div
            className={`h-9 px-4 rounded-lg border text-xs font-medium flex items-center justify-center ${
              shiftActive || needsShift
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200'
                : 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400'
            }`}
          >
            Shift
          </div>
          <button
            type="button"
            onClick={() => onVirtualKeyClick?.(' ')}
            className={`h-9 w-72 rounded-lg border text-xs font-medium flex items-center justify-center transition-colors ${
              activeTargetGrapheme === ' '
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200 ring-1 ring-teal-500/40'
                : 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Space
          </button>
          <div
            className={`h-9 px-4 rounded-lg border text-xs font-medium flex items-center justify-center ${
              shiftActive || needsShift
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200'
                : 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400'
            }`}
          >
            Shift
          </div>
        </div>
      </div>
    </div>
  );
};
