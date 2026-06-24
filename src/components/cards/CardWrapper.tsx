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
  isOptimistic?: boolean;
  hasFailed?: boolean;
  onRetry?: () => void;
  layoutId?: string;
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
  isOptimistic,
  hasFailed,
  onRetry,
  layoutId,
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
    <motion.article
      layoutId={layoutId}
      className={`group relative rounded-xl border p-5 transition-all duration-300 ${
        isOptimistic ? 'opacity-70 pointer-events-none overflow-hidden before:absolute before:inset-0 before:skeleton-shimmer before:opacity-40 before:z-0' : ''
      } ${
        hasFailed ? 'bg-red-50/50 border-red-200/60 shadow-sm' : 'bg-surface-raised shadow-black/[0.04] hover:shadow-md'
      } ${className}`}
    >
      {/* Card header */}
      <div className="mb-3.5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${hasFailed ? 'bg-red-100 text-red-700 border-red-200' : badge.className}`}
          >
            {badge.label}
          </span>
          <span className={`text-[11px] ${hasFailed ? 'text-red-500/70' : 'text-ink-faint'} flex items-center gap-1.5`}>
            {formatTime(timestamp)}
            {isOptimistic && (
              <span className="flex items-center gap-1 ml-1 text-blue-500 font-medium">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                </span>
                Synthesizing...
              </span>
            )}
          </span>
        </div>

        {/* More menu or Retry Button */}
        <div className="relative" ref={menuRef}>
          {hasFailed ? (
            <button
              onClick={(e) => { e.preventDefault(); onRetry?.(); }}
              className="px-2.5 py-1 text-[10px] font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors pointer-events-auto"
            >
              Retry
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-ink-faint opacity-0 transition-all duration-200 hover:bg-background/80 hover:text-ink-muted group-hover:opacity-100 ${isOptimistic ? 'invisible' : ''}`}
                aria-label="Card actions"
              >
                <MoreHorizontal size={15} strokeWidth={1.8} />
              </button>

              {isMenuOpen && !isOptimistic && (
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
            </>
          )}
        </div>
      </div>

      {/* Card content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.article>
  );
}
