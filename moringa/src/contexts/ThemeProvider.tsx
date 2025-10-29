'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';

type ThemeVars = {
  primary?: string; // hex like #16a34a
  primaryForeground?: string;
  background?: string;
  foreground?: string;
  accent?: string;
  accentForeground?: string;
  radius?: string; // e.g. 0.5rem
};

interface ThemeContextValue {
  theme: ThemeVars;
  setTheme: (vars: ThemeVars) => void;
  loaded: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function hexToHslTuple(hex: string): string | null {
  if (!hex) return null;
  let r = 0, g = 0, b = 0;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  } else {
    return null;
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  const H = Math.round(h * 360);
  const S = Math.round(s * 100);
  const L = Math.round(l * 100);
  return `${H} ${S}% ${L}%`;
}

function applyCssVars(vars: ThemeVars) {
  if (typeof document === 'undefined') return; // SSR guard
  const root = document.documentElement;
  if (vars.primary) {
    const hsl = hexToHslTuple(vars.primary);
    if (hsl) {
      root.style.setProperty('--primary', hsl);
      console.log('Set --primary to', hsl);
    }
  }
  if (vars.primaryForeground) {
    const hsl = hexToHslTuple(vars.primaryForeground);
    if (hsl) root.style.setProperty('--primary-foreground', hsl);
  }
  if (vars.background) {
    const hsl = hexToHslTuple(vars.background);
    if (hsl) root.style.setProperty('--background', hsl);
  }
  if (vars.foreground) {
    const hsl = hexToHslTuple(vars.foreground);
    if (hsl) root.style.setProperty('--foreground', hsl);
  }
  if (vars.accent) {
    const hsl = hexToHslTuple(vars.accent);
    if (hsl) root.style.setProperty('--accent', hsl);
  }
  if (vars.accentForeground) {
    const hsl = hexToHslTuple(vars.accentForeground);
    if (hsl) root.style.setProperty('--accent-foreground', hsl);
  }
  if (vars.radius) {
    root.style.setProperty('--radius', vars.radius);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVars>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get('/settings');
        const s = res.data || {};
        console.log('ThemeProvider: Loaded settings', s);
        const vars: ThemeVars = {
          primary: s.theme_primary || '#16a34a', // default green-600
          primaryForeground: s.theme_primary_foreground || '#ffffff',
          background: s.theme_background || '#f9fafb', // gray-50
          foreground: s.theme_foreground || '#111827', // gray-900
          accent: s.theme_accent || '#22c55e', // green-500
          accentForeground: s.theme_accent_foreground || '#ffffff',
          radius: s.theme_radius || '0.5rem',
        };
        if (!cancelled) {
          setThemeState(vars);
          applyCssVars(vars);
          console.log('ThemeProvider: Applied CSS vars', vars);
          setLoaded(true);
        }
      } catch (e) {
        console.error('ThemeProvider: Failed to load settings', e);
        // fallback to defaults
        const vars: ThemeVars = {
          primary: '#16a34a',
          primaryForeground: '#ffffff',
          background: '#f9fafb',
          foreground: '#111827',
          accent: '#22c55e',
          accentForeground: '#ffffff',
          radius: '0.5rem',
        };
        if (!cancelled) {
          setThemeState(vars);
          applyCssVars(vars);
          setLoaded(true);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const setTheme = (vars: ThemeVars) => {
    setThemeState((prev) => {
      const merged = { ...prev, ...vars };
      applyCssVars(merged);
      return merged;
    });
  };

  const value = useMemo(() => ({ theme, setTheme, loaded }), [theme, loaded]);
  
  // Force re-render by adding a key when loaded
  return (
    <ThemeContext.Provider value={value} key={loaded ? 'loaded' : 'loading'}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
