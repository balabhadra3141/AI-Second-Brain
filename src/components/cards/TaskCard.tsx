'use client';

import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import CardWrapper from './CardWrapper';
import { Thought, Priority } from '@/types';

interface TaskCardProps {
  thought: Thought;
  onToggle: () => void;
  onDelete: () => void;
  onRetry?: () => void;
}

const priorityStyles: Record<Priority, { dot: string; label: string; pill: string }> = {
  high: { dot: 'bg-priority-high', label: 'High', pill: 'bg-red-50 text-red-600 border-red-100' },
  medium: { dot: 'bg-priority-medium', label: 'Med', pill: 'bg-amber-50 text-amber-600 border-amber-100' },
  low: { dot: 'bg-priority-low', label: 'Low', pill: 'bg-slate-50 text-slate-500 border-slate-100' },
};

export default function TaskCard({ thought, onToggle, onDelete, onRetry }: TaskCardProps) {
  const priority = thought.priority || 'low';
  const ps = priorityStyles[priority];

  return (
    <CardWrapper
      type="task"
      timestamp={thought.createdAt}
      onDelete={onDelete}
      onCopy={() => navigator.clipboard.writeText(thought.content)}
      className={`bg-task-bg/60 border-task-border/70 transition-opacity duration-500 ${thought.completed ? 'opacity-50' : 'opacity-100'}`}
      isOptimistic={thought.isOptimistic}
      hasFailed={thought.hasFailed}
      onRetry={onRetry}
    >
      <div className={thought.completed ? 'task-completed' : ''}>
        {/* Checkbox + content */}
        <div className="flex gap-3">
          <button
            onClick={onToggle}
            className="mt-0.5 flex-shrink-0"
            aria-label={thought.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            <motion.div
              className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] transition-colors duration-200 ${
                thought.completed
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-task-border bg-white hover:border-emerald-400'
              }`}
              whileTap={{ scale: 0.82 }}
            >
              {thought.completed && (
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <motion.path
                    d="M2 6L5 9L10 3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  />
                </motion.svg>
              )}
            </motion.div>
          </button>

          <p
            className={`task-text flex-1 text-[14px] leading-relaxed transition-colors duration-300 ${
              thought.completed ? 'text-ink-faint' : 'text-foreground'
            }`}
          >
            {thought.content}
          </p>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-[30px]">
          {/* Priority badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${ps.pill}`}
          >
            <span className={`h-[5px] w-[5px] rounded-full ${ps.dot}`} />
            {ps.label}
          </span>

          {/* Deadline pill */}
          {thought.deadline && (
            <div className="flex items-center gap-1 rounded-md border border-border-subtle bg-background px-2 py-0.5">
              <Calendar size={10} strokeWidth={2} className="text-ink-faint" />
              <span className="text-[10px] font-medium text-ink-muted">{thought.deadline}</span>
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
