import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PopupView } from './components/PopupView';
import { createInitialStorageData, loadAppData, saveAppData } from './core/storage';
import type { AppRoute, AppStorageData, LayoutId } from './types';

function applyThemeClass(theme: AppStorageData['settings']['theme']) {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
}

const PopupApp: React.FC = () => {
  const [data, setData] = useState<AppStorageData>(() => createInitialStorageData());

  useEffect(() => {
    loadAppData().then((loaded) => {
      setData(loaded);
      applyThemeClass(loaded.settings.theme);
    });
  }, []);

  const handleChangeLayout = (layoutId: LayoutId) => {
    setData((prev) => {
      const next = { ...prev, settings: { ...prev.settings, layoutId } };
      saveAppData(next);
      return next;
    });
  };

  const handleNavigate = (route: AppRoute, mode?: 'timed' | 'weak') => {
    const hash = mode ? `${route}?mode=${mode}` : route;
    const g = globalThis as unknown as {
      browser?: {
        tabs?: { create: (opts: { url: string }) => void };
        runtime?: { getURL: (path: string) => string };
      };
      chrome?: {
        tabs?: { create: (opts: { url: string }) => void };
        runtime?: { getURL: (path: string) => string };
      };
    };
    const ext = g.browser ?? g.chrome;
    if (ext?.tabs && ext?.runtime) {
      ext.tabs.create({ url: ext.runtime.getURL(`index.html#${hash}`) });
      window.close();
    } else {
      window.location.href = `index.html#${hash}`;
    }
  };

  return (
    <PopupView
      data={data}
      onChangeLayout={handleChangeLayout}
      onNavigate={handleNavigate}
    />
  );
};

const rootEl = document.getElementById('popup-root');
if (rootEl) {
  createRoot(rootEl).render(<PopupApp />);
}
