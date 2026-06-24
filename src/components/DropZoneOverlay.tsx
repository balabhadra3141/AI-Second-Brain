'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';

interface DropZoneOverlayProps {
  isDragging: boolean;
}

export default function DropZoneOverlay({ isDragging }: DropZoneOverlayProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border-hover bg-surface-raised p-12 shadow-xl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-ink-muted">
              <Upload size={24} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-medium text-foreground">
                Drop to add to your stream
              </p>
              <p className="mt-1 text-[13px] text-ink-faint">
                Files will be attached to your next thought
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
