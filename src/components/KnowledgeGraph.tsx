'use client';

import { useState, useRef, useEffect } from 'react';
import { Thought, ThoughtType } from '@/types';
import { Trash2, Plus, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface KnowledgeGraphProps {
  thoughts: Thought[];
  relationships: any[];
  onUpdateCoordinates: (id: string, x: number, y: number) => void;
  onCreateRelationship: (sourceId: string, targetId: string, type?: string) => void;
  onDeleteRelationship: (id: string) => void;
  onDeleteThought: (id: string) => void;
}

const NODE_W = 180;
const NODE_H = 76;

const TYPE_CONFIG: Record<ThoughtType, {
  accent: string; bg: string; border: string; badge: string; badgeText: string; label: string;
}> = {
  task: {
    accent: '#10b981',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    badge: '#d1fae5',
    badgeText: '#065f46',
    label: 'Task',
  },
  idea: {
    accent: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    badge: '#fef3c7',
    badgeText: '#78350f',
    label: 'Idea',
  },
  knowledge: {
    accent: '#6366f1',
    bg: '#f8fafc',
    border: '#e2e8f0',
    badge: '#ede9fe',
    badgeText: '#4c1d95',
    label: 'Note',
  },
};

function cleanContent(text: string, maxWords = 9): string {
  const cleaned = text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
  const words = cleaned.split(/\s+/);
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '…' : cleaned;
}

export default function KnowledgeGraph({
  thoughts,
  relationships,
  onUpdateCoordinates,
  onCreateRelationship,
  onDeleteRelationship,
  onDeleteThought,
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [tempLinkEnd, setTempLinkEnd] = useState<{ x: number; y: number } | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  // Compute layout
  useEffect(() => {
    const updated: Record<string, { x: number; y: number }> = {};
    const unpositioned = thoughts.filter((t) => !(t as any).x && !(t as any).y).map((t) => t.id);

    thoughts.forEach((t) => {
      const sx = (t as any).x;
      const sy = (t as any).y;
      if (sx || sy) {
        updated[t.id] = { x: sx || 200, y: sy || 200 };
      } else {
        const idx = unpositioned.indexOf(t.id);
        const total = Math.max(1, unpositioned.length);
        const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
        const r = Math.min(200, 80 + total * 22);
        updated[t.id] = {
          x: 400 + Math.cos(angle) * r,
          y: 270 + Math.sin(angle) * r,
        };
      }
    });
    setNodePositions(updated);
  }, [thoughts]);

  const handleNodePointerDown = (e: React.PointerEvent<SVGGElement>, id: string) => {
    if (connectingSourceId) return;
    e.stopPropagation();
    setDraggedNodeId(id);
    const pos = nodePositions[id] || { x: 0, y: 0 };
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const cx = (e.clientX - rect.left - pan.x) / zoom;
      const cy = (e.clientY - rect.top - pan.y) / zoom;
      setDragOffset({ x: cx - pos.x, y: cy - pos.y });
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggedNodeId || connectingSourceId) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...pan };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left - pan.x) / zoom;
    const cy = (e.clientY - rect.top - pan.y) / zoom;

    if (draggedNodeId) {
      const w = rect.width / zoom;
      const h = rect.height / zoom;
      const nx = Math.max(NODE_W / 2, Math.min(w - NODE_W / 2, cx - dragOffset.x));
      const ny = Math.max(NODE_H / 2, Math.min(h - NODE_H / 2, cy - dragOffset.y));
      setNodePositions((prev) => ({ ...prev, [draggedNodeId]: { x: nx, y: ny } }));
    } else if (connectingSourceId) {
      setTempLinkEnd({ x: cx, y: cy });
    } else if (isPanning) {
      setPan({ x: panOrigin.current.x + (e.clientX - panStart.current.x), y: panOrigin.current.y + (e.clientY - panStart.current.y) });
    }
  };

  const handlePointerUp = () => {
    if (draggedNodeId) {
      const p = nodePositions[draggedNodeId];
      if (p) onUpdateCoordinates(draggedNodeId, Math.round(p.x), Math.round(p.y));
      setDraggedNodeId(null);
    } else if (connectingSourceId && tempLinkEnd) {
      let targetId: string | null = null;
      Object.entries(nodePositions).forEach(([id, pos]) => {
        if (id === connectingSourceId) return;
        if (Math.hypot(pos.x - tempLinkEnd.x, pos.y - tempLinkEnd.y) < 90) targetId = id;
      });
      if (targetId) onCreateRelationship(connectingSourceId, targetId, 'related_to');
      setConnectingSourceId(null);
      setTempLinkEnd(null);
    }
    setIsPanning(false);
  };

  const handleStartLink = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    setConnectingSourceId(id);
    const pos = nodePositions[id] || { x: 0, y: 0 };
    setTempLinkEnd(pos);
  };

  const handleZoom = (delta: number) => setZoom((z) => Math.min(2, Math.max(0.4, z + delta)));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerDown={handleCanvasPointerDown}
      className="relative h-[600px] w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-sm select-none"
      style={{ touchAction: 'none', cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      {/* Dotted grid background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="kg-dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="1.2" fill="#c4c4cc" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kg-dot-grid)" />
      </svg>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        {[
          { icon: ZoomIn, action: () => handleZoom(0.15), title: 'Zoom in' },
          { icon: ZoomOut, action: () => handleZoom(-0.15), title: 'Zoom out' },
          { icon: Maximize2, action: handleReset, title: 'Reset view' },
        ].map(({ icon: Icon, action, title }) => (
          <button
            key={title}
            onClick={action}
            title={title}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-subtle bg-surface-raised text-ink-faint hover:text-foreground hover:border-border-hover hover:shadow-sm transition-all cursor-pointer"
          >
            <Icon size={12} strokeWidth={2} />
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full border-2" style={{ borderColor: cfg.accent, background: cfg.bg }} />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Hint bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-surface-raised/90 border border-border-subtle backdrop-blur-sm px-3 py-1.5 shadow-sm">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="text-[10px] font-medium text-ink-faint">Drag nodes · Drag + to link · Scroll to zoom</span>
      </div>

      {thoughts.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="text-[13px] font-medium text-ink-muted">No thoughts to graph yet</div>
          <p className="text-[12px] text-ink-faint">Capture thoughts first using ⌘K</p>
        </div>
      )}

      {/* Main SVG canvas */}
      <svg className="absolute inset-0 w-full h-full" style={{ cursor: 'inherit' }}>
        <defs>
          <marker id="kg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#a1a1aa" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Relationship lines */}
          {relationships.map((rel) => {
            const s = nodePositions[rel.source_thought_id];
            const t = nodePositions[rel.target_thought_id];
            if (!s || !t) return null;
            const mx = (s.x + t.x) / 2;
            const my = (s.y + t.y) / 2;
            return (
              <g key={rel.id}>
                <line
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke="#d4d4d8"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  markerEnd="url(#kg-arrow)"
                />
                <foreignObject x={mx - 36} y={my - 12} width={72} height={24} className="overflow-visible">
                  <div className="flex items-center justify-center h-full">
                    <div className="group flex items-center gap-1 rounded-full bg-surface-raised border border-border-subtle px-2 py-0.5 text-[8.5px] font-medium text-ink-faint hover:text-foreground hover:border-border-hover transition-all cursor-pointer shadow-sm">
                      <span>{rel.relation_type || 'related'}</span>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteRelationship(rel.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 transition-all ml-0.5">
                        <X size={8} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Temp link line */}
          {connectingSourceId && tempLinkEnd && nodePositions[connectingSourceId] && (
            <line
              x1={nodePositions[connectingSourceId].x} y1={nodePositions[connectingSourceId].y}
              x2={tempLinkEnd.x} y2={tempLinkEnd.y}
              stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.6}
            />
          )}

          {/* Nodes */}
          {thoughts.map((thought) => {
            const pos = nodePositions[thought.id];
            if (!pos) return null;
            const cfg = TYPE_CONFIG[thought.type] || TYPE_CONFIG.knowledge;
            const isHovered = hoveredNodeId === thought.id;
            const isDragging = draggedNodeId === thought.id;
            const label = cleanContent(thought.content, 9);

            return (
              <g
                key={thought.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onPointerDown={(e) => handleNodePointerDown(e, thought.id)}
                onPointerEnter={() => setHoveredNodeId(thought.id)}
                onPointerLeave={() => setHoveredNodeId(null)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                {/* Drop shadow effect */}
                {(isHovered || isDragging) && (
                  <rect
                    x={-NODE_W / 2 + 2} y={-NODE_H / 2 + 4}
                    width={NODE_W} height={NODE_H}
                    rx={12} ry={12}
                    fill="rgba(0,0,0,0.06)"
                    style={{ filter: 'blur(6px)' }}
                  />
                )}

                {/* Node card bg */}
                <rect
                  x={-NODE_W / 2} y={-NODE_H / 2}
                  width={NODE_W} height={NODE_H}
                  rx={12} ry={12}
                  fill={cfg.bg}
                  stroke={isHovered || isDragging ? cfg.accent : cfg.border}
                  strokeWidth={isHovered || isDragging ? 2 : 1.5}
                  style={{ transition: 'stroke 0.15s, fill 0.15s' }}
                />

                {/* Top accent bar */}
                <rect
                  x={-NODE_W / 2} y={-NODE_H / 2}
                  width={NODE_W} height={3}
                  rx={12} ry={12}
                  fill={cfg.accent}
                  opacity={0.7}
                />
                <rect
                  x={-NODE_W / 2} y={-NODE_H / 2 + 1}
                  width={NODE_W} height={2}
                  fill={cfg.accent}
                  opacity={0.7}
                />

                {/* Type badge */}
                <foreignObject x={-NODE_W / 2 + 8} y={-NODE_H / 2 + 8} width={60} height={16} className="overflow-visible">
                  <span style={{ fontSize: 8, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', color: cfg.badgeText, background: cfg.badge, borderRadius: 4, padding: '1px 5px', display: 'inline-block' }}>
                    {cfg.label}
                  </span>
                </foreignObject>

                {/* Content text */}
                <foreignObject x={-NODE_W / 2 + 8} y={-NODE_H / 2 + 26} width={NODE_W - 16} height={NODE_H - 34} className="overflow-hidden">
                  <div style={{ fontSize: 11.5, color: '#18181b', lineHeight: 1.45, fontFamily: 'Inter, sans-serif', fontWeight: 500, wordBreak: 'break-word', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {label}
                  </div>
                </foreignObject>

                {/* Hover buttons */}
                {isHovered && !connectingSourceId && (
                  <>
                    <foreignObject x={NODE_W / 2 - 16} y={-NODE_H / 2 - 14} width={28} height={28} className="overflow-visible">
                      <button
                        onPointerDown={(e) => handleStartLink(e as any, thought.id)}
                        style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: cfg.accent, color: 'white', border: 'none', cursor: 'crosshair', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                        title="Draw link"
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </button>
                    </foreignObject>
                    <foreignObject x={-NODE_W / 2 - 10} y={-NODE_H / 2 - 14} width={28} height={28} className="overflow-visible">
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteThought(thought.id); }}
                        style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                        title="Delete"
                      >
                        <Trash2 size={10} strokeWidth={2} />
                      </button>
                    </foreignObject>
                  </>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
