import React, { useMemo, useRef, useState } from 'react';
import { FileUp, Play, Save, Trash2, FileText } from 'lucide-react';
import { countWords, normalizeBangla, segmentBanglaGraphemes } from '../core/unicode';
import type { SavedCustomText } from '../types';

interface CustomTextPracticeProps {
  savedTexts: SavedCustomText[];
  onStartCustomText: (title: string, text: string) => void;
  onSaveCustomText: (item: SavedCustomText) => void;
  onDeleteCustomText: (id: string) => void;
}

const SAMPLE_PASSAGES = [
  {
    title: 'বিশ্ববিদ্যালয় ও প্রযুক্তি অনুচ্ছেদ',
    text: 'বিশ্ববিদ্যালয় ও আধুনিক প্রযুক্তি আমাদের চিন্তাভাবনা এবং দৃষ্টিভঙ্গিকে প্রসারিত করেছে।\nপ্রতিযোগিতামূলক বিশ্বে স্বাধীনতা ও সৃজনশীলতা বজায় রাখা অত্যন্ত গুরুত্বপূর্ণ।',
  },
  {
    title: 'Mixed Bangla-English Technical Note',
    text: 'বাংলা Unicode (UTF-8) ব্যবহার করে Firefox WebExtension-এ দ্রুত বাংলা টাইপ করা যায়।\nAvro Phonetic এবং Bijoy Classic—উভয় লেআউটেই Grapheme-aware accuracy calculation সমর্থিত।',
  },
  {
    title: 'পরীক্ষার প্রশ্নোত্তর ও বিরামচিহ্ন',
    text: 'প্রশ্ন ১: বাংলা ভাষায় যুক্তবর্ণ ও কারচিহ্নের সঠিক ব্যবহার কেন গুরুত্বপূর্ণ?\nউত্তর: নির্ভুল বানান, স্পষ্ট উচ্চারণ এবং পেশাদার নথিপত্র তৈরির জন্য যুক্তবর্ণের দক্ষতা অপরিহার্য।',
  },
];

export const CustomTextPractice: React.FC<CustomTextPracticeProps> = ({
  savedTexts,
  onStartCustomText,
  onSaveCustomText,
  onDeleteCustomText,
}) => {
  const [title, setTitle] = useState('Custom Bangla Passage');
  const [text, setText] = useState(SAMPLE_PASSAGES[0].text);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const normalized = normalizeBangla(text);
    return {
      graphemes: segmentBanglaGraphemes(normalized).length,
      words: countWords(normalized),
      lines: normalized ? normalized.split('\n').length : 0,
    };
  }, [text]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = normalizeBangla(String(reader.result || ''));
      setText(content);
      setTitle(file.name.replace(/\.txt$/i, ''));
      setUploadNotice(`Loaded "${file.name}" (${countWords(content)} words).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleSave = () => {
    if (!text.trim()) return;
    onSaveCustomText({
      id: `custom-txt-${Date.now()}`,
      title: title.trim() || 'Untitled Passage',
      text: normalizeBangla(text),
      createdAt: Date.now(),
    });
    setUploadNotice(`Saved "${title.trim() || 'Untitled Passage'}" locally.`);
  };

  const handleStart = () => {
    const cleaned = normalizeBangla(text).trim();
    if (!cleaned) return;
    onStartCustomText(title.trim() || 'Custom Text Practice', cleaned);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* Main Editor */}
      <div className="xl:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Custom Text Practice
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Paste textbook passages, exam questions, mixed Bangla-English articles, or upload any UTF-8 TXT file. Preserves punctuation, spaces, and line breaks.
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <FileUp className="w-4 h-4" />
              Upload TXT File
            </button>
          </div>
        </div>

        {uploadNotice && (
          <div className="flex items-center justify-between text-xs text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-lg px-3.5 py-2">
            <span>{uploadNotice}</span>
            <button
              type="button"
              onClick={() => setUploadNotice(null)}
              className="hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Passage Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title for your custom practice session"
            className="w-full h-10 px-3.5 text-sm font-bangla-siliguri rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-2 focus:outline-teal-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Practice Text
            </label>
            <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
              {stats.graphemes} graphemes · {stats.words} words · {stats.lines} lines
            </span>
          </div>
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste unlimited Bangla or mixed Bangla-English text here..."
            className="w-full p-4 text-base font-bangla-siliguri leading-relaxed rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-2 focus:outline-teal-600"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setText('')}
            className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
          >
            Clear text
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!text.trim()}
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 h-10 px-4 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <Save className="w-4 h-4" />
              Save Locally
            </button>
            <button
              type="button"
              disabled={!text.trim()}
              onClick={handleStart}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4" />
              Practice This Text
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Quick Samples & Saved Passages */}
      <div className="xl:col-span-4 space-y-5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Quick Sample Passages
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {SAMPLE_PASSAGES.map((sample) => (
              <button
                key={sample.title}
                type="button"
                onClick={() => {
                  setTitle(sample.title);
                  setText(sample.text);
                }}
                className="w-full py-2.5 text-left group"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 font-bangla-siliguri">
                  {sample.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 font-bangla-siliguri">
                  {sample.text}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A26] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Saved Custom Passages
            </h3>
            <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
              {savedTexts.length}
            </span>
          </div>
          {savedTexts.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save passages on the left to build your personal study library.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {savedTexts.map((item) => (
                <div key={item.id} className="py-2.5 flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle(item.title);
                      setText(item.text);
                    }}
                    className="flex-1 text-left min-w-0 group"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 truncate font-bangla-siliguri flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-bangla-siliguri">
                      {item.text}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomText(item.id)}
                    title="Delete saved passage"
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
