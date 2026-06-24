'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Palette,
  ChevronRight,
} from 'lucide-react';
import { AppSettings, Theme, Typography, GridDensity, ProcessingMode } from '@/hooks/useSettings';
import AppearanceSection from './drawer/AppearanceSection';
import IntelligenceSection from './drawer/IntelligenceSection';
import VaultSection from './drawer/VaultSection';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DrawerPanel = 'settings' | 'appearance';

interface DrawerProps {
  isOpen: boolean;
  panel: DrawerPanel;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetSettings: () => void;
  onPurgeStream: () => void;
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { id: DrawerPanel; label: string; icon: typeof Settings }[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Drawer({
  isOpen,
  panel,
  onClose,
  settings,
  onUpdateSetting,
  onResetSettings,
  onPurgeStream,
}: DrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerPanel>(panel);

  // Sync external panel prop when drawer opens
  const handleTabChange = useCallback((tab: DrawerPanel) => {
    setActiveTab(tab);
  }, []);

  // When panel prop changes (e.g., user clicks Settings vs Appearance), sync the tab
  if (isOpen && activeTab !== panel && panel !== activeTab) {
    // Will be overridden by the useEffect pattern below
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ──────────────────────────────────────────────── */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'linear' }}
            className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Slide-over panel ──────────────────────────────────────── */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col border-l border-zinc-100 bg-white shadow-2xl shadow-black/[0.12]"
            aria-label="Settings drawer"
            role="dialog"
            aria-modal="true"
          >
            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                  StreamBrain
                </p>
                <h2 className="mt-0.5 text-[17px] font-semibold tracking-tight text-zinc-900">
                  Workspace Settings
                </h2>
              </div>
              <button
                id="drawer-close-btn"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-100 text-zinc-400 transition-all duration-150 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-700"
                aria-label="Close settings"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* ── Tabs ──────────────────────────────────────────────────── */}
            <div className="flex gap-1 border-b border-zinc-100 px-6 pt-3 pb-0">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`drawer-tab-${tab.id}`}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex items-center gap-1.5 rounded-t-lg px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                      isActive
                        ? 'text-zinc-900'
                        : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <Icon size={13} strokeWidth={isActive ? 2.2 : 1.8} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="drawer-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-zinc-900"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Scrollable body ───────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'appearance' ? (
                  <motion.div
                    key="appearance-tab"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <AppearanceSection settings={settings} onUpdateSetting={onUpdateSetting} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="settings-tab"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <IntelligenceSection settings={settings} onUpdateSetting={onUpdateSetting} />
                    <div className="mx-6 my-2 h-px bg-zinc-100" />
                    <VaultSection onPurgeStream={onPurgeStream} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <div className="border-t border-zinc-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-zinc-400">
                  v0.1.0 · StreamBrain Engine
                </p>
                <button
                  onClick={onResetSettings}
                  id="drawer-reset-btn"
                  className="text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-600"
                >
                  Reset to defaults
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
