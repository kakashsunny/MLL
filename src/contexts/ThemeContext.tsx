import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'neuraforge_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Permanently light theme - dark mode removed per user request
  const theme: Theme = 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    root.classList.remove('dark');
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    // No-op: dark mode removed
  };

  const setTheme = () => {
    // No-op: dark mode removed
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme, setTheme, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
