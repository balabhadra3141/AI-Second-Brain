'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Trash2,
  AlertTriangle,
  Check,
  X,
  BookOpen,
  HardDrive,
  Apple,
  FileText,
} from 'lucide-react';

interface VaultSectionProps {
  onPurgeStream: () => void;
}

// ─── Integrations list ────────────────────────────────────────────────────────

const INTEGRATIONS = [
  {
    id: 'apple-notes',
    label: 'Apple Notes',
    icon: Apple,
    status: 'coming-soon' as const,
  },
  {
    id: 'google-drive',
    label: 'Google Drive',
    icon: HardDrive,
    status: 'coming-soon' as const,
  },
  {
    id: 'notion',
    label: 'Notion',
    icon: BookOpen,
    status: 'coming-soon' as const,
  },
  {
    id: 'obsidian',
    label: 'Obsidian Vault',
    icon: FileText,
    status: 'coming-soon' as const,
  },
];

// ─── Simulated export ─────────────────────────────────────────────────────────

function triggerMarkdownExport() {
  const mockData = `# StreamBrain Export\n_Generated: ${new Date().toISOString()}_\n\n---\n\n## Tasks\n\n- [ ] Review Q3 product roadmap\n- [x] Set up CI/CD pipeline\n\n## Knowledge\n\n> RAG systems work best when chunks are between 256–512 tokens.\n\n## Ideas\n\n💡 StreamBrain auto-detects deep work mode based on input patterns.\n`;

  const blob = new Blob([mockData], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `streambrain-export-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

export default function VaultSection({ onPurgeStream }: VaultSectionProps) {
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'done'>('idle');
  const [purgeStep, setPurgeStep] = useState<0 | 1 | 2>(0);

  // ── Export handler ───────────────────────────────────────────────
  const handleExport = useCallback(() => {
    setExportState('exporting');
    setTimeout(() => {
      triggerMarkdownExport();
      setExportState('done');
      setTimeout(() => setExportState('idle'), 3000);
    }, 800);
  }, []);

  // ── Purge confirmation cascade ───────────────────────────────────
  const handlePurgeClick = useCallback(() => {
    if (purgeStep === 0) {
      setPurgeStep(1);
    } else if (purgeStep === 1) {
      setPurgeStep(2);
      onPurgeStream();
      setTimeout(() => setPurgeStep(0), 3500);
    }
  }, [purgeStep, onPurgeStream]);

  const cancelPurge = useCallback(() => setPurgeStep(0), []);

  return (
    <div className="space-y-8 px-6 py-6">

      {/* ── Integrations ─────────────────────────────────────────────── */}
      <div>
        <SectionLabel
          label="Connected Integrations"
          description="Sync your stream with external vaults"
        />
        <div className="overflow-hidden rounded-xl border border-zinc-100">
          {INTEGRATIONS.map((integration, i) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i > 0 ? 'border-t border-zinc-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
                    <Icon size={14} strokeWidth={1.8} className="text-zinc-500" />
                  </div>
                  <p className="text-[13px] font-medium text-zinc-700">
                    {integration.label}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Coming Soon
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Export Utility ───────────────────────────────────────────── */}
      <div>
        <SectionLabel
          label="Data Export"
          description="Download your full thought stream"
        />
        <motion.button
          id="vault-export-btn"
          onClick={handleExport}
          disabled={exportState === 'exporting'}
          whileTap={{ scale: 0.98 }}
          className={`group relative w-full overflow-hidden rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 ${
            exportState === 'done'
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-zinc-900 bg-zinc-950 hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  exportState === 'done'
                    ? 'bg-emerald-100'
                    : 'bg-white/10'
                }`}
              >
                {exportState === 'done' ? (
                  <Check size={16} strokeWidth={2} className="text-emerald-600" />
                ) : (
                  <Download
                    size={16}
                    strokeWidth={1.8}
                    className={`text-white transition-transform duration-300 ${
                      exportState === 'exporting' ? 'animate-bounce' : ''
                    }`}
                  />
                )}
              </div>
              <div>
                <p
                  className={`text-[13px] font-semibold ${
                    exportState === 'done' ? 'text-emerald-700' : 'text-white'
                  }`}
                >
                  {exportState === 'idle' && 'Export Stream to Markdown'}
                  {exportState === 'exporting' && 'Compiling stream…'}
                  {exportState === 'done' && 'Export complete!'}
                </p>
                <p
                  className={`text-[11px] ${
                    exportState === 'done' ? 'text-emerald-600/70' : 'text-white/40'
                  }`}
                >
                  {exportState === 'done'
                    ? 'Your .md file has been downloaded'
                    : 'Downloads as a compressed .md file'}
                </p>
              </div>
            </div>
            {exportState === 'idle' && (
              <Download size={15} strokeWidth={1.8} className="text-white/30" />
            )}
          </div>
        </motion.button>
      </div>

      {/* ── Danger Zone ──────────────────────────────────────────────── */}
      <div>
        <SectionLabel
          label="Danger Zone"
          description="Irreversible operations — proceed with care"
        />

        <div className="overflow-hidden rounded-xl border-2 border-red-100 bg-red-50/50">
          <div className="flex items-start gap-3 px-4 py-4">
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle size={14} strokeWidth={2} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-red-700">
                Purge Local Stream Cache
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-red-500/80">
                Permanently deletes all locally stored thoughts, tasks, and knowledge
                fragments from this device. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="border-t border-red-100 px-4 py-3">
            <AnimatePresence mode="wait">
              {purgeStep === 0 && (
                <motion.button
                  key="purge-initial"
                  id="purge-btn-initial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  onClick={handlePurgeClick}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-[12px] font-semibold text-red-600 transition-all duration-150 hover:border-red-300 hover:bg-red-50"
                >
                  <Trash2 size={13} strokeWidth={2} />
                  Purge Local Stream Cache
                </motion.button>
              )}

              {purgeStep === 1 && (
                <motion.div
                  key="purge-confirm"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-2"
                >
                  <p className="text-[12px] font-semibold text-red-700">
                    Are you absolutely sure?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      id="purge-btn-confirm"
                      onClick={handlePurgeClick}
                      className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      <Trash2 size={12} strokeWidth={2} />
                      Yes, purge everything
                    </button>
                    <button
                      id="purge-btn-cancel"
                      onClick={cancelPurge}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-[12px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
                    >
                      <X size={12} strokeWidth={2} />
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {purgeStep === 2 && (
                <motion.div
                  key="purge-done"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <Check size={12} strokeWidth={2.5} className="text-emerald-600" />
                  </div>
                  <p className="text-[12px] font-medium text-emerald-700">
                    Stream cache purged successfully.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
