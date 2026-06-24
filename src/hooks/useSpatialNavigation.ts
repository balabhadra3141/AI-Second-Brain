import { useState, useEffect, useCallback } from 'react';

export function useSpatialNavigation(isPaletteOpen: boolean) {
  const [focusedThoughtId, setFocusedThoughtId] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 1. Bypass hook if palette is open
      if (isPaletteOpen) return;

      // 2. Bypass hook if user is actively typing in an input or textarea
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      // If user is editing, we suspend spatial navigation
      // Only allow Escape to exit editing, or Cmd/Ctrl+Enter to save (handled locally in the card)
      if (isInputFocused) {
        if (e.key === 'Escape') {
          // The card will catch this to cancel edit, but we also ensure we keep focus
          e.preventDefault();
        }
        return;
      }

      // Action bindings
      if (focusedThoughtId) {
        const activeCard = document.querySelector(`[data-thought-id="${focusedThoughtId}"]`);
        
        if (e.key === 'Enter') {
          e.preventDefault();
          const toggleBtn = activeCard?.querySelector('[data-action="toggle-task"]') as HTMLElement;
          if (toggleBtn) toggleBtn.click();
          return;
        }
        
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          const insightsBtn = activeCard?.querySelector('[data-action="expand-insights"]') as HTMLElement;
          if (insightsBtn) insightsBtn.click();
          return;
        }

        if (e.key.toLowerCase() === 'e') {
          e.preventDefault();
          const editBtn = activeCard?.querySelector('[data-action="edit-thought"]') as HTMLElement;
          if (editBtn) editBtn.click();
          return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          const deleteBtn = activeCard?.querySelector('[data-action="delete-thought"]') as HTMLElement;
          if (deleteBtn) deleteBtn.click();
          return;
        }
      }

      // Directional mapping
      const key = e.key;
      let dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
      if (key === 'ArrowUp' || key === 'k') dir = 'UP';
      if (key === 'ArrowDown' || key === 'j') dir = 'DOWN';
      if (key === 'ArrowLeft' || key === 'h') dir = 'LEFT';
      if (key === 'ArrowRight' || key === 'l') dir = 'RIGHT';

      if (!dir) return;

      e.preventDefault();

      const cards = Array.from(document.querySelectorAll('[data-thought-id]')) as HTMLElement[];
      if (cards.length === 0) return;

      // If nothing is focused, jump to the first card
      if (!focusedThoughtId) {
        const firstId = cards[0].getAttribute('data-thought-id');
        if (firstId) {
          setFocusedThoughtId(firstId);
          cards[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      const currentCard = cards.find((c) => c.getAttribute('data-thought-id') === focusedThoughtId);
      if (!currentCard) {
        // Fallback if card was deleted
        const firstId = cards[0].getAttribute('data-thought-id');
        if (firstId) setFocusedThoughtId(firstId);
        return;
      }

      const currentRect = currentCard.getBoundingClientRect();
      const cx = currentRect.left + currentRect.width / 2;
      const cy = currentRect.top + currentRect.height / 2;

      let bestCard: HTMLElement | null = null;
      let minScore = Infinity;

      for (const card of cards) {
        if (card === currentCard) continue;

        const rect = card.getBoundingClientRect();
        const tx = rect.left + rect.width / 2;
        const ty = rect.top + rect.height / 2;

        const dx = tx - cx;
        const dy = ty - cy;

        // Ensure strict directional validity
        let valid = false;
        if (dir === 'UP' && dy < -5) valid = true; // -5 threshold to allow minor overlaps
        if (dir === 'DOWN' && dy > 5) valid = true;
        if (dir === 'LEFT' && dx < -5) valid = true;
        if (dir === 'RIGHT' && dx > 5) valid = true;

        if (!valid) continue;

        // Apply directional weighting to penalize diagonal snapping
        let score = Infinity;
        if (dir === 'UP' || dir === 'DOWN') {
          score = Math.abs(dy) + Math.abs(dx) * 3;
        } else {
          // LEFT or RIGHT
          score = Math.abs(dx) + Math.abs(dy) * 3;
        }

        if (score < minScore) {
          minScore = score;
          bestCard = card;
        }
      }

      if (bestCard) {
        const newId = bestCard.getAttribute('data-thought-id');
        if (newId) {
          setFocusedThoughtId(newId);
          // Calculate offset to ensure smooth scrolling isn't completely hidden by headers
          bestCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    },
    [focusedThoughtId, isPaletteOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { focusedThoughtId, setFocusedThoughtId };
}
