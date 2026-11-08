import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: EffectiveTheme;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'dex_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {}
    return 'dark'; // Padrão Dex elegante (Navy profundo)
  });

  const getSystemTheme = useCallback((): EffectiveTheme => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }, []);

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() => {
    if (themeMode === 'system') {
      return getSystemTheme();
    }
    return themeMode;
  });

  // Atualiza classe no documentElement e sincroniza
  const applyTheme = useCallback((effective: EffectiveTheme) => {
    const root = document.documentElement;
    if (effective === 'dark') {
      root.classList.add('dark');
      root.classList.remove('theme-light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('theme-light');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Monitorar preferências do sistema operacional quando em modo 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemChange = () => {
      if (themeMode === 'system') {
        const nextEffective = mediaQuery.matches ? 'dark' : 'light';
        setEffectiveTheme(nextEffective);
        applyTheme(nextEffective);
      }
    };

    if (themeMode === 'system') {
      const nextEffective = mediaQuery.matches ? 'dark' : 'light';
      setEffectiveTheme(nextEffective);
      applyTheme(nextEffective);
    } else {
      setEffectiveTheme(themeMode);
      applyTheme(themeMode);
    }

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themeMode, applyTheme]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Erro ao salvar tema no localStorage:', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState(prev => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        effectiveTheme,
        isDark: effectiveTheme === 'dark',
        setThemeMode,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

