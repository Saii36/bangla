import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  FileText,
  Grid2x2,
  Keyboard,
  Layers,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { CharacterPracticeBuilder } from './components/CharacterPracticeBuilder';
import { CustomTextPractice } from './components/CustomTextPractice';
import { LayoutsExplorer } from './components/LayoutsExplorer';
import { LessonManager } from './components/LessonManager';
import { PopupView } from './components/PopupView';
import { ProgressDashboard } from './components/ProgressDashboard';
import { SettingsView } from './components/SettingsView';
import { TypingArena } from './components/TypingArena';
import { getLayoutById } from './core/layouts/registry';
import { buildPracticeForMode, generateCustomCharacterDrill } from './core/practiceGenerator';
import {
  createInitialStorageData,
  loadAppData,
  recordSessionInData,
  saveAppData,
} from './core/storage';
import type {
  ActivePracticeConfig,
  AppRoute,
  AppStorageData,
  CustomCharSet,
  Difficulty,
  LayoutId,
  Lesson,
  PracticeMode,
  SavedCustomText,
  TypingSessionResult,
  UserSettings,
} from './types';

const NAV_ITEMS: Array<{ id: AppRoute; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'practice', label: 'Typing Studio', icon: Keyboard },
  { id: 'characters', label: 'Character Drills', icon: Grid2x2 },
  { id: 'lessons', label: 'Lessons', icon: BookOpen },
  { id: 'custom', label: 'Custom Text', icon: FileText },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'layouts', label: 'Layouts & Guides', icon: Layers },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const ROUTE_TITLES: Record<AppRoute, string> = {
  practice: 'Typing Studio',
  characters: 'Customizable Character Practice',
  lessons: 'Lessons & Lesson Creator',
  custom: 'Custom Text Practice',
  progress: 'Progress Dashboard',
  layouts: 'Bangla Keyboard Layouts',
  settings: 'Settings & Extension',
};

function parseHashRoute(): { route: AppRoute; mode?: PracticeMode } {
  if (typeof window === 'undefined') return { route: 'practice' };
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return { route: 'practice' };
  const [pathPart, queryPart] = raw.split('?');
  const validRoutes: AppRoute[] = [
    'practice',
    'characters',
    'lessons',
    'custom',
    'progress',
    'layouts',
    'settings',
  ];
  const route = validRoutes.includes(pathPart as AppRoute)
    ? (pathPart as AppRoute)
    : 'practice';
  const params = new URLSearchParams(queryPart || '');
  const modeParam = params.get('mode') as PracticeMode | null;
  return { route, mode: modeParam ?? undefined };
}

export default function App() {
  const [data, setData] = useState<AppStorageData>(() => createInitialStorageData());
  const [hydrated, setHydrated] = useState(false);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(() => parseHashRoute().route);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPopupPreview, setShowPopupPreview] = useState(false);

  const [practiceConfig, setPracticeConfig] = useState<ActivePracticeConfig>(() =>
    buildPracticeForMode('word', 'beginner')
  );

  // Hydrate persistent browser.storage.local / localStorage on mount
  useEffect(() => {
    let active = true;
    loadAppData().then((loaded) => {
      if (!active) return;
      setData(loaded);
      setHydrated(true);

      const initial = parseHashRoute();
      if (initial.mode) {
        setPracticeConfig(
          buildPracticeForMode(initial.mode, loaded.settings.difficulty, {
            durationSec: loaded.settings.testDurationSec,
            maxErrors: loaded.settings.accuracyModeMaxErrors,
            mistakeTotals: loaded.charMistakeTotals,
          })
        );
      } else {
        setPracticeConfig(
          buildPracticeForMode('word', loaded.settings.difficulty, {
            durationSec: loaded.settings.testDurationSec,
            maxErrors: loaded.settings.accuracyModeMaxErrors,
            mistakeTotals: loaded.charMistakeTotals,
          })
        );
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist changes whenever state updates after hydration
  useEffect(() => {
    if (!hydrated) return;
    saveAppData(data);
  }, [data, hydrated]);

  // Apply light/dark theme to <html> reliably
  useEffect(() => {
    const theme = data.settings.theme;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    if (theme === 'system') {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [data.settings.theme]);

  const updateSetting = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      setData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          [key]: value,
        },
      }));
    },
    []
  );

  const toggleLightDark = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    updateSetting('theme', isCurrentlyDark ? 'light' : 'dark');
  };

  const handleSelectMode = useCallback(
    (mode: PracticeMode, durationOverride?: number) => {
      if (mode === 'custom') {
        setActiveRoute('custom');
        return;
      }
      const durationSec = durationOverride ?? data.settings.testDurationSec;
      if (durationOverride) {
        updateSetting('testDurationSec', durationOverride);
      }
      setPracticeConfig(
        buildPracticeForMode(mode, data.settings.difficulty, {
          durationSec,
          maxErrors: data.settings.accuracyModeMaxErrors,
          mistakeTotals: data.charMistakeTotals,
        })
      );
      setActiveRoute('practice');
    },
    [
      data.settings.difficulty,
      data.settings.testDurationSec,
      data.settings.accuracyModeMaxErrors,
      data.charMistakeTotals,
      updateSetting,
    ]
  );

  const handleChangeDifficulty = useCallback(
    (difficulty: Difficulty) => {
      updateSetting('difficulty', difficulty);
      setPracticeConfig((prev) =>
        buildPracticeForMode(prev.mode, difficulty, {
          durationSec: prev.durationSec ?? data.settings.testDurationSec,
          maxErrors: data.settings.accuracyModeMaxErrors,
          mistakeTotals: data.charMistakeTotals,
        })
      );
    },
    [
      updateSetting,
      data.settings.testDurationSec,
      data.settings.accuracyModeMaxErrors,
      data.charMistakeTotals,
    ]
  );

  const handleRegenerate = useCallback(() => {
    setPracticeConfig((prev) => {
      if (prev.regenerateOptions) {
        const opts = prev.regenerateOptions;
        return {
          ...prev,
          text: generateCustomCharacterDrill({
            chars: opts.chars,
            includeCombinations: opts.includeCombinations,
            randomize: opts.randomize,
            repeatDifficult: opts.repeatDifficult,
            count: opts.count,
            mistakeTotals: data.charMistakeTotals,
          }),
        };
      }
      return buildPracticeForMode(prev.mode, data.settings.difficulty, {
        durationSec: prev.durationSec ?? data.settings.testDurationSec,
        maxErrors: data.settings.accuracyModeMaxErrors,
        mistakeTotals: data.charMistakeTotals,
      });
    });
  }, [
    data.charMistakeTotals,
    data.settings.difficulty,
    data.settings.testDurationSec,
    data.settings.accuracyModeMaxErrors,
  ]);

  const handleCompleteSession = useCallback((result: TypingSessionResult) => {
    setData((prev) => recordSessionInData(prev, result));
  }, []);

  const handlePracticeWeakChars = useCallback(
    (chars: string[]) => {
      const text = generateCustomCharacterDrill({
        chars,
        includeCombinations: true,
        randomize: true,
        repeatDifficult: true,
        count: 34,
        mistakeTotals: data.charMistakeTotals,
      });
      setPracticeConfig({
        mode: 'weak',
        title: `Targeted Weak Drill (${chars.slice(0, 5).join(' ')})`,
        text,
        sourceChars: chars,
        allowRegenerate: true,
        regenerateOptions: {
          chars,
          includeCombinations: true,
          randomize: true,
          repeatDifficult: true,
          count: 34,
        },
      });
      setActiveRoute('practice');
    },
    [data.charMistakeTotals]
  );

  const handleStartCustomDrill = useCallback(
    (params: {
      title: string;
      text: string;
      chars: string[];
      includeCombinations: boolean;
      randomize: boolean;
      repeatDifficult: boolean;
      count: number;
    }) => {
      setPracticeConfig({
        mode: 'character',
        title: params.title,
        text: params.text,
        sourceChars: params.chars,
        allowRegenerate: true,
        regenerateOptions: {
          chars: params.chars,
          includeCombinations: params.includeCombinations,
          randomize: params.randomize,
          repeatDifficult: params.repeatDifficult,
          count: params.count,
        },
      });
      setActiveRoute('practice');
    },
    []
  );

  const handleStartLesson = useCallback(
    (lesson: Lesson) => {
      if (lesson.layoutId !== 'any') {
        updateSetting('layoutId', lesson.layoutId);
      }
      setPracticeConfig({
        mode: lesson.targetDurationSec ? 'timed' : 'paragraph',
        title: lesson.title,
        text: lesson.text,
        lessonId: lesson.id,
        durationSec: lesson.targetDurationSec,
        allowRegenerate: false,
      });
      setActiveRoute('practice');
    },
    [updateSetting]
  );

  const handleStartCustomText = useCallback((title: string, text: string) => {
    setPracticeConfig({
      mode: 'custom',
      title,
      text,
      allowRegenerate: false,
    });
    setActiveRoute('practice');
  }, []);

  const handleSaveCharSet = (set: CustomCharSet) => {
    setData((prev) => ({
      ...prev,
      customCharSets: [set, ...prev.customCharSets],
    }));
  };

  const handleDeleteCharSet = (id: string) => {
    setData((prev) => ({
      ...prev,
      customCharSets: prev.customCharSets.filter((s) => s.id !== id),
    }));
  };

  const handleSaveLesson = (lesson: Lesson) => {
    setData((prev) => {
      const exists = prev.customLessons.some((l) => l.id === lesson.id);
      return {
        ...prev,
        customLessons: exists
          ? prev.customLessons.map((l) => (l.id === lesson.id ? lesson : l))
          : [lesson, ...prev.customLessons],
      };
    });
  };

  const handleDeleteLesson = (id: string) => {
    setData((prev) => ({
      ...prev,
      customLessons: prev.customLessons.filter((l) => l.id !== id),
    }));
  };

  const handleImportLessons = (lessons: Lesson[]) => {
    setData((prev) => ({
      ...prev,
      customLessons: [...lessons, ...prev.customLessons],
    }));
  };

  const handleSaveCustomText = (item: SavedCustomText) => {
    setData((prev) => ({
      ...prev,
      savedCustomTexts: [item, ...prev.savedCustomTexts],
    }));
  };

  const handleDeleteCustomText = (id: string) => {
    setData((prev) => ({
      ...prev,
      savedCustomTexts: prev.savedCustomTexts.filter((t) => t.id !== id),
    }));
  };

  const { bestWpm, averageWpm } = useMemo(() => {
    if (data.sessions.length === 0) return { bestWpm: 0, averageWpm: 0 };
    const best = data.sessions.reduce((m, s) => Math.max(m, s.wpmStandard), 0);
    const avg = Math.round(
      data.sessions.reduce((sum, s) => sum + s.wpmStandard, 0) / data.sessions.length
    );
    return { bestWpm: best, averageWpm: avg };
  }, [data.sessions]);

  const activeLayout = useMemo(
    () => getLayoutById(data.settings.layoutId),
    [data.settings.layoutId]
  );

  const navigate = (route: AppRoute) => {
    setActiveRoute(route);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${route}`);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0B111B] text-slate-900 dark:text-slate-100">
      {/* Desktop Left Workspace Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101723]">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bangla-siliguri font-bold text-lg shrink-0">
            ব
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            Bangla Typing Master
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeRoute === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => navigate(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quiet Local Summary Footer in Sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Active Layout</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
              {activeLayout.name}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Best / Avg Speed</span>
            <span className="font-mono-tabular font-semibold text-teal-700 dark:text-teal-300">
              {bestWpm} / {averageWpm} WPM
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] bg-white dark:bg-[#101723] border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Bangla Typing Master
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const active = activeRoute === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => navigate(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean Workspace Top Header */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101723] flex items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {ROUTE_TITLES[activeRoute]}
              </h1>
              <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">
                /
              </span>
              <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {activeLayout.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleLightDark}
              aria-label="Toggle light and dark theme"
              title="Toggle light and dark theme"
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
            </button>
            {activeRoute !== 'practice' && (
              <button
                type="button"
                onClick={() => navigate('practice')}
                className="h-9 px-3.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition-colors whitespace-nowrap shrink-0"
              >
                Resume Practice
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Route Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1280px] w-full mx-auto">
          {activeRoute === 'practice' && (
            <TypingArena
              config={practiceConfig}
              settings={data.settings}
              bestWpm={bestWpm}
              averageWpm={averageWpm}
              onSelectMode={handleSelectMode}
              onChangeLayout={(id) => updateSetting('layoutId', id)}
              onChangeDifficulty={handleChangeDifficulty}
              onToggleSetting={updateSetting}
              onRegenerate={handleRegenerate}
              onCompleteSession={handleCompleteSession}
              onPracticeWeakChars={handlePracticeWeakChars}
              onOpenProgress={() => navigate('progress')}
            />
          )}

          {activeRoute === 'characters' && (
            <CharacterPracticeBuilder
              activeLayoutId={data.settings.layoutId}
              customCharSets={data.customCharSets}
              charMistakeTotals={data.charMistakeTotals}
              onStartDrill={handleStartCustomDrill}
              onSaveCharSet={handleSaveCharSet}
              onDeleteCharSet={handleDeleteCharSet}
            />
          )}

          {activeRoute === 'lessons' && (
            <LessonManager
              customLessons={data.customLessons}
              onStartLesson={handleStartLesson}
              onSaveLesson={handleSaveLesson}
              onDeleteLesson={handleDeleteLesson}
              onImportLessons={handleImportLessons}
            />
          )}

          {activeRoute === 'custom' && (
            <CustomTextPractice
              savedTexts={data.savedCustomTexts}
              onStartCustomText={handleStartCustomText}
              onSaveCustomText={handleSaveCustomText}
              onDeleteCustomText={handleDeleteCustomText}
            />
          )}

          {activeRoute === 'progress' && (
            <ProgressDashboard
              sessions={data.sessions}
              charMistakeTotals={data.charMistakeTotals}
              onLaunchWeakChars={handlePracticeWeakChars}
              onLaunchMode={(mode) => handleSelectMode(mode)}
            />
          )}

          {activeRoute === 'layouts' && (
            <LayoutsExplorer
              activeLayoutId={data.settings.layoutId}
              onSelectLayout={(id) => updateSetting('layoutId', id)}
              onStartPracticeWithLayout={(id) => {
                updateSetting('layoutId', id);
                navigate('practice');
              }}
            />
          )}

          {activeRoute === 'settings' && (
            <SettingsView
              data={data}
              onUpdateSetting={updateSetting}
              onRestoreBackup={(next) => setData(next)}
              onResetProgress={() =>
                setData((prev) => ({
                  ...prev,
                  sessions: [],
                  charMistakeTotals: {},
                  charAttemptTotals: {},
                }))
              }
              onOpenPopupPreview={() => setShowPopupPreview(true)}
            />
          )}
        </main>
      </div>

      {/* Interactive Firefox Extension Popup Preview Modal */}
      {showPopupPreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Firefox Extension Popup Preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
          onClick={() => setShowPopupPreview(false)}
        >
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-xs text-slate-200 px-1">
              <span>Firefox Toolbar Popup Preview (popup.html)</span>
              <button
                type="button"
                onClick={() => setShowPopupPreview(false)}
                className="hover:underline"
              >
                Close
              </button>
            </div>
            <PopupView
              data={data}
              isEmbeddedPreview
              onChangeLayout={(id) => updateSetting('layoutId', id)}
              onNavigate={(route, mode) => {
                setShowPopupPreview(false);
                if (mode) {
                  handleSelectMode(mode);
                } else {
                  navigate(route);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
