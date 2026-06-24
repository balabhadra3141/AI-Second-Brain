'use client';

import { useState } from 'react';
import { User, Command } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import { DrawerPanel } from './Drawer';

interface HeaderProps {
  status: 'connected' | 'processing' | 'disconnected';
  onOpenPalette?: () => void;
  onOpenDrawer: (panel: DrawerPanel) => void;
}

export default function Header({ status, onOpenPalette, onOpenDrawer }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const statusConfig = {
    connected: {
      color: 'bg-status-connected',
      label: 'Connected',
      pulse: false,
    },
    processing: {
      color: 'bg-status-processing',
      label: 'AI Processing…',
      pulse: true,
    },
    disconnected: {
      color: 'bg-ink-faint',
      label: 'Offline',
      pulse: false,
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-12 border-b border-border-subtle bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          {/* Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="2.5" fill="white" />
                <circle cx="2" cy="2" r="1.2" fill="white" opacity="0.6" />
                <circle cx="10" cy="2" r="1.2" fill="white" opacity="0.6" />
                <circle cx="2" cy="10" r="1.2" fill="white" opacity="0.6" />
                <circle cx="10" cy="10" r="1.2" fill="white" opacity="0.6" />
              </svg>
            </div>
            <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
              StreamBrain
            </h1>
          </div>

          {/* Center: Cmd+K trigger pill (desktop) */}
          {onOpenPalette && (
            <button
              id="header-palette-trigger"
              onClick={onOpenPalette}
              className="hidden items-center gap-2 rounded-xl border border-border-subtle bg-surface-raised px-3.5 py-1.5 text-[12px] font-medium text-ink-faint transition-all duration-200 hover:border-border-hover hover:text-ink-muted hover:shadow-sm md:flex"
              aria-label="Open command palette"
            >
              <Command size={12} strokeWidth={2} />
              <span>Capture a thought…</span>
              <div className="ml-1 flex items-center gap-0.5">
                <kbd className="rounded border border-border-subtle bg-background px-1 py-px font-mono text-[10px]">⌘</kbd>
                <kbd className="rounded border border-border-subtle bg-background px-1 py-px font-mono text-[10px]">K</kbd>
              </div>
            </button>
          )}

          {/* Right: Status + Profile */}
          <div className="flex items-center gap-3">
            {/* Status */}
            <div className="hidden items-center gap-2 sm:flex">
              <span
                className={`inline-block h-[7px] w-[7px] rounded-full ${currentStatus.color} ${
                  currentStatus.pulse ? 'pulse-dot' : ''
                }`}
              />
              <span className="text-[11px] font-medium tracking-wide uppercase text-ink-faint">
                {currentStatus.label}
              </span>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                id="profile-trigger"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-ink-muted transition-all duration-200 hover:border-border-hover hover:text-foreground hover:shadow-sm"
                aria-label="Profile menu"
              >
                <User size={15} strokeWidth={1.8} />
              </button>
              <ProfileMenu
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onOpenDrawer={onOpenDrawer}
              />
            </div>
          </div>
        </div>
      </header>
      {/* Spacer for fixed header */}
      <div className="h-12" />
    </>
  );
}
