'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { StopCircle } from 'lucide-react';

interface VoiceVisualizerProps {
  onTranscriptionComplete: (text: string) => void;
  onCancel: () => void;
}

export default function VoiceVisualizer({ onTranscriptionComplete, onCancel }: VoiceVisualizerProps) {
  const [status, setStatus] = useState<'listening' | 'transcribing'>('listening');
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Total bars for the visualizer
  const BAR_COUNT = 24;

  useEffect(() => {
    let analyser: AnalyserNode;
    let dataArray: Uint8Array;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Initialize Web Audio API
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Gives us 32 frequency bins, enough for 24 bars
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const updateVisualizer = () => {
          if (status !== 'listening') return;
          
          analyser.getByteFrequencyData(dataArray as any);

          // Update DOM nodes directly to avoid React re-renders (60fps)
          for (let i = 0; i < BAR_COUNT; i++) {
            const bar = barsRef.current[i];
            if (bar) {
              // Get a frequency value (0 to 255) and map it to a height (e.g. 4px to 64px)
              // We'll skip the very lowest frequencies (i = 0, 1) and use higher bins for better visual variation
              const value = dataArray[i + 2] || 0;
              const height = Math.max(4, (value / 255) * 64);
              bar.style.height = `${height}px`;
            }
          }

          animationRef.current = requestAnimationFrame(updateVisualizer);
        };

        updateVisualizer();
      } catch (error) {
        console.error('Microphone access denied or error:', error);
        onCancel();
      }
    };

    startRecording();

    // Cleanup function to prevent memory leaks
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [onCancel, status]);

  const handleStopAndTranscribe = () => {
    setStatus('transcribing');
    
    // Stop tracks immediately to cut the mic light
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    // Freeze visualizer to a fixed height for pulsing skeleton
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = barsRef.current[i];
      if (bar) {
        // Create an organic-looking frozen wave
        const height = 16 + Math.sin(i * 0.5) * 8 + Math.random() * 8;
        bar.style.height = `${height}px`;
      }
    }

    // Simulate network delay for transcription
    setTimeout(() => {
      onTranscriptionComplete("This is a mock transcription of the audio. Synthesizing complex concepts...");
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center p-6 w-full"
      style={{ minHeight: '138px' }}
    >
      <div className={`flex items-end justify-center gap-1.5 h-16 mb-6 ${status === 'transcribing' ? 'animate-pulse opacity-50' : ''}`}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { barsRef.current[i] = el; }}
            className="w-1.5 rounded-full bg-gradient-to-t from-zinc-400 to-zinc-900 dark:from-zinc-600 dark:to-white"
            style={{ 
              height: '4px',
              transition: status === 'listening' ? 'height 75ms ease' : 'height 300ms ease'
            }}
          />
        ))}
      </div>

      {status === 'listening' ? (
        <button
          onClick={handleStopAndTranscribe}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-foreground rounded-full hover:bg-foreground/90 transition-colors shadow-md"
        >
          <StopCircle size={16} strokeWidth={2.5} className="text-red-400" />
          Stop & Transcribe
        </button>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-muted">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Transcribing...
        </div>
      )}
    </motion.div>
  );
}
