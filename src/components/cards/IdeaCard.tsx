'use client';

import { Lightbulb } from 'lucide-react';
import CardWrapper from './CardWrapper';
import { Thought } from '@/types';

interface IdeaCardProps {
  thought: Thought;
  onDelete: () => void;
}

export default function IdeaCard({ thought, onDelete }: IdeaCardProps) {
  return (
    <CardWrapper
      type="idea"
      timestamp={thought.createdAt}
      onDelete={onDelete}
      onCopy={() => navigator.clipboard.writeText(thought.content)}
      className="border-idea-border/60 bg-idea-bg/40"
    >
      {/* Idea content */}
      <div className="flex gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100/80 text-amber-600">
            <Lightbulb size={14} strokeWidth={1.8} />
          </div>
        </div>
        <p className="text-[14px] leading-relaxed text-foreground">
          {thought.content}
        </p>
      </div>

      {/* Next Practical Steps */}
      {thought.nextSteps && thought.nextSteps.length > 0 && (
        <div className="mt-4 ml-10">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            Next Steps
          </p>
          <ul className="space-y-1.5">
            {thought.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-[7px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400/80" />
                <span className="text-[13px] leading-relaxed text-ink-muted">
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardWrapper>
  );
}
