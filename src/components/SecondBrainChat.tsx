'use client';

import { useState, useRef, useEffect } from 'react';
import { Thought, ThoughtType } from '@/types';
import { Send, Bot, User, Sparkles, Link2, Plus, Check, Brain, Clipboard, Lightbulb, GraduationCap, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface SecondBrainChatProps {
  thoughts: Thought[];
  onQuery: (question: string, context: any[]) => Promise<string>;
  onAddThoughtDirectly: (type: ThoughtType, content: string, insights?: string, nextSteps?: string[]) => Promise<void>;
  onSelectView: (view: 'grid' | 'graph' | 'chat') => void;
}

const STARTERS = [
  'What are my most creative ideas?',
  'What high-priority tasks do I have?',
  'Summarize my knowledge notes',
  'What ideas connect to each other?',
];

function ProposedCapture({ type, content, onSave }: { type: ThoughtType; content: string; onSave: () => Promise<void> }) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handle = async () => {
    setState('saving');
    await onSave();
    setState('saved');
  };

  const colors: Record<ThoughtType, string> = {
    task: 'border-emerald-200 bg-emerald-50',
    idea: 'border-amber-200 bg-amber-50',
    knowledge: 'border-indigo-200 bg-indigo-50',
  };
  const dots: Record<ThoughtType, string> = {
    task: 'bg-emerald-500',
    idea: 'bg-amber-500',
    knowledge: 'bg-indigo-500',
  };

  return (
    <div className={`mt-2.5 rounded-xl border p-3 ${colors[type]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${dots[type]}`} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">{type} · proposed</span>
        </div>
        <button
          onClick={handle}
          disabled={state !== 'idle'}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer ${
            state === 'saved'
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : state === 'saving'
              ? 'opacity-50 bg-zinc-100 text-ink-faint'
              : 'bg-foreground text-background hover:opacity-90'
          }`}
        >
          {state === 'saved' ? <><Check size={9} /> Saved</> : state === 'saving' ? 'Saving…' : <><Plus size={9} /> Capture</>}
        </button>
      </div>
      <p className="text-[12px] text-ink-muted italic leading-relaxed">"{content}"</p>
    </div>
  );
}

export default function SecondBrainChat({ thoughts, onQuery, onAddThoughtDirectly, onSelectView }: SecondBrainChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "I'm your Second Brain assistant, powered by Lemma. Ask me anything about your captured thoughts, or say something like \"remember to review the roadmap\" to capture it instantly.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: trimmed, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);

    try {
      const ctx = thoughts.map((t) => ({ id: t.id, type: t.type, content: t.content, createdAt: t.createdAt }));
      const answer = await onQuery(trimmed, ctx);
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: answer, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'assistant', text: 'Could not reach your Second Brain. Is the local Lemma stack running?', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderText = (msg: Message) => {
    const captureRegex = /\[CREATE_THOUGHT:\s*({[^}]*})\s*\]/g;
    const captures: any[] = [];
    let text = msg.text.replace(captureRegex, (_: string, json: string) => {
      try { captures.push(JSON.parse(json)); } catch {}
      return '';
    }).trim();

    const parts: React.ReactNode[] = [];
    const citRe = /\[Thought:\s*([a-zA-Z0-9-]+)\]/g;
    let last = 0, k = 0;
    let m: RegExpExecArray | null;
    while ((m = citRe.exec(text)) !== null) {
      const matchIndex = m.index;
      const thoughtId = m[1];
      if (matchIndex > last) parts.push(<span key={k++}>{text.slice(last, matchIndex)}</span>);
      const found = thoughts.find((t) => t.id === thoughtId);
      if (found) {
        const capturedId = thoughtId;
        parts.push(
          <button
            key={k++}
            onClick={() => {
              onSelectView('grid');
              setTimeout(() => {
                const el = document.querySelector(`article[data-thought-id="${capturedId}"]`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el?.classList.add('ring-2', 'ring-zinc-900');
                setTimeout(() => el?.classList.remove('ring-2', 'ring-zinc-900'), 1800);
              }, 300);
            }}
            className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border border-border-subtle bg-surface-raised hover:bg-surface-card text-ink-muted hover:text-foreground transition-all cursor-pointer"
            title="View in Grid"
          >
            <Link2 size={8} />
            {found.type}: {found.content.slice(0, 14)}…
          </button>
        );
      } else {
        parts.push(<span key={k++}>{m[0]}</span>);
      }
      last = citRe.lastIndex;
    }
    if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);

    return (
      <div>
        <p className="whitespace-pre-line text-[13px] leading-relaxed">{parts.length ? parts : text}</p>
        {captures.map((cap, i) => (
          <ProposedCapture key={i} type={cap.type} content={cap.content} onSave={() => onAddThoughtDirectly(cap.type, cap.content)} />
        ))}
      </div>
    );
  };

  const tasks = thoughts.filter((t) => t.type === 'task');
  const ideas = thoughts.filter((t) => t.type === 'idea');
  const notes = thoughts.filter((t) => t.type === 'knowledge');
  const focusTask = tasks.find((t) => !t.completed);

  return (
    <div className="flex h-[600px] w-full rounded-2xl overflow-hidden border border-border-subtle bg-surface-raised shadow-sm">

      {/* Chat pane */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Brain size={16} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-foreground">Second Brain</h3>
            <p className="text-[10px] text-ink-faint">{thoughts.length} thoughts indexed · Lemma QA</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-ink-faint">Connected</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => {
            const isA = msg.role === 'assistant';
            return (
              <div key={msg.id} className={`flex items-end gap-2.5 ${isA ? '' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                  isA ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                }`}>
                  {isA ? <Bot size={11} /> : <User size={11} />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                  isA
                    ? 'bg-surface-card border border-border-subtle text-foreground'
                    : 'bg-foreground text-background'
                }`}>
                  {renderText(msg)}
                  <span className={`mt-1 block text-[9px] text-right ${isA ? 'text-ink-faint' : 'opacity-40'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-end gap-2.5">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 border border-indigo-200">
                <Bot size={11} />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-surface-card border border-border-subtle">
                <div className="flex items-center gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Starters */}
          {messages.length === 1 && !isLoading && (
            <div className="pt-2">
              <p className="mb-2.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-ink-faint">
                <Zap size={9} /> Quick starters
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STARTERS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q)}
                    className="rounded-xl border border-border-subtle bg-surface-raised px-3 py-2.5 text-left text-[11px] text-ink-muted hover:bg-surface-card hover:text-foreground hover:border-border-hover transition-all duration-150 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border-subtle p-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              disabled={isLoading}
              placeholder="Ask about your thoughts, or capture a new note…"
              className="w-full rounded-xl border border-border-subtle bg-background py-3 pl-4 pr-12 text-[13px] text-foreground placeholder:text-ink-faint focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 disabled:opacity-40 transition-all"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                input.trim() ? 'bg-foreground text-background hover:opacity-90' : 'bg-zinc-100 text-ink-faint'
              }`}
            >
              <Send size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile sidebar */}
      <div className="hidden md:flex w-[200px] flex-col border-l border-border-subtle bg-surface-card/40 p-4 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-widest text-ink-faint mb-3">Brain Profile</p>

        {focusTask && (
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-3 mb-4">
            <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 mb-1.5">Active Focus</p>
            <p className="text-[11px] text-ink-muted leading-relaxed italic line-clamp-3">"{focusTask.content.slice(0, 60)}{focusTask.content.length > 60 ? '…' : ''}"</p>
          </div>
        )}

        <div className="space-y-2">
          {[
            { icon: Clipboard, label: 'Tasks', value: tasks.length, sub: `${tasks.filter(t => t.completed).length} done`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: Lightbulb, label: 'Ideas', value: ideas.length, sub: 'captured', color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: GraduationCap, label: 'Notes', value: notes.length, sub: 'indexed', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface-raised px-3 py-2.5">
              <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon size={11} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-foreground">{label}</p>
                <p className="text-[9px] text-ink-faint">{sub}</p>
              </div>
              <span className="text-[14px] font-bold text-foreground">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={10} className="text-indigo-500" />
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Tip</span>
            </div>
            <p className="text-[10px] text-indigo-700/70 leading-relaxed">Say "note that…" or "remember to…" to capture thoughts directly in chat.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
