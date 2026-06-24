'use client';

import { useEffect, useState } from 'react';
import { Thought } from '@/types';

interface SemanticMinimapProps {
  thoughts: Thought[];
}

export default function SemanticMinimap({ thoughts }: SemanticMinimapProps) {
  const [sortedThoughts, setSortedThoughts] = useState<Thought[]>([]);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  // Effect to sort thoughts visually (offsetTop) rather than strictly array order
  // because CSS column masonry causes elements to render out of top-to-bottom sequence.
  useEffect(() => {
    // Wait a brief moment for the DOM to reflow/paint the masonry layout
    const timer = setTimeout(() => {
      const domNodes = document.querySelectorAll('article[data-thought-id]');
      const nodePositions = new Map<string, number>();

      domNodes.forEach((node) => {
        const id = node.getAttribute('data-thought-id');
        if (id) {
          // getBoundingClientRect().top gives us the true visual vertical position relative to the viewport.
          // By adding window.scrollY, we get the absolute top offset on the page.
          const topPos = node.getBoundingClientRect().top + window.scrollY;
          nodePositions.set(id, topPos);
        }
      });

      // Sort thoughts by their physical position on the screen
      const sorted = [...thoughts].sort((a, b) => {
        const posA = nodePositions.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const posB = nodePositions.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return posA - posB;
      });

      setSortedThoughts(sorted);
    }, 100);

    return () => clearTimeout(timer);
  }, [thoughts]);

  // Effect to track which thoughts are currently visible in the viewport using IntersectionObserver
  useEffect(() => {
    const domNodes = document.querySelectorAll('article[data-thought-id]');
    if (domNodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const id = entry.target.getAttribute('data-thought-id');
            if (!id) return;
            
            if (entry.isIntersecting) {
              next.add(id);
            } else {
              next.delete(id);
            }
          });
          return next;
        });
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.2, // Trigger when 20% of the element is visible
      }
    );

    domNodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
    };
  }, [thoughts]); // Re-bind observer when thoughts array changes

  const handleNavigate = (id: string) => {
    const element = document.querySelector(`article[data-thought-id="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (thoughts.length === 0) return null;

  return (
    <div className="fixed right-4 top-1/2 z-50 flex w-2 -translate-y-1/2 flex-col gap-1 overflow-hidden rounded-full bg-white/30 py-2 shadow-sm backdrop-blur-sm dark:bg-black/30" style={{ maxHeight: '60vh' }}>
      {sortedThoughts.map((thought) => {
        const isVisible = visibleIds.has(thought.id);
        
        let colorClass = 'bg-slate-400/70'; // Default knowledge
        if (thought.type === 'task') colorClass = 'bg-green-400/70';
        if (thought.type === 'idea') colorClass = 'bg-amber-400/70';

        return (
          <div
            key={thought.id}
            onClick={() => handleNavigate(thought.id)}
            className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${colorClass} ${
              isVisible ? 'w-3 -ml-0.5 opacity-100 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'w-2 opacity-40 hover:opacity-70'
            }`}
            title={`Navigate to ${thought.type}`}
          />
        );
      })}
    </div>
  );
}
