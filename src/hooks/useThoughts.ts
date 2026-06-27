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
  const [tasks, setTasks] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadThoughts = async () => {
    try {
      const res = await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_thoughts' }),
      });
      const data = await res.json();
      if (data.ok && data.items) {
        if (data.items.length > 0) {
          const mapped = data.items.map((item: any) => ({
            id: item.id,
            type: item.type as ThoughtType,
            content: item.content,
            createdAt: new Date(item.created_at || Date.now()),
            completed: !!item.completed,
            priority: (item.priority as Priority) || 'low',
            deadline: item.deadline || undefined,
            nextSteps: Array.isArray(item.next_steps) ? item.next_steps : [],
            insights: item.insights || '',
            connections: Array.isArray(item.tags) ? item.tags : [],
          }));
          setThoughts(mapped);
        } else {
          // Seed the thoughts table if empty
          const seeded: Thought[] = [];
          for (const t of SEED_THOUGHTS) {
            const resCreate = await fetch('/api/lemma', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'create_thought',
                payload: {
                  title: t.content.slice(0, 50),
                  content: t.content,
                  type: t.type,
                  x: 0,
                  y: 0,
                  priority: t.priority || 'low',
                  deadline: t.deadline || null,
                  insights: t.insights || '',
                  next_steps: t.nextSteps || [],
                  tags: [],
                  completed: !!t.completed,
                },
              }),
            });
            const dCreate = await resCreate.json();
            if (dCreate.ok && dCreate.record) {
              const item = dCreate.record;
              seeded.push({
                id: item.id,
                type: item.type as ThoughtType,
                content: item.content,
                createdAt: new Date(item.created_at || Date.now()),
                completed: !!item.completed,
                priority: (item.priority as Priority) || 'low',
                deadline: item.deadline || undefined,
                nextSteps: Array.isArray(item.next_steps) ? item.next_steps : [],
                insights: item.insights || '',
                connections: [],
              });
            }
          }
          setThoughts(seeded);
        }
      }
    } catch (e) {
      console.error('Failed to list thoughts, falling back to seed', e);
      setThoughts(SEED_THOUGHTS);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasksAndInsights = async () => {
    try {
      const tRes = await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_tasks' }),
      });
      const tData = await tRes.json();
      if (tData.ok) setTasks(tData.items || []);

      const iRes = await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_insights' }),
      });
      const iData = await iRes.json();
      if (iData.ok) setInsights(iData.items || []);
    } catch (e) {
      console.error('Failed to load tasks and insights', e);
    }
  };

  const runProactiveInsights = async () => {
    try {
      const res = await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_insights' }),
      });
      const data = await res.json();
      if (data.ok) {
        setInsights(data.items || []);
      }
    } catch (e) {
      console.error('Failed to run insights', e);
    }
  };

  const executeAction = async (actionType: string, context: string) => {
    try {
      const res = await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_action', actionType, context }),
      });
      const data = await res.json();
      if (data.ok) {
        // Refresh tasks list
        const tRes = await fetch('/api/lemma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list_tasks' }),
        });
        const tData = await tRes.json();
        if (tData.ok) setTasks(tData.items || []);
      }
    } catch (e) {
      console.error('Failed to run action', e);
    }
  };

  const loadRelationships = async () => {
    try {
      const res = await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_relationships' }),
      });
      const data = await res.json();
      if (data.ok) {
        setRelationships(data.items || []);
      }
    } catch (e) {
      console.error('Failed to load relationships', e);
    }
  };

  useEffect(() => {
    loadThoughts();
    loadTasksAndInsights();
    loadRelationships();
  }, []);

  const addThought = useCallback(async (content: string) => {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: Thought = {
      id: optimisticId,
      type: 'knowledge',
      content,
      createdAt: new Date(),
      isOptimistic: true,
      hasFailed: false,
    };
    setThoughts((prev) => [optimistic, ...prev]);

    try {
      const classified = await classifyViaLemma(content);
      const res = await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_thought',
          payload: {
            title: content.slice(0, 50),
            content: content,
            type: classified.type,
            x: 0,
            y: 0,
            priority: classified.priority || 'low',
            deadline: classified.deadline || null,
            insights: classified.insights || '',
            next_steps: classified.nextSteps || [],
            tags: [],
            completed: false,
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.record) {
        const item = data.record;
        const real: Thought = {
          id: item.id,
          type: item.type as ThoughtType,
          content: item.content,
          createdAt: new Date(item.created_at || Date.now()),
          completed: !!item.completed,
          priority: (item.priority as Priority) || 'low',
          deadline: item.deadline || undefined,
          nextSteps: Array.isArray(item.next_steps) ? item.next_steps : [],
          insights: item.insights || '',
          connections: [],
        };
        setThoughts((prev) => prev.map((t) => (t.id === optimisticId ? real : t)));
        // Generate insights passively on new captures
        void runProactiveInsights();
      } else {
        throw new Error();
      }
    } catch {
      setThoughts((prev) =>
        prev.map((t) => (t.id === optimisticId ? { ...t, hasFailed: true, isOptimistic: false } : t))
      );
    }
  }, []);

  const addThoughtDirectly = useCallback(async (type: ThoughtType, content: string, insights = '', nextSteps: string[] = []) => {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: Thought = {
      id: optimisticId,
      type,
      content,
      createdAt: new Date(),
      isOptimistic: true,
      hasFailed: false,
      insights,
      nextSteps,
    };
    setThoughts((prev) => [optimistic, ...prev]);

    try {
      const res = await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_thought',
          payload: {
            title: content.slice(0, 50),
            content,
            type,
            x: 0,
            y: 0,
            priority: 'low',
            deadline: null,
            insights,
            next_steps: nextSteps,
            tags: [],
            completed: false,
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.record) {
        const item = data.record;
        const real: Thought = {
          id: item.id,
          type: item.type as ThoughtType,
          content: item.content,
          createdAt: new Date(item.created_at || Date.now()),
          completed: !!item.completed,
          priority: 'low',
          nextSteps: item.next_steps || [],
          insights: item.insights || '',
          connections: [],
        };
        setThoughts((prev) => prev.map((t) => (t.id === optimisticId ? real : t)));
        void runProactiveInsights();
      }
    } catch {
      setThoughts((prev) => prev.filter((t) => t.id !== optimisticId));
    }
  }, []);

  const deleteThought = useCallback(async (id: string) => {
    setThoughts((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_thought', id }),
      });
    } catch (e) {
      console.error('Failed to delete thought from DB', e);
    }
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    let currentCompleted = false;
    setThoughts((prev) =>
      prev.map((t) => {
        if (t.id === id && t.type === 'task') {
          currentCompleted = !t.completed;
          return { ...t, completed: currentCompleted };
        }
        return t;
      })
    );
    try {
      await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_thought',
          id,
          payload: { completed: currentCompleted },
        }),
      });
    } catch (e) {
      console.error('Failed to toggle task in DB', e);
    }
  }, []);

  const updateThought = useCallback(async (id: string, content: string) => {
    setThoughts((prev) => prev.map((t) => (t.id === id ? { ...t, content } : t)));
    try {
      await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_thought',
          id,
          payload: { content, title: content.slice(0, 50) },
        }),
      });
    } catch (e) {
      console.error('Failed to update thought in DB', e);
    }
  }, []);

  const updateCoordinates = useCallback(async (id: string, x: number, y: number) => {
    setThoughts((prev) => prev.map((t) => (t.id === id ? { ...t, x, y } : t)));
    try {
      await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_thought',
          id,
          payload: { x, y },
        }),
      });
    } catch (e) {
      console.error('Failed to update coordinates in DB', e);
    }
  }, []);

  const thoughtsRef = useRef(thoughts);
  useEffect(() => {
    thoughtsRef.current = thoughts;
  }, [thoughts]);

  const synthesizeThoughts = useCallback((id1: string, id2: string) => {
    const thought1 = thoughtsRef.current.find((t) => t.id === id1);
    const thought2 = thoughtsRef.current.find((t) => t.id === id2);
    if (!thought1 || !thought2) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: Thought = {
      id: optimisticId,
      type: 'knowledge',
      content: `${thought1.content}\n\n---\n\n${thought2.content}`,
      createdAt: new Date(),
      isOptimistic: true,
      hasFailed: false,
    };

    setThoughts((prev) => {
      const filtered = prev.filter((t) => t.id !== id1 && t.id !== id2);
      return [optimistic, ...filtered];
    });

    // Delete source thoughts
    void deleteThought(id1);
    void deleteThought(id2);

    synthesizeViaLemma(thought1.content, thought2.content)
      .then(async (realThought) => {
        const res = await fetch('/api/lemma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_thought',
            payload: {
              title: realThought.content.slice(0, 50),
              content: realThought.content,
              type: realThought.type,
              x: 0,
              y: 0,
              priority: 'low',
              insights: realThought.insights || '',
              next_steps: [],
              tags: [],
              completed: false,
            },
          }),
        });
        const data = await res.json();
        if (data.ok && data.record) {
          const item = data.record;
          const real: Thought = {
            id: item.id,
            type: item.type as ThoughtType,
            content: item.content,
            createdAt: new Date(item.created_at || Date.now()),
            completed: !!item.completed,
            priority: (item.priority as Priority) || 'low',
            deadline: item.deadline || undefined,
            nextSteps: Array.isArray(item.next_steps) ? item.next_steps : [],
            insights: item.insights || '',
            connections: [],
          };
          setThoughts((prev) => prev.map((t) => (t.id === optimisticId ? real : t)));
        }
      })
      .catch(() => {
        // On failure, reload thoughts
        void loadThoughts();
      });
  }, []);

  const createRelationship = useCallback(async (sourceId: string, targetId: string, relationType = 'relates_to') => {
    try {
      const res = await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_relationship',
          payload: {
            source_thought_id: sourceId,
            target_thought_id: targetId,
            relation_type: relationType,
            confidence: 1.0
          }
        }),
      });
      const data = await res.json();
      if (data.ok && data.record) {
        setRelationships((prev) => [...prev, data.record]);
      }
    } catch (e) {
      console.error('Failed to create relationship', e);
    }
  }, []);

  const deleteRelationship = useCallback(async (id: string) => {
    setRelationships((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_relationship', id }),
      });
    } catch (e) {
      console.error('Failed to delete relationship', e);
    }
  }, []);

  return {
    thoughts,
    isLoading,
    tasks,
    insights,
    relationships,
    addThought,
    deleteThought,
    toggleTask,
    updateThought,
    retryThought: () => {},
    synthesizeThoughts,
    runProactiveInsights,
    executeAction,
    loadTasksAndInsights,
    createRelationship,
    deleteRelationship,
    updateCoordinates,
    loadThoughts,
    addThoughtDirectly,
  };
}
