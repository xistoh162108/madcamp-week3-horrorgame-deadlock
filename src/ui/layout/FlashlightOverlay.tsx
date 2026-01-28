import { useEffect, useState } from 'react';

interface FlashlightOverlayProps {
  mouseX: number;
  mouseY: number;
  radius: number;
  flickerIntensity: number;
  isBlackout: boolean;
}

export function FlashlightOverlay({
  mouseX,
  mouseY,
  radius,
  flickerIntensity,
  isBlackout,
}: FlashlightOverlayProps) {
  const [flickerOpacity, setFlickerOpacity] = useState(0);

  // Flicker effect loop
  useEffect(() => {
    if (flickerIntensity <= 0) {
      setFlickerOpacity(0);
      return;
    }

    let rafId: number;
    let lastTime = 0;
    
    // Random flicker intervals
    const update = (time: number) => {
      if (time - lastTime > 50) { // Update every 50ms at most
        // Higher intensity = more opacity on the "dark" flicker
        const isFlicker = Math.random() < flickerIntensity * 0.3;
        setFlickerOpacity(isFlicker ? Math.random() * 0.5 + 0.5 : 0);
        lastTime = time;
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [flickerIntensity]);

  // Full blackout overrides everything
  if (isBlackout) {
    return <div className="absolute inset-0 bg-black z-50 transition-colors duration-1000" />;
  }

  // Calculate flashlight gradient
  // We use a CSS mask or radial-gradient background to create the spot
  // A radial gradient background that is transparent in center and black outside is easiest
  
  const gradientBackground = `radial-gradient(circle ${radius}px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.98) 100%)`;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-40 transition-opacity duration-75"
      style={{
        background: gradientBackground,
        // Apply flicker by changing overall opacity of a black overlay?
        // No, flashlight flicker usually means the light goes OFF.
        // So the dark overlay should become fully opaque (black) when flickering.
        // But the gradient creates the "Light". Outside is dark.
        // If we want to simulate light failing, we should make the transparent part dark.
        // Easiest is to add a black overlay on top with flickerOpacity.
      }}
    >
      {/* Flicker overlay - covers the light spot when active */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: flickerOpacity }}
      />
    </div>
  );
}
