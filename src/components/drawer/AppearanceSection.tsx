'use client';

import { motion } from 'framer-motion';
import { Monitor, Sun, Moon } from 'lucide-react';
import { AppSettings, Theme, Typography, GridDensity } from '@/hooks/useSettings';

interface AppearanceSectionProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

// ─── Theme cards ─────────────────────────────────────────────────────────────

const THEMES: {
  id: Theme;
  label: string;
  description: string;
  icon: typeof Sun;
  preview: { bg: string; card: string; text: string; border: string };
}[] = [
  {
    id: 'paper',
    label: 'Paper',
    description: 'Warm editorial light',
    icon: Sun,
    preview: { bg: '#F4EFE6', card: '#FCFAF5', text: '#2C2825', border: '#E6DFD3' },
  },
  {
    id: 'onyx',
    label: 'Onyx',
    description: 'Pitch-dark focus mode',
    icon: Moon,
    preview: { bg: '#09090B', card: '#18181B', text: '#FAFAFA', border: '#27272A' },
  },
  {
    id: 'system',
    label: 'System',
    description: 'Follows OS preference',
    icon: Monitor,
    preview: { bg: '#F4F4F5', card: '#FFFFFF', text: '#3F3F46', border: '#E4E4E7' },
  },
];

// ─── Typography options ───────────────────────────────────────────────────────

const TYPOGRAPHY_OPTIONS: { id: Typography; label: string; sample: string; meta: string }[] = [
  { id: 'modern', label: 'Modern', sample: 'Inter', meta: 'Sans-serif · Clean UI' },
  { id: 'editorial', label: 'Editorial', sample: 'Lora', meta: 'Serif · Long reading' },
  { id: 'technical', label: 'Technical', sample: 'Mono', meta: 'Monospace · Data' },
];

// ─── Density options ──────────────────────────────────────────────────────────

const DENSITY_OPTIONS: { id: GridDensity; label: string; description: string; rows: number }[] = [
  { id: 'comfortable', label: 'Comfortable', description: 'Generous spacing', rows: 2 },
  { id: 'compact', label: 'Compact', description: 'Dense information view', rows: 3 },
];

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div className="mb-4">
      <p className="text-[13px] font-semibold text-zinc-800">{label}</p>
      {description && (
        <p className="mt-0.5 text-[12px] text-zinc-400">{description}</p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppearanceSection({ settings, onUpdateSetting }: AppearanceSectionProps) {
  return (
    <div className="space-y-8 px-6 py-6">

      {/* ── Theme Matrix ────────────────────────────────────────────── */}
      <div>
        <SectionLabel
          label="Theme"
          description="Choose your visual environment"
        />
        <div className="grid grid-cols-3 gap-2.5">
          {THEMES.map((theme) => {
            const Icon = theme.icon;
            const isActive = settings.theme === theme.id;
            return (
              <button
                key={theme.id}
                id={`theme-${theme.id}`}
                onClick={() => onUpdateSetting('theme', theme.id)}
                className={`group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all duration-200 ${
                  isActive
                    ? 'border-zinc-900 shadow-sm'
                    : 'border-zinc-100 hover:border-zinc-300'
                }`}
              >
                {/* Mini preview canvas */}
                <div
                  className="h-16 w-full p-2"
                  style={{ background: theme.preview.bg }}
                >
                  <div
                    className="h-2 w-8 rounded-sm mb-1.5"
                    style={{ background: theme.preview.border }}
                  />
                  <div
                    className="h-full w-full rounded-md border"
                    style={{
                      background: theme.preview.card,
                      borderColor: theme.preview.border,
                    }}
                  >
                    <div className="p-1.5 space-y-1">
                      <div
                        className="h-1 w-10 rounded-sm"
                        style={{ background: theme.preview.text, opacity: 0.7 }}
                      />
                      <div
                        className="h-1 w-7 rounded-sm"
                        style={{ background: theme.preview.text, opacity: 0.35 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Label area */}
                <div className="border-t border-zinc-100 bg-white px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} strokeWidth={2} className="text-zinc-500" />
                    <span className="text-[12px] font-semibold text-zinc-800">
                      {theme.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-zinc-400">{theme.description}</p>
                </div>

                {/* Active checkmark */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900"
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M1.5 4L3 5.5L6.5 2"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Typography Engine ────────────────────────────────────────── */}
      <div>
        <SectionLabel
          label="Typography"
          description="Controls content stream rendering"
        />
        <div className="overflow-hidden rounded-xl border border-zinc-100">
          {TYPOGRAPHY_OPTIONS.map((opt, i) => {
            const isActive = settings.typography === opt.id;
            const fontClass =
              opt.id === 'modern'
                ? 'font-sans'
                : opt.id === 'editorial'
                ? 'font-serif'
                : 'font-mono';
            return (
              <button
                key={opt.id}
                id={`typography-${opt.id}`}
                onClick={() => onUpdateSetting('typography', opt.id)}
                className={`flex w-full items-center justify-between px-4 py-3.5 transition-colors duration-150 ${
                  i > 0 ? 'border-t border-zinc-100' : ''
                } ${
                  isActive ? 'bg-zinc-950 text-white' : 'hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold ${fontClass} ${
                      isActive ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    Aa
                  </span>
                  <div className="text-left">
                    <p className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-zinc-800'}`}>
                      {opt.label}
                    </p>
                    <p className={`text-[11px] ${isActive ? 'text-white/50' : 'text-zinc-400'}`}>
                      {opt.meta}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-all duration-150 ${
                    isActive
                      ? 'border-white bg-white'
                      : 'border-zinc-300'
                  }`}
                >
                  {isActive && (
                    <div className="h-[7px] w-[7px] rounded-full bg-zinc-900" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grid Density ─────────────────────────────────────────────── */}
      <div>
        <SectionLabel
          label="Grid Density"
          description="Information density of the spatial grid"
        />
        <div className="grid grid-cols-2 gap-2">
          {DENSITY_OPTIONS.map((opt) => {
            const isActive = settings.density === opt.id;
            return (
              <button
                key={opt.id}
                id={`density-${opt.id}`}
                onClick={() => onUpdateSetting('density', opt.id)}
                className={`relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                  isActive
                    ? 'border-zinc-900 bg-zinc-950 text-white'
                    : 'border-zinc-100 bg-white hover:border-zinc-200'
                }`}
              >
                {/* Visual preview of density */}
                <div className={`flex flex-col gap-${isActive ? '1' : '1'}`}>
                  {Array.from({ length: opt.rows }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-[5px] rounded-sm ${isActive ? 'bg-white/20' : 'bg-zinc-200'}`}
                      style={{ width: `${60 + i * 10}%` }}
                    />
                  ))}
                </div>
                <div>
                  <p className={`text-[12px] font-semibold ${isActive ? 'text-white' : 'text-zinc-800'}`}>
                    {opt.label}
                  </p>
                  <p className={`text-[11px] ${isActive ? 'text-white/50' : 'text-zinc-400'}`}>
                    {opt.description}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-white"
                  >
                    <div className="h-[7px] w-[7px] rounded-full bg-zinc-900" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
