'use client';

import { motion } from 'framer-motion';
import { Zap, BrainCircuit, Clock, Check } from 'lucide-react';
import { AppSettings, ProcessingMode } from '@/hooks/useSettings';

interface IntelligenceSectionProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

// ─── Processing modes ─────────────────────────────────────────────────────────

const PROCESSING_MODES: {
  id: ProcessingMode;
  label: string;
  description: string;
  detail: string;
  icon: typeof Zap;
}[] = [
  {
    id: 'fast',
    label: 'Fast Capture',
    description: 'Instant save with basic tags',
    detail: 'Raw string saved immediately with lightweight classification — zero latency.',
    icon: Zap,
  },
  {
    id: 'deep',
    label: 'Deep Synthesis',
    description: 'Multi-step agent reasoning',
    detail:
      'Triggers contextual reference indexing, insight extraction, and connection graphing via the Lemma SDK.',
    icon: BrainCircuit,
  },
];

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative flex h-6 w-10 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${
        checked ? 'bg-zinc-900' : 'bg-zinc-200'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`absolute flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm ${
          checked ? 'left-5' : 'left-1'
        }`}
      >
        {checked && <Check size={8} strokeWidth={3} className="text-zinc-900" />}
      </motion.span>
    </button>
  );
}

function SectionLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div className="mb-4">
      <p className="text-[13px] font-semibold text-zinc-800">{label}</p>
      {description && <p className="mt-0.5 text-[12px] text-zinc-400">{description}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntelligenceSection({
  settings,
  onUpdateSetting,
}: IntelligenceSectionProps) {
  return (
    <div className="space-y-8 px-6 py-6">

      {/* ── Processing Mode ──────────────────────────────────────────── */}
      <div>
        <SectionLabel
          label="Processing Mode"
          description="Controls pipeline intensity for incoming thoughts"
        />
        <div className="space-y-2">
          {PROCESSING_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = settings.processingMode === mode.id;
            return (
              <button
                key={mode.id}
                id={`processing-${mode.id}`}
                onClick={() => onUpdateSetting('processingMode', mode.id)}
                className={`group relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                  isActive
                    ? 'border-zinc-900 bg-zinc-950'
                    : 'border-zinc-100 bg-white hover:border-zinc-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                      isActive ? 'bg-white/10' : 'bg-zinc-100'
                    }`}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                      className={isActive ? 'text-white' : 'text-zinc-500'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-[13px] font-semibold ${
                          isActive ? 'text-white' : 'text-zinc-800'
                        }`}
                      >
                        {mode.label}
                      </p>
                      <div
                        className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
                          isActive ? 'border-white bg-white' : 'border-zinc-300'
                        }`}
                      >
                        {isActive && (
                          <div className="h-[7px] w-[7px] rounded-full bg-zinc-900" />
                        )}
                      </div>
                    </div>
                    <p
                      className={`mt-0.5 text-[12px] ${
                        isActive ? 'text-white/60' : 'text-zinc-400'
                      }`}
                    >
                      {mode.description}
                    </p>
                    <p
                      className={`mt-2 text-[11px] leading-relaxed ${
                        isActive ? 'text-white/40' : 'text-zinc-400'
                      }`}
                    >
                      {mode.detail}
                    </p>
                  </div>
                </div>

                {/* Subtle glow for deep synthesis */}
                {isActive && mode.id === 'deep' && (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Auto-Cleanup ─────────────────────────────────────────────── */}
      <div>
        <SectionLabel
          label="Auto-Cleanup"
          description="Background agent behaviour after task completion"
        />
        <div className="overflow-hidden rounded-xl border border-zinc-100">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                <Clock size={15} strokeWidth={1.8} className="text-zinc-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-zinc-800">
                  Auto-archive completed tasks
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  Moves done tasks to archive after 24 hours
                </p>
              </div>
            </div>
            <Toggle
              id="toggle-auto-cleanup"
              checked={settings.autoCleanup}
              onChange={(v) => onUpdateSetting('autoCleanup', v)}
            />
          </div>

          {settings.autoCleanup && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden border-t border-zinc-100 bg-zinc-50 px-4 py-3"
            >
              <p className="text-[11px] leading-relaxed text-zinc-500">
                <span className="font-semibold text-zinc-700">Active:</span> Completed tasks
                will be automatically moved to the archive vault 24 hours after completion.
                This keeps your spatial grid clean without permanent deletion.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
