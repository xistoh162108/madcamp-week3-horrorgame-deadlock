/**
 * MonsterEyes Component
 *
 * Glowing eyes in the darkness of the hallway:
 * - Appear when monster is close
 * - Intensity increases with threat
 * - Movement during Telegraph
 * - Full visibility during attack
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectMonsterDistance, selectMonsterState, selectThreatEased, selectDoorState } from '@game/store';
import { MONSTER } from '@game/constants';

export function MonsterEyes() {
  const monsterDistance = useGameStore(selectMonsterDistance);
  const monsterState = useGameStore(selectMonsterState);
  const threatEased = useGameStore(selectThreatEased);
  const doorState = useGameStore(selectDoorState);

  // Only show eyes when monster is close enough
  const showEyes = monsterDistance <= MONSTER.ATTACK_THRESHOLD * 2;
  const isTelegraphing = monsterState === 'TELEGRAPHING';
  const isAttacking = monsterState === 'ATTACKING';
  const isDoorClosed = doorState === 'CLOSED';

  // Don't show if door is closed (unless attacking through it)
  if (isDoorClosed && !isAttacking) {
    return null;
  }

  // Calculate eye properties based on distance
  const eyeOpacity = Math.min(1, (1 - monsterDistance / 100) * 2);
  const eyeScale = 0.5 + threatEased * 0.5;

  // Eye position - moves closer as monster approaches
  // Adjusted to align with Door Window (approx 34% from top)
  const eyeY = 32 + (1 - monsterDistance / 100) * 5;

  // Eye color and glow based on state
  const glowColor = isAttacking
    ? 'rgba(255, 0, 0, 0.8)'
    : isTelegraphing
      ? 'rgba(255, 68, 68, 0.6)'
      : 'rgba(255, 102, 102, 0.4)';

  return (
    <AnimatePresence>
      {showEyes && (
        <motion.div
          className="absolute left-[80%] -translate-x-1/2 pointer-events-none"
          style={{ top: `${eyeY}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Single V2 Image Eye Container (One image contains two eyes) */}
          <motion.div
            className="relative overflow-hidden"
            style={{ width: 120, height: 60 }} // Adjusted size for two eyes
            animate={{
              scale: eyeScale,
              x: isTelegraphing ? [-2, 2, -2] : 0,
              y: isTelegraphing ? [-1, 1, -1] : 0,
            }}
            transition={{
              duration: isTelegraphing ? 0.2 : 0.5,
              repeat: isTelegraphing ? Infinity : 0,
            }}
          >
            <motion.img
              src="/images/monster_eyes_v2.png"
              alt="Monster Eyes"
              className="w-full h-full object-contain"
              style={{
                filter: `drop-shadow(0 0 15px ${glowColor}) brightness(${isAttacking ? 1.5 : 1})`,
                opacity: isAttacking ? 1 : eyeOpacity,
              }}
              animate={{
                scaleY: isTelegraphing ? [1, 0.5, 1] : [1, 0.9, 1],
              }}
              transition={{
                duration: isTelegraphing ? 0.2 : 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          {/* Silhouette hint during telegraph */}
          {isTelegraphing && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                opacity: [0, 0.1, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            >
              <div
                className="w-20 h-32 rounded-t-full bg-black"
                style={{
                  boxShadow: '0 0 40px rgba(0,0,0,0.8)',
                }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
