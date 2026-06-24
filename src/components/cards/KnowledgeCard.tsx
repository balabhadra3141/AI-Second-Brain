'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Link2, Sparkles, BookOpen } from 'lucide-react';
import CardWrapper from './CardWrapper';
import { Thought } from '@/types';
import InlineEditor from '../InlineEditor';

interface KnowledgeCardProps {
  thought: Thought;
  onDelete: () => void;
  onRetry?: () => void;
  onUpdate?: (content: string) => void;
  onSynthesize?: (draggedId: string, targetId: string) => void;
  isFocused?: boolean;
}

export default function KnowledgeCard({ thought, onDelete, onRetry, onUpdate, onSynthesize, isFocused }: KnowledgeCardProps) {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <CardWrapper
      type="knowledge"
      id={thought.id}
      isFocused={isFocused}
      timestamp={thought.createdAt}
      onDelete={onDelete}
      onCopy={() => navigator.clipboard.writeText(thought.content)}
      onEdit={() => setIsEditing(true)}
      className="bg-knowledge-bg border-knowledge-border/80"
      isOptimistic={thought.isOptimistic}
      hasFailed={thought.hasFailed}
      onRetry={onRetry}
      onSynthesize={onSynthesize}
    >
      <button data-action="edit-thought" className="hidden" onClick={() => setIsEditing(true)} />

      {/* Editorial quote style with thick left accent */}
      <div className="border-l-[3px] border-knowledge-accent/60 pl-4">
        <div className="mb-1.5 flex items-center gap-1.5">
          <BookOpen size={12} strokeWidth={2} className="text-knowledge-accent" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-knowledge-accent">
            Knowledge
          </span>
        </div>
        {isEditing ? (
          <InlineEditor
            initialContent={thought.content}
            onSave={(newContent) => {
              if (onUpdate) onUpdate(newContent);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            className="font-serif text-[14.5px] leading-[1.8] text-foreground italic"
          />
        ) : (
          <p className="font-serif text-[14.5px] leading-[1.8] text-foreground italic">
            {thought.content}
          </p>
        )}
        {thought.source && (
          <p className="mt-2 text-[11px] font-medium text-ink-faint tracking-wide">
            — {thought.source}
          </p>
        )}
      </div>

      {/* Expandable sections */}
      <div className="mt-4 space-y-1">
        {/* Insights Summary */}
        {thought.insights && (
          <div className="overflow-hidden rounded-xl border border-border-subtle/70">
            <button
              data-action="expand-insights"
              onClick={() => setInsightsOpen(!insightsOpen)}
              id={`insight-toggle-${thought.id}`}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-[12px] font-semibold text-ink-muted transition-colors duration-150 hover:bg-background/80"
            >
              <Sparkles size={13} strokeWidth={1.8} className="text-violet-400" />
              <span>Reveal Insights Summary</span>
              <motion.span
                animate={{ rotate: insightsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <ChevronDown size={13} strokeWidth={2} />
              </motion.span>
            </button>

            <AnimatePresence>
              {insightsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border-subtle/60 bg-background/50 px-3 py-3">
                    <p className="text-[13px] leading-relaxed text-ink-muted">
                      {thought.insights}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Context Connections */}
        {thought.connections && thought.connections.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border-subtle/70">
            <button
              onClick={() => setConnectionsOpen(!connectionsOpen)}
              id={`connections-toggle-${thought.id}`}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-[12px] font-semibold text-ink-muted transition-colors duration-150 hover:bg-background/80"
            >
              <Link2 size={13} strokeWidth={1.8} className="text-blue-400" />
              <span>
                Context Connections{' '}
                <span className="font-normal text-ink-faint">
                  ({thought.connections.length})
                </span>
              </span>
              <motion.span
                animate={{ rotate: connectionsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <ChevronDown size={13} strokeWidth={2} />
              </motion.span>
            </button>

            <AnimatePresence>
              {connectionsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 border-t border-border-subtle/60 bg-background/50 px-3 py-3">
                    {thought.connections.map((conn, i) => (
                      <motion.div
                        key={conn.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        className="group flex cursor-pointer items-start gap-2.5 rounded-lg border border-border-subtle/60 bg-surface-raised px-3 py-2 transition-all duration-150 hover:border-border-hover hover:shadow-sm"
                      >
                        <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-300" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium text-foreground group-hover:text-accent transition-colors">
                            {conn.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-ink-faint">
                            {conn.preview}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
