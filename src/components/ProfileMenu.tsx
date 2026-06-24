'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Palette, LogOut } from 'lucide-react';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Settings, label: 'Settings', id: 'menu-settings' },
  { icon: Palette, label: 'Appearance', id: 'menu-theme' },
  { icon: LogOut, label: 'Sign Out', id: 'menu-signout' },
];

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-lg shadow-black/[0.04]"
        >
          <div className="p-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                id={item.id}
                onClick={() => onClose()}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-muted transition-colors duration-150 hover:bg-background hover:text-foreground"
              >
                <item.icon size={15} strokeWidth={1.8} />
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
