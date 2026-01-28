import { useGameStore } from '@game/store';

export function GlitchOverlay() {
  const glitch = useGameStore(s => s.glitch);
  const strobeIntensity = useGameStore(s => s.flashlight.strobeIntensity);
  const intensity = glitch.intensity + glitch.spike + strobeIntensity * 0.5;

  if (intensity < 0.1) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Chromatic Aberration */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background: `linear-gradient(90deg,
            rgba(255,0,0,${intensity * 0.2}) 0%,
            transparent 50%,
            rgba(0,255,255,${intensity * 0.2}) 100%
          )`,
          transform: `translateX(${intensity * 8}px)`,
        }}
      />

      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background: `linear-gradient(90deg,
            rgba(0,0,255,${intensity * 0.2}) 0%,
            transparent 50%,
            rgba(255,255,0,${intensity * 0.2}) 100%
          )`,
          transform: `translateX(${-intensity * 8}px)`,
        }}
      />

      {/* Screen Tear Lines */}
      {intensity > 0.3 && Array.from({ length: Math.floor(intensity * 10) }).map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-px bg-white/30"
          style={{
            top: `${Math.random() * 100}%`,
            opacity: intensity * (0.5 + Math.random() * 0.5),
            transform: `translateX(${Math.random() * 20 - 10}px)`,
          }}
        />
      ))}

      {/* Strobe Flash */}
      {strobeIntensity > 0.1 && (
        <div
          className="absolute inset-0 bg-white"
          style={{ opacity: strobeIntensity * 0.4 }}
        />
      )}

      {/* Scan Lines (CRT) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      {/* Monitor Glitch Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: 'url(/images/monitor_glitch_overlay.png)',
          backgroundSize: 'cover',
          opacity: Math.min(intensity * 0.4, 0.6),
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
