'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface InlineEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  className?: string;
}

export default function InlineEditor({ initialContent, onSave, onCancel, className = '' }: InlineEditorProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to the end
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (content.trim()) {
        onSave(content.trim());
      } else {
        onCancel();
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={(e) => setContent(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        // Optional: save on blur or cancel on blur
        if (content.trim() && content !== initialContent) {
          onSave(content.trim());
        } else {
          onCancel();
        }
      }}
      className={`w-full bg-transparent resize-none outline-none border-b border-accent/50 focus:border-accent text-inherit font-inherit p-0 m-0 overflow-hidden ${className}`}
      rows={1}
      style={{ minHeight: '1.5em' }}
    />
  );
}
