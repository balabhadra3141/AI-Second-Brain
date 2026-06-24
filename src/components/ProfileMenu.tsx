'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Palette, LogOut } from 'lucide-react';
import { DrawerPanel } from './Drawer';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDrawer: (panel: DrawerPanel) => void;
}

export default function ProfileMenu({ isOpen, onClose, onOpenDrawer }: ProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('#profile-trigger')
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleDrawerOpen = (panel: DrawerPanel) => {
    onClose();
    // Small delay lets the menu exit-animate before drawer opens
    setTimeout(() => onOpenDrawer(panel), 80);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-lg shadow-black/[0.06]"
        >
          <div className="p-1.5">
            {/* ── Appearance ── */}
            <button
              id="menu-theme"
              onClick={() => handleDrawerOpen('appearance')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-muted transition-colors duration-150 hover:bg-background hover:text-foreground"
            >
              <Palette size={15} strokeWidth={1.8} />
              Appearance
            </button>

            {/* ── Settings ── */}
            <button
              id="menu-settings"
              onClick={() => handleDrawerOpen('settings')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-muted transition-colors duration-150 hover:bg-background hover:text-foreground"
            >
              <Settings size={15} strokeWidth={1.8} />
              Settings
            </button>

            {/* ── Separator ── */}
            <div className="mx-2 my-1.5 h-px bg-border-subtle" />

            {/* ── Sign Out ── */}
            <button
              id="menu-signout"
              onClick={onClose}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-red-500 transition-colors duration-150 hover:bg-red-50"
            >
              <LogOut size={15} strokeWidth={1.8} />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
