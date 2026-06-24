'use client';

import { motion } from 'framer-motion';

interface TimeScrubberProps {
  value: number;
  onChange: (val: number) => void;
  label: string;
}

export default function TimeScrubber({ value, onChange, label }: TimeScrubberProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      {/* Floating label container tied to the percentage value */}
      <div 
        className="relative w-full mb-3"
      >
        <motion.div 
          className="absolute bottom-0 -translate-x-1/2 pointer-events-none flex flex-col items-center"
          animate={{ left: `${value}%` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted bg-surface-raised px-2 py-1 rounded-md border border-border-subtle shadow-sm whitespace-nowrap">
            Showing: {label}
          </span>
          {/* Small triangle pointing down to the handle */}
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-border-subtle mt-[1px]"></div>
        </motion.div>
      </div>

      <div className="relative h-6 flex items-center group">
        {/* Custom Track */}
        <div className="absolute w-full h-[2px] bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          {/* Filled portion of the track */}
          <motion.div 
            className="h-full bg-zinc-400 dark:bg-zinc-500 origin-left"
            animate={{ scaleX: value / 100 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </div>

        {/* Custom Handle */}
        <motion.div 
          className="absolute w-2 h-6 bg-zinc-900 dark:bg-white rounded-full shadow-md pointer-events-none -ml-1"
          animate={{ left: `${value}%` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />

        {/* Native Invisible Range Input */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Time travel scrubber"
        />
      </div>
    </div>
  );
}
