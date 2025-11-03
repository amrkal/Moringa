'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type FontSize = 'small' | 'normal' | 'large' | 'extra-large';
export type ColorMode = 'light' | 'dark' | 'system';
export type ThemeName = 'moringa' | 'emerald' | 'rose' | 'violet' | 'sky' | 'amber';

interface AccessibilitySettings {
  colorMode: ColorMode;
  fontSize: FontSize;
  highContrast: boolean;
  reducedMotion: boolean;
  theme: ThemeName;
  colorBlind: boolean;
}

interface AccessibilityContextValue extends AccessibilitySettings {
  setColorMode: (mode: ColorMode) => void;
  setFontSize: (size: FontSize) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  resetSettings: () => void;
  isDarkMode: boolean;
  setTheme: (theme: ThemeName) => void;
  setColorBlind: (enabled: boolean) => void;
}

const defaultSettings: AccessibilitySettings = {
  colorMode: 'system',
  fontSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  theme: 'moringa',
  colorBlind: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('accessibility-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Failed to parse accessibility settings', e);
      }
    }

    // Check system preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !stored) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply color mode (dark/light/system) with explicit classes
  // Rules:
  // - 'dark': add .dark, remove .light
  // - 'light': add .light, remove .dark (prevents @media dark override)
  // - 'system': remove both .dark and .light, let prefers-color-scheme drive it
  useEffect(() => {
    const root = document.documentElement;

    // Determine dark state for consumers
    let shouldBeDark = false;
    if (settings.colorMode === 'dark') {
      shouldBeDark = true;
    } else if (settings.colorMode === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setIsDarkMode(shouldBeDark);

    // Reset classes first
    root.classList.remove('dark', 'light');

    if (settings.colorMode === 'dark') {
      root.classList.add('dark');
    } else if (settings.colorMode === 'light') {
      // Explicit light should suppress the @media dark block (:root:not(.light))
      root.classList.add('light');
    }
  }, [settings.colorMode]);

  // Apply font size class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large');
    root.classList.add(`font-${settings.fontSize}`);
  }, [settings.fontSize]);

  // Apply high contrast
  useEffect(() => {
    const root = document.documentElement;
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings.highContrast]);

  // Apply color theme class
  useEffect(() => {
    const root = document.documentElement;
    const themes: ThemeName[] = ['moringa', 'emerald', 'rose', 'violet', 'sky', 'amber'];
    themes.forEach(t => root.classList.remove(`theme-${t}`));
    root.classList.add(`theme-${settings.theme}`);
  }, [settings.theme]);

  // Apply reduced motion
  useEffect(() => {
    const root = document.documentElement;
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [settings.reducedMotion]);

  // Apply color blind friendly mode
  useEffect(() => {
    const root = document.documentElement;
    if (settings.colorBlind) {
      root.classList.add('color-blind');
    } else {
      root.classList.remove('color-blind');
    }
  }, [settings.colorBlind]);

  const setColorMode = (mode: ColorMode) => {
    setSettings(prev => ({ ...prev, colorMode: mode }));
  };

  const setFontSize = (size: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const setHighContrast = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, highContrast: enabled }));
  };

  const setReducedMotion = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, reducedMotion: enabled }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const setTheme = (theme: ThemeName) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const setColorBlind = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, colorBlind: enabled }));
  };

  const value: AccessibilityContextValue = {
    ...settings,
    setColorMode,
    setFontSize,
    setHighContrast,
    setReducedMotion,
    resetSettings,
    isDarkMode,
    setTheme,
    setColorBlind,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
