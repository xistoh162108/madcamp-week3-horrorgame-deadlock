/**
 * HallwaySection
 *
 * Left section of the room showing:
 * - Dark hallway behind the door
 * - The door (open/closed)
 * - Strobe light effect
 * - Monster eyes in the darkness
 */

import { useGameStore } from '@game/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Door } from './Door';
import { StrobeLight } from './StrobeLight';
import { MonsterEyes } from './MonsterEyes';

export function HallwaySection() {
  const moduleIndex = useGameStore(s => s.currentModuleIndex);
  const activeJumpscare = useGameStore(s => s.activeJumpscare);

  return (
    <div className="relative h-full bg-[#0c0c0c] border-r border-[#1a1a1a] overflow-hidden">
      {/* Hallway depth effect */}
      <div className="absolute inset-0">
        {/* Dark gradient for depth + Faint Emergency Light */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to right, #000 0%, #151515 50%, #0a0a0a 100%),
              radial-gradient(circle at 80% 40%, rgba(80, 20, 20, 0.15) 0%, transparent 60%)
            `,
          }}
        />

        {/* Vertical pipes/lines for industrial feel */}
        <div className="absolute left-[20%] top-0 bottom-0 w-[2px] bg-[#1a1a1a]" />
        <div className="absolute left-[40%] top-0 bottom-0 w-[1px] bg-[#111]" />
        <div className="absolute left-[80%] top-0 bottom-0 w-[2px] bg-[#1a1a1a]" />

        {/* Horizontal lines */}
        <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-[#1a1a1a]" />
        <div className="absolute top-[70%] left-0 right-0 h-[1px] bg-[#1a1a1a]" />
      </div>

      {/* Strobe Light Effect */}
      <StrobeLight />

      {/* Monster Eyes in the darkness */}
      <MonsterEyes />

      {/* The Door */}
      <Door />

      {/* Narrative Assets - Aligned with Door */}
      <div className="absolute right-0 top-[15%] bottom-[15%] w-[40%] pointer-events-none z-10">
        {/* Module 3: Light Leak (The Parasite) */}
        {/* Module 3: Light Leak (The Parasite) - CSS Glow */}
        {moduleIndex >= 2 && (
          <motion.div
            className="absolute inset-2 bg-green-400/20 blur-xl mix-blend-screen pointer-events-none rounded-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        )}

        {/* Module 5: Gas Mask (The Ascension) */}
        {moduleIndex >= 4 && (
          <div className="absolute top-[40%] left-[20%] w-[30%] opacity-80">
            <motion.img
              src="/images/door_gasmask.png"
              alt="Rescue Team"
              className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            />
          </div>
        )}
      </div>

      {/* JUMPSCARE OVERLAYS */}
      <AnimatePresence>
        {/* Inverted Face (Idle Scare) - Enhanced Visibility */}
        {activeJumpscare === 'HL_INV_FACE' && (
          <motion.div
            className="absolute top-0 left-[60%] w-[40%] z-50 pointer-events-none"
            initial={{ y: '-100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <img
              src="/images/jumpscare_face_inverted.png"
              alt="Scare"
              className="w-full object-contain drop-shadow-[0_0_20px_rgba(20,0,0,0.8)] brightness-150 contrast-110"
            />
          </motion.div>
        )}

        {/* Door Slam Hand (Action Scare) - Enhanced Visibility */}
        {activeJumpscare === 'DO_SLAM' && (
          <motion.div
            className="absolute top-[40%] right-[10%] w-[30%] z-50 pointer-events-none"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: '-20%', opacity: 1 }}
            exit={{ x: '50%', opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {/* Outline Glow for visibility against dark door */}
            <img
              src="/images/monster_hand_ignite.png"
              alt="Hand"
              className="w-full object-contain brightness-200 contrast-125 drop-shadow-[0_0_10px_rgba(255,50,50,0.3)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floor reflection */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[20%]"
        style={{
          background: 'linear-gradient(to top, rgba(30,10,10,0.2) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}

