/**
 * Door Component v2.0
 *
 * Shows door state with 1-Second Pre-Close indicator:
 * - OPEN: Door frame visible
 * - CLOSED: Door fills frame, timer counts up
 * - Shows "SECURED" when closed >= 1 second
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectDoorState, selectMonitorState, selectDoorClosedDuration, selectIsDoorHeld } from '@game/store';
import { DOOR } from '@game/constants';

export function Door() {
  const doorState = useGameStore(selectDoorState);
  const doorClosedDuration = useGameStore(selectDoorClosedDuration);
  const monitorState = useGameStore(selectMonitorState);
  const isDoorHeld = useGameStore(selectIsDoorHeld);

  const isClosed = doorState === 'CLOSED';
  const isSecured = doorClosedDuration >= DOOR.SAFE_DURATION;
  const canControl = monitorState === 'OFF';

  // Calculate progress toward secured (0-1)
  const secureProgress = Math.min(doorClosedDuration / DOOR.SAFE_DURATION, 1);

  return (
    <div className="absolute right-0 top-[15%] bottom-[15%] w-[40%]">
      {/* Door Frame */}
      <div
        className="absolute inset-0 border-2 border-[#2a2a2a] bg-[#0a0a0a]"
        style={{
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
        }}
      >
        {/* Door Frame Details */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#1a1a1a]" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#1a1a1a]" />
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#1a1a1a]" />

        {/* Darkness beyond door (when open) */}
        <AnimatePresence>
          {!isClosed && (
            <motion.div
              className="absolute inset-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background:
                  'radial-gradient(ellipse at center, #000 0%, #050505 100%)',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* The Door Panel */}
      <motion.div
        className="absolute top-2 bottom-2 left-2 bg-[#1a1a1a] origin-left"
        animate={{
          rotateY: isClosed ? 0 : -85,
          x: isClosed ? 0 : -5,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 25,
        }}
        style={{
          width: 'calc(100% - 8px)',
          transformStyle: 'preserve-3d',
          boxShadow: isClosed
            ? 'inset 0 0 30px rgba(0,0,0,0.5), 2px 0 10px rgba(0,0,0,0.8)'
            : '0 0 20px rgba(0,0,0,0.8)',
        }}
      >
        {/* Door Surface */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] to-[#222]">
          {/* Door Panels */}
          {/* Top Panel - Reinforced Glass Window */}
          <div className="absolute top-[10%] left-[10%] right-[10%] h-[35%] border-4 border-[#333] bg-black/30 overflow-hidden">
            {/* Wire Mesh Effect */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #222 25%, #222 75%, #000 75%, #000)',
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px'
              }}
            />
            {/* Dirt/Grime */}
            <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay" />
          </div>
          <div className="absolute bottom-[10%] left-[10%] right-[10%] h-[35%] border border-[#333] bg-[#181818]" />

          {/* Door Handle */}
          <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-3 h-8 bg-[#444] rounded-sm" />
        </div>

        {/* Security Indicator - shows when door is closed */}
        <AnimatePresence>
          {isClosed && (
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {/* Progress bar toward secured */}
              <div className="w-16 h-1 bg-[#333] rounded-full overflow-hidden mb-1">
                <motion.div
                  className={`h-full ${isSecured ? 'bg-green-500' : 'bg-yellow-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${secureProgress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Status text */}
              <div
                className={`text-[10px] font-mono text-center ${isSecured ? 'text-green-400' : 'text-yellow-400'
                  }`}
              >
                {isSecured ? 'SECURED' : `${doorClosedDuration.toFixed(1)}s`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Control Hint */}
      <AnimatePresence>
        {canControl && !isClosed && (
          <motion.div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#555] whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            [SPACE] CLOSE DOOR
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hold indicator when space is held */}
      <AnimatePresence>
        {isDoorHeld && canControl && (
          <motion.div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-yellow-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            HOLDING...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
