'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, X, Zap, MicOff } from 'lucide-react';
import VoiceVisualizer from './VoiceVisualizer';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, file?: File) => void;
}

export default function CommandPalette({ isOpen, onClose, onSubmit }: CommandPaletteProps) {
  const [value, setValue] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus textarea when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    } else {
      setValue('');
      setAttachedFile(null);
      setIsRecording(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed, attachedFile ?? undefined);
    onClose();
  }, [value, attachedFile, onSubmit, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
  };

  const toggleRecording = () => setIsRecording((prev) => !prev);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="palette-modal"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-[20%] z-[70] w-full max-w-xl -translate-x-1/2 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-2xl shadow-black/[0.18] ring-1 ring-black/[0.04]">
              {/* Textarea */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {isRecording ? (
                    <VoiceVisualizer
                      key="voice-visualizer"
                      onTranscriptionComplete={(text) => {
                        setValue((prev) => (prev ? prev + ' ' + text : text));
                        setIsRecording(false);
                      }}
                      onCancel={() => setIsRecording(false)}
                    />
                  ) : (
                    <motion.div
                      key="textarea-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <textarea
                        ref={textareaRef}
                        id="command-palette-input"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Capture a thought, prompt a document, or record a task..."
                        rows={4}
                        className="block w-full resize-none border-none bg-transparent px-5 pt-5 pb-3 text-[15px] leading-relaxed text-foreground placeholder:text-ink-faint/70 focus:outline-none"
                        style={{ minHeight: '110px', maxHeight: '280px' }}
                      />

                      {/* Close button */}
                      <button
                        onClick={onClose}
                        id="palette-close-btn"
                        className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-all duration-150 hover:bg-background hover:text-foreground"
                        aria-label="Close command palette"
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Attached file badge */}
              <AnimatePresence>
                {attachedFile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden px-5"
                  >
                    <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-background px-3 py-1.5">
                      <Paperclip size={11} strokeWidth={2} className="text-ink-faint" />
                      <span className="max-w-[200px] truncate text-[11px] font-medium text-ink-muted">
                        {attachedFile.name}
                      </span>
                      <button
                        onClick={() => setAttachedFile(null)}
                        className="text-ink-faint hover:text-foreground"
                        aria-label="Remove attachment"
                      >
                        <X size={10} strokeWidth={2.5} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Micro-toolbar */}
              <div className="flex items-center justify-between border-t border-border-subtle/60 px-4 py-3">
                <div className="flex items-center gap-1">
                  {/* File attachment */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    id="palette-file-input"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    id="palette-attach-btn"
                    className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-ink-faint transition-colors duration-150 hover:bg-background hover:text-ink-muted"
                    aria-label="Attach file"
                  >
                    <Paperclip size={14} strokeWidth={1.8} />
                    <span className="text-[11px] font-medium">Attach</span>
                  </button>

                  {/* Mic recording */}
                  {!isRecording && (
                    <button
                      onClick={toggleRecording}
                      id="palette-mic-btn"
                      className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-ink-faint transition-colors duration-150 hover:bg-background hover:text-ink-muted"
                      aria-label="Start recording"
                    >
                      <Mic size={14} strokeWidth={1.8} />
                      <span className="text-[11px] font-medium">Audio</span>
                    </button>
                  )}
                </div>

                {/* Right side: shortcut hint + submit */}
                <div className="flex items-center gap-3">
                  <span className="hidden items-center gap-1 sm:flex">
                    <kbd className="inline-flex h-5 items-center rounded border border-border-subtle bg-background px-1.5 font-mono text-[10px] font-medium text-ink-faint">
                      Enter
                    </kbd>
                    <span className="text-[11px] text-ink-faint">to Stream</span>
                  </span>

                  <motion.button
                    id="palette-submit-btn"
                    whileTap={{ scale: 0.93 }}
                    onClick={handleSubmit}
                    disabled={!value.trim()}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-foreground px-3.5 text-background transition-all duration-150 hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Submit thought"
                  >
                    <Zap size={13} strokeWidth={2} />
                    <span className="text-[12px] font-semibold">Stream</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Helper hint below modal */}
            <p className="mt-2.5 text-center text-[11px] text-white/60">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>{' '}
              to dismiss
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
