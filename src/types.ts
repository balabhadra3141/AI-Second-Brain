// ─── Core Types ──────────────────────────────────────────────────────────────

export type ThoughtType = 'task' | 'knowledge' | 'idea';

export type Priority = 'low' | 'medium' | 'high';

/** A related historical node surfaced as a contextual connection */
export interface Connection {
  id: string;
  title: string;
  preview: string;
}

// ─── Thought Interface ────────────────────────────────────────────────────────

export interface Thought {
  /** Unique identifier (UUID or sequential string) */
  id: string;

  /** ISO timestamp of creation */
  createdAt: Date;

  /** Semantic classification of the thought */
  type: ThoughtType;

  /** Raw captured content as entered by the user */
  content: string;

  // ── Task-specific metadata ─────────────────────────────
  /** Whether the task has been marked complete */
  completed?: boolean;
  /** Urgency priority level */
  priority?: Priority;
  /** Human-readable deadline string (e.g. "June 27" or "tomorrow") */
  deadline?: string;

  // ── Knowledge-specific metadata ────────────────────────
  /** AI-generated insights summary for this knowledge fragment */
  insights?: string;
  /** Array of related historical thought nodes (context graph) */
  connections?: Connection[];
  /** Source attribution for the knowledge clip */
  source?: string;

  // ── Idea-specific metadata ─────────────────────────────
  /** Ordered array of actionable next steps extracted from the idea */
  nextSteps?: string[];
}
