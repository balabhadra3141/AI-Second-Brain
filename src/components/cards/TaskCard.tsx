'use client';

import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import CardWrapper from './CardWrapper';
import { Thought, Priority } from '@/types';

interface TaskCardProps {
  thought: Thought;
  onToggle: () => void;
  onDelete: () => void;
}

const priorityStyles: Record<Priority, { dot: string; label: string }> = {
  high: { dot: 'bg-priority-high', label: 'High' },
  medium: { dot: 'bg-priority-medium', label: 'Med' },
  low: { dot: 'bg-priority-low', label: 'Low' },
};

export default function TaskCard({ thought, onToggle, onDelete }: TaskCardProps) {
  const priority = thought.priority || 'low';
  const ps = priorityStyles[priority];

  return (
    <CardWrapper
      type="task"
      timestamp={thought.createdAt}
      onDelete={onDelete}
      onCopy={() => navigator.clipboard.writeText(thought.content)}
      className={thought.completed ? 'opacity-60' : ''}
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
                  : 'border-border-hover bg-transparent hover:border-emerald-400'
              }`}
              whileTap={{ scale: 0.85 }}
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
            className={`task-text text-[14px] leading-relaxed transition-colors duration-300 ${
              thought.completed ? 'text-ink-faint' : 'text-foreground'
            }`}
          >
            {thought.content}
          </p>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex items-center gap-3 pl-[30px]">
          {/* Priority badge */}
          <div className="flex items-center gap-1.5">
            <span className={`h-[5px] w-[5px] rounded-full ${ps.dot}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
              {ps.label}
            </span>
          </div>

          {/* Deadline */}
          {thought.deadline && (
            <div className="flex items-center gap-1 text-ink-faint">
              <Calendar size={11} strokeWidth={1.8} />
              <span className="text-[11px] font-medium">{thought.deadline}</span>
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
