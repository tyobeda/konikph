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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pksart_theme') as Theme | null;
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          return saved;
        }
      } catch {}
    }
    return 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch {}
    }
    return false;
  });

  const [mounted, setMounted] = useState<boolean>(false);

  // Initialize theme from localStorage and detect system preference
  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('pksart_theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        setThemeState(savedTheme);
      }
    } catch {
      // Ignore localStorage errors
    }

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

  // Apply theme class to documentElement only when mounted and needed, preventing any flash
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    const root = document.documentElement;
    const currentlyDark = root.classList.contains('dark');

    if (isDark) {
      if (!currentlyDark) {
        root.classList.add('dark');
      }
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      if (currentlyDark) {
        root.classList.remove('dark');
      }
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [isDark, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('pksart_theme', newTheme);
    } catch {
      // Ignore
    }
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
