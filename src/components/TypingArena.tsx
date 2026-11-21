import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  RefreshCw,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Languages,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  FINGER_META,
  PHYSICAL_KEYBOARD_ROWS,
  resolveFingerForPhysicalKey,
} from '../core/heatmapEngine';
import { isAvroBufferChar, transliterateAvroToken } from '../core/layouts/avroEngine';
import {
  FixedKeyState,
  INITIAL_FIXED_STATE,
  processFixedLayoutKey,
} from '../core/layouts/fixedLayouts';
import { getAllLayouts, getKeyHintForGrapheme, getLayoutById } from '../core/layouts/registry';
import { playCompletionChime, playErrorTone, playKeyClick } from '../core/sound';
import { calculateLiveMetrics, createSessionRecord, getPrimarySpeedValue } from '../core/stats';
import { evaluateTypingGraphemes, normalizeBangla, segmentBanglaGraphemes } from '../core/unicode';
import type {
  ActivePracticeConfig,
  BanglaFontFamily,
  ColorPreset,
  Difficulty,
  LayoutId,
  PhysicalKeyEvent,
  PracticeMode,
  TypingSessionResult,
  UserSettings,
} from '../types';
import { SessionResultModal } from './SessionResultModal';
import { VirtualKeyboard } from './VirtualKeyboard';

interface TypingArenaProps {
  config: ActivePracticeConfig;
  settings: UserSettings;
  bestWpm: number;
  averageWpm: number;
  onSelectMode: (mode: PracticeMode, durationOverride?: number) => void;
  onChangeLayout: (layoutId: LayoutId) => void;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onToggleSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  onRegenerate: () => void;
  onCompleteSession: (result: TypingSessionResult) => void;
  onPracticeWeakChars: (chars: string[]) => void;
  onOpenProgress: () => void;
}

const MODE_OPTIONS: Array<{ id: PracticeMode; label: string }> = [
  { id: 'character', label: 'Character' },
  { id: 'word', label: 'Word' },
  { id: 'sentence', label: 'Sentence' },
  { id: 'paragraph', label: 'Paragraph' },
  { id: 'timed', label: 'Timed Test' },
  { id: 'accuracy', label: 'Accuracy' },
  { id: 'weak', label: 'Weak Chars' },
  { id: 'exam', label: 'Exam Sim' },
  { id: 'custom', label: 'Custom' },
];

const FONT_CLASS_MAP: Record<BanglaFontFamily, string> = {
  siliguri: 'font-bangla-siliguri',
  'noto-sans': 'font-bangla-sans',
  'noto-serif': 'font-bangla-serif',
  tiro: 'font-bangla-tiro',
};

const SURFACE_PRESET_MAP: Record<ColorPreset, string> = {
  default: 'bg-white dark:bg-[#121A26] border-slate-200 dark:border-slate-800',
  paper: 'bg-[#FAF8F2] dark:bg-[#16191D] border-stone-200 dark:border-slate-800',
  'high-contrast': 'bg-white dark:bg-black border-slate-900 dark:border-slate-500',
  midnight: 'bg-slate-900 dark:bg-[#090E17] border-slate-700 text-slate-100',
};

export const TypingArena: React.FC<TypingArenaProps> = ({
  config,
  settings,
  bestWpm,
  averageWpm,
  onSelectMode,
  onChangeLayout,
  onChangeDifficulty,
  onToggleSetting,
  onRegenerate,
  onCompleteSession,
  onPracticeWeakChars,
  onOpenProgress,
}) => {
  const [committedText, setCommittedText] = useState('');
  const [avroBuffer, setAvroBuffer] = useState('');
  const [fixedState, setFixedState] = useState<FixedKeyState>(INITIAL_FIXED_STATE);
  const [isComposingIME, setIsComposingIME] = useState(false);
  const [englishOverride, setEnglishOverride] = useState(false);

  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [totalKeyMistakes, setTotalKeyMistakes] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState<Record<string, number>>({});
  const [finishedResult, setFinishedResult] = useState<TypingSessionResult | null>(null);
  const [endedReason, setEndedReason] = useState<'completed' | 'time-up' | 'accuracy-limit'>(
    'completed'
  );

  const [pressedCode, setPressedCode] = useState<string | null>(null);
  const [shiftActive, setShiftActive] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeSpanRef = useRef<HTMLSpanElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const prevIncorrectRef = useRef(0);
  const keyEventsRef = useRef<PhysicalKeyEvent[]>([]);
  const lastHandRef = useRef<'left' | 'right' | undefined>(undefined);
  const lastNativeKeyRef = useRef<{ code: string; key: string; shifted: boolean } | null>(null);

  const activeLayout = useMemo(() => getLayoutById(settings.layoutId), [settings.layoutId]);
  const allLayouts = useMemo(() => getAllLayouts(), []);

  // Combined live typed text (committed + active Avro phonetic preview)
  const effectiveTypedText = useMemo(() => {
    if (settings.layoutId === 'avro' && avroBuffer) {
      return committedText + transliterateAvroToken(avroBuffer);
    }
    return committedText;
  }, [committedText, avroBuffer, settings.layoutId]);

  const isTimedMode = config.mode === 'timed' || config.mode === 'exam';
  const durationLimit = config.durationSec ?? settings.testDurationSec;

  // Reset typing state whenever target exercise text changes
  const resetSession = useCallback(() => {
    setCommittedText('');
    setAvroBuffer('');
    setFixedState(INITIAL_FIXED_STATE);
    setIsComposingIME(false);
    setStartedAt(null);
    setElapsedSec(0);
    setTotalKeyMistakes(0);
    setSessionMistakes({});
    setFinishedResult(null);
    setEndedReason('completed');
    prevIncorrectRef.current = 0;
    keyEventsRef.current = [];
    lastHandRef.current = undefined;
    lastNativeKeyRef.current = null;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    resetSession();
  }, [config.text, config.mode, config.title, resetSession]);

  // Keep layout switches non-destructive: flush Avro buffer when switching layouts mid-session
  const handleLayoutChange = (nextLayout: LayoutId) => {
    if (settings.layoutId === 'avro' && avroBuffer) {
      setCommittedText((prev) => prev + transliterateAvroToken(avroBuffer));
      setAvroBuffer('');
    }
    setFixedState(INITIAL_FIXED_STATE);
    onChangeLayout(nextLayout);
    inputRef.current?.focus();
  };

  // Grapheme-aware evaluation
  const evaluation = useMemo(
    () =>
      evaluateTypingGraphemes(config.text, effectiveTypedText, {
        isComposing: isComposingIME || avroBuffer.length > 0 || fixedState.pendingLink || Boolean(fixedState.pendingPreVowel),
        autoPunctuation: settings.autoPunctuation,
      }),
    [
      config.text,
      effectiveTypedText,
      isComposingIME,
      avroBuffer,
      fixedState.pendingLink,
      fixedState.pendingPreVowel,
      settings.autoPunctuation,
    ]
  );

  const liveMetrics = useMemo(
    () => calculateLiveMetrics(evaluation, effectiveTypedText, elapsedSec),
    [evaluation, effectiveTypedText, elapsedSec]
  );

  const primarySpeed = useMemo(
    () => getPrimarySpeedValue(liveMetrics, settings.speedMetric),
    [liveMetrics, settings.speedMetric]
  );

  // Finalize session helper
  const finishSession = useCallback(
    (reason: 'completed' | 'time-up' | 'accuracy-limit', finalDurationSec?: number) => {
      if (finishedResult) return;
      const elapsed = Math.max(1, finalDurationSec ?? elapsedSec);
      const record = createSessionRecord({
        mode: config.mode,
        layoutId: settings.layoutId,
        lessonId: config.lessonId,
        lessonTitle: config.title,
        evaluation,
        typedText: effectiveTypedText,
        durationSeconds: elapsed,
        totalKeyMistakes,
        sessionMistakeMap: sessionMistakes,
        keyEvents: [...keyEventsRef.current],
      });
      setEndedReason(reason);
      setFinishedResult(record);
      if (settings.soundEnabled) {
        playCompletionChime();
      }
      onCompleteSession(record);
    },
    [
      finishedResult,
      elapsedSec,
      config.mode,
      config.lessonId,
      config.title,
      settings.layoutId,
      settings.soundEnabled,
      evaluation,
      effectiveTypedText,
      totalKeyMistakes,
      sessionMistakes,
      onCompleteSession,
    ]
  );

  // Timer loop
  useEffect(() => {
    if (!startedAt || finishedResult) return;
    const id = window.setInterval(() => {
      const nextElapsed = Math.floor((Date.now() - startedAt) / 1000);
      setElapsedSec(nextElapsed);
      if (isTimedMode && nextElapsed >= durationLimit) {
        window.clearInterval(id);
        finishSession('time-up', durationLimit);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [startedAt, finishedResult, isTimedMode, durationLimit, finishSession]);

  // Track newly introduced mistakes & trigger completion / accuracy limit checks
  useEffect(() => {
    if (finishedResult) return;
    if (evaluation.incorrectCount > prevIncorrectRef.current) {
      const diff = evaluation.incorrectCount - prevIncorrectRef.current;
      setTotalKeyMistakes((m) => m + diff);
      setSessionMistakes((prev) => {
        const next = { ...prev };
        for (const [ch, cnt] of Object.entries(evaluation.mistakesByGrapheme)) {
          next[ch] = Math.max(next[ch] || 0, cnt);
        }
        return next;
      });
      if (settings.soundEnabled) {
        playErrorTone();
      }
    }
    prevIncorrectRef.current = evaluation.incorrectCount;

    if (
      config.mode === 'accuracy' &&
      config.maxErrors &&
      totalKeyMistakes >= config.maxErrors &&
      startedAt
    ) {
      finishSession('accuracy-limit');
      return;
    }

    if (evaluation.isComplete && startedAt) {
      // Flush Avro buffer if any
      finishSession('completed');
    }
  }, [
    evaluation,
    finishedResult,
    settings.soundEnabled,
    config.mode,
    config.maxErrors,
    totalKeyMistakes,
    startedAt,
    finishSession,
  ]);

  // Keep active grapheme visible inside scrollable practice box
  useEffect(() => {
    if (activeSpanRef.current && textContainerRef.current) {
      const container = textContainerRef.current;
      const el = activeSpanRef.current;
      const elTop = el.offsetTop;
      const targetScroll = Math.max(0, elTop - container.clientHeight * 0.35);
      container.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, [evaluation.cursorIndex]);

  const ensureStarted = useCallback(() => {
    if (!startedAt) {
      setStartedAt(Date.now());
    }
  }, [startedAt]);

  const inferCodeFromChar = (ch: string): string => {
    if (ch === ' ') return 'Space';
    if (ch === '\n') return 'Enter';
    const flat = PHYSICAL_KEYBOARD_ROWS.flat();
    const match = flat.find((k) => k.en === ch || k.enShift === ch);
    return match?.code ?? 'Unidentified';
  };

  const recordPhysicalKey = useCallback(
    (params: {
      code: string;
      latinKey: string;
      shifted?: boolean;
      correct: boolean;
      expectedOutput: string;
      producedOutput: string;
      script: 'bangla' | 'english';
    }) => {
      if (!params.code || params.code === 'Unidentified') return;
      const finger = resolveFingerForPhysicalKey(
        params.code,
        settings.layoutId,
        lastHandRef.current
      );
      if (finger) {
        lastHandRef.current = FINGER_META[finger].hand;
      }
      keyEventsRef.current.push({
        code: params.code,
        latinKey: params.latinKey,
        finger,
        correct: params.correct,
        expectedOutput: params.expectedOutput,
        producedOutput: params.producedOutput,
        script: params.script,
        layoutId: settings.layoutId,
        inputMethod: activeLayout.type,
        shifted: params.shifted,
        timestamp: Date.now(),
      });
    },
    [settings.layoutId, activeLayout.type]
  );

  // Process a single keystroke (used by both physical keyboard and virtual keyboard clicks)
  const handleProgrammaticKey = useCallback(
    (key: string, physicalCode?: string, shifted?: boolean) => {
      if (finishedResult) return;
      ensureStarted();

      if (settings.soundEnabled && settings.keyboardSoundEnabled) {
        playKeyClick();
      }

      const code = physicalCode || inferCodeFromChar(key);
      const expectedTarget = evaluation.items[evaluation.cursorIndex]?.target ?? '';
      const isEnglishTarget = /^[A-Za-z0-9]$/.test(expectedTarget);
      const script: 'bangla' | 'english' =
        englishOverride || isEnglishTarget ? 'english' : 'bangla';

      if (englishOverride || settings.layoutId === 'system-ime') {
        const nextText = committedText + key;
        const afterEval = evaluateTypingGraphemes(config.text, nextText, {
          autoPunctuation: settings.autoPunctuation,
        });
        recordPhysicalKey({
          code,
          latinKey: key,
          shifted,
          correct: afterEval.incorrectCount <= evaluation.incorrectCount,
          expectedOutput: expectedTarget,
          producedOutput: key,
          script,
        });
        setCommittedText(nextText);
        return;
      }

      if (settings.layoutId === 'avro') {
        let nextCommitted = committedText;
        let nextBuf = avroBuffer;
        let produced = '';

        if (key === ' ' || key === '\n') {
          const flushed = transliterateAvroToken(avroBuffer);
          nextCommitted = committedText + flushed + key;
          nextBuf = '';
          produced = key;
        } else if (isAvroBufferChar(key)) {
          nextBuf = avroBuffer + key;
          const segs = segmentBanglaGraphemes(transliterateAvroToken(nextBuf));
          produced = segs[segs.length - 1] ?? transliterateAvroToken(nextBuf);
        } else {
          const flushed = transliterateAvroToken(avroBuffer);
          nextCommitted = committedText + flushed + key;
          nextBuf = '';
          produced = key;
        }

        const nextEffective = nextBuf ? nextCommitted + transliterateAvroToken(nextBuf) : nextCommitted;
        const afterEval = evaluateTypingGraphemes(config.text, nextEffective, {
          isComposing: nextBuf.length > 0,
          autoPunctuation: settings.autoPunctuation,
        });

        // Only penalize this physical Latin key if it introduced a new mismatch
        const isCorrect = afterEval.incorrectCount <= evaluation.incorrectCount;

        recordPhysicalKey({
          code,
          latinKey: key,
          shifted,
          correct: isCorrect,
          expectedOutput: expectedTarget,
          producedOutput: produced,
          script,
        });

        setCommittedText(nextCommitted);
        setAvroBuffer(nextBuf);
        return;
      }

      // Fixed keyboard layout (Bijoy Classic, Bijoy Compatible, Jatiya, Probhat)
      const res = processFixedLayoutKey(settings.layoutId, key, fixedState, committedText);
      if (res) {
        const base =
          res.replaceTrailing && res.replaceTrailing > 0
            ? committedText.slice(0, -res.replaceTrailing)
            : committedText;
        const nextCommitted = base + res.append;
        const afterEval = evaluateTypingGraphemes(config.text, nextCommitted, {
          isComposing: res.nextState.pendingLink || Boolean(res.nextState.pendingPreVowel),
          autoPunctuation: settings.autoPunctuation,
        });

        // For Bijoy Classic pre-base vowel key (d/c/C), verify against expected target grapheme
        let isCorrect = afterEval.incorrectCount <= evaluation.incorrectCount;
        let produced = res.append;
        if (!res.append && res.nextState.pendingPreVowel) {
          produced = res.nextState.pendingPreVowel;
          isCorrect =
            expectedTarget.includes(res.nextState.pendingPreVowel) ||
            (res.nextState.pendingPreVowel === 'ে' &&
              (expectedTarget.includes('ো') || expectedTarget.includes('ৌ')));
        }

        recordPhysicalKey({
          code,
          latinKey: key,
          shifted,
          correct: isCorrect,
          expectedOutput: expectedTarget,
          producedOutput: produced,
          script,
        });

        setCommittedText(nextCommitted);
        setFixedState(res.nextState);
      } else {
        const nextCommitted = committedText + key;
        const afterEval = evaluateTypingGraphemes(config.text, nextCommitted, {
          autoPunctuation: settings.autoPunctuation,
        });
        recordPhysicalKey({
          code,
          latinKey: key,
          shifted,
          correct: afterEval.incorrectCount <= evaluation.incorrectCount,
          expectedOutput: expectedTarget,
          producedOutput: key,
          script,
        });
        setCommittedText(nextCommitted);
        setFixedState(INITIAL_FIXED_STATE);
      }
    },
    [
      finishedResult,
      ensureStarted,
      settings.soundEnabled,
      settings.keyboardSoundEnabled,
      settings.layoutId,
      settings.autoPunctuation,
      englishOverride,
      avroBuffer,
      fixedState,
      committedText,
      config.text,
      evaluation,
      recordPhysicalKey,
    ]
  );

  // Physical keyboard interception for built-in Avro & Fixed layouts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setPressedCode(e.code);
    if (e.key === 'Shift') setShiftActive(true);

    // Quick shortcut Alt+E toggles English passthrough for mixed Bangla-English passages
    if (e.altKey && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      if (avroBuffer) {
        setCommittedText((prev) => prev + transliterateAvroToken(avroBuffer));
        setAvroBuffer('');
      }
      setEnglishOverride((v) => !v);
      return;
    }

    // Escape resets quickly
    if (e.key === 'Escape') {
      e.preventDefault();
      resetSession();
      return;
    }

    if (finishedResult) {
      e.preventDefault();
      return;
    }

    // Let OS shortcuts (Ctrl+V, Ctrl+A, Cmd+C, etc.) work naturally
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // In OS / System IME mode or English override, record physical key metadata & let native input process
    if (settings.layoutId === 'system-ime' || englishOverride) {
      if (e.key.length === 1 || e.key === 'Enter') {
        ensureStarted();
        lastNativeKeyRef.current = { code: e.code, key: e.key, shifted: e.shiftKey };
        if (settings.soundEnabled && settings.keyboardSoundEnabled) {
          playKeyClick();
        }
      }
      return;
    }

    // Handle Backspace cleanly for built-in Avro and Fixed layouts
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (settings.layoutId === 'avro' && avroBuffer.length > 0) {
        setAvroBuffer((prev) => prev.slice(0, -1));
        return;
      }
      if (fixedState.pendingPreVowel) {
        setFixedState((prev) => ({ ...prev, pendingPreVowel: null }));
        return;
      }
      if (fixedState.pendingLink) {
        setFixedState((prev) => ({ ...prev, pendingLink: false }));
      }
      setCommittedText((prev) => {
        if (!prev) return '';
        const segs = segmentBanglaGraphemes(prev);
        if (segs.length === 0) return '';
        const last = segs[segs.length - 1];
        const lastChars = Array.from(last);
        if (lastChars.length > 1) {
          return prev.slice(0, prev.length - lastChars[lastChars.length - 1].length);
        }
        return segs.slice(0, -1).join('');
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleProgrammaticKey('\n', e.code, e.shiftKey);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    // Printable single character -> route through built-in layout engine
    if (e.key.length === 1) {
      if (/[\u0980-\u09FF]/.test(e.key)) {
        ensureStarted();
        lastNativeKeyRef.current = { code: e.code, key: e.key, shifted: e.shiftKey };
        return;
      }
      e.preventDefault();
      handleProgrammaticKey(e.key, e.code, e.shiftKey);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Shift') setShiftActive(false);
    setPressedCode(null);
  };

  // Handle native OS IME input changes (System IME, Linux IBus/Fcitx5, or English override)
  const handleNativeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finishedResult) return;
    if (settings.layoutId === 'system-ime' || englishOverride || isComposingIME) {
      ensureStarted();
      const nextVal = normalizeBangla(e.target.value);
      const lastKey = lastNativeKeyRef.current;
      if (lastKey && nextVal.length > committedText.length && !isComposingIME) {
        const expectedTarget = evaluation.items[evaluation.cursorIndex]?.target ?? '';
        const afterEval = evaluateTypingGraphemes(config.text, nextVal, {
          autoPunctuation: settings.autoPunctuation,
        });
        const segs = segmentBanglaGraphemes(nextVal);
        const produced = segs[segs.length - 1] ?? lastKey.key;
        const script: 'bangla' | 'english' =
          englishOverride || /^[A-Za-z0-9]$/.test(produced) ? 'english' : 'bangla';
        recordPhysicalKey({
          code: lastKey.code,
          latinKey: lastKey.key,
          shifted: lastKey.shifted,
          correct: afterEval.incorrectCount <= evaluation.incorrectCount,
          expectedOutput: expectedTarget,
          producedOutput: produced,
          script,
        });
        lastNativeKeyRef.current = null;
      }
      setCommittedText(nextVal);
    }
  };

  const activeTargetGrapheme = evaluation.items[evaluation.cursorIndex]?.target;
  const currentHint = activeTargetGrapheme
    ? getKeyHintForGrapheme(settings.layoutId, activeTargetGrapheme)
    : null;

  const displayTime = isTimedMode
    ? Math.max(0, durationLimit - elapsedSec)
    : elapsedSec;
  const formattedTime = `${String(Math.floor(displayTime / 60)).padStart(2, '0')}:${String(
    displayTime % 60
  ).padStart(2, '0')}`;

  return (
    <div className="space-y-5">
      {/* Mode & Layout Controls Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 9 Practice Modes */}
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900/80">
            {MODE_OPTIONS.map((m) => {
              const active = config.mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMode(m.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Layout Switcher (Preserves progress!) */}
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="arena-layout-select" className="sr-only">
              Bangla Keyboard Layout
            </label>
            <select
              id="arena-layout-select"
              value={settings.layoutId}
              onChange={(e) => handleLayoutChange(e.target.value as LayoutId)}
              className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-2 focus:outline-teal-600"
            >
              {allLayouts.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.type === 'phonetic' ? 'Phonetic' : l.type === 'fixed' ? 'Fixed' : 'OS IME'})
                </option>
              ))}
            </select>

            {/* Difficulty selector for generator modes */}
            {['character', 'word', 'sentence', 'paragraph', 'timed', 'accuracy'].includes(
              config.mode
            ) && (
              <select
                aria-label="Difficulty"
                value={settings.difficulty}
                onChange={(e) => onChangeDifficulty(e.target.value as Difficulty)}
                className="h-9 px-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-2 focus:outline-teal-600"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            )}

            {/* Duration selector for Timed / Exam modes */}
            {isTimedMode && (
              <select
                aria-label="Test Duration"
                value={durationLimit}
                onChange={(e) => onSelectMode(config.mode, Number(e.target.value))}
                className="h-9 px-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-2 focus:outline-teal-600 font-mono-tabular"
              >
                <option value={30}>30s</option>
                <option value={60}>60s</option>
                <option value={120}>2 min</option>
                <option value={180}>3 min</option>
                <option value={300}>5 min</option>
              </select>
            )}
          </div>
        </div>

        {/* Sub-bar: Title, Layout Mode Info, & Quick Utility Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-slate-100 font-bangla-siliguri text-sm">
              {config.title}
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeLayout.badgeLabel}</span>
            {config.mode === 'accuracy' && config.maxErrors && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  Max {config.maxErrors} mistakes allowed
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {settings.layoutId !== 'system-ime' && (
              <button
                type="button"
                onClick={() => {
                  if (avroBuffer) {
                    setCommittedText((prev) => prev + transliterateAvroToken(avroBuffer));
                    setAvroBuffer('');
                  }
                  setEnglishOverride((v) => !v);
                  inputRef.current?.focus();
                }}
                title="Toggle English passthrough for mixed Bangla-English text (Alt+E)"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  englishOverride
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                {englishOverride ? 'EN Mode (Alt+E)' : 'BN Mode (Alt+E)'}
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                onToggleSetting('showVirtualKeyboard', !settings.showVirtualKeyboard)
              }
              title="Show or hide virtual keyboard guide"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Keyboard className="w-3.5 h-3.5" />
              {settings.showVirtualKeyboard ? 'Hide Keys' : 'Show Keys'}
            </button>
            <button
              type="button"
              onClick={() => onToggleSetting('soundEnabled', !settings.soundEnabled)}
              title="Toggle typing sound effects"
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onToggleSetting('showKeyHints', !settings.showKeyHints)}
              title="Toggle keystroke hint strip"
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {settings.showKeyHints ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Strip (Tabular Numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] px-4 py-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">{primarySpeed.label}</p>
          <p className="text-2xl font-bold font-mono-tabular text-teal-700 dark:text-teal-300 mt-0.5">
            {primarySpeed.value}
            <span className="text-xs font-medium text-slate-400 ml-1">{primarySpeed.unit}</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] px-4 py-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {settings.speedMetric === 'cpm' ? 'Standard WPM' : 'Chars / Min'}
          </p>
          <p className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-0.5">
            {settings.speedMetric === 'cpm' ? liveMetrics.wpmStandard : liveMetrics.cpm}
            <span className="text-xs font-medium text-slate-400 ml-1">
              {settings.speedMetric === 'cpm' ? 'WPM' : 'CPM'}
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] px-4 py-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Accuracy</p>
          <p
            className={`text-2xl font-bold font-mono-tabular mt-0.5 ${
              liveMetrics.accuracy >= 95
                ? 'text-emerald-600 dark:text-emerald-400'
                : liveMetrics.accuracy >= 85
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {liveMetrics.accuracy}%
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] px-4 py-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Mistakes / Left</p>
          <p className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100 mt-0.5">
            <span className={totalKeyMistakes > 0 ? 'text-rose-600 dark:text-rose-400' : ''}>
              {totalKeyMistakes}
            </span>
            <span className="text-sm text-slate-400 font-normal mx-1">/</span>
            <span className="text-base text-slate-500 dark:text-slate-400">
              {evaluation.remainingCount}
            </span>
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] px-4 py-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isTimedMode ? 'Time Remaining' : 'Timer'}
          </p>
          <p
            className={`text-2xl font-bold font-mono-tabular mt-0.5 ${
              isTimedMode && displayTime <= 10 && startedAt
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {formattedTime}
          </p>
        </div>
      </div>

      {/* Main Distraction-Free Practice Stage */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`rounded-2xl border p-6 sm:p-8 transition-colors cursor-text ${
          SURFACE_PRESET_MAP[settings.colorPreset]
        }`}
      >
        {/* Thin Progress Line */}
        <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-6">
          <div
            className="h-full bg-teal-600 dark:bg-teal-400 transition-all duration-150"
            style={{ width: `${liveMetrics.completionPercent}%` }}
          />
        </div>

        {/* Grapheme-Aware Target Practice Text */}
        <div
          ref={textContainerRef}
          style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.85 }}
          className={`${FONT_CLASS_MAP[settings.fontFamily]} max-h-[260px] overflow-y-auto pr-2 break-words whitespace-pre-wrap select-none tracking-normal`}
        >
          {evaluation.items.map((item) => {
            const isActive = item.index === evaluation.cursorIndex;
            const displayChar =
              item.target === '\n'
                ? '↵\n'
                : item.target;

            let colorClass = 'text-slate-400 dark:text-slate-500';
            if (item.status === 'correct') {
              colorClass = 'text-emerald-700 dark:text-emerald-400';
            } else if (item.status === 'incorrect') {
              colorClass = settings.highlightErrors
                ? 'text-rose-700 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/70 underline decoration-rose-500 decoration-2 underline-offset-4 rounded-xs px-0.5'
                : 'text-rose-600 dark:text-rose-400';
            } else if (item.status === 'composing') {
              colorClass =
                'text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 underline decoration-amber-500 decoration-dashed underline-offset-4 rounded-xs px-0.5';
            } else if (isActive) {
              colorClass =
                'text-slate-950 dark:text-white bg-teal-100/90 dark:bg-teal-900/70 ring-1 ring-teal-500/60 rounded-xs px-0.5';
            }

            return (
              <span
                key={item.index}
                ref={isActive ? activeSpanRef : null}
                className={`relative inline transition-colors duration-75 ${colorClass}`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="typing-caret inline-block w-[2px] h-[1em] bg-teal-600 dark:bg-teal-400 align-middle -ml-0.5 mr-0.5"
                  />
                )}
                {displayChar}
              </span>
            );
          })}
        </div>

        {/* Typing Input Area & Live Composition Indicator */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                Correct: <strong className="font-mono-tabular">{evaluation.correctCount}</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Errors: <strong className="font-mono-tabular">{evaluation.incorrectCount}</strong>
              </span>
              {settings.layoutId === 'avro' && avroBuffer && (
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  Avro buffer: <span className="font-mono-tabular">{avroBuffer}</span> →{' '}
                  <span className="font-bangla-siliguri text-sm">
                    {transliterateAvroToken(avroBuffer)}
                  </span>
                </span>
              )}
              {settings.layoutId === 'bijoy' && fixedState.pendingPreVowel && (
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  Pre-base vowel ready:{' '}
                  <span className="font-bangla-siliguri text-sm">{fixedState.pendingPreVowel}</span>{' '}
                  (type consonant next)
                </span>
              )}
              {fixedState.pendingLink && (
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  Link key (্) active — type consonant for conjunct or vowel sign for স্বরবর্ণ
                </span>
              )}
            </div>

            {settings.showKeyHints && currentHint && activeTargetGrapheme && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span>Hint:</span>
                <span className="font-bangla-siliguri text-sm font-semibold text-teal-700 dark:text-teal-300">
                  {activeTargetGrapheme === ' ' ? 'Space' : activeTargetGrapheme}
                </span>
                <span className="font-mono-tabular px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {currentHint.keys}
                </span>
              </div>
            )}
          </div>

          <textarea
            ref={inputRef}
            value={effectiveTypedText}
            onChange={handleNativeChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onCompositionStart={() => setIsComposingIME(true)}
            onCompositionUpdate={() => setIsComposingIME(true)}
            onCompositionEnd={(e) => {
              setIsComposingIME(false);
              if (settings.layoutId === 'system-ime' || englishOverride) {
                setCommittedText(normalizeBangla(e.currentTarget.value));
              }
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={2}
            placeholder={
              settings.layoutId === 'avro'
                ? 'Start typing phonetically (e.g. "ami bangla" or "k kh g") — press Esc to restart...'
                : settings.layoutId === 'system-ime'
                ? 'Switch your OS keyboard to Bangla and start typing directly...'
                : `Start typing using ${activeLayout.name} keys — see the keyboard guide below...`
            }
            className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-3 text-lg ${FONT_CLASS_MAP[settings.fontFamily]} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-2 focus:outline-teal-600 resize-none`}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Press <span className="font-mono-tabular font-medium">Esc</span> to restart · Backspace corrects freely · Switching layouts keeps your progress
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart
              </button>
              {config.allowRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  New Exercise
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Keyboard Guide */}
      {settings.showVirtualKeyboard && (
        <VirtualKeyboard
          layoutId={settings.layoutId}
          activeTargetGrapheme={activeTargetGrapheme}
          pressedCode={pressedCode}
          shiftActive={shiftActive}
          onVirtualKeyClick={(k) => {
            handleProgrammaticKey(k);
            inputRef.current?.focus();
          }}
        />
      )}

      {/* Detailed Post-Session Result Modal */}
      {finishedResult && (
        <SessionResultModal
          result={finishedResult}
          bestWpm={Math.max(bestWpm, finishedResult.wpmStandard)}
          averageWpm={averageWpm || finishedResult.wpmStandard}
          speedMetric={settings.speedMetric}
          endedReason={endedReason}
          onRetry={resetSession}
          onNext={() => {
            if (config.allowRegenerate) {
              onRegenerate();
            } else {
              resetSession();
            }
          }}
          onPracticeWeak={(chars) => {
            setFinishedResult(null);
            onPracticeWeakChars(chars);
          }}
          onViewProgress={() => {
            setFinishedResult(null);
            onOpenProgress();
          }}
        />
      )}
    </div>
  );
};
