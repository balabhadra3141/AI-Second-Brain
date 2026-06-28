'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Image as ImageIcon, File } from 'lucide-react';
import type { Document } from '@/hooks/useDocuments';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export default function DocumentViewerModal({ isOpen, onClose, document }: DocumentViewerModalProps) {
  if (!document) return null;

  const isImage = document.mime_type?.startsWith('image/');
  const isPdf = document.mime_type === 'application/pdf';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-raised">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {isImage ? <ImageIcon size={16} /> : isPdf ? <FileText size={16} /> : <File size={16} />}
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-foreground leading-tight">
                    {document.title}
                  </h3>
                  <p className="text-[11px] text-ink-faint font-medium mt-0.5">
                    {document.mime_type || 'Unknown Type'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-ink-faint hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Close viewer"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden flex items-center justify-center">
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={document.fileUrl} 
                  alt={document.title} 
                  className="w-full h-full object-contain p-4"
                />
              ) : isPdf ? (
                <iframe 
                  src={`${document.fileUrl}#toolbar=0`} 
                  className="w-full h-full border-none"
                  title={document.title}
                />
              ) : (
                <div className="text-center">
                  <File size={48} className="mx-auto text-zinc-400 mb-4 opacity-50" />
                  <p className="text-[13px] font-medium text-ink-muted">
                    Preview not available for this file type.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
