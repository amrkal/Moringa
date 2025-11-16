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
  // New WCAG 2.1 AA features
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  readableFont: boolean;
  textSpacing: boolean;
  linkUnderlines: boolean;
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
  setScreenReaderOptimized: (enabled: boolean) => void;
  setKeyboardNavigation: (enabled: boolean) => void;
  setFocusIndicators: (enabled: boolean) => void;
  setReadableFont: (enabled: boolean) => void;
  setTextSpacing: (enabled: boolean) => void;
  setLinkUnderlines: (enabled: boolean) => void;
}

const defaultSettings: AccessibilitySettings = {
  colorMode: 'system',
  fontSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  theme: 'moringa',
  colorBlind: false,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  focusIndicators: true,
  readableFont: false,
  textSpacing: false,
  linkUnderlines: false,
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

    // Check system preference for high contrast
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    if (contrastQuery.matches && !stored) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply color mode
  useEffect(() => {
    const root = document.documentElement;

    let shouldBeDark = false;
    if (settings.colorMode === 'dark') {
      shouldBeDark = true;
    } else if (settings.colorMode === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setIsDarkMode(shouldBeDark);

    root.classList.remove('dark', 'light');
    if (settings.colorMode === 'dark') {
      root.classList.add('dark');
    } else if (settings.colorMode === 'light') {
      root.classList.add('light');
    }
  }, [settings.colorMode]);

  // Apply font size
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

  // Apply theme
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

  // Apply color blind mode
  useEffect(() => {
    const root = document.documentElement;
    if (settings.colorBlind) {
      root.classList.add('color-blind');
    } else {
      root.classList.remove('color-blind');
    }
  }, [settings.colorBlind]);

  // Apply screen reader optimizations
  useEffect(() => {
    const root = document.documentElement;
    if (settings.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
      // Set aria-live regions to be more verbose
      root.setAttribute('data-sr-verbose', 'true');
    } else {
      root.classList.remove('screen-reader-optimized');
      root.removeAttribute('data-sr-verbose');
    }
  }, [settings.screenReaderOptimized]);

  // Apply keyboard navigation enhancements
  useEffect(() => {
    const root = document.documentElement;
    if (settings.keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
  }, [settings.keyboardNavigation]);

  // Apply focus indicators
  useEffect(() => {
    const root = document.documentElement;
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  }, [settings.focusIndicators]);

  // Apply readable font (dyslexia-friendly)
  useEffect(() => {
    const root = document.documentElement;
    if (settings.readableFont) {
      root.classList.add('readable-font');
    } else {
      root.classList.remove('readable-font');
    }
  }, [settings.readableFont]);

  // Apply enhanced text spacing (WCAG 1.4.12)
  useEffect(() => {
    const root = document.documentElement;
    if (settings.textSpacing) {
      root.classList.add('enhanced-spacing');
    } else {
      root.classList.remove('enhanced-spacing');
    }
  }, [settings.textSpacing]);

  // Apply link underlines
  useEffect(() => {
    const root = document.documentElement;
    if (settings.linkUnderlines) {
      root.classList.add('underline-links');
    } else {
      root.classList.remove('underline-links');
    }
  }, [settings.linkUnderlines]);

  const setColorMode = (mode: ColorMode) => setSettings(prev => ({ ...prev, colorMode: mode }));
  const setFontSize = (size: FontSize) => setSettings(prev => ({ ...prev, fontSize: size }));
  const setHighContrast = (enabled: boolean) => setSettings(prev => ({ ...prev, highContrast: enabled }));
  const setReducedMotion = (enabled: boolean) => setSettings(prev => ({ ...prev, reducedMotion: enabled }));
  const setTheme = (theme: ThemeName) => setSettings(prev => ({ ...prev, theme }));
  const setColorBlind = (enabled: boolean) => setSettings(prev => ({ ...prev, colorBlind: enabled }));
  const setScreenReaderOptimized = (enabled: boolean) => setSettings(prev => ({ ...prev, screenReaderOptimized: enabled }));
  const setKeyboardNavigation = (enabled: boolean) => setSettings(prev => ({ ...prev, keyboardNavigation: enabled }));
  const setFocusIndicators = (enabled: boolean) => setSettings(prev => ({ ...prev, focusIndicators: enabled }));
  const setReadableFont = (enabled: boolean) => setSettings(prev => ({ ...prev, readableFont: enabled }));
  const setTextSpacing = (enabled: boolean) => setSettings(prev => ({ ...prev, textSpacing: enabled }));
  const setLinkUnderlines = (enabled: boolean) => setSettings(prev => ({ ...prev, linkUnderlines: enabled }));
  
  const resetSettings = () => setSettings(defaultSettings);

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
    setScreenReaderOptimized,
    setKeyboardNavigation,
    setFocusIndicators,
    setReadableFont,
    setTextSpacing,
    setLinkUnderlines,
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
