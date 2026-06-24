'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckSquare, Square } from 'lucide-react';
import CardWrapper from './CardWrapper';
import { Thought } from '@/types';
import InlineEditor from '../InlineEditor';

interface IdeaCardProps {
  thought: Thought;
  onDelete: () => void;
  onRetry?: () => void;
  onUpdate?: (content: string) => void;
  onSynthesize?: (draggedId: string, targetId: string) => void;
  isFocused?: boolean;
}

export default function IdeaCard({ thought, onDelete, onRetry, onUpdate, onSynthesize, isFocused }: IdeaCardProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [isEditing, setIsEditing] = useState(false);

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <CardWrapper
      type="idea"
      id={thought.id}
      isFocused={isFocused}
      timestamp={thought.createdAt}
      onDelete={onDelete}
      onCopy={() => navigator.clipboard.writeText(thought.content)}
      onEdit={() => setIsEditing(true)}
      className="bg-idea-bg border-idea-border/70"
      isOptimistic={thought.isOptimistic}
      hasFailed={thought.hasFailed}
      onRetry={onRetry}
      onSynthesize={onSynthesize}
    >
      <button data-action="edit-thought" className="hidden" onClick={() => setIsEditing(true)} />

      {/* Idea content */}
      <div className="flex gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 ring-1 ring-amber-200/60">
            <Lightbulb size={15} strokeWidth={1.8} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <InlineEditor
              initialContent={thought.content}
              onSave={(newContent) => {
                if (onUpdate) onUpdate(newContent);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
              className="text-[14px] leading-relaxed text-foreground"
            />
          ) : (
            <p className="text-[14px] leading-relaxed text-foreground">
              {thought.content}
            </p>
          )}
        </div>
      </div>

      {/* Next Practical Steps — tracked checklist */}
      {thought.nextSteps && thought.nextSteps.length > 0 && (
        <div className="mt-4 ml-11">
          <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-600/80">
            <span>Action Steps</span>
            <span className="font-normal text-ink-faint">
              ({checkedSteps.size}/{thought.nextSteps.length})
            </span>
          </p>

          {/* Progress bar */}
          <div className="mb-3 h-[3px] w-full overflow-hidden rounded-full bg-amber-100">
            <motion.div
              className="h-full rounded-full bg-amber-400"
              initial={{ width: 0 }}
              animate={{
                width: `${(checkedSteps.size / thought.nextSteps.length) * 100}%`,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>

          <ul className="space-y-2">
            {thought.nextSteps.map((step, i) => {
              const isChecked = checkedSteps.has(i);
              return (
                <motion.li
                  key={i}
                  layout
                  className="flex cursor-pointer items-start gap-2.5"
                  onClick={() => toggleStep(i)}
                >
                  {/* Step number indicator */}
                  <div className="mt-0.5 flex-shrink-0">
                    {isChecked ? (
                      <motion.span
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      >
                        <CheckSquare
                          size={15}
                          strokeWidth={1.8}
                          className="text-amber-500"
                        />
                      </motion.span>
                    ) : (
                      <Square size={15} strokeWidth={1.5} className="text-amber-300" />
                    )}
                  </div>
                  <span
                    className={`text-[13px] leading-snug transition-all duration-200 ${
                      isChecked
                        ? 'text-ink-faint line-through decoration-amber-300 decoration-[1.5px]'
                        : 'text-ink-muted'
                    }`}
                  >
                    {step}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>
      )}
    </CardWrapper>
  );
}
