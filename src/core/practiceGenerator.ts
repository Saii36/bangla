import {
  BANGLA_CHARACTERS,
  EXAM_PASSAGES,
  PARAGRAPH_BANK,
  SENTENCE_BANK,
  WORD_BANK,
} from '../data/banglaData';
import type { ActivePracticeConfig, Difficulty, PracticeMode } from '../types';

export interface CharDrillOptions {
  chars: string[];
  includeCombinations: boolean;
  randomize: boolean;
  repeatDifficult: boolean;
  count?: number;
  mistakeTotals?: Record<string, number>;
}

/**
 * Resolves a raw Bangla item into a typeable token (e.g., isolated vowel sign 'ি' -> 'কি'
 * or keeps full character/word intact).
 */
function toTypeableToken(ch: string): string {
  const item = BANGLA_CHARACTERS.find((c) => c.char === ch);
  if (item?.practiceToken) return item.practiceToken;
  return ch;
}

/**
 * Generates unlimited practice text from an arbitrary user-selected list of Bangla characters,
 * conjuncts, vowel signs, or complex words.
 *
 * Example: Selecting ["ক", "খ", "গ", "ঘ", "ঙ"] produces balanced single-letter drills
 * plus optional 2–4 character combinations like "কখ গঘ ঙক খগঘ কঙখ".
 */
export function generateCustomCharacterDrill(options: CharDrillOptions): string {
  const {
    chars,
    includeCombinations,
    randomize,
    repeatDifficult,
    count = 36,
    mistakeTotals = {},
  } = options;

  const uniqueChars = Array.from(new Set(chars.filter(Boolean)));
  if (uniqueChars.length === 0) {
    return 'ক খ গ ঘ ঙ';
  }

  const tokens = uniqueChars.map(toTypeableToken);
  const areWords = tokens.some((t) => Array.from(t).length >= 3);

  // Build weighted pool so difficult characters repeat more frequently when enabled
  const weightedPool: string[] = [];
  for (const tok of tokens) {
    const rawMistakes = mistakeTotals[tok] || 0;
    const weight = repeatDifficult ? Math.min(5, 1 + Math.ceil(rawMistakes / 2)) : 1;
    for (let w = 0; w < weight; w++) {
      weightedPool.push(tok);
    }
  }

  const pick = (index: number): string => {
    if (randomize) {
      return weightedPool[Math.floor(Math.random() * weightedPool.length)];
    }
    return weightedPool[index % weightedPool.length];
  };

  // If items are already multi-character complex words, output clean space-separated word drill
  if (areWords) {
    const outWords: string[] = [];
    const targetWords = Math.max(12, Math.min(count, 40));
    for (let i = 0; i < targetWords; i++) {
      outWords.push(pick(i));
    }
    return outWords.join(' ');
  }

  const chunks: string[] = [];
  if (includeCombinations) {
    // Mix single letters + 2-char and 3-char rhythmic combinations
    const groups = Math.max(18, Math.min(count, 45));
    for (let i = 0; i < groups; i++) {
      const len = i < Math.min(tokens.length, 6) ? 1 : i % 3 === 0 ? 2 : i % 3 === 1 ? 3 : 2;
      let cluster = '';
      for (let j = 0; j < len; j++) {
        cluster += pick(i * 3 + j);
      }
      chunks.push(cluster);
    }
  } else {
    const total = Math.max(20, Math.min(count, 60));
    for (let i = 0; i < total; i++) {
      chunks.push(pick(i));
    }
  }

  return chunks.join(' ');
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generates a ready-to-run practice configuration for any of the 9 practice modes.
 */
export function buildPracticeForMode(
  mode: PracticeMode,
  difficulty: Difficulty,
  options?: {
    durationSec?: number;
    maxErrors?: number;
    mistakeTotals?: Record<string, number>;
    customText?: string;
    customTitle?: string;
  }
): ActivePracticeConfig {
  const durationSec = options?.durationSec ?? 60;
  const maxErrors = options?.maxErrors ?? 5;
  const mistakeTotals = options?.mistakeTotals ?? {};

  switch (mode) {
    case 'character': {
      const basePool =
        difficulty === 'beginner'
          ? ['অ', 'আ', 'ই', 'উ', 'এ', 'ও', 'ক', 'খ', 'গ', 'ঘ', 'ঙ']
          : difficulty === 'intermediate'
          ? ['ক', 'খ', 'গ', 'ঘ', 'চ', 'ছ', 'জ', 'ট', 'ত', 'দ', 'ন', 'প', 'ব', 'ম', 'র', 'ল', 'স']
          : ['ক্ষ', 'জ্ঞ', 'ক্ত', 'ন্ত', 'ন্দ', 'স্ত', 'ষ্ট', 'ঙ্গ', 'প্র', 'ত্র', 'স্ব', 'ব্য', 'শ্র', 'দ্ব'];

      return {
        mode: 'character',
        title: `Character Practice (${difficulty})`,
        text: generateCustomCharacterDrill({
          chars: basePool,
          includeCombinations: difficulty !== 'beginner',
          randomize: true,
          repeatDifficult: true,
          count: 32,
          mistakeTotals,
        }),
        sourceChars: basePool,
        allowRegenerate: true,
        regenerateOptions: {
          chars: basePool,
          includeCombinations: difficulty !== 'beginner',
          randomize: true,
          repeatDifficult: true,
          count: 32,
        },
      };
    }

    case 'word': {
      const pool = shuffleArray(WORD_BANK[difficulty]);
      const selected = pool.slice(0, difficulty === 'beginner' ? 22 : 26);
      return {
        mode: 'word',
        title: `Word Drill (${difficulty})`,
        text: selected.join(' '),
        allowRegenerate: true,
      };
    }

    case 'sentence': {
      const pool = shuffleArray(SENTENCE_BANK[difficulty]);
      return {
        mode: 'sentence',
        title: `Sentence Practice (${difficulty})`,
        text: pool.slice(0, 3).join(' '),
        allowRegenerate: true,
      };
    }

    case 'paragraph': {
      const matching = PARAGRAPH_BANK.filter((p) => p.difficulty === difficulty);
      const chosen =
        matching[Math.floor(Math.random() * matching.length)] ?? PARAGRAPH_BANK[0];
      return {
        mode: 'paragraph',
        title: chosen.title,
        text: chosen.text,
        allowRegenerate: true,
      };
    }

    case 'timed': {
      const pool = shuffleArray([
        ...WORD_BANK[difficulty],
        ...WORD_BANK[difficulty === 'advanced' ? 'intermediate' : difficulty],
      ]);
      // Ensure generous text length so user never runs out during timed tests
      const repeated: string[] = [];
      while (repeated.length < 110) {
        repeated.push(...shuffleArray(pool));
      }
      return {
        mode: 'timed',
        title: `Timed Speed Test (${durationSec}s)`,
        text: repeated.slice(0, 110).join(' '),
        durationSec,
        allowRegenerate: true,
      };
    }

    case 'accuracy': {
      const sentences = shuffleArray(SENTENCE_BANK[difficulty]).slice(0, 3);
      return {
        mode: 'accuracy',
        title: `Accuracy Focus (Max ${maxErrors} mistakes)`,
        text: sentences.join(' '),
        maxErrors,
        allowRegenerate: true,
      };
    }

    case 'weak': {
      const entries = Object.entries(mistakeTotals)
        .filter(([ch, count]) => count > 0 && ch.trim().length > 0)
        .sort((a, b) => b[1] - a[1]);

      const weakChars =
        entries.length >= 3
          ? entries.slice(0, 10).map(([ch]) => ch)
          : ['ক্ষ', 'জ্ঞ', 'ঙ', 'ঞ', 'ণ', 'ষ', 'ড়', 'ঢ়', 'স্ব', 'প্র'];

      const label =
        entries.length >= 3
          ? `Weak Character Drill (${weakChars.slice(0, 5).join(' ')})`
          : 'Weak Character Starter Drill (Common Hard Bangla Letters)';

      return {
        mode: 'weak',
        title: label,
        text: generateCustomCharacterDrill({
          chars: weakChars,
          includeCombinations: true,
          randomize: true,
          repeatDifficult: true,
          count: 34,
          mistakeTotals,
        }),
        sourceChars: weakChars,
        allowRegenerate: true,
        regenerateOptions: {
          chars: weakChars,
          includeCombinations: true,
          randomize: true,
          repeatDifficult: true,
          count: 34,
        },
      };
    }

    case 'exam': {
      const exam = EXAM_PASSAGES[Math.floor(Math.random() * EXAM_PASSAGES.length)];
      return {
        mode: 'exam',
        title: exam.title,
        text: exam.text,
        durationSec: options?.durationSec ?? exam.durationSec,
        allowRegenerate: true,
      };
    }

    case 'custom':
    default: {
      return {
        mode: 'custom',
        title: options?.customTitle || 'Custom Text Practice',
        text:
          options?.customText?.trim() ||
          'বিশ্ববিদ্যালয়, প্রযুক্তি ও স্বাধীনতা—এই শব্দগুলো নির্ভুলভাবে অনুশীলন করুন।',
        allowRegenerate: false,
      };
    }
  }
}
