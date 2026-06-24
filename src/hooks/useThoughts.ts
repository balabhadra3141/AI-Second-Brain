'use client';

import { useState, useCallback, useEffect } from 'react';
import { Thought, ThoughtType, Priority } from '@/types';

const MOCK_THOUGHTS: Thought[] = [
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
      'This suggests our current chunking strategy at 1024 tokens is likely too coarse. Reducing chunk size could improve answer relevance by ~30% based on the paper\'s benchmarks. Consider implementing a sliding window approach in the ingestion pipeline.',
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
      'User-test with 5 beta participants for one week',
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
      'The Feynman Technique: To truly understand something, try to explain it in simple terms. If you can\'t explain it simply, you don\'t understand it well enough. The gaps in your explanation reveal the gaps in your knowledge.',
    createdAt: new Date(Date.now() - 1000 * 60 * 300),
    source: 'Mental Models — Farnam Street',
    insights:
      'This could be a powerful framework for StreamBrain\'s "explain back" feature. When a user saves a knowledge note, the AI could prompt them to re-explain it in their own words, strengthening retention.',
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

let nextId = 100;

export function useThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setThoughts(MOCK_THOUGHTS);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const addThought = useCallback((content: string) => {
    const type = classifyThought(content);
    const newThought: Thought = {
      id: String(nextId++),
      type,
      content,
      createdAt: new Date(),
      ...(type === 'task' && {
        completed: false,
        priority: inferPriority(content),
        deadline: inferDeadline(content),
      }),
      ...(type === 'idea' && {
        nextSteps: generateNextSteps(content),
      }),
      ...(type === 'knowledge' && {
        insights: 'AI is analyzing this knowledge fragment for deeper insights...',
        connections: [],
      }),
    };
    setThoughts((prev) => [newThought, ...prev]);
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
    setThoughts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, content } : t))
    );
  }, []);

  return { thoughts, isLoading, addThought, deleteThought, toggleTask, updateThought };
}

function classifyThought(content: string): ThoughtType {
  const lower = content.toLowerCase();
  const taskKeywords = ['todo', 'task', 'need to', 'must', 'should', 'deadline', 'finish', 'complete', 'set up', 'review', 'fix', 'implement', 'deploy', 'schedule'];
  const ideaKeywords = ['what if', 'idea', 'maybe', 'could we', 'imagine', 'brainstorm', 'concept', 'explore', 'build a', 'create a', 'design a'];

  if (taskKeywords.some((k) => lower.includes(k))) return 'task';
  if (ideaKeywords.some((k) => lower.includes(k))) return 'idea';
  return 'knowledge';
}

function inferPriority(content: string): Priority {
  const lower = content.toLowerCase();
  if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap')) return 'high';
  if (lower.includes('important') || lower.includes('soon')) return 'medium';
  return 'low';
}

function inferDeadline(content: string): string | undefined {
  const match = content.match(/by\s+([\w\s,]+\d{4}|\w+day|tomorrow|next\s+\w+)/i);
  if (match) return match[1].trim();
  return undefined;
}

function generateNextSteps(content: string): string[] {
  return [
    'Research existing solutions and prior art',
    'Draft a minimal proof-of-concept prototype',
    'Gather feedback from 2–3 potential users',
  ];
}
