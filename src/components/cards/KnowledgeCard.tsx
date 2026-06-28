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

// Strip markdown headers and trim content for a clean preview
function cleanMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '') // remove ## headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^[-*]\s+/gm, '• ') // bullets
    .replace(/\n{3,}/g, '\n\n') // collapse blank lines
    .trim();
}

// Get first N words for a short excerpt
function excerpt(text: string, words = 22): { preview: string; hasMore: boolean } {
  const cleaned = cleanMarkdown(text);
  const arr = cleaned.split(/\s+/);
  if (arr.length <= words) return { preview: cleaned, hasMore: false };
  return { preview: arr.slice(0, words).join(' ') + '…', hasMore: true };
}

export default function KnowledgeCard({ thought, onDelete, onRetry, onUpdate, onSynthesize, isFocused }: KnowledgeCardProps) {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Show full content by default for knowledge cards
  const displayContent = thought.content;
  const hasMore = false;

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

      {/* Left accent bar + header */}
      <div className="border-l-[3px] border-knowledge-accent/50 pl-3.5">
        <div className="mb-2 flex items-center gap-1.5">
          <BookOpen size={11} strokeWidth={2} className="text-knowledge-accent" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-knowledge-accent/80">
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
            className="text-[13.5px] leading-[1.65] text-foreground"
          />
        ) : (
          <>
            <p className="text-[13.5px] leading-[1.65] text-foreground whitespace-pre-line">
              {displayContent}
            </p>
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1.5 text-[11px] font-medium text-knowledge-accent hover:text-foreground transition-colors cursor-pointer"
              >
                {expanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
            )}
          </>
        )}

        {thought.source && (
          <p className="mt-2 text-[11px] font-medium text-ink-faint tracking-wide">
            — {thought.source}
          </p>
        )}
      </div>

      {/* Expandable sections */}
      <div className="mt-3.5 space-y-1">
        {thought.insights && (
          <div className="overflow-hidden rounded-lg border border-border-subtle/60">
            <button
              data-action="expand-insights"
              onClick={() => setInsightsOpen(!insightsOpen)}
              id={`insight-toggle-${thought.id}`}
              className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-semibold text-ink-muted transition-colors duration-150 hover:bg-background/60"
            >
              <Sparkles size={11} strokeWidth={1.8} className="text-violet-400 flex-shrink-0" />
              <span>AI Insights</span>
              <motion.span
                animate={{ rotate: insightsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <ChevronDown size={11} strokeWidth={2} />
              </motion.span>
            </button>

            <AnimatePresence>
              {insightsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border-subtle/50 bg-background/40 px-3 py-2.5">
                    <p className="text-[12px] leading-relaxed text-ink-muted">
                      {cleanMarkdown(thought.insights)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {thought.connections && thought.connections.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border-subtle/60">
            <button
              onClick={() => setConnectionsOpen(!connectionsOpen)}
              id={`connections-toggle-${thought.id}`}
              className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-semibold text-ink-muted transition-colors duration-150 hover:bg-background/60"
            >
              <Link2 size={11} strokeWidth={1.8} className="text-blue-400 flex-shrink-0" />
              <span>Connections ({thought.connections.length})</span>
              <motion.span
                animate={{ rotate: connectionsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <ChevronDown size={11} strokeWidth={2} />
              </motion.span>
            </button>

            <AnimatePresence>
              {connectionsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 border-t border-border-subtle/50 bg-background/40 px-3 py-2.5">
                    {thought.connections.map((conn, i) => (
                      <div
                        key={conn.id}
                        className="flex items-start gap-2 rounded-md border border-border-subtle/50 bg-surface-raised px-2.5 py-1.5"
                      >
                        <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-300" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-foreground">{conn.title}</p>
                          <p className="mt-0.5 truncate text-[10px] text-ink-faint">{conn.preview}</p>
                        </div>
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
