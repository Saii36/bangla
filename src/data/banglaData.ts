import type { BanglaCharItem, CharCategoryId, Lesson } from '../types';

export interface CharCategoryMeta {
  id: CharCategoryId;
  label: string;
  banglaLabel: string;
  description: string;
}

export const CHAR_CATEGORIES: CharCategoryMeta[] = [
  {
    id: 'vowels',
    label: 'Vowels',
    banglaLabel: 'স্বরবর্ণ',
    description: '11 independent Bangla vowel letters from অ to ঔ.',
  },
  {
    id: 'consonants',
    label: 'Consonants',
    banglaLabel: 'ব্যঞ্জনবর্ণ',
    description: 'Full consonant groups (বর্গ), ড় ঢ় য়, and ক্ষ.',
  },
  {
    id: 'karchinho',
    label: 'Vowel Signs',
    banglaLabel: 'কারচিহ্ন',
    description: 'Dependent vowel signs (া ি ী ু ূ ৃ ে ৈ ো ৌ) paired in syllables.',
  },
  {
    id: 'fola',
    label: 'Fola Signs',
    banglaLabel: 'ফলা',
    description: 'Consonant modifiers: য-ফলা, র-ফলা, ব-ফলা, ম-ফলা, ন-ফলা, ল-ফলা.',
  },
  {
    id: 'conjuncts',
    label: 'Conjuncts',
    banglaLabel: 'যুক্তবর্ণ',
    description: 'High-frequency and complex Bangla consonant clusters.',
  },
  {
    id: 'digits',
    label: 'Bangla Digits',
    banglaLabel: 'বাংলা সংখ্যা',
    description: 'Bangla numerals ০ through ৯.',
  },
  {
    id: 'punctuation',
    label: 'Punctuation',
    banglaLabel: 'বিরামচিহ্ন ও প্রতীক',
    description: 'Dari (।), commas, quotes, currency sign (৳), and symbols.',
  },
  {
    id: 'complex-words',
    label: 'Complex Words',
    banglaLabel: 'জটিল শব্দ',
    description: 'Multi-conjunct academic, technical, and literary Bangla words.',
  },
];

export const BANGLA_CHARACTERS: BanglaCharItem[] = [
  // স্বরবর্ণ (Vowels)
  { id: 'v-1', char: 'অ', name: 'Shoro-O', category: 'vowels', avroHint: 'o', bijoyHint: 'Shift+F', jatiyaHint: 'Shift+F', probhatHint: 'Shift+A' },
  { id: 'v-2', char: 'আ', name: 'Shoro-A', category: 'vowels', avroHint: 'a', bijoyHint: 'g + f', jatiyaHint: 'g + f', probhatHint: 'a' },
  { id: 'v-3', char: 'ই', name: 'Hrosho-I', category: 'vowels', avroHint: 'i', bijoyHint: 'g + d', jatiyaHint: 'g + d', probhatHint: 'Shift+I' },
  { id: 'v-4', char: 'ঈ', name: 'Dirgho-I', category: 'vowels', avroHint: 'I', bijoyHint: 'g + Shift+D', jatiyaHint: 'g + Shift+D', probhatHint: 'Shift+E' },
  { id: 'v-5', char: 'উ', name: 'Hrosho-U', category: 'vowels', avroHint: 'u', bijoyHint: 'g + s', jatiyaHint: 'g + s', probhatHint: 'Shift+U' },
  { id: 'v-6', char: 'ঊ', name: 'Dirgho-U', category: 'vowels', avroHint: 'U', bijoyHint: 'g + Shift+S', jatiyaHint: 'g + Shift+S', probhatHint: 'Shift+Y' },
  { id: 'v-7', char: 'ঋ', name: 'Ri', category: 'vowels', avroHint: 'rri', bijoyHint: 'g + a', jatiyaHint: 'g + a', probhatHint: 'Shift+R' },
  { id: 'v-8', char: 'এ', name: 'E', category: 'vowels', avroHint: 'e', bijoyHint: 'g + c', jatiyaHint: 'g + c', probhatHint: 'e' },
  { id: 'v-9', char: 'ঐ', name: 'Oi', category: 'vowels', avroHint: 'OI', bijoyHint: 'g + Shift+C', jatiyaHint: 'g + Shift+C', probhatHint: 'Shift+W' },
  { id: 'v-10', char: 'ও', name: 'O', category: 'vowels', avroHint: 'O', bijoyHint: 'x', jatiyaHint: 'g + x', probhatHint: 'o' },
  { id: 'v-11', char: 'ঔ', name: 'Ou', category: 'vowels', avroHint: 'OU', bijoyHint: 'g + Shift+X', jatiyaHint: 'g + Shift+X', probhatHint: 'Shift+O' },

  // ব্যঞ্জনবর্ণ (Consonants) - ক-বর্গ
  { id: 'c-1', char: 'ক', name: 'Ko', category: 'consonants', subGroup: 'ক-বর্গ', avroHint: 'k', bijoyHint: 'j', jatiyaHint: 'j', probhatHint: 'k' },
  { id: 'c-2', char: 'খ', name: 'Kho', category: 'consonants', subGroup: 'ক-বর্গ', avroHint: 'kh', bijoyHint: 'Shift+J', jatiyaHint: 'Shift+J', probhatHint: 'Shift+K' },
  { id: 'c-3', char: 'গ', name: 'Go', category: 'consonants', subGroup: 'ক-বর্গ', avroHint: 'g', bijoyHint: 'o', jatiyaHint: 'o', probhatHint: 'g' },
  { id: 'c-4', char: 'ঘ', name: 'Gho', category: 'consonants', subGroup: 'ক-বর্গ', avroHint: 'gh', bijoyHint: 'Shift+O', jatiyaHint: 'Shift+O', probhatHint: 'Shift+G' },
  { id: 'c-5', char: 'ঙ', name: 'Umo', category: 'consonants', subGroup: 'ক-বর্গ', avroHint: 'Ng', bijoyHint: 'q', jatiyaHint: 'q', probhatHint: 'Shift+M' },

  // চ-বর্গ
  { id: 'c-6', char: 'চ', name: 'Cho', category: 'consonants', subGroup: 'চ-বর্গ', avroHint: 'c', bijoyHint: 'y', jatiyaHint: 'y', probhatHint: 'c' },
  { id: 'c-7', char: 'ছ', name: 'Chho', category: 'consonants', subGroup: 'চ-বর্গ', avroHint: 'ch', bijoyHint: 'Shift+Y', jatiyaHint: 'Shift+Y', probhatHint: 'Shift+C' },
  { id: 'c-8', char: 'জ', name: 'Borgiyo-Jo', category: 'consonants', subGroup: 'চ-বর্গ', avroHint: 'j', bijoyHint: 'u', jatiyaHint: 'u', probhatHint: 'j' },
  { id: 'c-9', char: 'ঝ', name: 'Jho', category: 'consonants', subGroup: 'চ-বর্গ', avroHint: 'jh', bijoyHint: 'Shift+U', jatiyaHint: 'Shift+U', probhatHint: 'Shift+J' },
  { id: 'c-10', char: 'ঞ', name: 'Niyo', category: 'consonants', subGroup: 'চ-বর্গ', avroHint: 'NG', bijoyHint: 'Shift+I', jatiyaHint: 'Shift+I', probhatHint: 'Shift+N' },

  // ট-বর্গ
  { id: 'c-11', char: 'ট', name: 'To', category: 'consonants', subGroup: 'ট-বর্গ', avroHint: 'T', bijoyHint: 't', jatiyaHint: 't', probhatHint: 'Shift+T' },
  { id: 'c-12', char: 'ঠ', name: 'Tho', category: 'consonants', subGroup: 'ট-বর্গ', avroHint: 'Th', bijoyHint: 'Shift+T', jatiyaHint: 'Shift+T', probhatHint: 'Shift+H' },
  { id: 'c-13', char: 'ড', name: 'Do', category: 'consonants', subGroup: 'ট-বর্গ', avroHint: 'D', bijoyHint: 'e', jatiyaHint: 'e', probhatHint: 'Shift+D' },
  { id: 'c-14', char: 'ঢ', name: 'Dho', category: 'consonants', subGroup: 'ট-বর্গ', avroHint: 'Dh', bijoyHint: 'Shift+E', jatiyaHint: 'Shift+E', probhatHint: 'Shift+V' },
  { id: 'c-15', char: 'ণ', name: 'Murdhonno-No', category: 'consonants', subGroup: 'ট-বর্গ', avroHint: 'N', bijoyHint: 'Shift+B', jatiyaHint: 'Shift+B', probhatHint: 'Shift+B' },

  // ত-বর্গ
  { id: 'c-16', char: 'ত', name: 'To (Dental)', category: 'consonants', subGroup: 'ত-বর্গ', avroHint: 't', bijoyHint: 'k', jatiyaHint: 'k', probhatHint: 't' },
  { id: 'c-17', char: 'থ', name: 'Tho (Dental)', category: 'consonants', subGroup: 'ত-বর্গ', avroHint: 'th', bijoyHint: 'Shift+K', jatiyaHint: 'Shift+K', probhatHint: 'Shift+Q' },
  { id: 'c-18', char: 'দ', name: 'Do (Dental)', category: 'consonants', subGroup: 'ত-বর্গ', avroHint: 'd', bijoyHint: 'l', jatiyaHint: 'l', probhatHint: 'd' },
  { id: 'c-19', char: 'ধ', name: 'Dho (Dental)', category: 'consonants', subGroup: 'ত-বর্গ', avroHint: 'dh', bijoyHint: 'Shift+L', jatiyaHint: 'Shift+L', probhatHint: 'Shift+Z' },
  { id: 'c-20', char: 'ন', name: 'Donto-No', category: 'consonants', subGroup: 'ত-বর্গ', avroHint: 'n', bijoyHint: 'b', jatiyaHint: 'b', probhatHint: 'n' },

  // প-বর্গ
  { id: 'c-21', char: 'প', name: 'Po', category: 'consonants', subGroup: 'প-বর্গ', avroHint: 'p', bijoyHint: 'r', jatiyaHint: 'r', probhatHint: 'p' },
  { id: 'c-22', char: 'ফ', name: 'Pho', category: 'consonants', subGroup: 'প-বর্গ', avroHint: 'ph / f', bijoyHint: 'Shift+R', jatiyaHint: 'Shift+R', probhatHint: 'f' },
  { id: 'c-23', char: 'ব', name: 'Bo', category: 'consonants', subGroup: 'প-বর্গ', avroHint: 'b', bijoyHint: 'h', jatiyaHint: 'h', probhatHint: 'b' },
  { id: 'c-24', char: 'ভ', name: 'Bho', category: 'consonants', subGroup: 'প-বর্গ', avroHint: 'bh / v', bijoyHint: 'Shift+H', jatiyaHint: 'Shift+H', probhatHint: 'v' },
  { id: 'c-25', char: 'ম', name: 'Mo', category: 'consonants', subGroup: 'প-বর্গ', avroHint: 'm', bijoyHint: 'm', jatiyaHint: 'm', probhatHint: 'm' },

  // অন্তঃস্থ ও উষ্ম
  { id: 'c-26', char: 'য', name: 'Ontostho-Zo', category: 'consonants', subGroup: 'অন্তঃস্থ ও উষ্ম', avroHint: 'z', bijoyHint: 'w', jatiyaHint: 'w', probhatHint: 'z' },
  { id: 'c-27', char: 'র', name: 'Boishunno-Ro', category: 'consonants', subGroup: 'অন্তঃস্থ ও উষ্ম', avroHint: 'r', bijoyHint: 'v', jatiyaHint: 'v', probhatHint: 'r' },
  { id: 'c-28', char: 'ল', name: 'Lo', category: 'consonants', subGroup: 'অন্তঃস্থ ও উষ্ম', avroHint: 'l', bijoyHint: 'Shift+V', jatiyaHint: 'Shift+V', probhatHint: 'l' },
  { id: 'c-29', char: 'শ', name: 'Talobbo-Sho', category: 'consonants', subGroup: 'অন্তঃস্থ ও উষ্ম', avroHint: 'sh / S', bijoyHint: 'Shift+M', jatiyaHint: 'Shift+M', probhatHint: 'Shift+S' },
  { id: 'c-30', char: 'ষ', name: 'Murdhonno-Sho', category: 'consonants', subGroup: 'অন্তঃস্থ ও উষ্ম', avroHint: 'Sh', bijoyHint: 'Shift+N', jatiyaHint: 'Shift+N', probhatHint: 'Shift+X' },
  { id: 'c-31', char: 'স', name: 'Donto-So', category: 'consonants', subGroup: 'অন্তঃস্থ ও উষ্ম', avroHint: 's', bijoyHint: 'n', jatiyaHint: 'n', probhatHint: 's' },
  { id: 'c-32', char: 'হ', name: 'Ho', category: 'consonants', subGroup: 'অন্তঃস্থ ও উষ্ম', avroHint: 'h', bijoyHint: 'i', jatiyaHint: 'i', probhatHint: 'h' },

  // ড় ঢ় য় ও ক্ষ
  { id: 'c-33', char: 'ড়', name: 'Doy-Shunno-Ro', category: 'consonants', subGroup: 'অতিরিক্ত ও ক্ষ', avroHint: 'R', bijoyHint: 'p', jatiyaHint: 'p', probhatHint: 'x' },
  { id: 'c-34', char: 'ঢ়', name: 'Dhoy-Shunno-Rho', category: 'consonants', subGroup: 'অতিরিক্ত ও ক্ষ', avroHint: 'Rh', bijoyHint: 'Shift+P', jatiyaHint: 'Shift+P', probhatHint: 'Shift+F' },
  { id: 'c-35', char: 'য়', name: 'Ontostho-O', category: 'consonants', subGroup: 'অতিরিক্ত ও ক্ষ', avroHint: 'y / Y', bijoyHint: 'Shift+W', jatiyaHint: 'Shift+W', probhatHint: 'y' },
  { id: 'c-36', char: 'ৎ', name: 'Khondo-To', category: 'consonants', subGroup: 'অতিরিক্ত ও ক্ষ', avroHint: 't``', bijoyHint: '\\', jatiyaHint: '\\', probhatHint: 'Shift+L' },
  { id: 'c-37', char: 'ং', name: 'Onushwar', category: 'consonants', subGroup: 'অতিরিক্ত ও ক্ষ', avroHint: 'ng', bijoyHint: 'Shift+Q', jatiyaHint: 'Shift+Q', probhatHint: 'q' },
  { id: 'c-38', char: 'ঃ', name: 'Bishorgo', category: 'consonants', subGroup: 'অতিরিক্ত ও ক্ষ', avroHint: ':', bijoyHint: 'Shift+\\', jatiyaHint: 'Shift+\\', probhatHint: ':' },
  { id: 'c-39', char: 'ঁ', name: 'Chondrobindu', category: 'consonants', subGroup: 'অতিরিক্ত ও ক্ষ', avroHint: '^', bijoyHint: 'Shift+7', jatiyaHint: 'Shift+7', probhatHint: '^' },
  { id: 'c-40', char: 'ক্ষ', name: 'Khiyo (ক+্+ষ)', category: 'consonants', subGroup: 'অতিরিক্ত ও ক্ষ', breakdown: 'ক + ্ + ষ', avroHint: 'kSh', bijoyHint: 'j + g + Shift+N', jatiyaHint: 'j + g + Shift+N', probhatHint: 'k + / + Shift+X' },

  // কারচিহ্ন (Vowel Signs)
  { id: 'k-1', char: 'া', practiceToken: 'কা', name: 'আ-কার (া)', category: 'karchinho', avroHint: 'ka', bijoyHint: 'j + f', jatiyaHint: 'j + f', probhatHint: 'k + a' },
  { id: 'k-2', char: 'ি', practiceToken: 'কি', name: 'ই-কার (ি)', category: 'karchinho', avroHint: 'ki', bijoyHint: 'd + j', jatiyaHint: 'j + d', probhatHint: 'k + i' },
  { id: 'k-3', char: 'ী', practiceToken: 'কী', name: 'ঈ-কার (ী)', category: 'karchinho', avroHint: 'kI', bijoyHint: 'j + Shift+D', jatiyaHint: 'j + Shift+D', probhatHint: 'k + Shift+I' },
  { id: 'k-4', char: 'ু', practiceToken: 'কু', name: 'উ-কার (ু)', category: 'karchinho', avroHint: 'ku', bijoyHint: 'j + s', jatiyaHint: 'j + s', probhatHint: 'k + u' },
  { id: 'k-5', char: 'ূ', practiceToken: 'কূ', name: 'ঊ-কার (ূ)', category: 'karchinho', avroHint: 'kU', bijoyHint: 'j + Shift+S', jatiyaHint: 'j + Shift+S', probhatHint: 'k + Shift+U' },
  { id: 'k-6', char: 'ৃ', practiceToken: 'কৃ', name: 'ঋ-কার (ৃ)', category: 'karchinho', avroHint: 'krri', bijoyHint: 'j + a', jatiyaHint: 'j + a', probhatHint: 'k + <' },
  { id: 'k-7', char: 'ে', practiceToken: 'কে', name: 'এ-কার (ে)', category: 'karchinho', avroHint: 'ke', bijoyHint: 'c + j', jatiyaHint: 'j + c', probhatHint: 'k + e' },
  { id: 'k-8', char: 'ৈ', practiceToken: 'কৈ', name: 'ঐ-কার (ৈ)', category: 'karchinho', avroHint: 'kOI', bijoyHint: 'Shift+C + j', jatiyaHint: 'j + Shift+C', probhatHint: 'k + Shift+W' },
  { id: 'k-9', char: 'ো', practiceToken: 'কো', name: 'ও-কার (ো)', category: 'karchinho', avroHint: 'kO', bijoyHint: 'c + j + f', jatiyaHint: 'j + x', probhatHint: 'k + o' },
  { id: 'k-10', char: 'ৌ', practiceToken: 'কৌ', name: 'ঔ-কার (ৌ)', category: 'karchinho', avroHint: 'kOU', bijoyHint: 'c + j + Shift+X', jatiyaHint: 'j + Shift+X', probhatHint: 'k + Shift+O' },

  // ফলা (Fola)
  { id: 'f-1', char: '্য', practiceToken: 'ব্য', name: 'য-ফলা', category: 'fola', breakdown: 'ব + ্ + য', avroHint: 'by / bz', bijoyHint: 'h + Shift+Z', jatiyaHint: 'h + g + w', probhatHint: 'b + / + z' },
  { id: 'f-2', char: '্র', practiceToken: 'প্র', name: 'র-ফলা', category: 'fola', breakdown: 'প + ্ + র', avroHint: 'pr', bijoyHint: 'r + z', jatiyaHint: 'r + g + v', probhatHint: 'p + / + r' },
  { id: 'f-3', char: '্ব', practiceToken: 'স্ব', name: 'ব-ফলা', category: 'fola', breakdown: 'স + ্ + ব', avroHint: 'sw', bijoyHint: 'n + g + h', jatiyaHint: 'n + g + h', probhatHint: 's + / + b' },
  { id: 'f-4', char: '্ম', practiceToken: 'স্ম', name: 'ম-ফলা', category: 'fola', breakdown: 'স + ্ + ম', avroHint: 'sm', bijoyHint: 'n + g + m', jatiyaHint: 'n + g + m', probhatHint: 's + / + m' },
  { id: 'f-5', char: '্ন', practiceToken: 'স্ন', name: 'ন-ফলা', category: 'fola', breakdown: 'স + ্ + ন', avroHint: 'sn', bijoyHint: 'n + g + b', jatiyaHint: 'n + g + b', probhatHint: 's + / + n' },
  { id: 'f-6', char: '্ল', practiceToken: 'ক্ল', name: 'ল-ফলা', category: 'fola', breakdown: 'ক + ্ + ল', avroHint: 'kl', bijoyHint: 'j + g + Shift+V', jatiyaHint: 'j + g + Shift+V', probhatHint: 'k + / + l' },

  // যুক্তবর্ণ (Conjunct Consonants)
  { id: 'j-1', char: 'ক্ষ', name: 'ক্ষ (ক+ষ)', category: 'conjuncts', breakdown: 'ক + ্ + ষ', avroHint: 'kSh', bijoyHint: 'j+g+N' },
  { id: 'j-2', char: 'জ্ঞ', name: 'জ্ঞ (জ+ঞ)', category: 'conjuncts', breakdown: 'জ + ্ + ঞ', avroHint: 'gg / jNG', bijoyHint: 'u+g+I' },
  { id: 'j-3', char: 'ক্ত', name: 'ক্ত (ক+ত)', category: 'conjuncts', breakdown: 'ক + ্ + ত', avroHint: 'kt', bijoyHint: 'j+g+k' },
  { id: 'j-4', char: 'ন্ত', name: 'ন্ত (ন+ত)', category: 'conjuncts', breakdown: 'ন + ্ + ত', avroHint: 'nt', bijoyHint: 'b+g+k' },
  { id: 'j-5', char: 'ন্দ', name: 'ন্দ (ন+দ)', category: 'conjuncts', breakdown: 'ন + ্ + দ', avroHint: 'nd', bijoyHint: 'b+g+l' },
  { id: 'j-6', char: 'ন্ধ', name: 'ন্ধ (ন+ধ)', category: 'conjuncts', breakdown: 'ন + ্ + ধ', avroHint: 'ndh', bijoyHint: 'b+g+L' },
  { id: 'j-7', char: 'স্ত', name: 'স্ত (স+ত)', category: 'conjuncts', breakdown: 'স + ্ + ত', avroHint: 'st', bijoyHint: 'n+g+k' },
  { id: 'j-8', char: 'স্থ', name: 'স্থ (স+থ)', category: 'conjuncts', breakdown: 'স + ্ + থ', avroHint: 'sth', bijoyHint: 'n+g+K' },
  { id: 'j-9', char: 'স্প', name: 'স্প (স+প)', category: 'conjuncts', breakdown: 'স + ্ + প', avroHint: 'sp', bijoyHint: 'n+g+r' },
  { id: 'j-10', char: 'ষ্ট', name: 'ষ্ট (ষ+ট)', category: 'conjuncts', breakdown: 'ষ + ্ + ট', avroHint: 'ShT', bijoyHint: 'N+g+t' },
  { id: 'j-11', char: 'ষ্ঠ', name: 'ষ্ঠ (ষ+ঠ)', category: 'conjuncts', breakdown: 'ষ + ্ + ঠ', avroHint: 'ShTh', bijoyHint: 'N+g+T' },
  { id: 'j-12', char: 'ঙ্গ', name: 'ঙ্গ (ঙ+গ)', category: 'conjuncts', breakdown: 'ঙ + ্ + গ', avroHint: 'Ngg', bijoyHint: 'q+g+o' },
  { id: 'j-13', char: 'ঙ্ক', name: 'ঙ্ক (ঙ+ক)', category: 'conjuncts', breakdown: 'ঙ + ্ + ক', avroHint: 'Ngk', bijoyHint: 'q+g+j' },
  { id: 'j-14', char: 'ঞ্চ', name: 'ঞ্চ (ঞ+চ)', category: 'conjuncts', breakdown: 'ঞ + ্ + চ', avroHint: 'NGc', bijoyHint: 'I+g+y' },
  { id: 'j-15', char: 'ঞ্জ', name: 'ঞ্জ (ঞ+জ)', category: 'conjuncts', breakdown: 'ঞ + ্ + জ', avroHint: 'NGj', bijoyHint: 'I+g+u' },
  { id: 'j-16', char: 'ণ্ড', name: 'ণ্ড (ণ+ড)', category: 'conjuncts', breakdown: 'ণ + ্ + ড', avroHint: 'ND', bijoyHint: 'B+g+e' },
  { id: 'j-17', char: 'দ্ধ', name: 'দ্ধ (দ+ধ)', category: 'conjuncts', breakdown: 'দ + ্ + ধ', avroHint: 'ddh', bijoyHint: 'l+g+L' },
  { id: 'j-18', char: 'ত্ত', name: 'ত্ত (ত+ত)', category: 'conjuncts', breakdown: 'ত + ্ + ত', avroHint: 'tt', bijoyHint: 'k+g+k' },
  { id: 'j-19', char: 'ত্র', name: 'ত্র (ত+র)', category: 'conjuncts', breakdown: 'ত + ্ + র', avroHint: 'tr', bijoyHint: 'k+z' },
  { id: 'j-20', char: 'প্র', name: 'প্র (প+র)', category: 'conjuncts', breakdown: 'প + ্ + র', avroHint: 'pr', bijoyHint: 'r+z' },
  { id: 'j-21', char: 'শ্র', name: 'শ্র (শ+র)', category: 'conjuncts', breakdown: 'শ + ্ + র', avroHint: 'shr', bijoyHint: 'M+z' },
  { id: 'j-22', char: 'শ্ব', name: 'শ্ব (শ+ব)', category: 'conjuncts', breakdown: 'শ + ্ + ব', avroHint: 'shw', bijoyHint: 'M+g+h' },
  { id: 'j-23', char: 'স্ব', name: 'স্ব (স+ব)', category: 'conjuncts', breakdown: 'স + ্ + ব', avroHint: 'sw', bijoyHint: 'n+g+h' },
  { id: 'j-24', char: 'দ্ব', name: 'দ্ব (দ+ব)', category: 'conjuncts', breakdown: 'দ + ্ + ব', avroHint: 'dw', bijoyHint: 'l+g+h' },
  { id: 'j-25', char: 'ত্ব', name: 'ত্ব (ত+ব)', category: 'conjuncts', breakdown: 'ত + ্ + ব', avroHint: 'tw', bijoyHint: 'k+g+h' },
  { id: 'j-26', char: 'ম্প', name: 'ম্প (ম+প)', category: 'conjuncts', breakdown: 'ম + ্ + প', avroHint: 'mp', bijoyHint: 'm+g+r' },
  { id: 'j-27', char: 'ম্ব', name: 'ম্ব (ম+ব)', category: 'conjuncts', breakdown: 'ম + ্ + ব', avroHint: 'mb', bijoyHint: 'm+g+h' },
  { id: 'j-28', char: 'হ্ম', name: 'হ্ম (হ+ম)', category: 'conjuncts', breakdown: 'হ + ্ + ম', avroHint: 'hm', bijoyHint: 'i+g+m' },
  { id: 'j-29', char: 'শ্চ', name: 'শ্চ (শ+চ)', category: 'conjuncts', breakdown: 'শ + ্ + চ', avroHint: 'shc', bijoyHint: 'M+g+y' },
  { id: 'j-30', char: 'ষ্ট্র', name: 'ষ্ট্র (ষ+ট+র)', category: 'conjuncts', breakdown: 'ষ + ্ + ট + ্ + র', avroHint: 'ShTr', bijoyHint: 'N+g+t+z' },

  // বাংলা সংখ্যা (Digits)
  { id: 'd-0', char: '০', name: 'Shunno (0)', category: 'digits', avroHint: '0', bijoyHint: '0', jatiyaHint: '0', probhatHint: '0' },
  { id: 'd-1', char: '১', name: 'Ek (1)', category: 'digits', avroHint: '1', bijoyHint: '1', jatiyaHint: '1', probhatHint: '1' },
  { id: 'd-2', char: '২', name: 'Dui (2)', category: 'digits', avroHint: '2', bijoyHint: '2', jatiyaHint: '2', probhatHint: '2' },
  { id: 'd-3', char: '৩', name: 'Tin (3)', category: 'digits', avroHint: '3', bijoyHint: '3', jatiyaHint: '3', probhatHint: '3' },
  { id: 'd-4', char: '৪', name: 'Char (4)', category: 'digits', avroHint: '4', bijoyHint: '4', jatiyaHint: '4', probhatHint: '4' },
  { id: 'd-5', char: '৫', name: 'Pach (5)', category: 'digits', avroHint: '5', bijoyHint: '5', jatiyaHint: '5', probhatHint: '5' },
  { id: 'd-6', char: '৬', name: 'Chhoy (6)', category: 'digits', avroHint: '6', bijoyHint: '6', jatiyaHint: '6', probhatHint: '6' },
  { id: 'd-7', char: '৭', name: 'Shat (7)', category: 'digits', avroHint: '7', bijoyHint: '7', jatiyaHint: '7', probhatHint: '7' },
  { id: 'd-8', char: '৮', name: 'At (8)', category: 'digits', avroHint: '8', bijoyHint: '8', jatiyaHint: '8', probhatHint: '8' },
  { id: 'd-9', char: '৯', name: 'Noy (9)', category: 'digits', avroHint: '9', bijoyHint: '9', jatiyaHint: '9', probhatHint: '9' },

  // বিরামচিহ্ন ও প্রতীক (Punctuation & Symbols)
  { id: 'p-1', char: '।', name: 'Dari (Full stop)', category: 'punctuation', avroHint: '.', bijoyHint: 'Shift+G', jatiyaHint: 'Shift+G', probhatHint: '.' },
  { id: 'p-2', char: ',', name: 'Comma', category: 'punctuation', avroHint: ',', bijoyHint: ',', jatiyaHint: ',', probhatHint: ',' },
  { id: 'p-3', char: '?', name: 'Question Mark', category: 'punctuation', avroHint: '?', bijoyHint: '?', jatiyaHint: '?', probhatHint: '?' },
  { id: 'p-4', char: '!', name: 'Exclamation', category: 'punctuation', avroHint: '!', bijoyHint: '!', jatiyaHint: '!', probhatHint: '!' },
  { id: 'p-5', char: ';', name: 'Semicolon', category: 'punctuation', avroHint: ';', bijoyHint: ';', jatiyaHint: ';', probhatHint: ';' },
  { id: 'p-6', char: ':', name: 'Colon', category: 'punctuation', avroHint: '`::`', bijoyHint: ':', jatiyaHint: ':', probhatHint: ':' },
  { id: 'p-7', char: '—', name: 'Em Dash', category: 'punctuation', avroHint: '--', bijoyHint: '-', jatiyaHint: '-', probhatHint: '-' },
  { id: 'p-8', char: '৳', name: 'Taka Sign', category: 'punctuation', avroHint: '$', bijoyHint: '$', jatiyaHint: '$', probhatHint: '$' },
  { id: 'p-9', char: '(', name: 'Left Paren', category: 'punctuation', avroHint: '(', bijoyHint: '(', jatiyaHint: '(', probhatHint: '(' },
  { id: 'p-10', char: ')', name: 'Right Paren', category: 'punctuation', avroHint: ')', bijoyHint: ')', jatiyaHint: ')', probhatHint: ')' },
  { id: 'p-11', char: '%', name: 'Percent', category: 'punctuation', avroHint: '%', bijoyHint: '%', jatiyaHint: '%', probhatHint: '%' },

  // জটিল শব্দ (Complex Words — including all requested examples)
  { id: 'w-1', char: 'বিশ্ববিদ্যালয়', name: 'University', category: 'complex-words', breakdown: 'বি+শ্ব+বি+দ্যা+ল+য়', avroHint: 'bishwobidyaloy' },
  { id: 'w-2', char: 'প্রযুক্তি', name: 'Technology', category: 'complex-words', breakdown: 'প্র+যু+ক্তি', avroHint: 'prozukti' },
  { id: 'w-3', char: 'স্বাধীনতা', name: 'Independence', category: 'complex-words', breakdown: 'স্বা+ধী+ন+তা', avroHint: 'swadhInota' },
  { id: 'w-4', char: 'দৃষ্টিভঙ্গি', name: 'Perspective', category: 'complex-words', breakdown: 'দৃ+ষ্টি+ভ+ঙ্গি', avroHint: 'drrishTivonggi' },
  { id: 'w-5', char: 'প্রতিযোগিতা', name: 'Competition', category: 'complex-words', breakdown: 'প্র+তি+যো+গি+তা', avroHint: 'protizOgita' },
  { id: 'w-6', char: 'গুরুত্বপূর্ণ', name: 'Important', category: 'complex-words', breakdown: 'গু+রু+ত্ব+পূ+র্ণ', avroHint: 'gurutwopUrNo' },
  { id: 'w-7', char: 'আন্তর্জাতিক', name: 'International', category: 'complex-words', breakdown: 'আ+ন্ত+র্জা+তি+ক', avroHint: 'antorjatik' },
  { id: 'w-8', char: 'সাংস্কৃতিক', name: 'Cultural', category: 'complex-words', breakdown: 'সাং+স্কৃ+তি+ক', avroHint: 'sangkskritik' },
  { id: 'w-9', char: 'ব্যবস্থাপনা', name: 'Management', category: 'complex-words', breakdown: 'ব্য+ব+স্থা+প+না', avroHint: 'bybosthapona' },
  { id: 'w-10', char: 'সৃজনশীলতা', name: 'Creativity', category: 'complex-words', breakdown: 'সৃ+জ+ন+শী+ল+তা', avroHint: 'srrijonshIlota' },
  { id: 'w-11', char: 'বিশ্লেষণাত্মক', name: 'Analytical', category: 'complex-words', breakdown: 'বি+শ্লে+ষ+ণা+ত্ম+ক', avroHint: 'bishleShoNatmok' },
  { id: 'w-12', char: 'ঐতিহাসিক', name: 'Historical', category: 'complex-words', breakdown: 'ঐ+তি+হা+সি+ক', avroHint: 'OItihasik' },
  { id: 'w-13', char: 'অধ্যাবসায়', name: 'Perseverance', category: 'complex-words', breakdown: 'অ+ধ্যা+ব+সা+য়', avroHint: 'odhyabosay' },
  { id: 'w-14', char: 'সংবেদনশীল', name: 'Sensitive', category: 'complex-words', breakdown: 'সং+বে+দ+ন+শী+ল', avroHint: 'songbedonshIl' },
  { id: 'w-15', char: 'বিজ্ঞানসম্মত', name: 'Scientific', category: 'complex-words', breakdown: 'বি+জ্ঞা+ন+স+ম্ম+ত', avroHint: 'biggan-sommoto' },
  { id: 'w-16', char: 'কৃতজ্ঞতা', name: 'Gratitude', category: 'complex-words', breakdown: 'কৃ+ত+জ্ঞ+তা', avroHint: 'krritoggota' },
];

export const WORD_BANK: Record<'beginner' | 'intermediate' | 'advanced', string[]> = {
  beginner: [
    'আম', 'জাম', 'কলম', 'বই', 'ঘর', 'জল', 'ফল', 'বন', 'মন', 'কাজ',
    'মা', 'বাবা', 'ভাই', 'বোন', 'নদী', 'পাখি', 'ফুল', 'চাঁদ', 'সূর্য', 'আকাশ',
    'সবুজ', 'লাল', 'নীল', 'সাদা', 'কালো', 'দিন', 'রাত', 'সকাল', 'বিকেল', 'সময়',
    'বাংলা', 'দেশ', 'ভাষা', 'মানুষ', 'কথা', 'গান', 'ছবি', 'পথ', 'গাছ', 'পাতা',
  ],
  intermediate: [
    'বাংলাদেশ', 'পরিবার', 'বিদ্যালয়', 'শিক্ষক', 'ছাত্রছাত্রী', 'কম্পিউটার', 'ইন্টারনেট',
    'সাহিত্য', 'কবিতা', 'উপন্যাস', 'ইতিহাস', 'সংস্কৃতি', 'প্রকৃতি', 'বর্ষাকাল',
    'অভিজ্ঞতা', 'পরিকল্পনা', 'উপস্থাপনা', 'অর্থনীতি', 'সমাজসেবা', 'পরিবেশ',
    'উন্নয়ন', 'ভবিষ্যৎ', 'সফলতা', 'পরিশ্রম', 'আত্মবিশ্বাস', 'সৃজনশীল', 'অধ্যয়ন',
    'প্রশিক্ষণ', 'নির্ভুলতা', 'অনুশীলন', 'সংবাদপত্র', 'গ্রন্থাগার', 'বিজ্ঞান',
  ],
  advanced: [
    'বিশ্ববিদ্যালয়', 'প্রযুক্তি', 'স্বাধীনতা', 'দৃষ্টিভঙ্গি', 'প্রতিযোগিতা', 'গুরুত্বপূর্ণ',
    'আন্তর্জাতিক', 'সাংস্কৃতিক', 'ব্যবস্থাপনা', 'সৃজনশীলতা', 'বিশ্লেষণাত্মক', 'ঐতিহাসিক',
    'অধ্যাবসায়', 'সংবেদনশীল', 'বিজ্ঞানসম্মত', 'কৃতজ্ঞতা', 'অবকাঠামোগত', 'সম্ভাবনাময়',
    'বিশ্বায়ন', 'স্বনির্ভরতা', 'উত্তরসূরি', 'প্রতিশ্রুতিবদ্ধ', 'বৈচিত্র্যময়', 'স্বচ্ছতা',
    'যুক্তিবাদী', 'দক্ষতাসম্পন্ন', 'বহুমাত্রিক', 'প্রয়োগমূলক', 'নান্দনিকতা', 'স্থায়িত্বশীল',
  ],
};

export const SENTENCE_BANK: Record<'beginner' | 'intermediate' | 'advanced', string[]> = {
  beginner: [
    'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।',
    'প্রতিদিন নিয়মিত অনুশীলন করলে বাংলা টাইপিং সহজ হয়।',
    'সকালে পাখি ডাকে এবং সূর্য পূর্ব দিকে ওঠে।',
    'বই মানুষের সবচেয়ে ভালো বন্ধু ও জ্ঞানের উৎস।',
    'নদীর তীরে সবুজ গাছপালা বাতাসে দোলে।',
    'সময়মতো কাজ করলে জীবনে সফলতা আসে।',
    'বাংলা আমাদের মাতৃভাষা এবং গর্বের প্রতীক।',
    'কী-বোর্ডের দিকে না তাকিয়ে টাইপ করার অভ্যাস করুন।',
  ],
  intermediate: [
    'সঠিক আঙুলের অবস্থান বজায় রাখলে দ্রুত ও নির্ভুলভাবে বাংলা টাইপ করা যায়।',
    'প্রযুক্তির অগ্রগতির ফলে বাংলা ভাষায় ডিজিটাল চর্চা অনেক দূর এগিয়েছে।',
    'প্রতিদিন অন্তত পনেরো মিনিট মনোযোগ দিয়ে অনুশীলন করলে গতি ও নির্ভুলতা উভয়ই বাড়ে।',
    'যুক্তবর্ণ ও কারচিহ্নের সঠিক ব্যবহার জানা দক্ষ বাংলা টাইপিস্ট হওয়ার মূল চাবিকাঠি।',
    'শিক্ষা, সাহিত্য ও গবেষণার প্রতিটি ক্ষেত্রে বাংলা ভাষার ব্যবহার ক্রমেই বৃদ্ধি পাচ্ছে।',
    'ভুল কমানোর দিকে প্রথমে গুরুত্ব দিন, কারণ নির্ভুলতা থেকেই প্রকৃত গতি তৈরি হয়।',
  ],
  advanced: [
    'বিশ্ববিদ্যালয় পর্যায়ের গবেষণা ও প্রযুক্তি চর্চায় বাংলা ভাষার গুরুত্ব অপরিসীম।',
    'স্বাধীনতা ও সাংস্কৃতিক ঐতিহ্য রক্ষায় আমাদের দৃষ্টিভঙ্গি আরও সৃজনশীল ও বিশ্লেষণাত্মক হওয়া উচিত।',
    'আন্তর্জাতিক প্রতিযোগিতায় টিকে থাকতে হলে আধুনিক ব্যবস্থাপনা ও বিজ্ঞানসম্মত পরিকল্পনা অত্যন্ত গুরুত্বপূর্ণ।',
    'অধ্যাবসায়, শৃঙ্খলা এবং নিরন্তর অনুশীলনের মাধ্যমে যেকোনো জটিল দক্ষতা অর্জন করা সম্ভব।',
    'ডিজিটাল নথিপত্র ও পেশাদার প্রতিবেদনে বাংলা ইউনিকোডের নির্ভুল প্রয়োগ সময়ের দাবি।',
  ],
};

export const PARAGRAPH_BANK: Array<{ id: string; title: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; text: string }> = [
  {
    id: 'para-1',
    title: 'মাতৃভাষা ও অনুশীলন',
    difficulty: 'beginner',
    text: 'বাংলা আমাদের প্রিয় মাতৃভাষা। এই ভাষায় লেখার আনন্দ আলাদা। প্রতিদিন অল্প সময় করে অনুশীলন করলে বাংলা টাইপিং খুব দ্রুত আয়ত্ত করা যায়। প্রথমে ধীরে এবং নির্ভুলভাবে টাইপ করা উচিত। প্রতিটি অক্ষর ও কারচিহ্ন পরিষ্কারভাবে চিনে নিলে হাতের গতি নিজে থেকেই বেড়ে যায়।',
  },
  {
    id: 'para-2',
    title: 'প্রযুক্তি ও আধুনিক শিক্ষা',
    difficulty: 'intermediate',
    text: 'বর্তমান যুগে তথ্যপ্রযুক্তি আমাদের দৈনন্দিন জীবন ও শিক্ষাব্যবস্থাকে আমূল পরিবর্তন করেছে। বিদ্যালয় ও বিশ্ববিদ্যালয়ে এখন ডিজিটাল মাধ্যমে বাংলা নথিপত্র, গবেষণা প্রবন্ধ ও উপস্থাপনা তৈরি করা হয়। তাই দ্রুত ও নির্ভুল বাংলা টাইপিং একটি অত্যন্ত গুরুত্বপূর্ণ দক্ষতা হিসেবে বিবেচিত হচ্ছে।',
  },
  {
    id: 'para-3',
    title: 'স্বাধীনতা, দৃষ্টিভঙ্গি ও প্রতিযোগিতা',
    difficulty: 'advanced',
    text: 'বিশ্ববিদ্যালয় ও আধুনিক প্রযুক্তি খাতে আন্তর্জাতিক প্রতিযোগিতা দিন দিন তীব্রতর হচ্ছে। এই বাস্তবতায় সৃজনশীল দৃষ্টিভঙ্গি, বিশ্লেষণাত্মক চিন্তাশক্তি এবং বিজ্ঞানসম্মত ব্যবস্থাপনা অত্যন্ত গুরুত্বপূর্ণ। আমাদের স্বাধীনতা ও সাংস্কৃতিক ঐতিহ্যের চেতনাকে ধারণ করে অধ্যাবসায় ও দক্ষতার মাধ্যমে ভবিষ্যতের পথ নির্মাণ করতে হবে।',
  },
  {
    id: 'para-4',
    title: 'Mixed Bangla-English Technical Passage',
    difficulty: 'intermediate',
    text: 'বাংলা Unicode এবং UTF-8 এনকোডিং আধুনিক Web Browser ও Firefox Extension-এ নির্ভুলভাবে বাংলা প্রদর্শনের ভিত্তি। Avro Phonetic এবং Bijoy Classic—উভয় পদ্ধতিতেই নিয়মিত অনুশীলন করলে HTML, CSS ও বাংলা ডকুমেন্টেশন লেখার গতি বহুগুণ বৃদ্ধি পায়।',
  },
];

export const EXAM_PASSAGES: Array<{ id: string; title: string; durationSec: number; text: string }> = [
  {
    id: 'exam-1',
    title: 'দাপ্তরিক বাংলা টাইপিং পরীক্ষা — সেট ১',
    durationSec: 180,
    text: 'সরকারি ও বেসরকারি দপ্তরে নির্ভুল বাংলা নথিপত্র প্রস্তুত করা একটি অপরিহার্য দায়িত্ব। আধুনিক তথ্যপ্রযুক্তি ও ইউনিকোড ভিত্তিক বাংলা লেখার মাধ্যমে যোগাযোগ ব্যবস্থা আরও গতিশীল ও স্বচ্ছ হয়েছে। একজন দক্ষ টাইপিস্ট কেবল দ্রুতগতিতেই লেখেন না, বরং বানান, যুক্তবর্ণ, বিরামচিহ্ন এবং অনুচ্ছেদ বিন্যাসেও সর্বোচ্চ সতর্কতা অবলম্বন করেন। প্রতিদিন নিয়মিত অনুশীলন, সঠিক বসার ভঙ্গি এবং কিবোর্ডের প্রতিটি চাবির অবস্থান মনে রাখার মাধ্যমে পরীক্ষায় উচ্চ নম্বর অর্জন করা সম্ভব। প্রতিযোগিতামূলক এই সময়ে প্রযুক্তিগত দক্ষতা ও ভাষার শুদ্ধ প্রয়োগ আমাদের কর্মক্ষেত্রে এগিয়ে রাখে।',
  },
  {
    id: 'exam-2',
    title: 'বিশ্ববিদ্যালয় ও প্রযুক্তি প্রবন্ধ — সেট ২',
    durationSec: 300,
    text: 'বিশ্ববিদ্যালয় হলো মুক্তবুদ্ধি চর্চা, গবেষণা এবং নতুন জ্ঞান সৃষ্টির অন্যতম প্রধান কেন্দ্র। একবিংশ শতাব্দীর প্রযুক্তিগত অগ্রগতির সঙ্গে তাল মিলিয়ে উচ্চশিক্ষায় আধুনিক দৃষ্টিভঙ্গি ও সৃজনশীলতা অত্যন্ত গুরুত্বপূর্ণ হয়ে উঠেছে। স্বাধীনতা-পরবর্তী সময়ে আমাদের শিক্ষা, সাহিত্য, বিজ্ঞান ও অর্থনৈতিক অবকাঠামোতে উল্লেখযোগ্য পরিবর্তন সাধিত হয়েছে। আন্তর্জাতিক প্রতিযোগিতায় সফল হতে হলে শিক্ষার্থীদের বিশ্লেষণাত্মক দক্ষতা, অধ্যাবসায় এবং বিজ্ঞানসম্মত পরিকল্পনা গ্রহণের অভ্যাস গড়ে তুলতে হবে। মাতৃভাষা বাংলায় মানসম্মত পাঠ্যপুস্তক ও ডিজিটাল শিক্ষাসামগ্রী প্রণয়ন ভবিষ্যৎ প্রজন্মের জন্য এক অপার সম্ভাবনার দ্বার উন্মোচন করবে।',
  },
];

export const PREDEFINED_LESSONS: Lesson[] = [
  {
    id: 'lesson-vowels-basic',
    title: 'Lesson 01: স্বরবর্ণ পরিচিতি (Bangla Vowels)',
    description: 'Build muscle memory for all 11 independent Bangla vowels from অ to ঔ.',
    category: 'Vowels & Signs',
    difficulty: 'beginner',
    layoutId: 'any',
    text: 'অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ আ অ ই উ এ ও ঈ ঊ ঐ ঔ',
    targetWordCount: 30,
    isCustom: false,
    createdAt: 1700000001000,
    updatedAt: 1700000001000,
  },
  {
    id: 'lesson-k-borgo',
    title: 'Lesson 02: ক-বর্গ ও চ-বর্গ (First 10 Consonants)',
    description: 'Practice the first two consonant groups cleanly with steady rhythm.',
    category: 'Consonants',
    difficulty: 'beginner',
    layoutId: 'any',
    text: 'ক খ গ ঘ ঙ চ ছ জ ঝ ঞ কগ খঘ চজ ছঝ কখগঘঙ চছজঝঞ গক ঘখ জচ ঝছ',
    targetWordCount: 25,
    isCustom: false,
    createdAt: 1700000002000,
    updatedAt: 1700000002000,
  },
  {
    id: 'lesson-karchinho-flow',
    title: 'Lesson 03: কারচিহ্ন অনুশীলন (Vowel Sign Syllables)',
    description: 'Master all 10 dependent vowel signs attached to common consonants.',
    category: 'Vowels & Signs',
    difficulty: 'beginner',
    layoutId: 'any',
    text: 'কা কি কী কু কূ কৃ কে কৈ কো কৌ মা মি মী মু মূ মৃ মে মৈ মো মৌ বা বি বী বু বূ বে বো',
    targetWordCount: 27,
    isCustom: false,
    createdAt: 1700000003000,
    updatedAt: 1700000003000,
  },
  {
    id: 'lesson-everyday-words',
    title: 'Lesson 04: দৈনন্দিন বাংলা শব্দ (Everyday Vocabulary)',
    description: 'Smooth transition from isolated characters into natural Bangla words.',
    category: 'Vocabulary',
    difficulty: 'beginner',
    layoutId: 'any',
    text: 'বাংলা দেশ ভাষা মানুষ নদী পাখি আকাশ সবুজ ফুল বই কলম সময় সকাল বিকেল পরিবার শিক্ষক বিদ্যালয় কবিতা গান ছবি',
    targetWordCount: 20,
    isCustom: false,
    createdAt: 1700000004000,
    updatedAt: 1700000004000,
  },
  {
    id: 'lesson-fola-drills',
    title: 'Lesson 05: ফলা যুক্ত শব্দ (য-ফলা, র-ফলা, ব-ফলা, ম-ফলা)',
    description: 'Practice consonant modifiers in high-frequency Bangla words.',
    category: 'Conjuncts & Fola',
    difficulty: 'intermediate',
    layoutId: 'any',
    text: 'ব্যবসা ব্যবহার বিদ্যা প্রিয় প্রথম প্রাণ প্রকাশ স্বাধীন স্বদেশ স্বপ্ন স্মরণ স্মৃতি স্নান ক্লান্ত শ্রম গ্রহ',
    targetWordCount: 16,
    isCustom: false,
    createdAt: 1700000005000,
    updatedAt: 1700000005000,
  },
  {
    id: 'lesson-conjuncts-core',
    title: 'Lesson 06: যুক্তবর্ণ দক্ষতা (Essential Conjuncts)',
    description: 'Target the most frequent Bangla conjunct consonants used in books and exams.',
    category: 'Conjuncts & Fola',
    difficulty: 'intermediate',
    layoutId: 'any',
    text: 'শিক্ষা বিজ্ঞান রক্ত শান্ত আনন্দ বন্ধন বস্তু স্থান স্পষ্ট বৃষ্টি শ্রেষ্ঠ মঙ্গল অঙ্ক সঞ্চয় গঞ্জনা খণ্ড বুদ্ধি উত্তর পাত্র',
    targetWordCount: 19,
    isCustom: false,
    createdAt: 1700000006000,
    updatedAt: 1700000006000,
  },
  {
    id: 'lesson-bangla-digits',
    title: 'Lesson 07: বাংলা সংখ্যা ও বিরামচিহ্ন (Digits & Punctuation)',
    description: 'Practice typing Bangla numerals ০–৯ with dates, currency (৳), and punctuation.',
    category: 'Fundamentals',
    difficulty: 'intermediate',
    layoutId: 'any',
    text: '১৯৫২ সালের ২১শে ফেব্রুয়ারি ও ১৯৭১ সালের ১৬ই ডিসেম্বর। মূল্য ৫৫০৳, ছাড় ১৫%। মোট সংখ্যা: ০, ১, ২, ৩, ৪, ৫, ৬, ৭, ৮, ৯।',
    targetWordCount: 24,
    isCustom: false,
    createdAt: 1700000007000,
    updatedAt: 1700000007000,
  },
  {
    id: 'lesson-complex-words',
    title: 'Lesson 08: জটিল শব্দ অনুশীলন (Advanced Complex Words)',
    description: 'Master multi-conjunct academic and formal Bangla vocabulary without hesitation.',
    category: 'Vocabulary',
    difficulty: 'advanced',
    layoutId: 'any',
    text: 'বিশ্ববিদ্যালয় প্রযুক্তি স্বাধীনতা দৃষ্টিভঙ্গি প্রতিযোগিতা গুরুত্বপূর্ণ আন্তর্জাতিক সাংস্কৃতিক ব্যবস্থাপনা সৃজনশীলতা বিশ্লেষণাত্মক ঐতিহাসিক অধ্যাবসায় সংবেদনশীল বিজ্ঞানসম্মত কৃতজ্ঞতা',
    targetWordCount: 16,
    isCustom: false,
    createdAt: 1700000008000,
    updatedAt: 1700000008000,
  },
  {
    id: 'lesson-literature',
    title: 'Lesson 09: সাহিত্য ও প্রবন্ধ অনুচ্ছেদ (Literary Prose)',
    description: 'Long-form Bangla prose combining punctuation, conjuncts, and flowing cadence.',
    category: 'Literature & Essays',
    difficulty: 'advanced',
    layoutId: 'any',
    text: 'ভাষা কেবল ভাব প্রকাশের মাধ্যম নয়, এটি একটি জাতির ইতিহাস, সংস্কৃতি ও আত্মপরিচয়ের ধারক। নিরন্তর অনুশীলন ও সঠিক দৃষ্টিভঙ্গির মাধ্যমে আমরা প্রযুক্তির প্রতিটি শাখায় বাংলা ভাষাকে সমৃদ্ধ করতে পারি।',
    targetDurationSec: 120,
    isCustom: false,
    createdAt: 1700000009000,
    updatedAt: 1700000009000,
  },
  {
    id: 'lesson-bilingual',
    title: 'Lesson 10: Mixed Bangla & English (দ্বিভাষিক অনুশীলন)',
    description: 'Switch smoothly between Bangla script and English technical terminology.',
    category: 'Mixed Bangla-English',
    difficulty: 'advanced',
    layoutId: 'any',
    text: 'বাংলা Unicode স্ট্যান্ডার্ড ব্যবহার করে Firefox, Linux এবং Windows-এ নির্ভুল বাংলা টাইপ করা যায়। WPM এবং Accuracy নিয়মিত পর্যবেক্ষণ করুন।',
    targetDurationSec: 90,
    isCustom: false,
    createdAt: 1700000010000,
    updatedAt: 1700000010000,
  },
];

/** Maps any Bangla grapheme cluster to a coarse category label for Weakest Character Group analytics */
export function categorizeBanglaGrapheme(grapheme: string): string {
  if (!grapheme) return 'Other';
  if (/^[০-৯]$/.test(grapheme)) return 'বাংলা সংখ্যা';
  if (/^[অ-ঔ]$/.test(grapheme)) return 'স্বরবর্ণ';
  if (grapheme.includes('\u09CD')) {
    if (/[্য্র্ব্ম্ন্ল]$/.test(grapheme)) return 'ফলা ও যুক্তবর্ণ';
    return 'যুক্তবর্ণ';
  }
  if (/[\u09BE-\u09CC]/.test(grapheme)) return 'কারচিহ্ন';
  if (/^[ক-হড়ঢ়য়ৎংঃঁ]$/.test(grapheme)) return 'ব্যঞ্জনবর্ণ';
  if (/[।,?!;:—\-()'’"“”৳%]/.test(grapheme)) return 'বিরামচিহ্ন';
  if (/^[A-Za-z0-9]$/.test(grapheme)) return 'English';
  return 'Other';
}
