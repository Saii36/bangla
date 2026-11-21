import type { KeyCapSpec, LayoutDefinition, LayoutId } from '../../types';
import {
  BIJOY_SHIFTED,
  BIJOY_UNSHIFTED,
  JATIYA_SHIFTED,
  JATIYA_UNSHIFTED,
  PROBHAT_SHIFTED,
  PROBHAT_UNSHIFTED,
} from './fixedLayouts';

const QWERTY_ROWS: Array<
  Array<{
    code: string;
    en: string;
    enShift: string;
    finger: KeyCapSpec['finger'];
    isHome?: boolean;
  }>
> = [
  [
    { code: 'Digit1', en: '1', enShift: '!', finger: 'lp' },
    { code: 'Digit2', en: '2', enShift: '@', finger: 'lr' },
    { code: 'Digit3', en: '3', enShift: '#', finger: 'lm' },
    { code: 'Digit4', en: '4', enShift: '$', finger: 'li' },
    { code: 'Digit5', en: '5', enShift: '%', finger: 'li' },
    { code: 'Digit6', en: '6', enShift: '^', finger: 'ri' },
    { code: 'Digit7', en: '7', enShift: '&', finger: 'ri' },
    { code: 'Digit8', en: '8', enShift: '*', finger: 'rm' },
    { code: 'Digit9', en: '9', enShift: '(', finger: 'rr' },
    { code: 'Digit0', en: '0', enShift: ')', finger: 'rp' },
    { code: 'Minus', en: '-', enShift: '_', finger: 'rp' },
    { code: 'Equal', en: '=', enShift: '+', finger: 'rp' },
  ],
  [
    { code: 'KeyQ', en: 'q', enShift: 'Q', finger: 'lp' },
    { code: 'KeyW', en: 'w', enShift: 'W', finger: 'lr' },
    { code: 'KeyE', en: 'e', enShift: 'E', finger: 'lm' },
    { code: 'KeyR', en: 'r', enShift: 'R', finger: 'li' },
    { code: 'KeyT', en: 't', enShift: 'T', finger: 'li' },
    { code: 'KeyY', en: 'y', enShift: 'Y', finger: 'ri' },
    { code: 'KeyU', en: 'u', enShift: 'U', finger: 'ri' },
    { code: 'KeyI', en: 'i', enShift: 'I', finger: 'rm' },
    { code: 'KeyO', en: 'o', enShift: 'O', finger: 'rr' },
    { code: 'KeyP', en: 'p', enShift: 'P', finger: 'rp' },
    { code: 'BracketLeft', en: '[', enShift: '{', finger: 'rp' },
    { code: 'BracketRight', en: ']', enShift: '}', finger: 'rp' },
    { code: 'Backslash', en: '\\', enShift: '|', finger: 'rp' },
  ],
  [
    { code: 'KeyA', en: 'a', enShift: 'A', finger: 'lp', isHome: true },
    { code: 'KeyS', en: 's', enShift: 'S', finger: 'lr', isHome: true },
    { code: 'KeyD', en: 'd', enShift: 'D', finger: 'lm', isHome: true },
    { code: 'KeyF', en: 'f', enShift: 'F', finger: 'li', isHome: true },
    { code: 'KeyG', en: 'g', enShift: 'G', finger: 'li' },
    { code: 'KeyH', en: 'h', enShift: 'H', finger: 'ri' },
    { code: 'KeyJ', en: 'j', enShift: 'J', finger: 'ri', isHome: true },
    { code: 'KeyK', en: 'k', enShift: 'K', finger: 'rm', isHome: true },
    { code: 'KeyL', en: 'l', enShift: 'L', finger: 'rr', isHome: true },
    { code: 'Semicolon', en: ';', enShift: ':', finger: 'rp', isHome: true },
    { code: 'Quote', en: "'", enShift: '"', finger: 'rp' },
  ],
  [
    { code: 'KeyZ', en: 'z', enShift: 'Z', finger: 'lp' },
    { code: 'KeyX', en: 'x', enShift: 'X', finger: 'lr' },
    { code: 'KeyC', en: 'c', enShift: 'C', finger: 'lm' },
    { code: 'KeyV', en: 'v', enShift: 'V', finger: 'li' },
    { code: 'KeyB', en: 'b', enShift: 'B', finger: 'li' },
    { code: 'KeyN', en: 'n', enShift: 'N', finger: 'ri' },
    { code: 'KeyM', en: 'm', enShift: 'M', finger: 'ri' },
    { code: 'Comma', en: ',', enShift: '<', finger: 'rm' },
    { code: 'Period', en: '.', enShift: '>', finger: 'rr' },
    { code: 'Slash', en: '/', enShift: '?', finger: 'rp' },
  ],
];

const AVRO_PREVIEW_UNSHIFTED: Record<string, string> = {
  '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯', '0': '০',
  q: 'ক', w: '্ব', e: 'এ/ে', r: 'র', t: 'ত', y: 'য়', u: 'উ/ু', i: 'ই/ি', o: 'অ', p: 'প',
  a: 'আ/া', s: 'স', d: 'দ', f: 'ফ', g: 'গ', h: 'হ', j: 'জ', k: 'ক', l: 'ল',
  z: 'য', x: 'ক্স', c: 'চ', v: 'ভ', b: 'ব', n: 'ন', m: 'ম', '.': '।',
};

const AVRO_PREVIEW_SHIFTED: Record<string, string> = {
  $: '৳', '^': 'ঁ',
  T: 'ট', D: 'ড', N: 'ণ', I: 'ঈ/ী', U: 'ঊ/ূ', O: 'ও/ো', S: 'শ', R: 'ড়', Z: '্য', ':': 'ঃ',
};

function buildKeyboardRows(
  unshifted: Record<string, string>,
  shifted: Record<string, string>
): KeyCapSpec[][] {
  return QWERTY_ROWS.map((row) =>
    row.map((k) => ({
      code: k.code,
      en: k.en,
      enShift: k.enShift,
      bn: unshifted[k.en] ?? k.en,
      bnShift: shifted[k.enShift] ?? k.enShift,
      finger: k.finger,
      isHome: k.isHome,
    }))
  );
}

const DEFAULT_LAYOUTS: LayoutDefinition[] = [
  {
    id: 'avro',
    name: 'Avro Phonetic',
    nativeName: 'অভ্র ফোনেটিক',
    type: 'phonetic',
    badgeLabel: 'Phonetic Input Method',
    shortDescription:
      'Type Bangla phonetically using familiar English spelling rules — built right into the tutor.',
    mechanismSummary:
      'Phonetic transliteration maps multi-key Latin phonetic sequences (like "ami", "kSh", "projukti") into context-aware Bangla Unicode. Vowels become independent letters at word starts and কারচিহ্ন after consonants.',
    instructions: [
      'Type naturally in English letters — the built-in Avro engine converts your phonetic buffer into Bangla live.',
      'Press Space or punctuation to commit a phonetic word. Backspace edits inside your current phonetic buffer smoothly.',
      'Use uppercase letters for retroflex/long sounds: T (ট), D (ড), N (ণ), I (ঈ/ী), U (ঊ/ূ), O (ও/ো), R (ড়), S/Sh (শ/ষ).',
      'Type consecutive consonants without "o" to create conjuncts (e.g., pr → প্র, kt → ক্ত, kSh → ক্ষ, sw → স্ব).',
      'Use backtick (`) before an English letter to type literal English characters inside mixed passages.',
    ],
    tips: [
      'Use inherent "o" to prevent unwanted conjuncts: type "kolom" for কলম, not "klm".',
      'Type "boi" for বই — the "o" closes ব so "i" becomes independent ই.',
      'Type "rri" for ঋ/ৃ (e.g., "drrishTi" → দৃষ্টি).',
    ],
    examples: [
      { keys: 'ami bangla likhi.', output: 'আমি বাংলা লিখি।', note: 'Period produces দাঁড়ি (।)' },
      { keys: 'bishwobidyaloy', output: 'বিশ্ববিদ্যালয়', note: 'Automatic শ্ব & দ্যা conjuncts' },
      { keys: 'prozukti', output: 'প্রযুক্তি', note: 'র-ফলা + য-কার + ক্ত conjunct' },
      { keys: 'kSh', output: 'ক্ষ', note: 'Direct Khiyo conjunct' },
      { keys: 'swadhInota', output: 'স্বাধীনতা', note: 'ব-ফলা + দীর্ঘ ঈ-কার' },
    ],
    keyboardRows: buildKeyboardRows(AVRO_PREVIEW_UNSHIFTED, AVRO_PREVIEW_SHIFTED),
  },
  {
    id: 'bijoy',
    name: 'Bijoy Classic',
    nativeName: 'বিজয় ক্লাসিক',
    type: 'fixed',
    badgeLabel: 'Fixed Layout · Pre-Base Vowels',
    shortDescription:
      'Classic Bijoy fixed keymap with authentic pre-base vowel ordering (ি, ে, ৈ typed before consonant) and "g" link key.',
    mechanismSummary:
      'Fixed positional keyboard layout where every physical key maps to a dedicated Bangla character. Pre-base vowel signs (d=ি, c=ে, C=ৈ) are typed BEFORE the consonant and automatically reordered into canonical Unicode.',
    instructions: [
      'Place fingers on home row: A S D F (ৃ ু ি া) and J K L ; (ক ত দ ;).',
      'Type pre-base vowel signs BEFORE the consonant: press d then j for কি, or c then j for কে.',
      'Press g (Link/Hasanta) between consonants to form conjuncts: j + g + Shift+N = ক্ষ.',
      'Press g followed by a vowel sign to produce independent স্বরবর্ণ: g+f = আ, g+d = ই, g+s = উ, g+c = এ.',
      'Press c + consonant + f to form ও-কার (e.g., c + j + f → কো), and Shift+G for দাঁড়ি (।).',
    ],
    tips: [
      'Keep left hand dedicated to vowel signs (a s d f c x) and right hand to core consonants (h j k l b n m).',
      'Use z for র-ফলা (r + z = প্র) and Shift+Z for য-ফলা (h + Shift+Z = ব্য).',
      'Shift+F produces অ directly without needing the g link key.',
    ],
    examples: [
      { keys: 'd + j', output: 'কি', note: 'Pre-base ই-কার before ক' },
      { keys: 'g + f', output: 'আ', note: 'Link key + আ-কার = স্বরবর্ণ আ' },
      { keys: 'j + g + Shift+N', output: 'ক্ষ', note: 'ক + হসন্ত + ষ' },
      { keys: 'r + z', output: 'প্র', note: 'প + র-ফলা' },
      { keys: 'h + f + Shift+Q + Shift+V + f', output: 'বাংলা', note: 'Full word in Bijoy Classic' },
    ],
    keyboardRows: buildKeyboardRows(BIJOY_UNSHIFTED, BIJOY_SHIFTED),
    keymap: BIJOY_UNSHIFTED,
    shiftKeymap: BIJOY_SHIFTED,
    preBaseVowels: true,
  },
  {
    id: 'bijoy-unicode',
    name: 'Bijoy Compatible (UniJoy)',
    nativeName: 'বিজয় ইউনিকোড (ইউনিজয়)',
    type: 'fixed',
    badgeLabel: 'Fixed Layout · Unicode Order',
    shortDescription:
      'Identical Bijoy consonant positions with modern Unicode post-base vowel order (consonant first, then কারচিহ্ন).',
    mechanismSummary:
      'Retains Bijoy physical key positions for muscle-memory transfer while accepting logical Unicode order (typing ক then ি yields কি directly), eliminating pre-base reordering confusion.',
    instructions: [
      'Uses the same physical keys as Bijoy Classic for consonants, digits, and Shift layers.',
      'Type consonant FIRST, then vowel sign: j + d = কি, j + c = কে, j + x = কো.',
      'Press g + vowel sign for independent vowels (g+f = আ, g+d = ই, g+s = উ).',
      'Press g between consonants for conjuncts (j + g + k = ক্ত, n + g + h = স্ব).',
    ],
    tips: [
      'Ideal if you already know Bijoy key positions but prefer logical Unicode typing order used on Linux/OpenBangla.',
      'No need to remember pre-base vowel splitting for ও-কার — just press consonant + x.',
    ],
    examples: [
      { keys: 'j + d', output: 'কি', note: 'Consonant first, then ই-কার' },
      { keys: 'j + x', output: 'কো', note: 'Direct ও-কার after consonant' },
      { keys: 'n + g + h + f', output: 'স্বা', note: 'স + ্ + ব + া' },
    ],
    keyboardRows: buildKeyboardRows(BIJOY_UNSHIFTED, BIJOY_SHIFTED),
    keymap: BIJOY_UNSHIFTED,
    shiftKeymap: BIJOY_SHIFTED,
    preBaseVowels: false,
  },
  {
    id: 'jatiya',
    name: 'National / Jatiya',
    nativeName: 'জাতীয় কীবোর্ড লেআউট',
    type: 'fixed',
    badgeLabel: 'Fixed Layout · BCC Standard',
    shortDescription:
      'Official Bangladesh Computer Council (BCC) National Bangla keyboard standard for government & institutional exams.',
    mechanismSummary:
      'Fixed Unicode-order national layout standardized by BCC. Optimized for high-frequency Bangla letter ergonomics and official typing examinations across Bangladesh.',
    instructions: [
      'Type in logical Unicode order: base consonant first, followed by কারচিহ্ন (vowel sign).',
      'Use g (্) as the conjunct joiner and independent vowel prefix (g+f = আ, g+d = ই, g+x = ও).',
      'Shift+F types অ directly; Shift+G types দাঁড়ি (।); z attaches র-ফলা and Shift+Z attaches য-ফলা.',
      'Ideal for government recruitment exams and institutional Bangla typing tests.',
    ],
    tips: [
      'Master the home-row vowel signs (a s d f) and right-hand consonants (h j k l) before moving to shifted keys.',
      'Practice Exam Simulation mode with Jatiya enabled to build official exam endurance.',
    ],
    examples: [
      { keys: 'j + f', output: 'কা', note: 'ক + আ-কার' },
      { keys: 'j + x', output: 'কো', note: 'ক + ও-কার' },
      { keys: 'b + g + k', output: 'ন্ত', note: 'ন + ্ + ত' },
    ],
    keyboardRows: buildKeyboardRows(JATIYA_UNSHIFTED, JATIYA_SHIFTED),
    keymap: JATIYA_UNSHIFTED,
    shiftKeymap: JATIYA_SHIFTED,
    preBaseVowels: false,
  },
  {
    id: 'probhat',
    name: 'Probhat',
    nativeName: 'প্রভাত লেআউট',
    type: 'fixed',
    badgeLabel: 'Fixed Layout · Sound-Aligned',
    shortDescription:
      'Popular open-source fixed Unicode layout aligning Bangla letters with similar English QWERTY keys.',
    mechanismSummary:
      'Fixed 1-to-1 positional layout designed for zero-modal Unicode typing without phonetic ambiguity. Each Bangla letter sits on a sound-related QWERTY key (k=ক, b=ব, m=ম, a=া) with "/" as Hasanta.',
    instructions: [
      'Every key produces one fixed Bangla character immediately — no word-commit delay.',
      'Use "/" (Forward Slash) as Hasanta (্) to join consonants into conjuncts (e.g., k + / + Shift+X = ক্ষ).',
      'Unshifted vowels produce কারচিহ্ন (a=া, i=ি, u=ু, e=ী); Shifted keys produce independent স্বরবর্ণ (Shift+A=অ, Shift+I=ই, Shift+U=উ).',
      'Press "." directly for দাঁড়ি (।).',
    ],
    tips: [
      'Great bridge for touch typists transitioning from English QWERTY to a fast fixed Bangla layout.',
      'Remember "/" for conjuncts — keep your right pinky comfortable reaching the slash key.',
    ],
    examples: [
      { keys: 'b + a + Shift+L + l + a', output: 'বাংলা', note: 'Direct 1-to-1 Unicode keys' },
      { keys: 'p + / + r', output: 'প্র', note: 'Slash acts as Hasanta' },
      { keys: 'k + i', output: 'কি', note: 'Logical Unicode order' },
    ],
    keyboardRows: buildKeyboardRows(PROBHAT_UNSHIFTED, PROBHAT_SHIFTED),
    keymap: PROBHAT_UNSHIFTED,
    shiftKeymap: PROBHAT_SHIFTED,
    preBaseVowels: false,
  },
  {
    id: 'system-ime',
    name: 'OS / System IME',
    nativeName: 'সিস্টেম আইএমই (Avro / Bijoy App)',
    type: 'system',
    badgeLabel: 'External OS Input Method',
    shortDescription:
      'Use your operating system’s native Avro Keyboard, OpenBangla, Bijoy Bayanno, or IBus input directly.',
    mechanismSummary:
      'Passthrough mode that disables internal key interception and listens cleanly to native OS IME composition events (compositionstart / compositionupdate / compositionend) without penalizing incomplete commits.',
    instructions: [
      'Switch your OS keyboard switcher (Windows Avro, Bijoy Bayanno, OpenBangla, macOS Bangla, or Linux IBus) to Bangla.',
      'Type directly into the practice box — Bangla Typing Master evaluates finalized Unicode grapheme clusters automatically.',
      'Incomplete IME composition candidates are highlighted in amber rather than marked red.',
      'Works seamlessly for mixed Bangla-English passages by toggling your OS keyboard shortcut.',
    ],
    tips: [
      'Choose this mode whenever you already have desktop Avro Keyboard or Bijoy Bayanno running on your machine.',
      'Grapheme-aware comparison guarantees consistent accuracy scoring regardless of IME Unicode decomposition.',
    ],
    examples: [
      { keys: 'Desktop Avro / OpenBangla', output: 'Native IME', note: 'Full OS dictionary & autocorrect' },
      { keys: 'Bijoy Bayanno (Unicode)', output: 'Native Unicode', note: 'Ensure Bijoy is set to Unicode mode' },
    ],
    keyboardRows: buildKeyboardRows(AVRO_PREVIEW_UNSHIFTED, AVRO_PREVIEW_SHIFTED),
  },
];

// Modular registry supporting dynamic layout registration in future updates
const layoutMap = new Map<LayoutId, LayoutDefinition>(
  DEFAULT_LAYOUTS.map((l) => [l.id, l])
);

export function getAllLayouts(): LayoutDefinition[] {
  return Array.from(layoutMap.values());
}

export function getLayoutById(id: LayoutId): LayoutDefinition {
  return layoutMap.get(id) ?? DEFAULT_LAYOUTS[0];
}

export function registerLayout(definition: LayoutDefinition): void {
  layoutMap.set(definition.id, definition);
}

/**
 * Finds a helpful key hint for a given target Bangla grapheme on the active layout.
 */
export function getKeyHintForGrapheme(
  layoutId: LayoutId,
  grapheme: string
): { keys: string; note?: string } | null {
  if (!grapheme) return null;
  if (grapheme === ' ') return { keys: 'Space' };
  if (grapheme === '\n') return { keys: 'Enter' };

  const layout = getLayoutById(layoutId);

  // Check direct fixed keymaps
  if (layout.keymap || layout.shiftKeymap) {
    for (const [k, v] of Object.entries(layout.keymap ?? {})) {
      if (v === grapheme) return { keys: k.toUpperCase() };
    }
    for (const [k, v] of Object.entries(layout.shiftKeymap ?? {})) {
      if (v === grapheme) return { keys: `Shift + ${k.toUpperCase()}` };
    }
    // Decompose multi-codepoint Bangla cluster into individual key hints
    const parts = Array.from(grapheme);
    if (parts.length > 1) {
      const hints: string[] = [];
      for (const p of parts) {
        const single = getKeyHintForGrapheme(layoutId, p);
        if (single) hints.push(single.keys);
      }
      if (hints.length > 0) {
        // For Bijoy Classic, show pre-base vowel first if present
        if (layout.preBaseVowels && parts.length === 2 && ['ি', 'ে', 'ৈ'].includes(parts[1])) {
          const rev = [...hints].reverse();
          return { keys: rev.join(' + '), note: 'Pre-base vowel first' };
        }
        return { keys: hints.join(' + ') };
      }
    }
  }

  // Avro Phonetic hint lookup
  if (layoutId === 'avro') {
    const quickAvro: Record<string, string> = {
      'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'I', 'উ': 'u', 'ঊ': 'U', 'ঋ': 'rri', 'এ': 'e', 'ঐ': 'OI', 'ও': 'O', 'ঔ': 'OU',
      'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'Ng',
      'চ': 'c', 'ছ': 'ch', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'NG',
      'ট': 'T', 'ঠ': 'Th', 'ড': 'D', 'ঢ': 'Dh', 'ণ': 'N',
      'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
      'প': 'p', 'ফ': 'ph / f', 'ব': 'b', 'ভ': 'bh / v', 'ম': 'm',
      'য': 'z', 'র': 'r', 'ল': 'l', 'শ': 'sh / S', 'ষ': 'Sh', 'স': 's', 'হ': 'h',
      'ড়': 'R', 'ঢ়': 'Rh', 'য়': 'y', 'ৎ': 't``', 'ং': 'ng', 'ঃ': ':', 'ঁ': '^',
      '।': '.', 'া': 'a', 'ি': 'i', 'ী': 'I', 'ু': 'u', 'ূ': 'U', 'ৃ': 'rri', 'ে': 'e', 'ৈ': 'OI', 'ো': 'O', 'ৌ': 'OU',
      'ক্ষ': 'kSh', 'জ্ঞ': 'gg',
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    };
    if (quickAvro[grapheme]) return { keys: quickAvro[grapheme] };
    // Build approximate phonetic breakdown
    const chars = Array.from(grapheme);
    const seq = chars
      .filter((c) => c !== '্')
      .map((c) => quickAvro[c] ?? c)
      .join('');
    if (seq) return { keys: seq };
  }

  return null;
}
