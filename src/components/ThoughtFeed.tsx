'use client';

import { AnimatePresence } from 'framer-motion';
import { Thought } from '@/types';
import TaskCard from './cards/TaskCard';
import KnowledgeCard from './cards/KnowledgeCard';
import IdeaCard from './cards/IdeaCard';
import SkeletonCard from './cards/SkeletonCard';

interface ThoughtFeedProps {
  thoughts: Thought[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onToggleTask: (id: string) => void;
}

export default function ThoughtFeed({
  thoughts,
  isLoading,
  onDelete,
  onToggleTask,
}: ThoughtFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        <SkeletonCard variant="task" />
        <SkeletonCard variant="knowledge" />
        <SkeletonCard variant="idea" />
        <SkeletonCard variant="task" />
      </div>
    );
  }

  if (thoughts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 h-px w-12 bg-border-subtle" />
        <p className="text-[14px] text-ink-faint">
          Your stream is empty
        </p>
        <p className="mt-1 text-[12px] text-ink-faint/60">
          Drop a thought above to begin
        </p>
        <div className="mt-4 h-px w-12 bg-border-subtle" />
      </div>
    );
  }

  return (
    <div className="space-y-3 py-4">
      <AnimatePresence mode="popLayout">
        {thoughts.map((thought) => {
          switch (thought.type) {
            case 'task':
              return (
                <TaskCard
                  key={thought.id}
                  thought={thought}
                  onToggle={() => onToggleTask(thought.id)}
                  onDelete={() => onDelete(thought.id)}
                />
              );
            case 'knowledge':
              return (
                <KnowledgeCard
                  key={thought.id}
                  thought={thought}
                  onDelete={() => onDelete(thought.id)}
                />
              );
            case 'idea':
              return (
                <IdeaCard
                  key={thought.id}
                  thought={thought}
                  onDelete={() => onDelete(thought.id)}
                />
              );
            default:
              return null;
          }
        })}
      </AnimatePresence>
    </div>
  );
}
