/**
 * StrobeLight Component
 *
 * Creates flickering strobe light effect in the hallway:
 * - Intensity increases with threat level
 * - Faster flicker during Telegraph
 * - Red tint during danger
 */

import { motion } from 'framer-motion';
import { useGameStore } from '@game/store';

export function StrobeLight() {
  const threatEased = useGameStore((s) => s.threatEased);
  const monsterState = useGameStore((s) => s.monsterState);
  const isBlackout = useGameStore((s) => s.isBlackout);

  // During blackout, no light
  if (isBlackout) {
    return null;
  }

  const isTelegraphing = monsterState === 'TELEGRAPHING';
  const isAttacking = monsterState === 'ATTACKING';

  // Calculate light properties based on threat
  const baseOpacity = 0.1 + threatEased * 0.4;
  const flickerSpeed = isTelegraphing ? 0.1 : 0.3 + (1 - threatEased) * 0.5;

  // Color shifts from white to red as threat increases
  const redIntensity = Math.floor(255 * (0.8 + threatEased * 0.2));
  const greenIntensity = Math.floor(200 * (1 - threatEased * 0.7));
  const blueIntensity = Math.floor(150 * (1 - threatEased * 0.9));
  const lightColor = `rgb(${redIntensity}, ${greenIntensity}, ${blueIntensity})`;

  return (
    <>
      {/* Main strobe flash */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: isAttacking
            ? [0, 1, 0, 1, 0]
            : isTelegraphing
              ? [0, baseOpacity, 0, baseOpacity * 0.5, 0]
              : [0, baseOpacity * 0.3, 0],
        }}
        transition={{
          duration: flickerSpeed,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${lightColor} 0%, transparent 70%)`,
        }}
      />

      {/* Secondary ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [baseOpacity * 0.2, baseOpacity * 0.4, baseOpacity * 0.2],
        }}
        transition={{
          duration: flickerSpeed * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `linear-gradient(to bottom, ${lightColor}22 0%, transparent 50%)`,
        }}
      />

      {/* Light source indicator (ceiling light) */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-8 h-2">
        <motion.div
          className="w-full h-full rounded-b-full"
          animate={{
            opacity: isTelegraphing ? [0.3, 1, 0.3] : [0.2, 0.5, 0.2],
            boxShadow: isTelegraphing
              ? [
                  `0 0 10px ${lightColor}`,
                  `0 0 30px ${lightColor}`,
                  `0 0 10px ${lightColor}`,
                ]
              : [
                  `0 0 5px ${lightColor}55`,
                  `0 0 15px ${lightColor}55`,
                  `0 0 5px ${lightColor}55`,
                ],
          }}
          transition={{
            duration: flickerSpeed,
            repeat: Infinity,
          }}
          style={{
            backgroundColor: lightColor,
          }}
        />
      </div>

      {/* Vertical light beam during telegraph */}
      {isTelegraphing && (
        <motion.div
          className="absolute top-[5%] left-1/2 -translate-x-1/2 w-24 h-full pointer-events-none"
          animate={{
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 0.15,
            repeat: Infinity,
          }}
          style={{
            background: `linear-gradient(to bottom, ${lightColor}44 0%, transparent 80%)`,
            clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
          }}
        />
      )}
    </>
  );
}
