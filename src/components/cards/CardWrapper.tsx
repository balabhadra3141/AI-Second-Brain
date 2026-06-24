'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Trash2, Copy } from 'lucide-react';
import { ThoughtType } from '@/types';

interface CardWrapperProps {
  children: React.ReactNode;
  type: ThoughtType;
  timestamp: Date;
  onDelete: () => void;
  onCopy: () => void;
  className?: string;
}

const typeBadge: Record<ThoughtType, { label: string; className: string }> = {
  task: {
    label: 'Task',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  },
  knowledge: {
    label: 'Knowledge',
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
  },
  idea: {
    label: 'Idea',
    className: 'bg-amber-50 text-amber-700 border border-amber-100',
  },
};

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CardWrapper({
  children,
  type,
  timestamp,
  onDelete,
  onCopy,
  className = '',
}: CardWrapperProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const badge = typeBadge[type];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setIsMenuOpen(false);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article
      className={`group relative rounded-xl border bg-surface-raised p-5 transition-shadow duration-300 hover:shadow-md hover:shadow-black/[0.04] ${className}`}
    >
      {/* Card header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.className}`}
          >
            {badge.label}
          </span>
          <span className="text-[11px] text-ink-faint">{formatTime(timestamp)}</span>
        </div>

        {/* More menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint opacity-0 transition-all duration-200 hover:bg-background/80 hover:text-ink-muted group-hover:opacity-100"
            aria-label="Card actions"
          >
            <MoreHorizontal size={15} strokeWidth={1.8} />
          </button>

          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="absolute right-0 top-full z-10 mt-1.5 w-36 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-xl shadow-black/[0.08]"
            >
              <button
                onClick={handleCopy}
                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] font-medium text-ink-muted transition-colors hover:bg-background hover:text-foreground"
              >
                <Copy size={13} strokeWidth={1.8} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <div className="mx-2 h-px bg-border-subtle/60" />
              <button
                onClick={() => {
                  onDelete();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <Trash2 size={13} strokeWidth={1.8} />
                Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Card content */}
      {children}
    </article>
  );
}
