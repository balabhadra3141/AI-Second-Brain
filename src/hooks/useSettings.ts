'use client';

import { useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = 'paper' | 'onyx' | 'system';
export type Typography = 'modern' | 'editorial' | 'technical';
export type GridDensity = 'comfortable' | 'compact';
export type ProcessingMode = 'fast' | 'deep';

export interface AppSettings {
  theme: Theme;
  typography: Typography;
  density: GridDensity;
  processingMode: ProcessingMode;
  autoCleanup: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  typography: 'modern',
  density: 'comfortable',
  processingMode: 'fast',
  autoCleanup: false,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSetting, resetSettings };
}
