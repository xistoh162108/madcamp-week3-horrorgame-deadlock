import { useEffect, useRef, useState } from 'react';
import { useGameStore, selectTotalGlitch } from '@game/store';
import { corruptText } from '@utils/glitchText';

interface TerminalProps {
  logs: string[];
  maxVisible?: number;
}

export function Terminal({ logs, maxVisible = 10 }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const glitchIntensity = useGameStore(selectTotalGlitch);
  const [seed, setSeed] = useState(0);

  // Animate glitch seed
  useEffect(() => {
    if (glitchIntensity <= 0) return;
    const interval = setInterval(() => {
        setSeed(s => s + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [glitchIntensity]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Get log line color based on prefix
  const getLogColor = (log: string): string => {
    if (log.includes('[ERROR]') || log.includes('[CRITICAL]')) return 'text-error';
    if (log.includes('[WARNING]') || log.includes('[ALERT]')) return 'text-warning';
    if (log.includes('[SUCCESS]')) return 'text-success';
    if (log.includes('[SYSTEM]')) return 'text-crt-green';
    if (log.includes('[AMBIENT]')) return 'text-crt-green/50';
    return 'text-crt-green/80';
  };

  const visibleLogs = logs.slice(-maxVisible);

  return (
    <div className="h-full flex flex-col bg-crt-dark p-4">
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-crt-green/30">
        <span className="text-crt-green/60 font-mono text-xs">
          system_terminal — bash
        </span>
      </div>

      {/* Terminal content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-hidden font-mono text-sm"
      >
        {visibleLogs.map((log, index) => (
          <div
            key={index}
            className={`${getLogColor(log)} leading-relaxed`}
          >
            <span className="text-crt-green/40 mr-2">$</span>
            {glitchIntensity > 0.1 ? corruptText(log, glitchIntensity, seed + index) : log}
          </div>
        ))}

        {/* Blinking cursor */}
        <div className="text-crt-green">
          <span className="text-crt-green/40 mr-2">$</span>
          <span className="animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
}
