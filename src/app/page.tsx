'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import SpatialGrid from '@/components/SpatialGrid';
import SemanticMinimap from '@/components/SemanticMinimap';
import CommandPalette from '@/components/CommandPalette';
import DropZoneOverlay from '@/components/DropZoneOverlay';
import Drawer, { DrawerPanel } from '@/components/Drawer';
import TimeScrubber from '@/components/TimeScrubber';
import { useThoughts, queryViaLemma } from '@/hooks/useThoughts';
import { useDropZone } from '@/hooks/useDropZone';
import { useSettings } from '@/hooks/useSettings';
import { useTimelineFilter } from '@/hooks/useTimelineFilter';
import { useSpatialNavigation } from '@/hooks/useSpatialNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PanelLeftClose, PanelLeftOpen, Sparkles, ChevronRight, ChevronLeft, Info, ScanLine } from 'lucide-react';
import OCRScanner from '@/components/OCRScanner';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import SecondBrainChat from '@/components/SecondBrainChat';
import DocumentsView from '@/components/DocumentsView';

export default function Home() {
  const { 
    thoughts, 
    isLoading, 
    tasks, 
    insights, 
    relationships,
    addThought, 
    deleteThought, 
    toggleTask, 
    retryThought, 
    updateThought, 
    synthesizeThoughts, 
    runProactiveInsights, 
    executeAction,
    createRelationship,
    deleteRelationship,
    updateCoordinates,
    loadThoughts,
    addThoughtDirectly
  } = useThoughts();
  const { filteredThoughts, scrubberValue, setScrubberValue, cutoffText } = useTimelineFilter(thoughts);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);
  const { isDragging } = useDropZone((files) => {
    if (files.length > 0) {
      setDraggedFile(files[0]);
      setIsPaletteOpen(true);
    }
  });
  const { settings, updateSetting, resetSettings } = useSettings();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [mainView, setMainView] = useState<'grid' | 'graph' | 'chat' | 'files'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { focusedThoughtId } = useSpatialNavigation(isPaletteOpen);

  // Drawer state
  const [drawerPanel, setDrawerPanel] = useState<DrawerPanel | null>(null);

  // HACKATHON REQUIREMENT: Lemma Q&A answer state — shown when user asks a question
  const [lemmaAnswer, setLemmaAnswer] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const status = isLoading ? 'processing' : 'connected';

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply global appearance settings to DOM
  useEffect(() => {
    const root = document.documentElement;

    // Apply Theme
    root.classList.remove('theme-onyx', 'theme-paper');
    if (settings.theme !== 'system') {
      root.classList.add(`theme-${settings.theme}`);
    }

    // Apply Typography
    root.classList.remove('font-modern', 'font-editorial', 'font-technical');
    root.classList.add(`font-${settings.typography}`);
  }, [settings.theme, settings.typography]);

  const handlePaletteSubmit = useCallback(
    async (content: string, file?: File) => {
      if (file) {
        setIsUploadingPdf(true);
        setLemmaAnswer(null);
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('content', content);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.ok) {
            await loadThoughts();
            setScrubberValue(100);
          } else {
            console.error('File upload failed', data.error);
          }
        } catch (err) {
          console.error('Error uploading file', err);
        } finally {
          setIsUploadingPdf(false);
          setDraggedFile(null);
        }
        return;
      }

      const isQuestion = content.trimStart().startsWith('?');

      if (isQuestion) {
        // HACKATHON REQUIREMENT: Utilizing Lemma SDK for natural-language Q&A
        // against the spatial grid. Lines starting with '?' are routed to the
        // Lemma query engine instead of being saved as thoughts.
        const question = content.trimStart().slice(1).trim();
        setIsQuerying(true);
        setLemmaAnswer(null);
        try {
          const answer = await queryViaLemma(
            question,
            thoughts.map((t) => ({ id: t.id, type: t.type, content: t.content, createdAt: t.createdAt }))
          );
          setLemmaAnswer(answer);
        } catch {
          setLemmaAnswer('Lemma could not process your question. Please check that the local stack is running.');
        } finally {
          setIsQuerying(false);
        }
      } else {
        // Raw thought → Lemma classify pipeline
        addThought(content);
        setScrubberValue(100);
        setLemmaAnswer(null);
      }
    },
    [addThought, setScrubberValue, thoughts, loadThoughts]
  );

  const handlePurgeStream = useCallback(() => {
    // In a real app, this would delete all items from local state/DB
    console.log('Purging stream...');
  }, []);

  return (
    <>
      <Header
        status={status}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onOpenDrawer={(panel) => setDrawerPanel(panel)}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6">
        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-ink-faint">
            Spatial Workspace
          </h2>
          <p className="mt-1 text-[22px] font-semibold tracking-tight text-foreground">
            {filteredThoughts.length > 0
              ? `${filteredThoughts.length} thought${filteredThoughts.length !== 1 ? 's' : ''} in your stream`
              : 'Your second brain awaits'}
          </p>
        </div>

        {/* HACKATHON REQUIREMENT: Lemma Q&A answer panel — shown when user types a ? query */}
        <AnimatePresence>
          {(lemmaAnswer || isQuerying) && (
            <motion.div
              key="lemma-answer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 rounded-xl border border-border-subtle bg-surface-raised px-5 py-4"
            >
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                Lemma · Answer
              </p>
              {isQuerying ? (
                <p className="text-[14px] text-ink-muted animate-pulse">Querying your stream via Lemma…</p>
              ) : (
                <>
                  <p className="text-[14px] leading-relaxed text-foreground">{lemmaAnswer}</p>
                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <span className="text-[11px] text-ink-faint font-semibold uppercase">Action Actions:</span>
                    <button
                      onClick={() => executeAction('todo', lemmaAnswer || '')}
                      className="rounded-full border border-border-subtle bg-background hover:bg-surface-card text-[11px] px-3 py-1 font-medium transition-colors"
                    >
                      Generate Tasks
                    </button>
                    <button
                      onClick={() => executeAction('study_plan', lemmaAnswer || '')}
                      className="rounded-full border border-border-subtle bg-background hover:bg-surface-card text-[11px] px-3 py-1 font-medium transition-colors"
                    >
                      Create Study Plan
                    </button>
                    <button
                      onClick={() => executeAction('flashcards', lemmaAnswer || '')}
                      className="rounded-full border border-border-subtle bg-background hover:bg-surface-card text-[11px] px-3 py-1 font-medium transition-colors"
                    >
                      Generate Flashcards
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-5 items-start">

          {/* ── LEFT SIDEBAR (collapsible) ───────────────────── */}
          <motion.div
            animate={{ width: sidebarOpen ? 300 : 0, opacity: sidebarOpen ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-shrink-0 overflow-hidden"
            style={{ minWidth: 0 }}
          >
            <div className="w-[300px] space-y-4">
              {/* Insights panel */}
              <div className="rounded-2xl border border-border-subtle bg-surface-raised shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <Sparkles size={13} strokeWidth={1.8} className="text-indigo-500" />
                    <h3 className="text-[13px] font-bold text-foreground">AI Insights</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={runProactiveInsights}
                      className="rounded-lg bg-zinc-100 text-ink-muted text-[11px] font-semibold px-2.5 py-1 hover:bg-zinc-200 hover:text-foreground transition-colors"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint hover:bg-zinc-100 hover:text-foreground transition-all cursor-pointer"
                      title="Collapse sidebar"
                    >
                      <ChevronLeft size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-2.5 max-h-[320px] overflow-y-auto">
                  {insights.length === 0 ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <div className="mb-2 h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center">
                        <Sparkles size={14} className="text-zinc-400" />
                      </div>
                      <p className="text-[12px] font-medium text-ink-muted">No insights yet</p>
                      <p className="text-[11px] text-ink-faint mt-0.5">Capture more thoughts first</p>
                    </div>
                  ) : (
                    insights.map((ins, idx) => {
                      const dot = ins.type === 'contradiction' ? 'bg-red-400' : ins.type === 'pattern' ? 'bg-blue-400' : ins.type === 'suggestion' ? 'bg-violet-400' : 'bg-emerald-400';
                      const bg = ins.type === 'contradiction' ? 'border-red-100 bg-red-50/50' : ins.type === 'pattern' ? 'border-blue-100 bg-blue-50/50' : ins.type === 'suggestion' ? 'border-violet-100 bg-violet-50/50' : 'border-emerald-100 bg-emerald-50/50';
                      return (
                        <div key={idx} className={`p-3 rounded-xl border ${bg}`}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dot}`} />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">{ins.type}</span>
                          </div>
                          <h4 className="text-[12.5px] font-semibold text-foreground leading-snug">{ins.title}</h4>
                          <p className="text-[11.5px] text-ink-muted mt-1 leading-relaxed">{ins.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Tasks */}
              <div className="rounded-2xl border border-border-subtle bg-surface-raised shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
                  <h3 className="text-[13px] font-bold text-foreground">Action Tasks</h3>
                  <span className="text-[10px] font-semibold text-ink-faint">{tasks.length} items</span>
                </div>
                <div className="px-4 py-3 space-y-2 max-h-[200px] overflow-y-auto">
                  {tasks.length === 0 ? (
                    <p className="text-[11.5px] text-ink-muted py-3 text-center">No actions generated yet.</p>
                  ) : (
                    tasks.map((task, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-raised border border-border-subtle gap-2">
                        <span className="text-[12px] font-medium text-foreground truncate">{task.title}</span>
                        <span className={`flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>{task.priority}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT PANEL: Tabbed Workspace ─────────────────── */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Tab bar */}
            <div className="flex items-center gap-2">
              {/* Sidebar toggle */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-raised text-ink-faint hover:text-foreground hover:border-border-hover shadow-sm transition-all cursor-pointer"
                  title="Open insights sidebar"
                >
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
              )}
              <div className="flex flex-1 bg-surface-raised border border-border-subtle/60 p-1 rounded-2xl gap-1 shadow-sm">
                {[
                  { id: 'grid' as const, label: 'Spatial Grid', description: 'Your primary workspace. Visually organize, merge, and interact with all your captured thoughts.' },
                  { id: 'graph' as const, label: 'Knowledge Graph', description: 'A visual web of connections. See how your ideas relate to each other based on AI analysis.' },
                  { id: 'chat' as const, label: 'Second Brain', description: 'Your AI assistant. Ask questions and get answers synthesized directly from your personal knowledge base.' },
                  { id: 'files' as const, label: 'Documents', description: 'Manage uploaded files and scanned documents.' },
                ].map(({ id, label, description }) => (
                  <button
                    key={id}
                    onClick={() => setMainView(id)}
                    title={description}
                    className={`group flex items-center justify-center gap-1.5 flex-1 py-2.5 text-[12px] font-semibold rounded-xl transition-all duration-150 cursor-pointer ${
                      mainView === id
                        ? 'bg-foreground text-background shadow-sm'
                        : 'text-ink-muted hover:bg-surface-card hover:text-foreground'
                    }`}
                  >
                    <span>{label}</span>
                    <Info size={13} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsScannerOpen(!isScannerOpen)}
                className={`flex h-[42px] px-4 gap-2 flex-shrink-0 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                  isScannerOpen
                    ? 'border-foreground bg-foreground text-background shadow-sm'
                    : 'border-border-subtle bg-surface-raised text-ink-faint hover:text-foreground hover:border-border-hover shadow-sm'
                }`}
                title="Scan document (OCR)"
              >
                <ScanLine size={14} strokeWidth={2} />
                <span className="text-[12px] font-semibold hidden sm:inline">Scan</span>
              </button>
            </div>

            {/* OCR Scanner Panel */}
            <AnimatePresence>
              {isScannerOpen && (
                <motion.div
                  key="ocr-scanner"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <OCRScanner
                    onScanComplete={(text) => {
                      setIsScannerOpen(false);
                      addThought(text);
                      setScrubberValue(100);
                    }}
                    onClose={() => setIsScannerOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* View Contents */}
            {isUploadingPdf && (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border-hover bg-surface-card animate-pulse">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent mb-3" />
                <p className="text-sm font-semibold text-foreground">Extracting PDF contents via Lemma...</p>
                <p className="text-xs text-ink-faint mt-1">This registers file nodes and maps semantic knowledge.</p>
              </div>
            )}

            {!isUploadingPdf && mainView === 'grid' && (
              <SpatialGrid
                thoughts={filteredThoughts}
                isProcessing={isLoading}
                density={settings.density}
                onDelete={deleteThought}
                onToggleTask={toggleTask}
                onRetry={retryThought}
                onUpdate={updateThought}
                onSynthesize={synthesizeThoughts}
                focusedThoughtId={focusedThoughtId}
              />
            )}

            {!isUploadingPdf && mainView === 'graph' && (
              <KnowledgeGraph
                thoughts={filteredThoughts}
                relationships={relationships}
                onUpdateCoordinates={updateCoordinates}
                onCreateRelationship={createRelationship}
                onDeleteRelationship={deleteRelationship}
                onDeleteThought={deleteThought}
              />
            )}

            {!isUploadingPdf && mainView === 'chat' && (
              <SecondBrainChat
                thoughts={thoughts}
                onQuery={queryViaLemma}
                onAddThoughtDirectly={addThoughtDirectly}
                onSelectView={setMainView}
              />
            )}

            {!isUploadingPdf && mainView === 'files' && (
              <DocumentsView />
            )}
          </div>
        </div>
      </main>

      {/* Time-Travel Scrubber */}
      {thoughts.length > 0 && (
        <TimeScrubber
          value={scrubberValue}
          onChange={setScrubberValue}
          label={cutoffText}
        />
      )}

      {/* Floating action button (mobile) */}
      <motion.button
        id="fab-add-thought"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsPaletteOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-xl shadow-black/20 transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/25 md:bottom-8 md:right-8"
        aria-label="Capture a thought"
      >
        <Plus size={22} strokeWidth={2} />
      </motion.button>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => {
          setIsPaletteOpen(false);
          setDraggedFile(null);
        }}
        onSubmit={handlePaletteSubmit}
        initialFile={draggedFile}
      />

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={drawerPanel !== null}
        panel={drawerPanel || 'settings'}
        onClose={() => setDrawerPanel(null)}
        settings={settings}
        onUpdateSetting={updateSetting}
        onResetSettings={resetSettings}
        onPurgeStream={handlePurgeStream}
      />

      <SemanticMinimap thoughts={filteredThoughts} />

      <DropZoneOverlay isDragging={isDragging} />
    </>
  );
}
