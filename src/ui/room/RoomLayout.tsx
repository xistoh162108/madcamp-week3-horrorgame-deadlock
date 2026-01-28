/**
 * RoomLayout v2.0
 *
 * CSS-only 3-section room layout:
 * - Left: Hallway & Door (monster entry point)
 * - Center: Desk & Monitor
 * - Right: Chalkboard (hints)
 *
 * When monitor is ON: Room blurs, Monitor view shows
 * When monitor is OFF: Room visible, can see door
 */

import { motion } from 'framer-motion';
import { useGameStore } from '@game/store';
import { HallwaySection } from './HallwaySection';
import { DeskSection } from './DeskSection';
import { ServerRackSection } from './ServerRackSection';

export function RoomLayout() {
  const monitorState = useGameStore(s => s.monitorState);
  const isBlackout = useGameStore(s => s.isBlackout);

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden">
      {/* Room View - visible when monitor OFF */}
      <motion.div
        className="absolute inset-0 grid grid-cols-[1fr_2fr_1fr]"
        initial={{ opacity: 1, filter: 'blur(0px)' }}
        animate={{
          opacity: monitorState === 'ON' ? 0.3 : 1,
          filter: monitorState === 'ON' ? 'blur(8px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Left Section: Hallway & Door */}
        <HallwaySection />

        {/* Center Section: Desk & Monitor */}
        <DeskSection />

        {/* Right Section: Server Rack */}
        <ServerRackSection />
      </motion.div>

      {/* Blackout Overlay */}
      {isBlackout && (
        <motion.div
          className="absolute inset-0 bg-black z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-500 text-2xl font-mono animate-pulse">
              BLACKOUT
            </div>
          </div>
        </motion.div>
      )}

      {/* Blood Smear Atmosphere */}
      <motion.div
        className="absolute inset-0 z-5 pointer-events-none opacity-0"
        animate={{ opacity: useGameStore.getState().threat > 0.7 ? 0.4 : 0 }}
        style={{
          backgroundImage: 'url(/images/blood_smear.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Ambient Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)',
        }}
      />
    </div>
  );
}
