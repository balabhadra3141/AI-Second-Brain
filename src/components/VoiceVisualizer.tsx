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
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const hasTranscribedRef = useRef<boolean>(false);
  
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

        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = false;
          
          recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              }
            }
            transcriptRef.current += finalTranscript + ' ';
          };
          
          recognitionRef.current = recognition;
          recognition.start();
        } else {
          console.warn("Speech Recognition not supported in this browser.");
        }

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
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
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

    if (recognitionRef.current) {
      recognitionRef.current.onend = () => {
        if (!hasTranscribedRef.current) {
          hasTranscribedRef.current = true;
          onTranscriptionComplete(transcriptRef.current.trim() || 'No audio captured.');
        }
      };
      
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      
      // Fallback in case onend fails to fire
      setTimeout(() => {
        if (!hasTranscribedRef.current) {
          hasTranscribedRef.current = true;
          onTranscriptionComplete(transcriptRef.current.trim() || 'No audio captured.');
        }
      }, 1500);
    } else {
      setTimeout(() => {
        onTranscriptionComplete("Speech recognition unavailable in this browser.");
      }, 1000);
    }
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
            className="w-1.5 rounded-full bg-zinc-950 dark:bg-white"
            style={{ 
              height: '4px',
              transition: status === 'listening' ? 'height 75ms ease-out' : 'height 300ms ease-out'
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
