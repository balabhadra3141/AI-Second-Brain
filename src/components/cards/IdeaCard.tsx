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

function cleanContent(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function IdeaCard({ thought, onDelete, onRetry, onUpdate, onSynthesize, isFocused }: IdeaCardProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) { next.delete(index); } else { next.add(index); }
      return next;
    });
  };

  const cleaned = cleanContent(thought.content);
  const words = cleaned.split(/\s+/);
  const isLong = words.length > 20;
  const preview = isLong && !expanded ? words.slice(0, 20).join(' ') + '…' : thought.content;

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

      <div className="flex gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-500 ring-1 ring-amber-200/50">
            <Lightbulb size={13} strokeWidth={1.8} />
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
              className="text-[13.5px] leading-relaxed text-foreground"
            />
          ) : (
            <>
              <p className="text-[13.5px] leading-relaxed text-foreground whitespace-pre-line">
                {preview}
              </p>
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-1 text-[11px] font-medium text-amber-600 hover:text-foreground transition-colors cursor-pointer"
                >
                  {expanded ? 'Show less ↑' : 'Read more ↓'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {thought.nextSteps && thought.nextSteps.length > 0 && (
        <div className="mt-3.5 ml-10 border-t border-amber-100/70 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600/70">
              Action Steps
            </p>
            <span className="text-[10px] text-ink-faint">
              {checkedSteps.size}/{thought.nextSteps.length}
            </span>
          </div>

          <div className="mb-2.5 h-[2px] w-full overflow-hidden rounded-full bg-amber-100">
            <motion.div
              className="h-full rounded-full bg-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${(checkedSteps.size / thought.nextSteps.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>

          <ul className="space-y-1.5">
            {thought.nextSteps.map((step, i) => {
              const isChecked = checkedSteps.has(i);
              return (
                <motion.li
                  key={i}
                  layout
                  className="flex cursor-pointer items-start gap-2"
                  onClick={() => toggleStep(i)}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isChecked ? (
                      <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 350, damping: 20 }}>
                        <CheckSquare size={13} strokeWidth={1.8} className="text-amber-500" />
                      </motion.span>
                    ) : (
                      <Square size={13} strokeWidth={1.5} className="text-amber-300" />
                    )}
                  </div>
                  <span className={`text-[12px] leading-snug transition-all duration-200 ${
                    isChecked ? 'text-ink-faint line-through decoration-amber-300' : 'text-ink-muted'
                  }`}>
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
