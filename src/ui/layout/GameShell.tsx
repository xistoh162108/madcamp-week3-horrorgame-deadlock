import { ReactNode } from 'react';
import { RoomContainer } from './RoomContainer';

interface GameShellProps {
  monitorContent: ReactNode;
}

export function GameShell({
  monitorContent,
}: GameShellProps) {
  const activeJumpscare = useGameStore(s => s.activeJumpscare);
  const mousePos = useGameStore(s => s.lastMousePos);

  const isInsect = activeJumpscare === 'MS_CURSOR'; // 'MS_CURSOR'

  return (
    <div className={`w-screen h-screen bg-crt-dark flex flex-col overflow-hidden ${isInsect ? 'cursor-none' : ''}`}>
      {/* Main content area (Full screen room/monitor) */}
      <div className="flex-1 relative overflow-hidden">
        <RoomContainer>
          {monitorContent}
        </RoomContainer>

        {/* Global Overlays */}
        <BloodOverlay />
        <NoiseOverlay />

        {/* Insect Cursor Custom */}
        {isInsect && (
          <img
            src="/images/cursor_insect.png"
            className="fixed w-12 h-12 pointer-events-none z-[100] drop-shadow-md mix-blend-difference"
            style={{
              left: mousePos.x,
              top: mousePos.y,
              transform: 'translate(-50%, -50%)'
            }}
            alt="Cursor"
          />
        )}
      </div>
    </div>
  );
}

import { useGameStore } from '@game/store';
import { motion, AnimatePresence } from 'framer-motion';

function BloodOverlay() {
  const powerLoad = useGameStore(s => s.powerLoad);

  // Show when heat is critical (System Fever)
  const isCritical = powerLoad > 80;

  return (
    <AnimatePresence>
      {isCritical && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-50 mix-blend-multiply"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.4] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <img
            src="/images/blood_smear.png"
            alt="System Fever"
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NoiseOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[60] mix-blend-overlay opacity-5">
      <motion.div
        className="w-full h-full"
        style={{ backgroundImage: 'url(/images/noise.png)' }}
        animate={{ backgroundPosition: ['0% 0%', '10% 10%', '-5% 5%', '5% -5%'] }}
        transition={{ duration: 0.2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
