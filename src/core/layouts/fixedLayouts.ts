import type { LayoutId } from '../../types';

export interface FixedKeyState {
  /** Pending Bijoy Classic 'g' (hasanta/link) key */
  pendingLink: boolean;
  /** Pending pre-base vowel (ি, ে, ৈ) in Bijoy Classic mode */
  pendingPreVowel: string | null;
  /** Pending Reph (র্) in Bijoy Classic mode */
  pendingReph: boolean;
}

export const INITIAL_FIXED_STATE: FixedKeyState = {
  pendingLink: false,
  pendingPreVowel: null,
  pendingReph: false,
};

// Bijoy Classic & Bijoy-Compatible (UniJoy) base keymap
export const BIJOY_UNSHIFTED: Record<string, string> = {
  '`': '‌',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
  '0': '০',
  '-': '-',
  '=': '=',
  q: 'ঙ',
  w: 'য',
  e: 'ড',
  r: 'প',
  t: 'ট',
  y: 'চ',
  u: 'জ',
  i: 'হ',
  o: 'গ',
  p: 'ড়',
  '[': '[',
  ']': ']',
  '\\': 'ৎ',
  a: 'ৃ',
  s: 'ু',
  d: 'ি',
  f: 'া',
  g: '্', // Link / Hasanta
  h: 'ব',
  j: 'ক',
  k: 'ত',
  l: 'দ',
  ';': ';',
  "'": "'",
  z: '্র', // র-ফলা
  x: 'ও',
  c: 'ে',
  v: 'র',
  b: 'ন',
  n: 'স',
  m: 'ম',
  ',': ',',
  '.': '.',
  '/': '/',
};

export const BIJOY_SHIFTED: Record<string, string> = {
  '~': '‍',
  '!': '!',
  '@': '@',
  '#': '#',
  $: '৳',
  '%': '%',
  '^': '^',
  '&': 'ঁ',
  '*': '*',
  '(': '(',
  ')': ')',
  _: '_',
  '+': '+',
  Q: 'ং',
  W: 'য়',
  E: 'ঢ',
  R: 'ফ',
  T: 'ঠ',
  Y: 'ছ',
  U: 'ঝ',
  I: 'ঞ',
  O: 'ঘ',
  P: 'ঢ়',
  '{': '{',
  '}': '}',
  '|': 'ঃ',
  A: 'র্', // রেফ
  S: 'ূ',
  D: 'ী',
  F: 'অ',
  G: '।',
  H: 'ভ',
  J: 'খ',
  K: 'থ',
  L: 'ধ',
  ':': ':',
  '"': '"',
  Z: '্য', // য-ফলা
  X: 'ৌ',
  C: 'ৈ',
  V: 'ল',
  B: 'ণ',
  N: 'ষ',
  M: 'শ',
  '<': '<',
  '>': '>',
  '?': '?',
};

// Bijoy / Jatiya link + kar -> independent vowel mapping
const LINK_VOWEL_MAP: Record<string, string> = {
  f: 'আ',
  d: 'ই',
  D: 'ঈ',
  s: 'উ',
  S: 'ঊ',
  a: 'ঋ',
  c: 'এ',
  C: 'ঐ',
  x: 'ও',
  X: 'ঔ',
  F: 'অ',
};

// National / Jatiya Keyboard Layout (Bangladesh Computer Council standard)
export const JATIYA_UNSHIFTED: Record<string, string> = {
  ...BIJOY_UNSHIFTED,
  q: 'ঙ',
  w: 'য',
  e: 'ড',
  r: 'প',
  t: 'ট',
  y: 'চ',
  u: 'জ',
  i: 'হ',
  o: 'গ',
  p: 'ড়',
  a: 'ৃ',
  s: 'ু',
  d: 'ি',
  f: 'া',
  g: '্',
  h: 'ব',
  j: 'ক',
  k: 'ত',
  l: 'দ',
  z: '্র',
  x: 'ো',
  c: 'ে',
  v: 'র',
  b: 'ন',
  n: 'স',
  m: 'ম',
};

export const JATIYA_SHIFTED: Record<string, string> = {
  ...BIJOY_SHIFTED,
  F: 'অ',
  G: '।',
  X: 'ৌ',
  C: 'ৈ',
};

// Probhat Fixed Unicode Layout (intuitive English-sound fixed positions)
export const PROBHAT_UNSHIFTED: Record<string, string> = {
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
  '0': '০',
  q: 'দ',
  w: 'ূ',
  e: 'ী',
  r: 'র',
  t: 'ট',
  y: 'এ',
  u: 'ু',
  i: 'ি',
  o: 'ও',
  p: 'প',
  a: 'া',
  s: 'স',
  d: 'ড',
  f: 'ত',
  g: 'গ',
  h: 'হ',
  j: 'জ',
  k: 'ক',
  l: 'ল',
  z: 'য়',
  x: 'শ',
  c: 'চ',
  v: 'আ',
  b: 'ব',
  n: 'ন',
  m: 'ম',
  '/': '্',
  '.': '।',
  ',': ',',
  ';': ';',
  "'": "'",
};

export const PROBHAT_SHIFTED: Record<string, string> = {
  $: '৳',
  '^': 'ঁ',
  '&': 'ং',
  Q: 'ধ',
  W: 'ঊ',
  E: 'ঈ',
  R: 'ড়',
  T: 'ঠ',
  Y: 'ঐ',
  U: 'উ',
  I: 'ই',
  O: 'ঔ',
  P: 'ফ',
  A: 'অ',
  S: 'ষ',
  D: 'ঢ',
  F: 'থ',
  G: 'ঘ',
  H: 'ঃ',
  J: 'ঝ',
  K: 'খ',
  L: 'ং',
  Z: 'য',
  X: 'ঢ়',
  C: 'ছ',
  V: 'ঋ',
  B: 'ভ',
  N: 'ণ',
  M: 'ঙ',
  '<': 'ৃ',
  '>': 'ো',
  '?': '?',
  ':': ':',
  '"': '"',
};

const BANGLA_CONSONANT_CHAR = /^[\u0995-\u09B9\u09DC-\u09DF]$/;

export interface FixedKeyOutput {
  /** Text to append to current input */
  append: string;
  /** Number of trailing code units to remove before appending (for Bijoy ে+C+া -> C+ো) */
  replaceTrailing?: number;
  nextState: FixedKeyState;
}

/**
 * Processes a single printable key for fixed layouts (Bijoy Classic, Bijoy Compatible,
 * Jatiya, Probhat). Handles Bijoy Classic pre-base vowel reordering & `g` link vowels cleanly.
 */
export function processFixedLayoutKey(
  layoutId: LayoutId,
  key: string,
  state: FixedKeyState,
  currentText: string
): FixedKeyOutput | null {
  if (key.length !== 1) return null;

  // Space or newline flushes pending state
  if (key === ' ') {
    return {
      append: (state.pendingPreVowel ?? '') + ' ',
      nextState: INITIAL_FIXED_STATE,
    };
  }

  const isBijoyClassic = layoutId === 'bijoy';
  const isBijoyLike = layoutId === 'bijoy' || layoutId === 'bijoy-unicode' || layoutId === 'jatiya';

  const unshifted =
    layoutId === 'probhat'
      ? PROBHAT_UNSHIFTED
      : layoutId === 'jatiya'
      ? JATIYA_UNSHIFTED
      : BIJOY_UNSHIFTED;

  const shifted =
    layoutId === 'probhat'
      ? PROBHAT_SHIFTED
      : layoutId === 'jatiya'
      ? JATIYA_SHIFTED
      : BIJOY_SHIFTED;

  // Handle 'g' link key followed by vowel key -> Independent vowel (আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ)
  if (isBijoyLike && state.pendingLink && LINK_VOWEL_MAP[key]) {
    return {
      append: LINK_VOWEL_MAP[key],
      replaceTrailing: currentText.endsWith('্') ? 1 : 0,
      nextState: { ...INITIAL_FIXED_STATE },
    };
  }

  const mapped = shifted[key] ?? unshifted[key];
  if (!mapped) return null;

  // Bijoy Classic specific pre-base vowel ordering (d -> ি, c -> ে, C -> ৈ typed BEFORE consonant)
  if (isBijoyClassic) {
    // Starting a pre-base vowel before consonant
    if ((key === 'd' || key === 'c' || key === 'C') && !state.pendingLink) {
      return {
        append: '',
        nextState: {
          ...state,
          pendingPreVowel: mapped,
        },
      };
    }

    // Pressing 'f' (া) right after a consonant+ে converts ে -> ো (authentic Bijoy Classic behavior!)
    if (key === 'f' && currentText.endsWith('ে')) {
      return {
        append: 'ো',
        replaceTrailing: 1,
        nextState: INITIAL_FIXED_STATE,
      };
    }

    // Pressing 'g' sets link state for conjunct OR independent vowel
    if (key === 'g') {
      return {
        append: '্',
        nextState: {
          ...state,
          pendingLink: true,
        },
      };
    }

    // If a pre-base vowel was waiting and user now types a consonant:
    if (state.pendingPreVowel && BANGLA_CONSONANT_CHAR.test(mapped)) {
      // Wait: if previous char was '্' (building a conjunct like ক্তি -> d + j + g + k),
      // we need to keep the pre-base vowel attached at the end of the consonant cluster!
      return {
        append: mapped + state.pendingPreVowel,
        nextState: {
          pendingLink: false,
          pendingPreVowel: null,
          pendingReph: false,
        },
      };
    }

    // If user typed a consonant while previous char was pre-base vowel + hasanta (e.g. 'কি' -> pressing g should move ি to end of conjunct)
    // Handled naturally when user types link before vowel or after consonant.
    if (state.pendingPreVowel) {
      // Non-consonant after pending pre-base vowel -> emit both
      return {
        append: state.pendingPreVowel + mapped,
        nextState: INITIAL_FIXED_STATE,
      };
    }

    // Bijoy Classic 'x' acts as ো after a consonant, ও standalone
    if (key === 'x') {
      const lastChar = currentText.slice(-1);
      if (BANGLA_CONSONANT_CHAR.test(lastChar)) {
        return {
          append: 'ো',
          nextState: INITIAL_FIXED_STATE,
        };
      }
    }

    return {
      append: mapped,
      nextState: {
        pendingLink: false,
        pendingPreVowel: null,
        pendingReph: false,
      },
    };
  }

  // Bijoy Compatible (UniJoy) & Jatiya: post-base Unicode ordering + 'g' link support
  if (isBijoyLike) {
    if (key === 'g') {
      return {
        append: '্',
        nextState: {
          ...INITIAL_FIXED_STATE,
          pendingLink: true,
        },
      };
    }
    // In Bijoy-Unicode, 'x' after consonant is ো, standalone is ও
    if (layoutId === 'bijoy-unicode' && key === 'x') {
      const lastChar = currentText.slice(-1);
      return {
        append: BANGLA_CONSONANT_CHAR.test(lastChar) ? 'ো' : 'ও',
        nextState: INITIAL_FIXED_STATE,
      };
    }
    return {
      append: mapped,
      nextState: INITIAL_FIXED_STATE,
    };
  }

  // Probhat: direct Unicode mapping
  return {
    append: mapped,
    nextState: INITIAL_FIXED_STATE,
  };
}
