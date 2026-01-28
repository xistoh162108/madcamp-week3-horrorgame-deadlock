import { ReactNode } from 'react';

interface MonitorFrameProps {
  children: ReactNode;
  glitchIntensity?: number;
}

export function MonitorFrame({ children, glitchIntensity = 0 }: MonitorFrameProps) {
  // Calculate noise opacity based on glitch intensity
  const noiseOpacity = 0.05 + glitchIntensity * 0.1;

  return (
    <div
      className="relative w-[800px] h-[600px] bg-crt-dark rounded-lg overflow-hidden crt-scanlines vignette"
      style={{
        boxShadow: `
          inset 0 0 100px rgba(0, 0, 0, 0.5),
          0 0 20px rgba(0, 255, 65, 0.1),
          0 0 40px rgba(0, 255, 65, 0.05)
        `,
        borderRadius: '2% / 3%',
      }}
    >
      {/* CRT Screen bezel */}
      <div className="absolute inset-0 border-4 border-gray-800 rounded-lg pointer-events-none z-20" />

      {/* Main content area */}
      <div className="absolute inset-4 bg-crt-dark overflow-hidden">
        {children}
      </div>

      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15) 0px,
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          )`,
          mixBlendMode: 'multiply',
          opacity: 0.7,
        }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-11"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: noiseOpacity,
          animation: 'noise 0.15s steps(3) infinite',
        }}
      />

      {/* Screen glare */}
      <div
        className="absolute inset-0 pointer-events-none z-12"
        style={{
          background: `radial-gradient(
            ellipse at 30% 20%,
            rgba(255, 255, 255, 0.03) 0%,
            transparent 50%
          )`,
        }}
      />
    </div>
  );
}
