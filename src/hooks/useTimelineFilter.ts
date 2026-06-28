import { useState, useMemo, useDeferredValue } from 'react';
import { Thought } from '@/types';

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function useTimelineFilter(thoughts: Thought[]) {
  // Scrubber value ranges from 0 (oldest) to 100 (newest)
  const [scrubberValue, setScrubberValue] = useState(100);
  
  // Defer the filtered value calculation to prevent dropping frames on drag
  const deferredValue = useDeferredValue(scrubberValue);

  const { minTime, maxTime } = useMemo(() => {
    if (!thoughts || thoughts.length === 0) {
      return { minTime: 0, maxTime: 0 };
    }
    // Thoughts might not be perfectly sorted, so let's find absolute min/max
    let min = thoughts[0].createdAt.getTime();
    let max = min;
    for (const t of thoughts) {
      const time = t.createdAt.getTime();
      if (time < min) min = time;
      if (time > max) max = time;
    }
    return { minTime: min, maxTime: max };
  }, [thoughts]);

  const { filteredThoughts, cutoffDate } = useMemo(() => {
    if (thoughts.length === 0) {
      return { filteredThoughts: thoughts, cutoffDate: new Date(0) };
    }

    // Calculate cutoff time based on the deferred 0-100 scrubber value
    const timeSpan = maxTime - minTime;
    const cutoffTime = minTime + (timeSpan * (deferredValue / 100));
    
    // Create Date object for the cutoff text
    const dateObj = new Date(cutoffTime);
    const text = formatRelativeDate(dateObj);

    // Filter thoughts: Keep thoughts that are OLDER than or EQUAL to the cutoff time.
    // Wait, the scrubber is like a time machine.
    // If scrubber = 100 (Now), we see everything up to Now.
    // If scrubber = 50, we see everything up to halfway point. We shouldn't see newer stuff.
    // So we keep thoughts where createdAt.getTime() <= cutoffTime.
    const filtered = thoughts.filter((t) => t.createdAt.getTime() <= cutoffTime);

    return {
      filteredThoughts: filtered,
      cutoffDate: dateObj,
    };
  }, [thoughts, minTime, maxTime, deferredValue]);

  // Provide an immediate text for the UI so the label updates instantly while dragging
  const immediateCutoffTime = minTime + ((maxTime - minTime) * (scrubberValue / 100));
  const immediateCutoffText = formatRelativeDate(new Date(immediateCutoffTime));

  return {
    filteredThoughts,
    scrubberValue,
    setScrubberValue,
    cutoffDate,
    cutoffText: immediateCutoffText,
  };
}
