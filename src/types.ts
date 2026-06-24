export type ThoughtType = 'task' | 'knowledge' | 'idea';

export type Priority = 'low' | 'medium' | 'high';

export interface Connection {
  id: string;
  title: string;
  preview: string;
}

export interface Thought {
  id: string;
  type: ThoughtType;
  content: string;
  createdAt: Date;
  // Task-specific
  completed?: boolean;
  priority?: Priority;
  deadline?: string;
  // Knowledge-specific
  insights?: string;
  connections?: Connection[];
  source?: string;
  // Idea-specific
  nextSteps?: string[];
}
