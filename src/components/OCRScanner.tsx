'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, FileImage, FileText, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// ─── PDF.js (lazy-loaded client-side only) ─────────────────────────────────
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfjsLib() {
  if (pdfjsLib) return pdfjsLib;
  pdfjsLib = await import('pdfjs-dist');
  // CRITICAL: use CDN worker to avoid Next.js/Webpack bundling issues
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  return pdfjsLib;
}

// ─── Types ──────────────────────────────────────────────────────────────────

type ScanStatus =
  | 'idle'
  | 'extracting-pdf'
  | 'scanning'
  | 'processing'
  | 'complete'
  | 'error';

interface OCRScannerProps {
  /** Called with the cleaned OCR text when scanning finishes successfully. */
  onScanComplete: (text: string) => void;
  /** Optional callback when the user dismisses the scanner. */
  onClose?: () => void;
}

// ─── Status display config ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<ScanStatus, { label: string; color: string }> = {
  idle:              { label: 'Ready to scan', color: 'var(--ink-faint)' },
  'extracting-pdf':  { label: 'Extracting PDF page…', color: 'var(--status-processing)' },
  scanning:          { label: 'Scanning handwriting…', color: 'var(--status-processing)' },
  processing:        { label: 'Cleaning up text…', color: 'var(--status-processing)' },
  complete:          { label: 'Scan complete!', color: 'var(--status-connected)' },
  error:             { label: 'Scan failed', color: 'var(--priority-high)' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Renders the first page of a PDF file to a high-resolution canvas
 * and returns it as a base64 PNG data URL.
 */
async function convertPdfToImage(file: File): Promise<string> {
  const pdfjs = await getPdfjsLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  // High scale for OCR fidelity
  const scale = 2.0;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create canvas 2D context');

  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas.toDataURL('image/png');
}

/**
 * Strips common OCR noise from raw Tesseract output.
 */
function cleanOcrText(raw: string): string {
  return raw
    .replace(/^```[a-z]*\n?/i, '')  // strip starting code fence
    .replace(/\n?```$/i, '')        // strip ending code fence
    .replace(/\f/g, '\n')           // form-feeds → newlines
    .trim();
}

// Helper to convert Image File to Base64
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function OCRScanner({ onScanComplete, onClose }: OCRScannerProps) {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Core scan pipeline ──────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setErrorMsg(null);
    setProgress(0);

    try {
      let imageSourceDataUrl: string;

      // Step 1: If PDF, convert first page to image
      if (file.type === 'application/pdf') {
        setStatus('extracting-pdf');
        setProgress(10);
        const dataUrl = await convertPdfToImage(file);
        setPreview(dataUrl);
        imageSourceDataUrl = dataUrl;
        setProgress(30);
      } else {
        // Regular image — convert to base64
        imageSourceDataUrl = await fileToDataUrl(file);
        setPreview(imageSourceDataUrl);
        setProgress(20);
      }

      // Step 2: Run Advanced LLM Vision OCR
      setStatus('scanning');
      setProgress(40);
      
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSourceDataUrl })
      });
      
      const data = await res.json();
      if (!res.ok || !data.text) {
        throw new Error(data.error || 'Failed to scan image with Vision API');
      }

      // Step 3: Clean up text
      setStatus('processing');
      setProgress(92);
      const cleaned = cleanOcrText(data.text);

      if (!cleaned || cleaned.length < 3) {
        throw new Error('No readable text found in this file.');
      }

      setProgress(100);
      setStatus('complete');

      // Small delay so the user sees the "complete" state
      setTimeout(() => {
        onScanComplete(cleaned);
      }, 600);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error during scan');
      console.error('[OCRScanner] Scan failed:', err);
    }
  }, [onScanComplete]);

  // ── File input / drop handlers ──────────────────────────────────────────

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      setStatus('error');
      setErrorMsg('Unsupported file type. Please use an image or PDF.');
      return;
    }

    processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setPreview(null);
    setErrorMsg(null);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  const { label: statusLabel, color: statusColor } = STATUS_CONFIG[status];
  const isProcessing = status === 'extracting-pdf' || status === 'scanning' || status === 'processing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ScanLine size={18} style={{ color: statusColor }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
            OCR Scanner
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: 6,
            background: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
            color: statusColor,
          }}>
            {statusLabel}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-faint)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Close scanner"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Progress bar ─────────────────────────────────────────── */}
      {isProcessing && (
        <div style={{
          height: 3, borderRadius: 2, background: 'var(--border-subtle)',
          marginBottom: 16, overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%', borderRadius: 2, background: statusColor }}
          />
        </div>
      )}

      {/* ── Drop zone (idle state) ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragOver ? statusColor : 'var(--border-hover)'}`,
              borderRadius: 12,
              padding: '36px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isDragOver ? 'color-mix(in srgb, var(--status-processing) 5%, transparent)' : 'transparent',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
              <FileImage size={28} strokeWidth={1.5} style={{ color: 'var(--ink-faint)' }} />
              <FileText size={28} strokeWidth={1.5} style={{ color: 'var(--ink-faint)' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>
              Drop an image or PDF here
            </p>
            <p style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
              Supports handwritten notes, screenshots, scanned documents
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </motion.div>
        )}

        {/* ── Preview + scanning state ──────────────────────────── */}
        {(isProcessing || status === 'complete') && preview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Scanned document preview"
              style={{
                width: '100%',
                maxHeight: 260,
                objectFit: 'contain',
                display: 'block',
                background: 'var(--background)',
              }}
            />
            {/* Scanning overlay */}
            {isProcessing && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Loader2 size={28} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                  {statusLabel}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                  {progress}%
                </span>
              </div>
            )}
            {/* Complete overlay */}
            {status === 'complete' && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={36} style={{ color: 'var(--status-connected)' }} />
              </div>
            )}
          </motion.div>
        )}

        {/* ── Error state ──────────────────────────────────────── */}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '24px',
              borderRadius: 12,
              border: '1px solid var(--priority-high)',
              background: 'color-mix(in srgb, var(--priority-high) 6%, transparent)',
              textAlign: 'center',
            }}
          >
            <AlertCircle size={24} style={{ color: 'var(--priority-high)', marginBottom: 8 }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>
              {errorMsg || 'Something went wrong'}
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 16px',
                borderRadius: 8,
                border: '1px solid var(--border-hover)',
                background: 'var(--surface-raised)',
                color: 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Keyframes for spinner ─────────────────────────────── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
