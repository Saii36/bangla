import React from 'react';
import { getHeatmapIntensity, getKeyHeatColorClasses } from '../core/heatmapEngine';
import type {
  FingerId,
  FingerPerformanceAggregate,
  HeatmapMetricMode,
} from '../types';

interface HandDiagramProps {
  fingerStats: Record<FingerId, FingerPerformanceAggregate>;
  metric: HeatmapMetricMode;
  selectedFinger: FingerId | null;
  hoveredFinger: FingerId | null;
  linkedFinger?: FingerId | null; // highlighted when hovering a physical key on the keyboard
  onSelectFinger: (finger: FingerId) => void;
  onHoverFinger: (finger: FingerId | null) => void;
}

interface FingerShapeSpec {
  id: FingerId;
  hand: 'left' | 'right';
  label: string;
  /** SVG path for the anatomically proportioned finger silhouette */
  path: string;
  /** Subtle fingernail contour */
  nailPath: string;
  /** Knuckle line coordinates [x1, y1, x2, y2] */
  knuckle: [number, number, number, number];
  /** Coordinates for the numeric value badge inside the finger */
  textX: number;
  textY: number;
  /** Coordinates for the outside short label */
  labelX: number;
  labelY: number;
}

/**
 * Anatomically recognizable top-down Left & Right hand paths (viewBox 0 0 620 275).
 * Left hand centered around x=155, Right hand mirrored around x=465.
 */
const LEFT_PALM_PATH =
  'M 64 148 C 58 175, 62 214, 78 238 C 94 258, 122 264, 158 264 C 194 264, 218 250, 232 228 C 242 210, 240 184, 228 164 C 218 148, 206 138, 198 134 C 174 128, 108 128, 64 148 Z';

const RIGHT_PALM_PATH =
  'M 556 148 C 562 175, 558 214, 542 238 C 526 258, 498 264, 462 264 C 426 264, 402 250, 388 228 C 378 210, 380 184, 392 164 C 402 148, 414 138, 422 134 C 446 128, 512 128, 556 148 Z';

const FINGER_SHAPES: FingerShapeSpec[] = [
  // LEFT HAND
  {
    id: 'lp',
    hand: 'left',
    label: 'Pinky',
    path: 'M 64 152 L 56 84 C 55 72, 63 64, 72 64 C 81 64, 88 72, 89 83 L 94 144 Z',
    nailPath: 'M 63 82 C 63 72, 67 69, 72 69 C 77 69, 81 72, 81 82 C 77 85, 67 85, 63 82 Z',
    knuckle: [62, 114, 88, 112],
    textX: 74,
    textY: 102,
    labelX: 68,
    labelY: 50,
  },
  {
    id: 'lr',
    hand: 'left',
    label: 'Ring',
    path: 'M 95 142 L 92 56 C 92 44, 100 36, 110 36 C 120 36, 128 44, 128 56 L 129 138 Z',
    nailPath: 'M 100 54 C 100 44, 104 41, 110 41 C 116 41, 120 44, 120 54 C 116 57, 104 57, 100 54 Z',
    knuckle: [96, 94, 124, 93],
    textX: 111,
    textY: 82,
    labelX: 110,
    labelY: 22,
  },
  {
    id: 'lm',
    hand: 'left',
    label: 'Middle',
    path: 'M 131 137 L 132 42 C 132 30, 141 22, 151 22 C 161 22, 169 30, 169 42 L 168 137 Z',
    nailPath: 'M 140 40 C 140 30, 145 27, 151 27 C 157 27, 161 30, 161 40 C 157 43, 145 43, 140 40 Z',
    knuckle: [135, 84, 165, 84],
    textX: 150,
    textY: 74,
    labelX: 151,
    labelY: 11,
  },
  {
    id: 'li',
    hand: 'left',
    label: 'Index',
    path: 'M 170 139 L 175 56 C 176 44, 184 37, 194 37 C 204 37, 211 45, 210 57 L 204 146 Z',
    nailPath: 'M 183 55 C 184 45, 188 42, 194 42 C 200 42, 203 45, 203 55 C 198 58, 188 58, 183 55 Z',
    knuckle: [176, 96, 204, 98],
    textX: 191,
    textY: 85,
    labelX: 196,
    labelY: 23,
  },
  {
    id: 'lthumb',
    hand: 'left',
    label: 'L. Thumb',
    path: 'M 218 166 L 254 134 C 263 126, 275 127, 282 135 C 289 143, 288 155, 279 163 L 236 208 Z',
    nailPath: 'M 263 136 C 270 131, 275 133, 279 138 C 282 143, 282 149, 276 154 C 270 153, 265 145, 263 136 Z',
    knuckle: [242, 152, 258, 174],
    textX: 256,
    textY: 164,
    labelX: 274,
    labelY: 117,
  },

  // RIGHT HAND (anatomical mirror)
  {
    id: 'rthumb',
    hand: 'right',
    label: 'R. Thumb',
    path: 'M 402 166 L 366 134 C 357 126, 345 127, 338 135 C 331 143, 332 155, 341 163 L 384 208 Z',
    nailPath: 'M 357 136 C 350 131, 345 133, 341 138 C 338 143, 338 149, 344 154 C 350 153, 355 145, 357 136 Z',
    knuckle: [378, 152, 362, 174],
    textX: 364,
    textY: 164,
    labelX: 346,
    labelY: 117,
  },
  {
    id: 'ri',
    hand: 'right',
    label: 'Index',
    path: 'M 450 139 L 445 56 C 444 44, 436 37, 426 37 C 416 37, 409 45, 410 57 L 416 146 Z',
    nailPath: 'M 437 55 C 436 45, 432 42, 426 42 C 420 42, 417 45, 417 55 C 422 58, 432 58, 437 55 Z',
    knuckle: [416, 98, 444, 96],
    textX: 429,
    textY: 85,
    labelX: 424,
    labelY: 23,
  },
  {
    id: 'rm',
    hand: 'right',
    label: 'Middle',
    path: 'M 489 137 L 488 42 C 488 30, 479 22, 469 22 C 459 22, 451 30, 451 42 L 452 137 Z',
    nailPath: 'M 480 40 C 480 30, 475 27, 469 27 C 463 27, 459 30, 459 40 C 463 43, 475 43, 480 40 Z',
    knuckle: [455, 84, 485, 84],
    textX: 470,
    textY: 74,
    labelX: 469,
    labelY: 11,
  },
  {
    id: 'rr',
    hand: 'right',
    label: 'Ring',
    path: 'M 525 142 L 528 56 C 528 44, 520 36, 510 36 C 500 36, 492 44, 492 56 L 491 138 Z',
    nailPath: 'M 520 54 C 520 44, 516 41, 510 41 C 504 41, 500 44, 500 54 C 504 57, 516 57, 520 54 Z',
    knuckle: [496, 93, 524, 94],
    textX: 509,
    textY: 82,
    labelX: 510,
    labelY: 22,
  },
  {
    id: 'rp',
    hand: 'right',
    label: 'Pinky',
    path: 'M 556 152 L 564 84 C 565 72, 557 64, 548 64 C 539 64, 532 72, 531 83 L 526 144 Z',
    nailPath: 'M 557 82 C 557 72, 553 69, 548 69 C 543 69, 539 72, 539 82 C 543 85, 553 85, 557 82 Z',
    knuckle: [532, 112, 558, 114],
    textX: 546,
    textY: 102,
    labelX: 552,
    labelY: 50,
  },
];

function getFingerFill(intensity: number | null, metric: HeatmapMetricMode): { fill: string; stroke: string; textFill: string } {
  if (intensity === null) {
    return {
      fill: 'fill-slate-100 dark:fill-slate-800/80',
      stroke: 'stroke-slate-300 dark:stroke-slate-600',
      textFill: 'fill-slate-500 dark:fill-slate-400',
    };
  }
  const palette = getKeyHeatColorClasses(intensity, metric);
  if (metric === 'total-presses') {
    if (intensity < 0.25) return { fill: 'fill-sky-100 dark:fill-sky-900/60', stroke: 'stroke-sky-400 dark:stroke-sky-500', textFill: 'fill-sky-900 dark:fill-sky-100' };
    if (intensity < 0.55) return { fill: 'fill-teal-200 dark:fill-teal-800/70', stroke: 'stroke-teal-500 dark:stroke-teal-400', textFill: 'fill-teal-950 dark:fill-teal-50' };
    if (intensity < 0.8) return { fill: 'fill-teal-400/80 dark:fill-teal-700/85', stroke: 'stroke-teal-600 dark:stroke-teal-400', textFill: 'fill-teal-950 dark:fill-white' };
    return { fill: 'fill-teal-600 dark:fill-teal-500', stroke: 'stroke-teal-800 dark:stroke-teal-300', textFill: 'fill-white' };
  }
  if (intensity <= 0.08) {
    return { fill: 'fill-emerald-100 dark:fill-emerald-900/65', stroke: 'stroke-emerald-500 dark:stroke-emerald-500', textFill: 'fill-emerald-950 dark:fill-emerald-100' };
  }
  if (intensity <= 0.35) {
    return { fill: 'fill-amber-100 dark:fill-amber-900/60', stroke: 'stroke-amber-500 dark:stroke-amber-500', textFill: 'fill-amber-950 dark:fill-amber-100' };
  }
  if (intensity <= 0.65) {
    return { fill: 'fill-orange-200 dark:fill-orange-900/75', stroke: 'stroke-orange-500 dark:stroke-orange-400', textFill: 'fill-orange-950 dark:fill-orange-50' };
  }
  void palette;
  return { fill: 'fill-rose-200 dark:fill-rose-900/85', stroke: 'stroke-rose-600 dark:stroke-rose-400', textFill: 'fill-rose-950 dark:fill-rose-50' };
}

export const HandDiagram: React.FC<HandDiagramProps> = ({
  fingerStats,
  metric,
  selectedFinger,
  hoveredFinger,
  linkedFinger,
  onSelectFinger,
  onHoverFinger,
}) => {
  const allStats = Object.values(fingerStats);
  const maxIncorrect = allStats.reduce((m, s) => Math.max(m, s.incorrect), 1);
  const maxAttempts = allStats.reduce((m, s) => Math.max(m, s.attempts), 1);

  return (
    <div className="w-full space-y-3">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 620 278"
          className="w-full max-w-[660px] mx-auto h-auto select-none"
          role="img"
          aria-label="Interactive ergonomic left and right hand finger performance visualization"
        >
          {/* Left Palm */}
          <path
            d={LEFT_PALM_PATH}
            className="fill-slate-100/90 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="1.75"
          />
          <text
            x="148"
            y="206"
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 text-[11px] font-semibold"
          >
            Left Hand
          </text>
          <text
            x="148"
            y="223"
            textAnchor="middle"
            className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono"
          >
            {(['lp', 'lr', 'lm', 'li', 'lthumb'] as FingerId[]).reduce(
              (sum, f) => sum + fingerStats[f].attempts,
              0
            )}{' '}
            presses
          </text>

          {/* Right Palm */}
          <path
            d={RIGHT_PALM_PATH}
            className="fill-slate-100/90 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="1.75"
          />
          <text
            x="472"
            y="206"
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 text-[11px] font-semibold"
          >
            Right Hand
          </text>
          <text
            x="472"
            y="223"
            textAnchor="middle"
            className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono"
          >
            {(['rthumb', 'ri', 'rm', 'rr', 'rp'] as FingerId[]).reduce(
              (sum, f) => sum + fingerStats[f].attempts,
              0
            )}{' '}
            presses
          </text>

          {/* Individual Interactive Fingers */}
          {FINGER_SHAPES.map((spec) => {
            const stat = fingerStats[spec.id];
            const intensity = getHeatmapIntensity(metric, stat, maxIncorrect, maxAttempts);
            const colors = getFingerFill(intensity, metric);
            const isActive =
              selectedFinger === spec.id ||
              hoveredFinger === spec.id ||
              linkedFinger === spec.id;

            const badgeValue =
              stat.attempts === 0
                ? '—'
                : metric === 'error-frequency'
                ? `${stat.incorrect}`
                : metric === 'total-presses'
                ? `${stat.attempts}`
                : metric === 'error-ratio'
                ? `${Math.round(stat.errorRatio)}%`
                : `${Math.round(stat.accuracy)}%`;

            return (
              <g
                key={spec.id}
                role="button"
                tabIndex={0}
                aria-label={`${stat.label}: ${stat.attempts} presses, ${stat.accuracy}% accuracy, ${stat.incorrect} errors`}
                onClick={() => onSelectFinger(spec.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectFinger(spec.id);
                  }
                }}
                onMouseEnter={() => onHoverFinger(spec.id)}
                onMouseLeave={() => onHoverFinger(null)}
                className="cursor-pointer focus:outline-none group"
              >
                <path
                  d={spec.path}
                  className={`${colors.fill} ${
                    isActive
                      ? 'stroke-teal-700 dark:stroke-teal-300'
                      : colors.stroke
                  } transition-all duration-150`}
                  strokeWidth={isActive ? 2.8 : 1.6}
                />
                {/* Anatomical fingernail highlight */}
                <path
                  d={spec.nailPath}
                  className="fill-white/45 dark:fill-white/10 stroke-slate-400/35 dark:stroke-slate-300/20 pointer-events-none"
                  strokeWidth="0.9"
                />
                {/* Knuckle crease */}
                <line
                  x1={spec.knuckle[0]}
                  y1={spec.knuckle[1]}
                  x2={spec.knuckle[2]}
                  y2={spec.knuckle[3]}
                  className="stroke-slate-500/25 dark:stroke-slate-300/20 pointer-events-none"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />

                {/* Metric Value inside finger */}
                <text
                  x={spec.textX}
                  y={spec.textY}
                  textAnchor="middle"
                  className={`${colors.textFill} text-[10px] font-mono font-bold pointer-events-none`}
                >
                  {badgeValue}
                </text>

                {/* Short finger name outside fingertip */}
                <text
                  x={spec.labelX}
                  y={spec.labelY}
                  textAnchor="middle"
                  className={`text-[10px] font-medium pointer-events-none ${
                    isActive
                      ? 'fill-teal-700 dark:fill-teal-300 font-semibold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {spec.label}
                </text>

                <title>
                  {`${stat.label} — ${stat.accuracy}% accuracy · ${stat.correct} correct · ${stat.incorrect} errors · ${stat.attempts} total presses (${stat.usageShare}% share)`}
                </title>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Compact 10-Finger Comparison Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {FINGER_SHAPES.map((spec) => {
          const stat = fingerStats[spec.id];
          const isSelected = selectedFinger === spec.id || linkedFinger === spec.id;
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => onSelectFinger(spec.id)}
              onMouseEnter={() => onHoverFinger(spec.id)}
              onMouseLeave={() => onHoverFinger(null)}
              className={`px-2.5 py-2 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 dark:border-teal-400'
                  : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {stat.label}
                </span>
                <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                  {stat.attempts > 0 ? `${Math.round(stat.accuracy)}%` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono-tabular">
                <span>{stat.attempts} keys</span>
                <span
                  className={
                    stat.status === 'underperforming'
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : stat.status === 'overused'
                      ? 'text-amber-600 dark:text-amber-400 font-semibold'
                      : ''
                  }
                >
                  {stat.status === 'underperforming'
                    ? 'Low acc'
                    : stat.status === 'overused'
                    ? 'Overused'
                    : stat.incorrect > 0
                    ? `${stat.incorrect} err`
                    : 'OK'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
