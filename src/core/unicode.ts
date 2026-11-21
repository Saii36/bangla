import type { GraphemeEvaluation, TypingEvaluationResult } from '../types';

/**
 * Canonical Bangla Unicode normalization.
 * Converts decomposed nukta sequences (ড+়, ঢ+়, য+়) and split two-part vowels
 * (ে+া -> ো, ে+ৗ -> ৌ) into canonical NFC precomposed Bangla forms so users
 * typing via Avro, Bijoy, Jatiya, or OS IME are always evaluated fairly.
 */
export function normalizeBangla(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFC')
    // Canonicalize split ো and ৌ if produced by older IMEs
    .replace(/\u09C7\u09BE/g, '\u09CB') // ে + া -> ো
    .replace(/\u09C7\u09D7/g, '\u09CC') // ে + ৗ -> ৌ
    // Canonicalize nukta combinations
    .replace(/\u09A1\u09BC/g, '\u09DC') // ড + ় -> ড়
    .replace(/\u09A2\u09BC/g, '\u09DD') // ঢ + ় -> ঢ়
    .replace(/\u09AF\u09BC/g, '\u09DF') // য + ় -> য়
    // Normalize Windows/Mac CRLF line endings
    .replace(/\r\n?/g, '\n');
}

const BANGLA_CONSONANT_RE = /[\u0995-\u09B9\u09DC-\u09DF\u09CE]/;
const BANGLA_LETTER_RE = /[\u0985-\u09B9\u09DC-\u09DF\u09E0-\u09E1\u09CE]/;
const BANGLA_NUKTA = '\u09BC';
const BANGLA_HASANTA = '\u09CD';
const ZWJ = '\u200D';
const ZWNJ = '\u200C';
const BANGLA_VOWEL_SIGN_RE = /[\u09BE-\u09CC\u09D7]/;
const BANGLA_POST_MODIFIER_RE = /[\u0981-\u0983]/; // ঁ ং ঃ

// Fallback Intl.Segmenter for non-Bangla (English, emoji, punctuation, spaces)
const intlSegmenter: { segment: (s: string) => Iterable<{ segment: string }> } | null =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new (Intl as unknown as {
        Segmenter: new (
          locale: string,
          opts: { granularity: string }
        ) => { segment: (s: string) => Iterable<{ segment: string }> };
      }).Segmenter('bn', { granularity: 'grapheme' })
    : null;

/**
 * Orthographic Bangla akshara / grapheme segmenter.
 *
 * Unlike naive `string.split('')` or UTF-16 code unit indexing (which shatters
 * `ক্ষ`, `বি`, `প্রযুক্তি`, `বিশ্ববিদ্যালয়` mid-cluster), this groups:
 *   Base + [Nukta] + (Hasanta + [ZWJ/ZWNJ] + Consonant + [Nukta])* + [Kar-chinho]* + [ঁ/ং/ঃ]
 * into single orthographic typing units, while preserving English, spaces,
 * punctuation, and line breaks cleanly.
 */
export function segmentBanglaGraphemes(raw: string): string[] {
  const text = normalizeBangla(raw);
  if (!text) return [];

  const result: string[] = [];
  const chars = Array.from(text);
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];

    // Check if starting a Bangla orthographic cluster
    if (BANGLA_LETTER_RE.test(ch)) {
      let cluster = ch;
      i++;

      // Optional nukta
      if (i < chars.length && chars[i] === BANGLA_NUKTA) {
        cluster += chars[i++];
      }

      // Conjuncts / Folas: (Hasanta + optional ZWJ/ZWNJ + Consonant + optional Nukta)+
      // Also handle Reph (র + ্ + consonant) and য-ফলা (consonant + ্ + য)
      while (i < chars.length && chars[i] === BANGLA_HASANTA) {
        // Peek ahead to see if hasanta joins another consonant
        let lookahead = i + 1;
        if (lookahead < chars.length && (chars[lookahead] === ZWJ || chars[lookahead] === ZWNJ)) {
          lookahead++;
        }
        if (lookahead < chars.length && BANGLA_CONSONANT_RE.test(chars[lookahead])) {
          // Consume hasanta, optional joiner, consonant
          while (i <= lookahead) {
            cluster += chars[i++];
          }
          if (i < chars.length && chars[i] === BANGLA_NUKTA) {
            cluster += chars[i++];
          }
        } else {
          // Trailing hasanta (explicit halant or mid-typing composition)
          cluster += chars[i++];
          if (i < chars.length && (chars[i] === ZWJ || chars[i] === ZWNJ)) {
            cluster += chars[i++];
          }
          break;
        }
      }

      // Dependent vowel signs (কারচিহ্ন: া ি ী ু ূ ৃ ে ৈ ো ৌ)
      while (i < chars.length && BANGLA_VOWEL_SIGN_RE.test(chars[i])) {
        cluster += chars[i++];
      }

      // Chandrabindu / Anusvara / Visarga (ঁ ং ঃ) when attached to cluster
      while (i < chars.length && BANGLA_POST_MODIFIER_RE.test(chars[i])) {
        cluster += chars[i++];
      }

      result.push(cluster);
      continue;
    }

    // Standalone combining mark (e.g., practicing isolated কারচিহ্ন like 'া', 'ি' or ফলা '্য')
    if (ch === BANGLA_HASANTA && i + 1 < chars.length && BANGLA_CONSONANT_RE.test(chars[i + 1])) {
      result.push(ch + chars[i + 1]);
      i += 2;
      continue;
    }

    // Non-Bangla run: collect consecutive non-Bangla chars and segment via Intl.Segmenter
    let nonBanglaRun = ch;
    i++;
    while (
      i < chars.length &&
      !BANGLA_LETTER_RE.test(chars[i]) &&
      chars[i] !== BANGLA_HASANTA
    ) {
      nonBanglaRun += chars[i++];
    }

    if (intlSegmenter) {
      for (const seg of intlSegmenter.segment(nonBanglaRun)) {
        result.push(seg.segment);
      }
    } else {
      result.push(...Array.from(nonBanglaRun));
    }
  }

  return result;
}

/**
 * Checks whether `typedCluster` is a valid in-progress prefix of `targetCluster`.
 * Example: target = "বিশ্ব" -> cluster 1 = "বি", cluster 2 = "শ্ব".
 * While typing "শ্ব", user first produces "শ", then "শ্", then "শ্ব".
 * "শ" and "শ্" are prefixes of "শ্ব", so we show composing state instead of red error.
 */
export function isBanglaClusterPrefix(typedCluster: string, targetCluster: string): boolean {
  if (!typedCluster || !targetCluster) return false;
  if (typedCluster === targetCluster) return false;
  if (targetCluster.startsWith(typedCluster)) return true;

  // Handle ZWNJ/ZWJ optionality during intermediate composition
  const cleanTyped = typedCluster.replace(/[\u200C\u200D]/g, '');
  const cleanTarget = targetCluster.replace(/[\u200C\u200D]/g, '');
  return cleanTyped.length > 0 && cleanTyped.length < cleanTarget.length && cleanTarget.startsWith(cleanTyped);
}

/**
 * Evaluates typed text against target text using Bangla grapheme-aware comparison.
 * Never penalizes incomplete composition or intermediate conjunct keystrokes.
 */
export function evaluateTypingGraphemes(
  targetText: string,
  typedText: string,
  options?: { isComposing?: boolean; autoPunctuation?: boolean }
): TypingEvaluationResult {
  const normTarget = normalizeBangla(targetText);
  const normTyped = normalizeBangla(typedText);

  const targetGraphemes = segmentBanglaGraphemes(normTarget);
  const typedGraphemes = segmentBanglaGraphemes(normTyped);

  const items: GraphemeEvaluation[] = [];
  let correctCount = 0;
  let incorrectCount = 0;
  const mistakesByGrapheme: Record<string, number> = {};

  const lastTypedIdx = typedGraphemes.length - 1;
  const isComposingNow = Boolean(options?.isComposing);

  for (let i = 0; i < targetGraphemes.length; i++) {
    const target = targetGraphemes[i];
    const typed = i < typedGraphemes.length ? typedGraphemes[i] : undefined;

    if (typed === undefined) {
      items.push({
        index: i,
        target,
        status: i === typedGraphemes.length ? 'current' : 'pending',
      });
      continue;
    }

    const isMatch =
      typed === target ||
      (options?.autoPunctuation && isEquivalentPunctuation(typed, target));

    if (isMatch) {
      correctCount++;
      items.push({
        index: i,
        target,
        typed,
        status: 'correct',
      });
    } else if (
      i === lastTypedIdx &&
      (isComposingNow || isBanglaClusterPrefix(typed, target))
    ) {
      // User is actively building this Bangla grapheme cluster (e.g., consonant before kar-chinho or conjunct)
      items.push({
        index: i,
        target,
        typed,
        status: 'composing',
      });
    } else {
      incorrectCount++;
      mistakesByGrapheme[target] = (mistakesByGrapheme[target] || 0) + 1;
      items.push({
        index: i,
        target,
        typed,
        status: 'incorrect',
      });
    }
  }

  // Determine active cursor position
  let cursorIndex = typedGraphemes.length;
  if (
    lastTypedIdx >= 0 &&
    lastTypedIdx < items.length &&
    items[lastTypedIdx].status === 'composing'
  ) {
    cursorIndex = lastTypedIdx;
  }

  const remainingCount = Math.max(0, targetGraphemes.length - correctCount - incorrectCount);
  const isComplete =
    targetGraphemes.length > 0 &&
    typedGraphemes.length >= targetGraphemes.length &&
    items[targetGraphemes.length - 1]?.status !== 'composing';

  return {
    items,
    totalGraphemes: targetGraphemes.length,
    typedGraphemes: typedGraphemes.length,
    correctCount,
    incorrectCount,
    remainingCount,
    cursorIndex: Math.min(cursorIndex, targetGraphemes.length),
    isComplete,
    mistakesByGrapheme,
  };
}

function isEquivalentPunctuation(a: string, b: string): boolean {
  const quotes = ['"', '“', '”'];
  const singleQuotes = ["'", '‘', '’'];
  const dashes = ['-', '–', '—'];
  if (quotes.includes(a) && quotes.includes(b)) return true;
  if (singleQuotes.includes(a) && singleQuotes.includes(b)) return true;
  if (dashes.includes(a) && dashes.includes(b)) return true;
  return false;
}

/**
 * Counts space-delimited words in normalized text (handles Bangla and English).
 */
export function countWords(text: string): number {
  const trimmed = normalizeBangla(text).trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}
