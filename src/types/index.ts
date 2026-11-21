export type LayoutId =
  | 'avro'
  | 'bijoy'
  | 'bijoy-unicode'
  | 'jatiya'
  | 'probhat'
  | 'system-ime';

export type InputMethodType = 'phonetic' | 'fixed' | 'system';

export type PracticeMode =
  | 'character'
  | 'word'
  | 'sentence'
  | 'paragraph'
  | 'custom'
  | 'timed'
  | 'accuracy'
  | 'weak'
  | 'exam';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type CharCategoryId =
  | 'vowels'
  | 'consonants'
  | 'karchinho'
  | 'fola'
  | 'conjuncts'
  | 'digits'
  | 'punctuation'
  | 'complex-words';

export type LessonCategory =
  | 'Fundamentals'
  | 'Vowels & Signs'
  | 'Consonants'
  | 'Conjuncts & Fola'
  | 'Vocabulary'
  | 'Literature & Essays'
  | 'Mixed Bangla-English'
  | 'Custom';

export type SpeedMetricPreference = 'wpm-standard' | 'wpm-words' | 'cpm';

export type BanglaFontFamily =
  | 'siliguri'
  | 'noto-sans'
  | 'noto-serif'
  | 'tiro';

export type ColorPreset = 'default' | 'paper' | 'high-contrast' | 'midnight';

export type AppRoute =
  | 'practice'
  | 'characters'
  | 'lessons'
  | 'custom'
  | 'progress'
  | 'layouts'
  | 'settings';

export type FingerId =
  | 'lp'
  | 'lr'
  | 'lm'
  | 'li'
  | 'lthumb'
  | 'rthumb'
  | 'ri'
  | 'rm'
  | 'rr'
  | 'rp';

export type KeyboardRowName = 'number' | 'top' | 'home' | 'bottom' | 'space';

export type HeatmapViewMode = 'keyboard' | 'finger' | 'combined';

export type HeatmapMetricMode =
  | 'error-frequency'
  | 'accuracy'
  | 'total-presses'
  | 'error-ratio';

export type HeatmapTimeRange = 'all' | 'today' | '7d' | '30d' | 'custom' | 'session';

export interface HeatmapFilters {
  timeRange: HeatmapTimeRange;
  customStartDate: string; // YYYY-MM-DD
  customEndDate: string; // YYYY-MM-DD
  sessionId: string; // when timeRange === 'session'
  inputMethod: InputMethodType | 'all';
  layoutId: LayoutId | 'all';
  script: 'all' | 'bangla' | 'english';
  metric: HeatmapMetricMode;
  displayLayout: LayoutId | 'english';
}

/**
 * Physical keystroke record captured independently of Bangla Unicode character evaluation.
 * - For Avro Phonetic: records the physical Latin key (`latinKey`, `code`) and resulting Bangla output (`producedOutput`).
 * - For fixed layouts (Bijoy, Jatiya, Probhat): records the physical key mapped directly via layout keymap.
 * - For OS/System IME: `finger` is omitted (`null`) when physical mapping cannot be verified.
 */
export interface PhysicalKeyEvent {
  /** Standard KeyboardEvent.code (e.g. 'KeyJ', 'KeyD', 'Space') */
  code: string;
  /** Physical Latin key legend pressed (e.g. 'j', 'J', 'd', ' ') */
  latinKey: string;
  /** Assigned finger based on standard touch-typing physical layout, or null if unavailable */
  finger: FingerId | null;
  /** Whether this physical keystroke contributed to a correct or incorrect typing state */
  correct: boolean;
  /** Expected target character or grapheme at the time of press */
  expectedOutput: string;
  /** Actual Bangla or English output produced by this keystroke (or phonetic commit) */
  producedOutput: string;
  /** Whether user was typing Bangla or English text */
  script: 'bangla' | 'english';
  /** Layout active during this keystroke */
  layoutId: LayoutId;
  /** Input method category */
  inputMethod: InputMethodType;
  /** Whether Shift modifier was active */
  shifted?: boolean;
  /** Timestamp (ms) */
  timestamp: number;
}

export interface KeyPerformanceAggregate {
  code: string;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number; // 0-100
  errorRatio: number; // 0-100
  commonMistakes: Array<{ expected: string; actual: string; count: number }>;
  producedOutputs: Array<{ output: string; count: number }>;
  recentHistory: Array<{ sessionId: string; dateKey: string; accuracy: number; attempts: number }>;
}

export interface FingerPerformanceAggregate {
  finger: FingerId;
  label: string;
  hand: 'left' | 'right';
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  errorRatio: number;
  usageShare: number; // percentage of all finger-mapped presses
  status: 'untested' | 'optimal' | 'overused' | 'underperforming';
  topMistypedKeys: Array<{ code: string; latin: string; incorrect: number; accuracy: number }>;
  recentHistory: Array<{ sessionId: string; dateKey: string; accuracy: number; attempts: number }>;
}

export interface BanglaCharItem {
  id: string;
  char: string;
  practiceToken?: string;
  name: string;
  category: CharCategoryId;
  subGroup?: string;
  breakdown?: string;
  avroHint?: string;
  bijoyHint?: string;
  jatiyaHint?: string;
  probhatHint?: string;
}

export interface CustomCharSet {
  id: string;
  name: string;
  chars: string[];
  includeCombinations: boolean;
  randomize: boolean;
  repeatDifficult: boolean;
  createdAt: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  difficulty: Difficulty;
  layoutId: LayoutId | 'any';
  text: string;
  targetDurationSec?: number;
  targetWordCount?: number;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface KeyCapSpec {
  code: string;
  en: string;
  enShift?: string;
  bn?: string;
  bnShift?: string;
  finger: 'lp' | 'lr' | 'lm' | 'li' | 'ri' | 'rm' | 'rr' | 'rp' | 'thumb';
  width?: number;
  isHome?: boolean;
}

export interface LayoutDefinition {
  id: LayoutId;
  name: string;
  nativeName: string;
  type: InputMethodType;
  badgeLabel: string;
  shortDescription: string;
  mechanismSummary: string;
  instructions: string[];
  tips: string[];
  examples: Array<{ keys: string; output: string; note?: string }>;
  keyboardRows: KeyCapSpec[][];
  keymap?: Record<string, string>;
  shiftKeymap?: Record<string, string>;
  preBaseVowels?: boolean;
}

export interface GraphemeEvaluation {
  index: number;
  target: string;
  typed?: string;
  status: 'correct' | 'incorrect' | 'current' | 'composing' | 'pending';
}

export interface TypingEvaluationResult {
  items: GraphemeEvaluation[];
  totalGraphemes: number;
  typedGraphemes: number;
  correctCount: number;
  incorrectCount: number;
  remainingCount: number;
  cursorIndex: number;
  isComplete: boolean;
  mistakesByGrapheme: Record<string, number>;
}

export interface TypingSessionResult {
  id: string;
  timestamp: number;
  dateKey: string; // YYYY-MM-DD
  mode: PracticeMode;
  layoutId: LayoutId;
  lessonId?: string;
  lessonTitle: string;
  wpmStandard: number;
  wpmNet: number;
  wpmWords: number;
  cpm: number;
  accuracy: number;
  totalMistakes: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  completionPercent: number;
  durationSeconds: number;
  mistakesByChar: Record<string, number>;
  mistakesByCategory: Record<string, number>;
  /** Physical keystroke telemetry tracked independently from Bangla character mistakes */
  keyEvents?: PhysicalKeyEvent[];
  /** Dominant language script typed in this session */
  languageMix?: 'bangla' | 'english' | 'mixed';
}

export interface SavedCustomText {
  id: string;
  title: string;
  text: string;
  createdAt: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  layoutId: LayoutId;
  difficulty: Difficulty;
  testDurationSec: number;
  fontSize: number;
  fontFamily: BanglaFontFamily;
  colorPreset: ColorPreset;
  soundEnabled: boolean;
  keyboardSoundEnabled: boolean;
  autoPunctuation: boolean;
  highlightErrors: boolean;
  showVirtualKeyboard: boolean;
  showKeyHints: boolean;
  speedMetric: SpeedMetricPreference;
  accuracyModeMaxErrors: number;
}

export interface AppStorageData {
  version: number;
  settings: UserSettings;
  sessions: TypingSessionResult[];
  customLessons: Lesson[];
  customCharSets: CustomCharSet[];
  savedCustomTexts: SavedCustomText[];
  charMistakeTotals: Record<string, number>;
  charAttemptTotals: Record<string, number>;
}

export interface ActivePracticeConfig {
  mode: PracticeMode;
  title: string;
  text: string;
  lessonId?: string;
  durationSec?: number;
  maxErrors?: number;
  sourceChars?: string[];
  allowRegenerate?: boolean;
  regenerateOptions?: {
    chars: string[];
    includeCombinations: boolean;
    randomize: boolean;
    repeatDifficult: boolean;
    count: number;
  };
}
