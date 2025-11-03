'use client';

import React, { useState } from 'react';
import {
  Accessibility,
  Sun,
  Moon,
  Monitor,
  Type,
  Contrast,
  Zap,
  X,
  RotateCcw,
  EyeOff,
} from 'lucide-react';
import { useAccessibility, ColorMode, FontSize } from '@/contexts/AccessibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    colorMode,
    fontSize,
    highContrast,
    reducedMotion,
    setColorMode,
    setFontSize,
    setHighContrast,
    setReducedMotion,
    resetSettings,
    isDarkMode,
    colorBlind,
    setColorBlind,
  } = useAccessibility();
  
  const { language } = useLanguage();
  const t = (key: keyof typeof translations.accessibility) => 
    translations.accessibility[key][language];

  // Keyboard shortcut: Alt + A to toggle menu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const colorModeOptions: { value: ColorMode; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="h-4 w-4" />, label: t('light') },
    { value: 'dark', icon: <Moon className="h-4 w-4" />, label: t('dark') },
    { value: 'system', icon: <Monitor className="h-4 w-4" />, label: t('system') },
  ];

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: 'small', label: t('small') },
    { value: 'normal', label: t('normal') },
    { value: 'large', label: t('large') },
    { value: 'extra-large', label: t('extraLarge') },
  ];

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3.5 bg-[hsl(var(--card))] text-primary border border-[hsl(var(--border))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30 backdrop-blur-sm"
        aria-label={t('accessibilityMenu')}
        title={t('accessibilityMenu')}
      >
        <Accessibility className="h-5 w-5" />
      </button>

      {/* Accessibility Menu Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[hsl(var(--foreground))/0.2] z-40 animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed bottom-24 right-6 z-50 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto bg-[hsl(var(--card))] rounded-2xl shadow-2xl border border-[hsl(var(--border))] animate-scaleIn">
            {/* Header */}
            <div className="sticky top-0 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{t('accessibility')}</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                aria-label={t('close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Color Mode */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {isDarkMode ? (
                    <Moon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  ) : (
                    <Sun className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  )}
                  <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {t('colorMode')}
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {colorModeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setColorMode(option.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        colorMode === option.value
                          ? 'border-primary bg-primary-soft'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--input))]'
                      }`}
                    >
                      {option.icon}
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Type className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {t('fontSize')}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFontSize(option.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        fontSize === option.value
                          ? 'border-primary bg-primary-soft'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--input))]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* High Contrast Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {t('highContrast')}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {t('highContrastDesc')}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHighContrast(!highContrast)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      highContrast ? 'bg-primary' : 'bg-[hsl(var(--muted))]'
                    }`}
                    role="switch"
                    aria-checked={highContrast}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-[hsl(var(--card))] transition-transform ${
                        highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Reduced Motion Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {t('reducedMotion')}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {t('reducedMotionDesc')}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReducedMotion(!reducedMotion)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      reducedMotion ? 'bg-primary' : 'bg-[hsl(var(--muted))]'
                    }`}
                    role="switch"
                    aria-checked={reducedMotion}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-[hsl(var(--card))] transition-transform ${
                        reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Color Blind Mode Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {t('colorBlindMode')}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {t('colorBlindDesc')}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setColorBlind(!colorBlind)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      colorBlind ? 'bg-primary' : 'bg-[hsl(var(--muted))]'
                    }`}
                    role="switch"
                    aria-checked={colorBlind}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-[hsl(var(--card))] transition-transform ${
                        colorBlind ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  resetSettings();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-[hsl(var(--input))] hover:border-[hsl(var(--ring))] hover:bg-[hsl(var(--muted))] transition-colors text-sm font-medium text-[hsl(var(--foreground))]"
              >
                <RotateCcw className="h-4 w-4" />
                {t('resetToDefaults')}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
