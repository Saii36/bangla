import React, { useMemo, useRef, useState } from 'react';
import {
  Copy,
  Download,
  Edit3,
  Play,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { getAllLayouts } from '../core/layouts/registry';
import { downloadTextFile } from '../core/storage';
import { countWords } from '../core/unicode';
import { PREDEFINED_LESSONS } from '../data/banglaData';
import type { Difficulty, LayoutId, Lesson, LessonCategory } from '../types';

interface LessonManagerProps {
  customLessons: Lesson[];
  onStartLesson: (lesson: Lesson) => void;
  onSaveLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onImportLessons: (lessons: Lesson[]) => void;
}

const CATEGORIES: Array<LessonCategory | 'All'> = [
  'All',
  'Fundamentals',
  'Vowels & Signs',
  'Consonants',
  'Conjuncts & Fola',
  'Vocabulary',
  'Literature & Essays',
  'Mixed Bangla-English',
  'Custom',
];

const EMPTY_FORM: {
  id?: string;
  title: string;
  description: string;
  category: LessonCategory;
  difficulty: Difficulty;
  layoutId: LayoutId | 'any';
  text: string;
  targetDurationSec: string;
  targetWordCount: string;
} = {
  title: '',
  description: '',
  category: 'Custom',
  difficulty: 'beginner',
  layoutId: 'any',
  text: '',
  targetDurationSec: '',
  targetWordCount: '',
};

export const LessonManager: React.FC<LessonManagerProps> = ({
  customLessons,
  onStartLesson,
  onSaveLesson,
  onDeleteLesson,
  onImportLessons,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<LessonCategory | 'All'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const allLayouts = useMemo(() => getAllLayouts(), []);

  const allLessons = useMemo(
    () => [...customLessons, ...PREDEFINED_LESSONS],
    [customLessons]
  );

  const filteredLessons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allLessons.filter((lesson) => {
      if (categoryFilter !== 'All' && lesson.category !== categoryFilter) return false;
      if (difficultyFilter !== 'all' && lesson.difficulty !== difficultyFilter) return false;
      if (q) {
        const hay = `${lesson.title} ${lesson.description} ${lesson.text}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allLessons, categoryFilter, difficultyFilter, search]);

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setShowEditor(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setForm({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      difficulty: lesson.difficulty,
      layoutId: lesson.layoutId,
      text: lesson.text,
      targetDurationSec: lesson.targetDurationSec ? String(lesson.targetDurationSec) : '',
      targetWordCount: lesson.targetWordCount ? String(lesson.targetWordCount) : '',
    });
    setShowEditor(true);
  };

  const handleDuplicate = (lesson: Lesson) => {
    const now = Date.now();
    onSaveLesson({
      ...lesson,
      id: `custom-lesson-${now}`,
      title: `${lesson.title} (Copy)`,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    });
    setStatusMessage(`Duplicated "${lesson.title}".`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.text.trim()) return;
    const now = Date.now();
    const lesson: Lesson = {
      id: form.id || `custom-lesson-${now}`,
      title: form.title.trim(),
      description: form.description.trim() || 'Custom Bangla typing practice lesson.',
      category: form.category,
      difficulty: form.difficulty,
      layoutId: form.layoutId,
      text: form.text.trim(),
      targetDurationSec: form.targetDurationSec ? Number(form.targetDurationSec) : undefined,
      targetWordCount: form.targetWordCount
        ? Number(form.targetWordCount)
        : countWords(form.text),
      isCustom: true,
      createdAt: form.id ? now : now,
      updatedAt: now,
    };
    onSaveLesson(lesson);
    setShowEditor(false);
    setStatusMessage(`Saved lesson "${lesson.title}".`);
  };

  const handleExportAllJson = () => {
    const exportList = customLessons.length > 0 ? customLessons : PREDEFINED_LESSONS;
    downloadTextFile(
      'bangla-typing-lessons.json',
      JSON.stringify(exportList, null, 2),
      'application/json'
    );
    setStatusMessage(`Exported ${exportList.length} lessons as JSON.`);
  };

  const handleExportLessonTxt = (lesson: Lesson) => {
    const safeName = lesson.title.replace(/[^\w\u0980-\u09FF-]+/g, '_').slice(0, 40);
    downloadTextFile(`${safeName || 'lesson'}.txt`, lesson.text, 'text/plain');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = String(reader.result || '');
        if (file.name.toLowerCase().endsWith('.json')) {
          const parsed = JSON.parse(content);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          const imported: Lesson[] = list
            .filter((item) => item && typeof item.text === 'string' && item.text.trim())
            .map((item, idx) => ({
              id: `imported-${Date.now()}-${idx}`,
              title: String(item.title || `Imported Lesson ${idx + 1}`),
              description: String(item.description || 'Imported from JSON'),
              category: (item.category as LessonCategory) || 'Custom',
              difficulty: (item.difficulty as Difficulty) || 'intermediate',
              layoutId: (item.layoutId as LayoutId | 'any') || 'any',
              text: String(item.text).trim(),
              targetDurationSec: item.targetDurationSec ? Number(item.targetDurationSec) : undefined,
              targetWordCount: countWords(String(item.text)),
              isCustom: true,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }));
          if (imported.length === 0) throw new Error('No valid lessons found in JSON.');
          onImportLessons(imported);
          setStatusMessage(`Imported ${imported.length} lesson(s) from JSON.`);
        } else {
          // TXT file becomes a new custom lesson
          const trimmed = content.trim();
          if (!trimmed) throw new Error('TXT file is empty.');
          const title = file.name.replace(/\.txt$/i, '');
          onImportLessons([
            {
              id: `imported-txt-${Date.now()}`,
              title,
              description: `Imported from ${file.name}`,
              category: 'Custom',
              difficulty: 'intermediate',
              layoutId: 'any',
              text: trimmed,
              targetWordCount: countWords(trimmed),
              isCustom: true,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ]);
          setStatusMessage(`Imported "${title}" from TXT.`);
        }
      } catch (err) {
        setStatusMessage(
          err instanceof Error ? err.message : 'Unable to parse imported lesson file.'
        );
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Lessons &amp; Custom Lesson Creator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Structured beginner-to-advanced curriculum plus unlimited custom lessons with JSON &amp; TXT import/export.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt,application/json,text/plain"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Import JSON / TXT
            </button>
            <button
              type="button"
              onClick={handleExportAllJson}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Lesson
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="flex items-center justify-between text-xs text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-lg px-3.5 py-2">
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-teal-600 dark:text-teal-300 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lessons by title or Bangla words..."
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-2 focus:outline-teal-600"
            />
          </div>
          <select
            aria-label="Filter by difficulty"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
            className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900/80">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-10 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No lessons match your current filters.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-700 text-white hover:bg-teal-800"
          >
            <Plus className="w-4 h-4" />
            Create Custom Lesson
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson) => {
            const wordCount = countWords(lesson.text);
            return (
              <div
                key={lesson.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span>{lesson.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{lesson.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">{wordCount} words</span>
                      {lesson.targetDurationSec && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tabular">{lesson.targetDurationSec}s</span>
                        </>
                      )}
                    </div>
                    {lesson.isCustom && (
                      <span className="text-teal-700 dark:text-teal-300 font-medium shrink-0">
                        Custom
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-bangla-siliguri">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lesson.description}
                  </p>
                  <p className="font-bangla-siliguri text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 rounded-lg px-3 py-2 line-clamp-2 leading-relaxed">
                    {lesson.text}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(lesson)}
                      title="Duplicate lesson"
                      className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportLessonTxt(lesson)}
                      title="Export as TXT"
                      className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {lesson.isCustom && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditModal(lesson)}
                          title="Edit or rename lesson"
                          className="p-1.5 rounded-md text-slate-500 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLesson(lesson.id)}
                          title="Delete lesson"
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartLesson(lesson)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Practice Lesson
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Lesson Modal */}
      {showEditor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Lesson Editor"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <form
            onSubmit={handleFormSubmit}
            className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-6 space-y-4 shadow-xl my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {form.id ? 'Edit Lesson' : 'Create Custom Lesson'}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., যুক্তবর্ণ অনুশীলন — সপ্তাহ ১"
                  className="w-full h-10 px-3 text-sm font-bangla-siliguri rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-2 focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short goal or focus of this lesson"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-2 focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value as LessonCategory }))
                    }
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))
                    }
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Typing Method
                  </label>
                  <select
                    value={form.layoutId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, layoutId: e.target.value as LayoutId | 'any' }))
                    }
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="any">Any Active Layout</option>
                    {allLayouts.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Duration (sec, optional)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={1800}
                    value={form.targetDurationSec}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, targetDurationSec: e.target.value }))
                    }
                    placeholder="e.g., 120"
                    className="w-full h-9 px-3 text-xs font-mono-tabular rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Words (optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={form.targetWordCount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, targetWordCount: e.target.value }))
                    }
                    placeholder="Auto-calculated"
                    className="w-full h-9 px-3 text-xs font-mono-tabular rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Practice Text (Bangla or mixed Bangla-English)
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.text}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  placeholder="Paste or type your Bangla practice passage here..."
                  className="w-full p-3 text-sm font-bangla-siliguri rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-2 focus:outline-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white"
              >
                Save Lesson
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
