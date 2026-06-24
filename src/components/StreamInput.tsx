'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, ArrowUp } from 'lucide-react';

interface StreamInputProps {
  onSubmit: (content: string) => void;
}

export default function StreamInput({ onSubmit }: StreamInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }, []);

  const hasContent = value.trim().length > 0;

  return (
    <div className="sticky top-12 z-40 bg-background pb-2 pt-4">
      <div
        className={`overflow-hidden rounded-2xl border bg-surface-raised transition-all duration-300 ${
          isFocused
            ? 'border-border-hover shadow-lg shadow-black/[0.03]'
            : 'border-border-subtle shadow-sm'
        }`}
      >
        <textarea
          ref={textareaRef}
          id="stream-input"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What's on your mind? Drop a thought, task, or link…"
          rows={1}
          className="block w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[15px] leading-relaxed text-foreground placeholder:text-ink-faint focus:outline-none"
          style={{ minHeight: '44px', maxHeight: '200px' }}
        />

        {/* Utility bar */}
        <div className="flex items-center justify-between border-t border-border-subtle/50 px-3 py-2">
          <div className="flex items-center gap-1">
            <button
              id="btn-attach"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors duration-150 hover:bg-background hover:text-ink-muted"
              aria-label="Attach file"
            >
              <Paperclip size={16} strokeWidth={1.8} />
            </button>
            <button
              id="btn-mic"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors duration-150 hover:bg-background hover:text-ink-muted"
              aria-label="Voice input"
            >
              <Mic size={16} strokeWidth={1.8} />
            </button>
          </div>

          <AnimatePresence>
            {hasContent && (
              <motion.button
                id="btn-submit"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleSubmit}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background transition-colors duration-150 hover:bg-foreground/80"
                aria-label="Submit thought"
              >
                <ArrowUp size={16} strokeWidth={2} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Subtle hint */}
      <p className="mt-2 text-center text-[11px] text-ink-faint/60">
        Press <kbd className="rounded bg-background px-1 py-0.5 font-mono text-[10px] text-ink-faint">Enter</kbd> to send · <kbd className="rounded bg-background px-1 py-0.5 font-mono text-[10px] text-ink-faint">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
