'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Thought, ThoughtType, Priority } from '@/types';

// ─── Lemma API Client ─────────────────────────────────────────────────────────
// All AI calls route through the secure Next.js API route, which in turn
// calls the Lemma SDK server-side. This keeps the LemmaClient out of the
// browser bundle and avoids CORS issues with the local stack.

/**
 * HACKATHON REQUIREMENT: Utilizing Lemma SDK for semantic thought classification.
 * Calls POST /api/lemma { action: "classify" } → structured Thought JSON.
 */
async function classifyViaLemma(content: string): Promise<Thought> {
  const res = await fetch('/api/lemma', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'classify', content }),
  });

  if (!res.ok) {
    throw new Error(`Lemma classify failed: ${res.status}`);
  }

  const { result } = await res.json();
  const type = (result.type as ThoughtType) ?? 'knowledge';

  const thought: Thought = {
    id: String(Date.now()),
    type,
    content,
    createdAt: new Date(),
    ...(type === 'task' && {
      completed: false,
      priority: (result.priority as Priority) ?? 'low',
      deadline: result.deadline ?? undefined,
    }),
    ...(type === 'idea' && {
      nextSteps: Array.isArray(result.nextSteps) ? result.nextSteps : [],
    }),
    ...(type === 'knowledge' && {
      insights: result.insights ?? '',
      connections: [],
    }),
  };

  return thought;
}

/**
 * HACKATHON REQUIREMENT: Utilizing Lemma SDK for drag-and-drop node synthesis.
 * Calls POST /api/lemma { action: "synthesize" } → single merged Thought JSON.
 */
async function synthesizeViaLemma(content1: string, content2: string): Promise<Thought> {
  const res = await fetch('/api/lemma', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'synthesize', content1, content2 }),
  });

  if (!res.ok) {
    throw new Error(`Lemma synthesize failed: ${res.status}`);
  }

  const { result } = await res.json();
  const type = (result.type as ThoughtType) ?? 'knowledge';

  return {
    id: String(Date.now()),
    type,
    content: result.content ?? `${content1}\n\n---\n\n${content2}`,
    createdAt: new Date(),
    insights: result.insights ?? undefined,
    connections: [],
  };
}

/**
 * HACKATHON REQUIREMENT: Utilizing Lemma SDK for Context Lens semantic connections.
 * Calls POST /api/lemma { action: "connect" } → array of related card IDs.
 */
export async function findSemanticConnections(
  activeCard: Pick<Thought, 'id' | 'content'>,
  gridCards: Pick<Thought, 'id' | 'content'>[]
): Promise<string[]> {
  const candidates = gridCards.filter((c) => c.id !== activeCard.id);
  if (candidates.length === 0) return [];

  const res = await fetch('/api/lemma', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'connect', activeCard, gridCards: candidates }),
  });

  if (!res.ok) return [];
  const { connectedIds } = await res.json();
  return Array.isArray(connectedIds) ? connectedIds : [];
}

/**
 * HACKATHON REQUIREMENT: Utilizing Lemma SDK for natural-language Q&A.
 * Calls POST /api/lemma { action: "query" } → conversational answer string.
 */
export async function queryViaLemma(
  question: string,
  gridContext: Pick<Thought, 'id' | 'type' | 'content' | 'createdAt'>[]
): Promise<string> {
  const res = await fetch('/api/lemma', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'query', question, gridContext }),
  });

  if (!res.ok) throw new Error(`Lemma query failed: ${res.status}`);
  const { answer } = await res.json();
  return answer ?? '';
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
// Initial thoughts shown before the user adds anything. These are static and
// are replaced by real Lemma-classified data the moment a user captures a thought.

const SEED_THOUGHTS: Thought[] = [
  {
    id: '1',
    type: 'task',
    content: 'Review and finalize the Q3 product roadmap with the engineering team',
    createdAt: new Date(Date.now() - 1000 * 60 * 12),
    completed: false,
    priority: 'high',
    deadline: '2026-06-27',
  },
  {
    id: '2',
    type: 'knowledge',
    content:
      'Retrieval-Augmented Generation (RAG) systems work best when chunks are between 256–512 tokens. Overlapping windows of 20% improve contextual coherence at retrieval time.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    source: 'Research Paper — "Scaling RAG for Production"',
    insights:
      'This suggests our current chunking strategy at 1024 tokens is likely too coarse. Reducing chunk size could improve answer relevance by ~30% based on the paper\'s benchmarks.',
    connections: [
      { id: 'c1', title: 'Vector DB comparison notes', preview: 'Pinecone vs Weaviate latency benchmarks from last week...' },
      { id: 'c2', title: 'Embedding model selection', preview: 'OpenAI ada-002 vs Cohere embed-v3 cost analysis...' },
    ],
  },
  {
    id: '3',
    type: 'idea',
    content:
      'What if StreamBrain could auto-detect when a user is in "deep work" mode based on input patterns and suppress all notifications? A focus-aware AI assistant.',
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
    nextSteps: [
      'Research existing focus detection algorithms and heuristics',
      'Prototype a simple input velocity tracker as a signal',
      'Design a minimal "Focus Mode" UI state with subtle visual shift',
    ],
  },
  {
    id: '4',
    type: 'task',
    content: 'Set up CI/CD pipeline for the staging environment using GitHub Actions',
    createdAt: new Date(Date.now() - 1000 * 60 * 180),
    completed: true,
    priority: 'medium',
  },
  {
    id: '5',
    type: 'knowledge',
    content:
      'The Feynman Technique: To truly understand something, try to explain it in simple terms. If you can\'t explain it simply, you don\'t understand it well enough.',
    createdAt: new Date(Date.now() - 1000 * 60 * 300),
    source: 'Mental Models — Farnam Street',
    insights:
      'Could drive StreamBrain\'s "explain back" feature — when a user saves a knowledge note, the AI prompts them to re-explain it in their own words.',
    connections: [
      { id: 'c3', title: 'Spaced repetition research', preview: 'Leitner system intervals for optimal recall...' },
    ],
  },
  {
    id: '6',
    type: 'idea',
    content:
      'Build a "thought genealogy" feature that visually maps how one idea evolved into others over time — a tree of intellectual lineage.',
    createdAt: new Date(Date.now() - 1000 * 60 * 420),
    nextSteps: [
      'Sketch a minimal tree visualization using D3.js or a simpler canvas approach',
      'Define the data model for parent-child thought relationships',
      'Explore LLM-based similarity matching to auto-suggest connections',
    ],
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isSyncing = useRef(false);
  
  const synthesisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSynthesisRef = useRef<{ 
    optimisticId: string; 
    thought1: Thought; 
    thought2: Thought;
    index1: number;
    index2: number;
  } | null>(null);

  useEffect(() => {
    const handleUndo = (e: Event) => {
      const customEvent = e as CustomEvent<{ optimisticId: string }>;
      const { optimisticId } = customEvent.detail;
      
      if (pendingSynthesisRef.current && pendingSynthesisRef.current.optimisticId === optimisticId) {
        if (synthesisTimeoutRef.current) {
          clearTimeout(synthesisTimeoutRef.current);
          synthesisTimeoutRef.current = null;
        }
        
        const { thought1, thought2, index1, index2 } = pendingSynthesisRef.current;
        setThoughts((curr) => {
          const restored = curr.filter((t) => t.id !== optimisticId);
          
          // Insert back at original indices (highest index first to prevent shifting the lower index)
          const toInsert = [
            { t: thought1, i: index1 },
            { t: thought2, i: index2 }
          ].sort((a, b) => b.i - a.i);

          for (const item of toInsert) {
            const safeIndex = Math.min(Math.max(0, item.i), restored.length);
            restored.splice(safeIndex, 0, item.t);
          }
          return restored;
        });
        pendingSynthesisRef.current = null;
      }
    };

    window.addEventListener('undoSynthesis', handleUndo);
    return () => window.removeEventListener('undoSynthesis', handleUndo);
  }, []);

  // Safely initialize offline queue listener on client side
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineQueue();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      return () => window.removeEventListener('online', handleOnline);
    }
  }, []);

  useEffect(() => {
    // Load seed data immediately; real Lemma classifications flow in as the user adds thoughts
    setThoughts(SEED_THOUGHTS);
    setIsLoading(false);
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      syncOfflineQueue();
    }
  }, []);

  const syncOfflineQueue = async () => {
    if (isSyncing.current) return;

    const queueStr = localStorage.getItem('offline_thoughts_queue');
    if (!queueStr) return;

    let queue: { id: string; content: string }[] = [];
    try {
      queue = JSON.parse(queueStr);
    } catch {
      localStorage.removeItem('offline_thoughts_queue');
      return;
    }

    if (queue.length === 0) return;
    isSyncing.current = true;

    const remainingQueue = [...queue];
    for (const item of queue) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) break;

      try {
        // HACKATHON REQUIREMENT: Utilizing Lemma SDK to classify thoughts that were
        // captured offline and are now being synced.
        const realThought = await classifyViaLemma(item.content);
        setThoughts((prev) =>
          prev.map((t) => (t.id === item.id ? { ...realThought, id: item.id } : t))
        );
        remainingQueue.shift();
        localStorage.setItem('offline_thoughts_queue', JSON.stringify(remainingQueue));
      } catch {
        setThoughts((prev) =>
          prev.map((t) =>
            t.id === item.id ? { ...t, hasFailed: true, isOptimistic: false } : t
          )
        );
        remainingQueue.shift();
        localStorage.setItem('offline_thoughts_queue', JSON.stringify(remainingQueue));
      }
    }
    isSyncing.current = false;
  };

  const processThought = async (optimisticId: string, content: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const queueStr = localStorage.getItem('offline_thoughts_queue');
      const queue = queueStr ? JSON.parse(queueStr) : [];
      queue.push({ id: optimisticId, content });
      localStorage.setItem('offline_thoughts_queue', JSON.stringify(queue));
      return;
    }

    try {
      // HACKATHON REQUIREMENT: Utilizing Lemma SDK for real-time thought classification.
      const realThought = await classifyViaLemma(content);
      setThoughts((prev) =>
        prev.map((t) => (t.id === optimisticId ? { ...realThought, id: optimisticId } : t))
      );
    } catch {
      setThoughts((prev) =>
        prev.map((t) =>
          t.id === optimisticId ? { ...t, hasFailed: true, isOptimistic: false } : t
        )
      );
    }
  };

  const addThought = useCallback((content: string) => {
    const optimisticId = `optimistic-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const optimistic: Thought = {
      id: optimisticId,
      type: 'knowledge',
      content,
      createdAt: new Date(),
      isOptimistic: true,
      hasFailed: false,
    };

    setThoughts((prev) => [optimistic, ...prev]);
    processThought(optimisticId, content);
  }, []);

  const retryThought = useCallback((id: string) => {
    setThoughts((prev) => {
      const thought = prev.find((t) => t.id === id);
      if (!thought) return prev;
      processThought(id, thought.content);
      return prev.map((t) =>
        t.id === id ? { ...t, hasFailed: false, isOptimistic: true } : t
      );
    });
  }, []);

  const deleteThought = useCallback((id: string) => {
    setThoughts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setThoughts((prev) =>
      prev.map((t) =>
        t.id === id && t.type === 'task' ? { ...t, completed: !t.completed } : t
      )
    );
  }, []);

  const updateThought = useCallback((id: string, content: string) => {
    setThoughts((prev) => prev.map((t) => (t.id === id ? { ...t, content } : t)));
  }, []);

  const thoughtsRef = useRef(thoughts);
  useEffect(() => { thoughtsRef.current = thoughts; }, [thoughts]);

  const synthesizeThoughts = useCallback((id1: string, id2: string) => {
    const thought1 = thoughtsRef.current.find((t) => t.id === id1);
    const thought2 = thoughtsRef.current.find((t) => t.id === id2);
    if (!thought1 || !thought2) return;

    const optimisticId = `optimistic-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const optimistic: Thought = {
      id: optimisticId,
      type: 'knowledge',
      content: `${thought1.content}\n\n---\n\n${thought2.content}`,
      createdAt: new Date(),
      isOptimistic: true,
      hasFailed: false,
    };

    const index1 = thoughtsRef.current.findIndex((t) => t.id === id1);
    const index2 = thoughtsRef.current.findIndex((t) => t.id === id2);

    setThoughts((prev) => {
      const filtered = prev.filter((t) => t.id !== id1 && t.id !== id2);
      return [optimistic, ...filtered];
    });

    pendingSynthesisRef.current = { optimisticId, thought1, thought2, index1, index2 };

    synthesisTimeoutRef.current = setTimeout(() => {
      synthesisTimeoutRef.current = null;
      pendingSynthesisRef.current = null;

      // HACKATHON REQUIREMENT: Utilizing Lemma SDK for drag-and-drop node synthesis.
      synthesizeViaLemma(thought1.content, thought2.content)
        .then((realThought) => {
          setThoughts((curr) =>
            curr.map((t) => (t.id === optimisticId ? { ...realThought, id: optimisticId } : t))
          );
        })
        .catch(() => {
          alert('Synthesis failed. Restoring original thoughts.');
          setThoughts((curr) => {
            const restored = curr.filter((t) => t.id !== optimisticId);
            const toInsert = [
              { t: thought1, i: index1 },
              { t: thought2, i: index2 }
            ].sort((a, b) => b.i - a.i);

            for (const item of toInsert) {
              const safeIndex = Math.min(Math.max(0, item.i), restored.length);
              restored.splice(safeIndex, 0, item.t);
            }
            return restored;
          });
        });
    }, 4000);
  }, []);

  return {
    thoughts,
    isLoading,
    addThought,
    deleteThought,
    toggleTask,
    updateThought,
    retryThought,
    synthesizeThoughts,
  };
}
