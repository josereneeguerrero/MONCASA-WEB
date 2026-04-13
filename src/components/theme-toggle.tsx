'use client';

import { useEffect } from 'react';

type ThemeMode = 'light' | 'dark';
type ThemePreference = ThemeMode | 'system';

const storageKey = 'moncasa-theme';

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference): ThemeMode {
  if (preference === 'system') {
    return getSystemTheme();
  }

  return preference;
}

function getStoredPreference(): ThemePreference {
  const storedTheme = window.localStorage.getItem(storageKey);

  if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
    return storedTheme;
  }

  return 'system';
}

function applyThemeFromPreference(preference: ThemePreference) {
  const theme = resolveTheme(preference);
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const ensureInitialPreference = () => {
      if (!window.localStorage.getItem(storageKey)) {
        window.localStorage.setItem(storageKey, 'system');
      }
    };

    const syncTheme = () => {
      const preference = getStoredPreference();
      applyThemeFromPreference(preference);
    };

    const onSystemChange = () => {
      if (getStoredPreference() === 'system') {
        applyThemeFromPreference('system');
      }
    };

    const onStorageChange = (event: StorageEvent) => {
      if (!event.key || event.key === storageKey) {
        syncTheme();
      }
    };

    ensureInitialPreference();
    syncTheme();

    mediaQuery.addEventListener('change', onSystemChange);
    window.addEventListener('storage', onStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', onSystemChange);
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const nextTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';
    window.localStorage.setItem(storageKey, nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed right-4 top-4 z-50 grid h-12 w-12 place-items-center rounded-full border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] text-[var(--color-moncasa-text)] shadow-[0_16px_50px_var(--color-moncasa-shadow)] transition hover:-translate-y-0.5 hover:bg-[var(--color-moncasa-surface-soft)] sm:right-6 sm:top-6"
      aria-label="Cambiar tema"
      title="Cambiar tema"
      suppressHydrationWarning
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m4.93 19.07 1.41-1.41" />
        <path d="m17.66 6.34 1.41-1.41" />
      </svg>
    </button>
  );
}