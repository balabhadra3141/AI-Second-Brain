'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import SpatialGrid from '@/components/SpatialGrid';
import CommandPalette from '@/components/CommandPalette';
import DropZoneOverlay from '@/components/DropZoneOverlay';
import Drawer, { DrawerPanel } from '@/components/Drawer';
import { useThoughts } from '@/hooks/useThoughts';
import { useDropZone } from '@/hooks/useDropZone';
import { useSettings } from '@/hooks/useSettings';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function Home() {
  const { thoughts, isLoading, addThought, deleteThought, toggleTask } = useThoughts();
  const { isDragging } = useDropZone();
  const { settings, updateSetting, resetSettings } = useSettings();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Drawer state
  const [drawerPanel, setDrawerPanel] = useState<DrawerPanel | null>(null);

  const status = isLoading ? 'processing' : 'connected';

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply global appearance settings to DOM
  useEffect(() => {
    const root = document.documentElement;

    // Apply Theme
    root.classList.remove('theme-onyx', 'theme-paper');
    if (settings.theme !== 'system') {
      root.classList.add(`theme-${settings.theme}`);
    }

    // Apply Typography
    root.classList.remove('font-modern', 'font-editorial', 'font-technical');
    root.classList.add(`font-${settings.typography}`);
  }, [settings.theme, settings.typography]);

  const handlePaletteSubmit = useCallback(
    (content: string, file?: File) => {
      setIsProcessing(true);
      // Simulate AI classification latency
      setTimeout(() => {
        addThought(content);
        setIsProcessing(false);
      }, 900);
    },
    [addThought]
  );

  const handlePurgeStream = useCallback(() => {
    // In a real app, this would delete all items from local state/DB
    console.log('Purging stream...');
  }, []);

  return (
    <>
      <Header
        status={status}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onOpenDrawer={(panel) => setDrawerPanel(panel)}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6">
        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-ink-faint">
            Spatial Workspace
          </h2>
          <p className="mt-1 text-[22px] font-semibold tracking-tight text-foreground">
            {thoughts.length > 0
              ? `${thoughts.length} thought${thoughts.length !== 1 ? 's' : ''} in your stream`
              : 'Your second brain awaits'}
          </p>
        </div>

        <SpatialGrid
          thoughts={thoughts}
          isProcessing={isProcessing || isLoading}
          density={settings.density}
          onDelete={deleteThought}
          onToggleTask={toggleTask}
        />
      </main>

      {/* Floating action button (mobile) */}
      <motion.button
        id="fab-add-thought"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsPaletteOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-xl shadow-black/20 transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/25 md:bottom-8 md:right-8"
        aria-label="Capture a thought"
      >
        <Plus size={22} strokeWidth={2} />
      </motion.button>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSubmit={handlePaletteSubmit}
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerPanel !== null}
        panel={drawerPanel || 'settings'}
        onClose={() => setDrawerPanel(null)}
        settings={settings}
        onUpdateSetting={updateSetting}
        onResetSettings={resetSettings}
        onPurgeStream={handlePurgeStream}
      />

      <DropZoneOverlay isDragging={isDragging} />
    </>
  );
}
