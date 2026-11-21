/**
 * Built-in Avro Phonetic Transliteration Engine (Standard Phonetic Rules).
 * Converts Latin phonetic key sequences into canonical Bangla Unicode in real time.
 *
 * Examples:
 *   "ami bangla likhi."     -> "আমি বাংলা লিখি।"
 *   "bishwobidyaloy"        -> "বিশ্ববিদ্যালয়"
 *   "projukti"              -> "প্রযুক্তি"
 *   "swadhInota"            -> "স্বাধীনতা"
 *   "k kh g gh Ng"          -> "ক খ গ ঘ ঙ"
 *   "kSh"                   -> "ক্ষ"
 */

interface PatternRule {
  find: string;
  replace: string;
  kind: 'vowel' | 'consonant' | 'modifier' | 'digit' | 'punct';
  kar?: string; // dependent vowel sign when following a consonant
}

// Ordered carefully; longest matches are checked first at runtime.
const RULES: PatternRule[] = [
  // 4-char & 3-char special patterns
  { find: 'kSh', replace: 'ক্ষ', kind: 'consonant' },
  { find: 'rri', replace: 'ঋ', kar: 'ৃ', kind: 'vowel' },
  { find: 't``', replace: 'ৎ', kind: 'consonant' },
  { find: 'bhl', replace: 'ভ্ল', kind: 'consonant' },
  { find: 'Chh', replace: 'ছ', kind: 'consonant' },
  { find: 'chh', replace: 'ছ', kind: 'consonant' },

  // 2-char vowels
  { find: 'OI', replace: 'ঐ', kar: 'ৈ', kind: 'vowel' },
  { find: 'OU', replace: 'ঔ', kar: 'ৌ', kind: 'vowel' },
  { find: 'oo', replace: 'উ', kar: 'ু', kind: 'vowel' },
  { find: 'ee', replace: 'ঈ', kar: 'ী', kind: 'vowel' },

  // 2-char consonants & special digraphs
  { find: 'kh', replace: 'খ', kind: 'consonant' },
  { find: 'gh', replace: 'ঘ', kind: 'consonant' },
  { find: 'Ng', replace: 'ঙ', kind: 'consonant' },
  { find: 'NG', replace: 'ঞ', kind: 'consonant' },
  { find: 'ng', replace: 'ং', kind: 'modifier' },
  { find: 'ch', replace: 'ছ', kind: 'consonant' },
  { find: 'jh', replace: 'ঝ', kind: 'consonant' },
  { find: 'Th', replace: 'ঠ', kind: 'consonant' },
  { find: 'Dh', replace: 'ঢ', kind: 'consonant' },
  { find: 'th', replace: 'থ', kind: 'consonant' },
  { find: 'dh', replace: 'ধ', kind: 'consonant' },
  { find: 'ph', replace: 'ফ', kind: 'consonant' },
  { find: 'bh', replace: 'ভ', kind: 'consonant' },
  { find: 'sh', replace: 'শ', kind: 'consonant' },
  { find: 'Sh', replace: 'ষ', kind: 'consonant' },
  { find: 'Rh', replace: 'ঢ়', kind: 'consonant' },
  { find: 'gg', replace: 'জ্ঞ', kind: 'consonant' },
  { find: ',,', replace: '্', kind: 'modifier' },
  { find: '..', replace: '.', kind: 'punct' },
  { find: '--', replace: '—', kind: 'punct' },

  // 1-char vowels
  { find: 'a', replace: 'আ', kar: 'া', kind: 'vowel' },
  { find: 'A', replace: 'আ', kar: 'া', kind: 'vowel' },
  { find: 'i', replace: 'ই', kar: 'ি', kind: 'vowel' },
  { find: 'I', replace: 'ঈ', kar: 'ী', kind: 'vowel' },
  { find: 'u', replace: 'উ', kar: 'ু', kind: 'vowel' },
  { find: 'U', replace: 'ঊ', kar: 'ূ', kind: 'vowel' },
  { find: 'e', replace: 'এ', kar: 'ে', kind: 'vowel' },
  { find: 'E', replace: 'এ', kar: 'ে', kind: 'vowel' },
  { find: 'O', replace: 'ও', kar: 'ো', kind: 'vowel' },
  { find: 'o', replace: 'অ', kar: '', kind: 'vowel' }, // inherent vowel after consonant

  // 1-char consonants
  { find: 'k', replace: 'ক', kind: 'consonant' },
  { find: 'K', replace: 'ক', kind: 'consonant' },
  { find: 'g', replace: 'গ', kind: 'consonant' },
  { find: 'G', replace: 'গ', kind: 'consonant' },
  { find: 'c', replace: 'চ', kind: 'consonant' },
  { find: 'C', replace: 'চ', kind: 'consonant' },
  { find: 'j', replace: 'জ', kind: 'consonant' },
  { find: 'J', replace: 'জ', kind: 'consonant' },
  { find: 'T', replace: 'ট', kind: 'consonant' },
  { find: 'D', replace: 'ড', kind: 'consonant' },
  { find: 'N', replace: 'ণ', kind: 'consonant' },
  { find: 't', replace: 'ত', kind: 'consonant' },
  { find: 'd', replace: 'দ', kind: 'consonant' },
  { find: 'n', replace: 'ন', kind: 'consonant' },
  { find: 'p', replace: 'প', kind: 'consonant' },
  { find: 'P', replace: 'প', kind: 'consonant' },
  { find: 'f', replace: 'ফ', kind: 'consonant' },
  { find: 'F', replace: 'ফ', kind: 'consonant' },
  { find: 'b', replace: 'ব', kind: 'consonant' },
  { find: 'B', replace: 'ব', kind: 'consonant' },
  { find: 'v', replace: 'ভ', kind: 'consonant' },
  { find: 'V', replace: 'ভ', kind: 'consonant' },
  { find: 'm', replace: 'ম', kind: 'consonant' },
  { find: 'M', replace: 'ম', kind: 'consonant' },
  { find: 'z', replace: 'য', kind: 'consonant' },
  { find: 'Z', replace: '্য', kind: 'modifier' },
  { find: 'r', replace: 'র', kind: 'consonant' },
  { find: 'l', replace: 'ল', kind: 'consonant' },
  { find: 'L', replace: 'ল', kind: 'consonant' },
  { find: 'S', replace: 'শ', kind: 'consonant' },
  { find: 's', replace: 'স', kind: 'consonant' },
  { find: 'h', replace: 'হ', kind: 'consonant' },
  { find: 'H', replace: 'হ', kind: 'consonant' },
  { find: 'R', replace: 'ড়', kind: 'consonant' },
  { find: 'y', replace: 'য়', kind: 'consonant' },
  { find: 'Y', replace: 'য়', kind: 'consonant' },
  { find: 'w', replace: 'ব', kind: 'consonant' },
  { find: 'W', replace: 'ও', kar: 'ো', kind: 'vowel' },
  { find: 'q', replace: 'ক', kind: 'consonant' },
  { find: 'Q', replace: 'ক', kind: 'consonant' },
  { find: 'x', replace: 'ক্স', kind: 'consonant' },

  // Modifiers & Punctuation
  { find: '^', replace: 'ঁ', kind: 'modifier' },
  { find: ':', replace: 'ঃ', kind: 'modifier' },
  { find: '.', replace: '।', kind: 'punct' },
  { find: '$', replace: '৳', kind: 'punct' },

  // Digits
  { find: '0', replace: '০', kind: 'digit' },
  { find: '1', replace: '১', kind: 'digit' },
  { find: '2', replace: '২', kind: 'digit' },
  { find: '3', replace: '৩', kind: 'digit' },
  { find: '4', replace: '৪', kind: 'digit' },
  { find: '5', replace: '৫', kind: 'digit' },
  { find: '6', replace: '৬', kind: 'digit' },
  { find: '7', replace: '৭', kind: 'digit' },
  { find: '8', replace: '৮', kind: 'digit' },
  { find: '9', replace: '৯', kind: 'digit' },
];

// Sort descending by pattern length for greedy longest-match
const SORTED_RULES = [...RULES].sort((a, b) => b.find.length - a.find.length);

/**
 * Transliterates a single Avro phonetic Latin word/buffer into Bangla Unicode.
 * Supports:
 *  - Automatic conjunct formation between consecutive consonants (e.g., pr -> প্র, kt -> ক্ত)
 *  - 'w' after consonant -> ব-ফলা (স্ব, শ্ব, দ্ব, ত্ব)
 *  - 'y' after consonant -> য-ফলা (ব্য, দ্যা) when not preceded by vowel/o
 *  - 'rr' before consonant -> রেফ (র্ণ, র্জ)
 *  - Inherent 'o' releases consonant state so following vowel is independent (boi -> বই)
 *  - Backtick ` escapes literal English characters inside a word
 */
export function transliterateAvroToken(input: string): string {
  if (!input) return '';

  let out = '';
  let i = 0;
  let prevWasConsonant = false;

  while (i < input.length) {
    // Literal escape with backtick: `abc` or `x
    if (input[i] === '`') {
      if (i + 1 < input.length) {
        out += input[i + 1];
        i += 2;
        prevWasConsonant = false;
        continue;
      }
      i++;
      continue;
    }

    // Handle 'rr' before a consonant as Reph (র্ + consonant) when not 'rri'
    if (
      input.startsWith('rr', i) &&
      !input.startsWith('rri', i) &&
      i + 2 < input.length &&
      /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(input[i + 2])
    ) {
      out += 'র্';
      i += 2;
      prevWasConsonant = false;
      continue;
    }

    // Special: 'ng' followed by 'g' or 'k' -> ঙ্গ / ঙ্ক (e.g., vongi -> ভঙ্গি, ongko -> অঙ্ক)
    if (
      input.startsWith('ng', i) &&
      i + 2 < input.length &&
      (input[i + 2] === 'g' || input[i + 2] === 'k')
    ) {
      if (prevWasConsonant) out += '্';
      out += 'ঙ';
      i += 2;
      prevWasConsonant = true;
      continue;
    }

    // Match longest rule
    let matched: PatternRule | null = null;
    for (const rule of SORTED_RULES) {
      if (input.startsWith(rule.find, i)) {
        matched = rule;
        break;
      }
    }

    if (!matched) {
      out += input[i];
      i++;
      prevWasConsonant = false;
      continue;
    }

    if (matched.kind === 'vowel') {
      if (prevWasConsonant) {
        // Use dependent kar-chinho (for 'o', kar is '', releasing the consonant cleanly)
        out += matched.kar ?? '';
      } else {
        out += matched.replace;
      }
      prevWasConsonant = false;
    } else if (matched.kind === 'consonant') {
      if (prevWasConsonant) {
        // Consonant cluster: insert hasanta (্)
        if (matched.find === 'y' || matched.find === 'Y') {
          // y after consonant becomes য-ফলা (্ + য)
          out += '্য';
        } else if (matched.find === 'w') {
          // w after consonant becomes ব-ফলা (্ + ব)
          out += '্ব';
        } else {
          out += '্' + matched.replace;
        }
      } else {
        out += matched.replace;
      }
      prevWasConsonant = true;
    } else if (matched.kind === 'modifier') {
      out += matched.replace;
      prevWasConsonant = matched.find === 'Z';
    } else {
      out += matched.replace;
      prevWasConsonant = false;
    }

    i += matched.find.length;
  }

  return out;
}

/**
 * Checks if a key event character can be consumed by the Avro phonetic buffer.
 */
export function isAvroBufferChar(ch: string): boolean {
  return /^[A-Za-z0-9.^:`,$-]$/.test(ch);
}
