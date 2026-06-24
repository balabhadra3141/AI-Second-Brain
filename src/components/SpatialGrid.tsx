'use client';

import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Thought } from '@/types';
import TaskCard from './cards/TaskCard';
import KnowledgeCard from './cards/KnowledgeCard';
import IdeaCard from './cards/IdeaCard';
import SkeletonCard from './cards/SkeletonCard';

interface SpatialGridProps {
  thoughts: Thought[];
  isProcessing: boolean;
  density?: 'comfortable' | 'compact';
  onDelete: (id: string) => void;
  onToggleTask: (id: string) => void;
  onRetry?: (id: string) => void;
  onUpdate?: (id: string, content: string) => void;
  focusedThoughtId?: string | null;
}

const emptyVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function SpatialGrid({
  thoughts,
  isProcessing,
  density = 'comfortable',
  onDelete,
  onToggleTask,
  onRetry,
  onUpdate,
  focusedThoughtId,
}: SpatialGridProps) {
  // Empty state
  if (!isProcessing && thoughts.length === 0) {
    return (
      <motion.div
        variants={emptyVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-surface-raised">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-faint" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <p className="text-[15px] font-medium text-ink-muted">Your spatial brain is empty</p>
        <p className="mt-1.5 max-w-[220px] text-[13px] leading-relaxed text-ink-faint">
          Press <kbd className="rounded-md border border-border-subtle bg-background px-1.5 py-0.5 font-mono text-[11px]">⌘K</kbd> to capture your first thought
        </p>
      </motion.div>
    );
  }

  return (
    <div className="py-6">
      {/* Masonry columns layout */}
      <div className={`columns-1 sm:columns-2 lg:columns-3 [column-fill:_balance] ${density === 'compact' ? 'gap-2' : 'gap-4'}`}>
        {/* Processing skeleton — removed from top if using optimistic UI, but let's keep it if isProcessing is true globally */}
        {isProcessing && (
          <div className={`${density === 'compact' ? 'mb-2' : 'mb-4'} break-inside-avoid`}>
            <SkeletonCard variant="default" />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {thoughts.map((thought, index) => {
            const originalId = (thought as any).originalId || thought.id;
            const isFocused = thought.id === focusedThoughtId;
            
            const cardContent = (() => {
              switch (thought.type) {
                case 'task':
                  return (
                    <TaskCard
                      key={thought.id}
                      thought={thought}
                      onToggle={() => onToggleTask(thought.id)}
                      onDelete={() => onDelete(thought.id)}
                      onRetry={() => onRetry?.(thought.id)}
                      onUpdate={(content) => onUpdate?.(thought.id, content)}
                      isFocused={isFocused}
                    />
                  );
                case 'knowledge':
                  return (
                    <KnowledgeCard
                      key={thought.id}
                      thought={thought}
                      onDelete={() => onDelete(thought.id)}
                      onRetry={() => onRetry?.(thought.id)}
                      onUpdate={(content) => onUpdate?.(thought.id, content)}
                      isFocused={isFocused}
                    />
                  );
                case 'idea':
                  return (
                    <IdeaCard
                      key={thought.id}
                      thought={thought}
                      onDelete={() => onDelete(thought.id)}
                      onRetry={() => onRetry?.(thought.id)}
                      onUpdate={(content) => onUpdate?.(thought.id, content)}
                      isFocused={isFocused}
                    />
                  );
                default:
                  return null;
              }
            })();

            if (!cardContent) return null;

            return (
              <motion.div
                key={thought.id}
                layoutId={originalId}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                  delay: index < 6 && !thought.isOptimistic ? index * 0.04 : 0,
                }}
                className={`${density === 'compact' ? 'mb-2' : 'mb-4'} break-inside-avoid`}
              >
                {cardContent}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
