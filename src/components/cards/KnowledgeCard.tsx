'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Link2, Sparkles } from 'lucide-react';
import CardWrapper from './CardWrapper';
import { Thought } from '@/types';

interface KnowledgeCardProps {
  thought: Thought;
  onDelete: () => void;
}

export default function KnowledgeCard({ thought, onDelete }: KnowledgeCardProps) {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);

  return (
    <CardWrapper
      type="knowledge"
      timestamp={thought.createdAt}
      onDelete={onDelete}
      onCopy={() => navigator.clipboard.writeText(thought.content)}
    >
      {/* Editorial quote style */}
      <div className="border-l-2 border-knowledge-accent/40 pl-4">
        <p className="font-serif text-[15px] leading-[1.75] text-foreground italic">
          {thought.content}
        </p>
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
          <div>
            <button
              onClick={() => setInsightsOpen(!insightsOpen)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-semibold text-ink-muted transition-colors duration-150 hover:bg-background"
            >
              <Sparkles size={13} strokeWidth={1.8} />
              <span>Insights Summary</span>
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
                  <p className="px-2 py-2 text-[13px] leading-relaxed text-ink-muted">
                    {thought.insights}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Context Connections */}
        {thought.connections && thought.connections.length > 0 && (
          <div>
            <button
              onClick={() => setConnectionsOpen(!connectionsOpen)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-semibold text-ink-muted transition-colors duration-150 hover:bg-background"
            >
              <Link2 size={13} strokeWidth={1.8} />
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
                  <div className="space-y-1.5 px-2 py-2">
                    {thought.connections.map((conn) => (
                      <div
                        key={conn.id}
                        className="rounded-lg border border-border-subtle/60 bg-background px-3 py-2 transition-colors duration-150 hover:border-border-hover cursor-pointer"
                      >
                        <p className="text-[12px] font-medium text-foreground">
                          {conn.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-faint line-clamp-1">
                          {conn.preview}
                        </p>
                      </div>
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
