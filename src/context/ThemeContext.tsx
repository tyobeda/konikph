'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

/** Write theme to both localStorage and cookie (cookie dipakai server untuk SSR tanpa flash) */
function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem('koni_theme', theme);
  } catch {
    // Ignore
  }
  try {
    // Cookie dibaca layout.tsx saat SSR — max-age 1 tahun
    document.cookie = `koni_theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Ignore
  }
}

/** Baca tema tersimpan dari localStorage atau cookie */
function readSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem('koni_theme') as Theme | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    // Ignore
  }
  // Fallback ke cookie jika localStorage kosong
  try {
    const match = document.cookie.match(/(?:^|;\s*)koni_theme=([^;]+)/);
    const cookieVal = match?.[1] as Theme | undefined;
    if (cookieVal === 'light' || cookieVal === 'dark' || cookieVal === 'system') return cookieVal;
  } catch {
    // Ignore
  }
  return 'system';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(readSavedTheme);

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch {}
    }
    return false;
  });

  const [mounted, setMounted] = useState<boolean>(false);

  // Setelah mount: sync state & pasang listener perubahan system preference
  useEffect(() => {
    setMounted(true);
    setThemeState(readSavedTheme());

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemIsDark(mediaQuery.matches);

    const handleSystemChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    return systemIsDark ? 'dark' : 'light';
  }, [theme, systemIsDark]);

  const isDark = resolvedTheme === 'dark';

  // Sinkronkan class pada <html> setiap kali tema berubah (setelah mount)
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [isDark, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    persistTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
