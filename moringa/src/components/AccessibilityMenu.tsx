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
  Headphones,
  Keyboard,
  Focus,
  AlignLeft,
  Space,
  Link as LinkIcon,
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
    screenReaderOptimized,
    setScreenReaderOptimized,
    keyboardNavigation,
    setKeyboardNavigation,
    focusIndicators,
    setFocusIndicators,
    readableFont,
    setReadableFont,
    textSpacing,
    setTextSpacing,
    linkUnderlines,
    setLinkUnderlines,
  } = useAccessibility();
  
  const { language } = useLanguage();
  const t = (key: keyof typeof translations.accessibility) => 
    translations.accessibility[key][language];

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A to toggle menu
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

  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? 'bg-primary' : 'bg-[hsl(var(--muted))]'
      }`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-[hsl(var(--card))] transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3.5 bg-[hsl(var(--card))] text-primary border border-[hsl(var(--border))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30 backdrop-blur-sm"
        aria-label={`${t('accessibilityMenu')} (Alt+A)`}
        title={`${t('accessibilityMenu')} (Alt+A)`}
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Accessibility Menu Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[hsl(var(--foreground))/0.2] z-40 animate-fadeIn"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div 
            className="fixed bottom-24 right-6 z-50 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto bg-[hsl(var(--card))] rounded-2xl shadow-2xl border border-[hsl(var(--border))] animate-scaleIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-menu-title"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 id="accessibility-menu-title" className="text-lg font-semibold">{t('accessibility')}</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <Moon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                  ) : (
                    <Sun className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                  )}
                  <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {t('colorMode')}
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('colorMode')}>
                  {colorModeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setColorMode(option.value)}
                      role="radio"
                      aria-checked={colorMode === option.value}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                        colorMode === option.value
                          ? 'border-primary bg-primary/10'
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
                  <Type className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                  <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {t('fontSize')}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('fontSize')}>
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFontSize(option.value)}
                      role="radio"
                      aria-checked={fontSize === option.value}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary ${
                        fontSize === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--input))]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Adjustments Section */}
              <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
                <h3 className="text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))] tracking-wider">
                  Visual Adjustments
                </h3>

                {/* High Contrast */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {t('highContrast')}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {t('highContrastDesc')}
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    checked={highContrast} 
                    onChange={() => setHighContrast(!highContrast)}
                    label={t('highContrast')}
                  />
                </label>

                {/* Color Blind Mode */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {t('colorBlindMode')}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {t('colorBlindDesc')}
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    checked={colorBlind} 
                    onChange={() => setColorBlind(!colorBlind)}
                    label={t('colorBlindMode')}
                  />
                </label>

                {/* Enhanced Focus Indicators */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Focus className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Enhanced Focus
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        Stronger visual indicators
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    checked={focusIndicators} 
                    onChange={() => setFocusIndicators(!focusIndicators)}
                    label="Enhanced Focus Indicators"
                  />
                </label>

                {/* Link Underlines */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Underline Links
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        Always show link underlines
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    checked={linkUnderlines} 
                    onChange={() => setLinkUnderlines(!linkUnderlines)}
                    label="Underline Links"
                  />
                </label>
              </div>

              {/* Reading & Navigation Section */}
              <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
                <h3 className="text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))] tracking-wider">
                  Reading & Navigation
                </h3>

                {/* Readable Font */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Readable Font
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        Dyslexia-friendly font
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    checked={readableFont} 
                    onChange={() => setReadableFont(!readableFont)}
                    label="Readable Font"
                  />
                </label>

                {/* Text Spacing */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Space className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Text Spacing
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        Increase line & letter spacing
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    checked={textSpacing} 
                    onChange={() => setTextSpacing(!textSpacing)}
                    label="Text Spacing"
                  />
                </label>

                {/* Keyboard Navigation */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Keyboard Navigation
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        Enhanced keyboard shortcuts
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    checked={keyboardNavigation} 
                    onChange={() => setKeyboardNavigation(!keyboardNavigation)}
                    label="Keyboard Navigation"
                  />
                </label>

                {/* Screen Reader Optimized */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Screen Reader Mode
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        Optimize for screen readers
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    checked={screenReaderOptimized} 
                    onChange={() => setScreenReaderOptimized(!screenReaderOptimized)}
                    label="Screen Reader Mode"
                  />
                </label>
              </div>

              {/* Motion Section */}
              <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
                <h3 className="text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))] tracking-wider">
                  Motion & Animation
                </h3>

                {/* Reduced Motion */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {t('reducedMotion')}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {t('reducedMotionDesc')}
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    checked={reducedMotion} 
                    onChange={() => setReducedMotion(!reducedMotion)}
                    label={t('reducedMotion')}
                  />
                </label>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  resetSettings();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-[hsl(var(--input))] hover:border-[hsl(var(--ring))] hover:bg-[hsl(var(--muted))] transition-colors text-sm font-medium text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-primary"
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
