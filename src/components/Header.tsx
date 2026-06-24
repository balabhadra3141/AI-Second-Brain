'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import ProfileMenu from './ProfileMenu';

interface HeaderProps {
  status: 'connected' | 'processing' | 'disconnected';
}

export default function Header({ status }: HeaderProps) {
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
        <div className="mx-auto flex h-full max-w-2xl items-center justify-between px-4">
          {/* Wordmark */}
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
              StreamBrain
            </h1>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
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
            />
          </div>
        </div>
      </header>
      {/* Spacer for fixed header */}
      <div className="h-12" />
    </>
  );
}
