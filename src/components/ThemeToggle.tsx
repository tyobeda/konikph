'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, Theme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'dropdown' | 'inline';
  buttonClassName?: string;
  order?: ('dark' | 'system' | 'light')[];
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'dropdown',
  buttonClassName,
  order = ['dark', 'system', 'light'],
}) => {
  const { theme, resolvedTheme, setTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-800 animate-pulse ${className}`} />
    );
  }

  // Quick 1-click icon toggle
  if (variant === 'icon') {
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={
          buttonClassName ||
          `relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 focus:outline-none ${className}`
        }
        aria-label="Ganti mode tema"
        title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      >
        {isDark ? (
          <Sun size={18} className="text-amber-400 rotate-0 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon size={18} className={buttonClassName ? "text-slate-300 hover:text-white transition-colors" : "text-gray-600 rotate-0 transition-transform duration-300 hover:-rotate-12"} />
        )}
      </button>
    );
  }

  // Inline 3-state segmented switch
  if (variant === 'inline') {
    const allOptions: Record<Theme, { key: Theme; label: string; icon: typeof Sun }> = {
      dark: { key: 'dark', label: 'Dark', icon: Moon },
      system: { key: 'system', label: 'System', icon: Laptop },
      light: { key: 'light', label: 'Light', icon: Sun },
    };
    const options = order.map((k) => allOptions[k]);

    return (
      <div
        role="group"
        aria-label="Pengaturan Mode Tampilan"
        className={`inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs transition-colors duration-200 ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTheme(opt.key)}
              aria-pressed={isSelected}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isSelected
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon
                size={14}
                className={
                  isSelected && opt.key === 'dark'
                    ? 'text-indigo-400'
                    : isSelected && opt.key === 'light'
                    ? 'text-amber-500'
                    : isSelected && opt.key === 'system'
                    ? 'text-[#F26522]'
                    : 'text-gray-400 dark:text-gray-500'
                }
              />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown variant (Header default)
  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          buttonClassName ||
          "relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 focus:outline-none"
        }
        aria-label="Pilih tema tampilan"
        title="Ganti Tema (Terang / Gelap / Sistem)"
      >
        {isDark ? (
          <Sun size={18} className="text-amber-400" />
        ) : (
          <Moon size={18} className={buttonClassName ? "text-slate-300 hover:text-white transition-colors" : "text-gray-600 dark:text-gray-300"} />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Tema Tampilan
          </div>

          <button
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
              theme === 'light'
                ? 'text-[#F26522] font-bold bg-orange-50/50 dark:bg-orange-950/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun size={15} className="text-amber-500" />
              <span>Mode Terang</span>
            </div>
            {theme === 'light' && <Check size={14} className="text-[#F26522]" />}
          </button>

          <button
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
              theme === 'dark'
                ? 'text-[#F26522] font-bold bg-orange-50/50 dark:bg-orange-950/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon size={15} className="text-blue-400" />
              <span>Mode Gelap</span>
            </div>
            {theme === 'dark' && <Check size={14} className="text-[#F26522]" />}
          </button>

          <button
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
              theme === 'system'
                ? 'text-[#F26522] font-bold bg-orange-50/50 dark:bg-orange-950/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'
            }`}
          >
            <div className="flex items-center gap-2">
              <Laptop size={15} className="text-gray-500 dark:text-gray-400" />
              <span>Ikuti Sistem</span>
            </div>
            {theme === 'system' && <Check size={14} className="text-[#F26522]" />}
          </button>
        </div>
      )}
    </div>
  );
};
