import React, { useMemo, useState } from 'react';
import {
  Play,
  Plus,
  Save,
  Trash2,
  Shuffle,
  CheckSquare,
  Square,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { generateCustomCharacterDrill } from '../core/practiceGenerator';
import { BANGLA_CHARACTERS, CHAR_CATEGORIES } from '../data/banglaData';
import type { CharCategoryId, CustomCharSet, LayoutId } from '../types';

interface CharacterPracticeBuilderProps {
  activeLayoutId: LayoutId;
  customCharSets: CustomCharSet[];
  charMistakeTotals: Record<string, number>;
  onStartDrill: (params: {
    title: string;
    text: string;
    chars: string[];
    includeCombinations: boolean;
    randomize: boolean;
    repeatDifficult: boolean;
    count: number;
  }) => void;
  onSaveCharSet: (set: CustomCharSet) => void;
  onDeleteCharSet: (id: string) => void;
}

export const CharacterPracticeBuilder: React.FC<CharacterPracticeBuilderProps> = ({
  activeLayoutId,
  customCharSets,
  charMistakeTotals,
  onStartDrill,
  onSaveCharSet,
  onDeleteCharSet,
}) => {
  const [activeCategory, setActiveCategory] = useState<CharCategoryId>('consonants');
  const [selectedChars, setSelectedChars] = useState<string[]>(['ক', 'খ', 'গ', 'ঘ', 'ঙ']);
  const [includeCombinations, setIncludeCombinations] = useState(true);
  const [randomize, setRandomize] = useState(true);
  const [repeatDifficult, setRepeatDifficult] = useState(true);
  const [drillLength, setDrillLength] = useState(30);

  const [customEntry, setCustomEntry] = useState('');
  const [setName, setSetName] = useState('');
  const [previewSeed, setPreviewSeed] = useState(0);

  const categoryItems = useMemo(
    () => BANGLA_CHARACTERS.filter((c) => c.category === activeCategory),
    [activeCategory]
  );

  // Group consonants by subGroup (বর্গ) for clear Bangla orthographic structure
  const groupedItems = useMemo(() => {
    const groups = new Map<string, typeof categoryItems>();
    for (const item of categoryItems) {
      const key = item.subGroup || 'All';
      const arr = groups.get(key) ?? [];
      arr.push(item);
      groups.set(key, arr);
    }
    return Array.from(groups.entries());
  }, [categoryItems]);

  const toggleChar = (ch: string) => {
    setSelectedChars((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const selectRangeInCategory = (mode: 'all' | 'first10' | 'last10' | 'clear') => {
    const chars = categoryItems.map((i) => i.char);
    if (mode === 'all') {
      setSelectedChars((prev) => Array.from(new Set([...prev, ...chars])));
    } else if (mode === 'first10') {
      setSelectedChars(chars.slice(0, 10));
    } else if (mode === 'last10') {
      setSelectedChars(chars.slice(-10));
    } else {
      setSelectedChars([]);
    }
  };

  const selectPresetGroup = (preset: 'vowels' | 'consonants' | 'k-borgo' | 'complex') => {
    if (preset === 'vowels') {
      setActiveCategory('vowels');
      setSelectedChars(BANGLA_CHARACTERS.filter((c) => c.category === 'vowels').map((c) => c.char));
    } else if (preset === 'consonants') {
      setActiveCategory('consonants');
      setSelectedChars(
        BANGLA_CHARACTERS.filter((c) => c.category === 'consonants').map((c) => c.char)
      );
    } else if (preset === 'k-borgo') {
      setActiveCategory('consonants');
      setSelectedChars(['ক', 'খ', 'গ', 'ঘ', 'ঙ']);
    } else {
      setActiveCategory('complex-words');
      setSelectedChars([
        'বিশ্ববিদ্যালয়',
        'প্রযুক্তি',
        'স্বাধীনতা',
        'দৃষ্টিভঙ্গি',
        'প্রতিযোগিতা',
        'গুরুত্বপূর্ণ',
      ]);
      setIncludeCombinations(false);
    }
  };

  const handleAddCustomToken = (e: React.FormEvent) => {
    e.preventDefault();
    const tokens = customEntry
      .trim()
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) return;
    setSelectedChars((prev) => Array.from(new Set([...prev, ...tokens])));
    setCustomEntry('');
  };

  const handleSaveSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setName.trim() || selectedChars.length === 0) return;
    onSaveCharSet({
      id: `charset-${Date.now()}`,
      name: setName.trim(),
      chars: [...selectedChars],
      includeCombinations,
      randomize,
      repeatDifficult,
      createdAt: Date.now(),
    });
    setSetName('');
  };

  const generatedPreview = useMemo(() => {
    // previewSeed intentionally forces fresh randomized sample when user clicks Shuffle Preview
    void previewSeed;
    return generateCustomCharacterDrill({
      chars: selectedChars,
      includeCombinations,
      randomize,
      repeatDifficult,
      count: drillLength,
      mistakeTotals: charMistakeTotals,
    });
  }, [
    selectedChars,
    includeCombinations,
    randomize,
    repeatDifficult,
    drillLength,
    charMistakeTotals,
    previewSeed,
  ]);

  const handleLaunch = () => {
    if (selectedChars.length === 0) return;
    const text = generateCustomCharacterDrill({
      chars: selectedChars,
      includeCombinations,
      randomize,
      repeatDifficult,
      count: drillLength,
      mistakeTotals: charMistakeTotals,
    });
    const labelPreview =
      selectedChars.length <= 5
        ? selectedChars.join(' ')
        : `${selectedChars.slice(0, 4).join(' ')} (+${selectedChars.length - 4})`;

    onStartDrill({
      title: `Custom Drill: ${labelPreview}`,
      text,
      chars: selectedChars,
      includeCombinations,
      randomize,
      repeatDifficult,
      count: drillLength,
    });
  };

  const getHintForItem = (item: (typeof BANGLA_CHARACTERS)[number]) => {
    if (activeLayoutId === 'avro') return item.avroHint;
    if (activeLayoutId === 'bijoy' || activeLayoutId === 'bijoy-unicode') return item.bijoyHint;
    if (activeLayoutId === 'jatiya') return item.jatiyaHint ?? item.bijoyHint;
    if (activeLayoutId === 'probhat') return item.probhatHint;
    return item.avroHint;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* Left 8 columns: Category Tabs + Interactive Character Grid */}
      <div className="xl:col-span-8 space-y-5">
        {/* Quick Macro Presets */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Bangla Character &amp; Word Selector
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pick any combination of স্বরবর্ণ, ব্যঞ্জনবর্ণ, কারচিহ্ন, ফলা, যুক্তবর্ণ, or complex words to generate unlimited drills.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => selectPresetGroup('k-borgo')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                ক খ গ ঘ ঙ
              </button>
              <button
                type="button"
                onClick={() => selectPresetGroup('vowels')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                Only Vowels
              </button>
              <button
                type="button"
                onClick={() => selectPresetGroup('consonants')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                Only Consonants
              </button>
              <button
                type="button"
                onClick={() => selectPresetGroup('complex')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                Complex Words
              </button>
            </div>
          </div>

          {/* Category Segmented Tabs */}
          <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900/80">
            {CHAR_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span className="font-bangla-siliguri mr-1">{cat.banglaLabel}</span>
                  <span className="opacity-70">({cat.label})</span>
                </button>
              );
            })}
          </div>

          {/* Selection Actions for Active Category */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              {CHAR_CATEGORIES.find((c) => c.id === activeCategory)?.description}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => selectRangeInCategory('all')}
                className="text-teal-700 dark:text-teal-300 font-medium hover:underline whitespace-nowrap shrink-0"
              >
                Select All
              </button>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <button
                type="button"
                onClick={() => selectRangeInCategory('first10')}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline whitespace-nowrap shrink-0"
              >
                First 10
              </button>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <button
                type="button"
                onClick={() => selectRangeInCategory('last10')}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline whitespace-nowrap shrink-0"
              >
                Last 10
              </button>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <button
                type="button"
                onClick={() => selectRangeInCategory('clear')}
                className="text-rose-600 dark:text-rose-400 hover:underline whitespace-nowrap shrink-0"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Character Checkboxes Grid */}
          <div className="space-y-5 pt-2">
            {groupedItems.map(([groupName, items]) => (
              <div key={groupName} className="space-y-2.5">
                {groupName !== 'All' && (
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-bangla-siliguri">
                      {groupName}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const groupChars = items.map((i) => i.char);
                        const allSelected = groupChars.every((ch) => selectedChars.includes(ch));
                        if (allSelected) {
                          setSelectedChars((prev) => prev.filter((c) => !groupChars.includes(c)));
                        } else {
                          setSelectedChars((prev) => Array.from(new Set([...prev, ...groupChars])));
                        }
                      }}
                      className="text-xs text-teal-700 dark:text-teal-300 hover:underline"
                    >
                      Toggle group
                    </button>
                  </div>
                )}
                <div
                  className={`grid gap-2 ${
                    activeCategory === 'complex-words'
                      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                      : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6'
                  }`}
                >
                  {items.map((item) => {
                    const checked = selectedChars.includes(item.char);
                    const mistakes = charMistakeTotals[item.practiceToken || item.char] || 0;
                    const hint = getHintForItem(item);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => toggleChar(item.char)}
                        className={`group relative flex flex-col items-start justify-between p-2.5 rounded-xl border text-left transition-all ${
                          checked
                            ? 'bg-teal-50/90 dark:bg-teal-950/50 border-teal-500 dark:border-teal-400 text-slate-900 dark:text-slate-100'
                            : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full gap-1">
                          <span
                            className={`font-bangla-siliguri font-semibold leading-tight ${
                              activeCategory === 'complex-words' ? 'text-base' : 'text-2xl'
                            }`}
                          >
                            {item.practiceToken && item.category === 'karchinho'
                              ? item.char
                              : item.char}
                          </span>
                          {checked ? (
                            <CheckSquare className="w-4 h-4 text-teal-700 dark:text-teal-300 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                          )}
                        </div>
                        <div className="mt-1.5 w-full space-y-0.5">
                          {item.breakdown && (
                            <p className="text-[11px] font-bangla-siliguri text-slate-500 dark:text-slate-400 truncate">
                              {item.breakdown}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-mono-tabular truncate">{hint || item.name}</span>
                            {mistakes > 0 && (
                              <span className="text-rose-600 dark:text-rose-400 font-mono-tabular font-medium shrink-0">
                                {mistakes} err
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Conjuncts / Complex Words */}
          <form
            onSubmit={handleAddCustomToken}
            className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={customEntry}
              onChange={(e) => setCustomEntry(e.target.value)}
              placeholder="Add custom conjuncts or complex words (space-separated, e.g. ক্ষ্ম ত্ত্ব বিজ্ঞান)..."
              className="flex-1 h-10 px-3.5 text-sm font-bangla-siliguri rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-2 focus:outline-teal-600"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add to Selection
            </button>
          </form>
        </div>
      </div>

      {/* Right 4 columns: Generator Settings, Live Preview & Saved Custom Sets */}
      <div className="xl:col-span-4 space-y-5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Practice Configuration
            </h3>
            <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
              {selectedChars.length} selected
            </span>
          </div>

          {/* Selected Characters Summary */}
          <div className="min-h-[54px] max-h-[120px] overflow-y-auto p-3 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
            {selectedChars.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Select one or more characters on the left to build a practice set.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedChars.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChar(ch)}
                    title="Click to remove"
                    className="font-bangla-siliguri text-sm px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-rose-400 hover:text-rose-600 transition-colors"
                  >
                    {ch} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 text-sm">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300">
                Generate combinations (e.g. কখ গঘ ঙক)
              </span>
              <input
                type="checkbox"
                checked={includeCombinations}
                onChange={(e) => setIncludeCombinations(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300">
                Randomize character order
              </span>
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300">
                Repeat difficult characters more often
              </span>
              <input
                type="checkbox"
                checked={repeatDifficult}
                onChange={(e) => setRepeatDifficult(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded"
              />
            </label>
          </div>

          {/* Exercise Length Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="drill-length-slider" className="text-slate-600 dark:text-slate-400">
                Exercise Length
              </label>
              <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                {drillLength} items
              </span>
            </div>
            <input
              id="drill-length-slider"
              type="range"
              min={15}
              max={60}
              step={5}
              value={drillLength}
              onChange={(e) => setDrillLength(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          {/* Live Generated Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Generated Exercise Preview</span>
              <button
                type="button"
                onClick={() => setPreviewSeed((s) => s + 1)}
                className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-300 hover:underline"
              >
                <Shuffle className="w-3 h-3" />
                Shuffle
              </button>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 font-bangla-siliguri text-base leading-relaxed text-slate-800 dark:text-slate-200 max-h-28 overflow-y-auto">
              {selectedChars.length > 0 ? generatedPreview : '—'}
            </div>
          </div>

          <button
            type="button"
            disabled={selectedChars.length === 0}
            onClick={handleLaunch}
            className="w-full inline-flex items-center justify-center gap-2 h-11 px-4 text-sm font-semibold rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white disabled:opacity-50 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Custom Practice
          </button>

          {/* Save Character Set Form */}
          <form
            onSubmit={handleSaveSet}
            className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="Save set name..."
              className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-2 focus:outline-teal-600"
            />
            <button
              type="submit"
              disabled={!setName.trim() || selectedChars.length === 0}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              Save Set
            </button>
          </form>
        </div>

        {/* Saved Custom Character Sets */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Saved Character Sets
            </h3>
            <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
              {customCharSets.length}
            </span>
          </div>
          {customCharSets.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save your favorite character combinations above for one-click reuse.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {customCharSets.map((set) => (
                <div key={set.id} className="py-2.5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChars(set.chars);
                      setIncludeCombinations(set.includeCombinations);
                      setRandomize(set.randomize);
                      setRepeatDifficult(set.repeatDifficult);
                    }}
                    className="text-left min-w-0 flex-1 group"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 truncate font-bangla-siliguri">
                      {set.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-bangla-siliguri mt-0.5">
                      {set.chars.slice(0, 8).join(' ')} · {set.chars.length} items
                    </p>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const text = generateCustomCharacterDrill({
                          chars: set.chars,
                          includeCombinations: set.includeCombinations,
                          randomize: set.randomize,
                          repeatDifficult: set.repeatDifficult,
                          count: drillLength,
                          mistakeTotals: charMistakeTotals,
                        });
                        onStartDrill({
                          title: set.name,
                          text,
                          chars: set.chars,
                          includeCombinations: set.includeCombinations,
                          randomize: set.randomize,
                          repeatDifficult: set.repeatDifficult,
                          count: drillLength,
                        });
                      }}
                      title="Practice set immediately"
                      className="p-1.5 rounded-md text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCharSet(set.id)}
                      title="Delete saved set"
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedChars.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedChars(['ক', 'খ', 'গ', 'ঘ', 'ঙ'])}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to ক খ গ ঘ ঙ example
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
