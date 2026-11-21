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

export interface BanglaCharItem {
  id: string;
  char: string;
  practiceToken?: string; // e.g., for kar-chinho 'ি', practice token can be 'কি' or standalone 'ি'
  name: string;
  category: CharCategoryId;
  subGroup?: string;
  breakdown?: string; // e.g., 'ক + ্ + ষ'
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
  width?: number; // relative key width, default 1
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
  /** Bijoy Classic uses pre-base vowel ordering for ি, ে, ৈ */
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
  wpmStandard: number; // (correctGraphemes / 5) / minutes
  wpmNet: number;
  wpmWords: number; // actual space-delimited words / minutes
  cpm: number;
  accuracy: number; // 0-100
  totalMistakes: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  completionPercent: number;
  durationSeconds: number;
  mistakesByChar: Record<string, number>;
  /** Category keys where mistakes occurred */
  mistakesByCategory: Record<string, number>;
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
  fontSize: number; // px (18 to 40)
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
  durationSec?: number; // for timed or exam mode
  maxErrors?: number; // for accuracy mode
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
