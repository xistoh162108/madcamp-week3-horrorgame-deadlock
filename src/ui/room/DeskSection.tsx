/**
 * DeskSection Component
 *
 * Center section of the room showing:
 * - The desk
 * - Monitor (ON/OFF/BOOTING states)
 * - Keyboard
 * - Ambient lighting from monitor
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@game/store';

export function DeskSection() {
  const monitorState = useGameStore((s) => s.monitorState);
  const bootTimer = useGameStore((s) => s.bootTimer);
  const isBlackout = useGameStore((s) => s.isBlackout);
  const moduleIndex = useGameStore((s) => s.currentModuleIndex);

  const isOn = monitorState === 'ON';
  const isBooting = monitorState === 'BOOTING';

  // Monitor glow color
  const glowColor = isBlackout
    ? 'transparent'
    : isOn
      ? 'rgba(100, 200, 255, 0.15)'
      : isBooting
        ? 'rgba(100, 200, 255, 0.08)'
        : 'transparent';

  return (
    <div className="relative h-full bg-[#0a0a0a] overflow-hidden">
      {/* Room ambient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, #111 0%, #080808 60%, #050505 100%)',
        }}
      />

      {/* Monitor glow on ceiling/walls */}
      <AnimatePresence>
        {(isOn || isBooting) && !isBlackout && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(ellipse at 50% 70%, ${glowColor} 0%, transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* CHALKBOARD (Wall behind desk) */}
      <Chalkboard moduleIndex={moduleIndex} />

      {/* Desk */}
      <div className="absolute bottom-[15%] left-[10%] right-[10%] h-[8%]">
        {/* Desk surface */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#2a2018] to-[#1a1510]"
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {/* Desk edge highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3a3028]" />

          {/* NARRATIVE ASSETS */}
          <NarrativeProps moduleIndex={moduleIndex} />
        </div>

        {/* Desk front panel */}
        <div className="absolute top-full left-0 right-0 h-[60%] bg-gradient-to-b from-[#1a1510] to-[#100c08]" />
      </div>

      {/* Monitor */}
      <div className="absolute bottom-[23%] left-1/2 -translate-x-1/2 w-[50%] aspect-[16/10]">
        {/* Monitor back/stand */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[20%] h-[15%] bg-[#1a1a1a]" />
        <div className="absolute -bottom-[5%] left-1/2 -translate-x-1/2 w-[30%] h-[5%] bg-[#222] rounded-sm" />

        {/* Monitor frame */}
        <div
          className="absolute inset-0 bg-[#1a1a1a] rounded-sm"
          style={{
            boxShadow: isOn
              ? '0 0 30px rgba(100, 200, 255, 0.2)'
              : '0 5px 20px rgba(0,0,0,0.5)',
          }}
        >
          {/* Screen bezel */}
          <div className="absolute inset-[4%] bg-[#111] rounded-sm overflow-hidden">
            {/* Screen content */}
            <MonitorScreen
              isOn={isOn}
              isBooting={isBooting}
              isBlackout={isBlackout}
              bootTimer={bootTimer}
            />
          </div>

          {/* Power LED */}
          <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full">
            <motion.div
              className="w-full h-full rounded-full"
              animate={{
                backgroundColor: isBlackout
                  ? '#333'
                  : isOn
                    ? '#4ade80'
                    : isBooting
                      ? '#fbbf24'
                      : '#333',
                boxShadow: isBlackout
                  ? 'none'
                  : isOn
                    ? '0 0 6px #4ade80'
                    : isBooting
                      ? '0 0 6px #fbbf24'
                      : 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyboard */}
      <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-[35%] h-[3%]">
        <div
          className="w-full h-full bg-[#222] rounded-sm"
          style={{
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          {/* Key rows hint */}
          <div className="absolute top-[20%] left-[5%] right-[5%] h-[20%] flex gap-[2%]">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 bg-[#2a2a2a] rounded-[1px]" />
            ))}
          </div>
          <div className="absolute top-[50%] left-[5%] right-[5%] h-[20%] flex gap-[2%]">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="flex-1 bg-[#2a2a2a] rounded-[1px]" />
            ))}
          </div>
        </div>
      </div>

      {/* Control hint */}
      <AnimatePresence>
        {!isOn && !isBooting && !isBlackout && (
          <motion.div
            className="absolute bottom-[8%] left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#444]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            [TAB] TURN ON MONITOR
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MonitorScreenProps {
  isOn: boolean;
  isBooting: boolean;
  isBlackout: boolean;
  bootTimer: number;
}

function MonitorScreen({
  isOn,
  isBooting,
  isBlackout,
  bootTimer,
}: MonitorScreenProps) {
  const activeJumpscare = useGameStore(s => s.activeJumpscare);

  if (isBlackout) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <motion.div
          className="text-red-500 font-mono text-xs"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          POWER FAILURE
        </motion.div>
      </div>
    );
  }

  if (isBooting) {
    // JUMPSCARE: Boot Glitch
    if (activeJumpscare === 'MN_GLITCH') {
      return (
        <div className="w-full h-full bg-black relative overflow-hidden">
          <img
            src="/images/monitor_glitch_face.png"
            className="w-full h-full object-cover mix-blend-luminosity brightness-150 contrast-125 animate-pulse"
            alt="ERROR"
          />
          <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
        </div>
      );
    }

    const progress = 1 - bootTimer / 1.5; // BOOT.DURATION = 1.5
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center gap-2">
        <div className="text-[#4a9eff] font-mono text-[10px]">BOOTING...</div>
        <div className="w-[60%] h-1 bg-[#222] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#4a9eff]"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    );
  }

  if (isOn) {
    return (
      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background:
            'linear-gradient(to bottom, #0a1520 0%, #081018 50%, #060810 100%)',
        }}
      >
        {/* Scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />

        {/* Screen glow */}
        <div className="absolute inset-0 bg-[#4a9eff] opacity-5" />

        {/* Placeholder for actual code editor */}
        <div className="absolute top-2 left-2 right-2 bottom-2 text-[6px] font-mono text-[#4a9eff] opacity-50 overflow-hidden">
          <div>{'>'} BIO-KERNEL v4.2.0 (SAFE MODE)</div>
          <div>{'>'} Subject Status: CRITICAL</div>
          <div className="mt-1">
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              _
            </motion.span>
          </div>
        </div>
      </motion.div>
    );
  }

  // OFF state
  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden">
      {/* JUMPSCARE: Screen Reflection */}
      {activeJumpscare === 'MN_REFLECT' && (
        <motion.div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <img
            src="/images/reflection_monster_shadow.png"
            className="w-full h-full object-cover scale-110 opacity-60"
            alt="Reflection" // Accessibility hidden
          />
        </motion.div>
      )}
    </div>
  );
}

function NarrativeProps({ }: { moduleIndex: number }) {
  return (
    <AnimatePresence>
      {/* Module 1: Nametag (The Shell) */}
      {true && (
        <motion.img
          key="nametag"
          src="/images/desk_nametag.png"
          alt="Dirty ID Card"
          className="absolute left-[5%] bottom-[10%] w-[22%] opacity-90 drop-shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.9, y: 0 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Module 2: Fishbowl (The Gasp) */}
      {true && (
        <motion.img
          key="fishbowl"
          src="/images/desk_fishbowl.png"
          alt="Dry Fishbowl"
          className="absolute right-[5%] bottom-[5%] w-[27%] opacity-90 drop-shadow-md"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 0.9, x: 0 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Desk Surface Carvings/Scribbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 mix-blend-overlay">
        <div className="absolute bottom-[20%] left-[30%] text-[#ffffffaa] font-handwriting text-[10px] -rotate-1">
          DON'T SLEEP
        </div>
        <div className="absolute bottom-[10%] left-[45%] text-[#ffffff88] font-handwriting text-[8px] rotate-2">
          Day 104...
        </div>
        <div className="absolute bottom-[25%] right-[35%] text-[#ff000088] font-handwriting text-[9px] -rotate-3 font-bold">
          LIES
        </div>
        <div className="absolute bottom-[15%] right-[20%] text-[#ffffff66] font-handwriting text-[14px] rotate-12">
          Who am I?
        </div>
        {/* Scratches */}
        <div className="absolute bottom-[30%] left-[10%] w-10 h-[1px] bg-white/20 rotate-45" />
        <div className="absolute bottom-[28%] left-[12%] w-8 h-[1px] bg-white/20 rotate-12" />
      </div>
    </AnimatePresence>
  );
}

function Chalkboard({ }: { moduleIndex: number }) {
  return (
    <div className="absolute top-[10%] left-[15%] right-[15%] h-[35%] bg-[#1a201a] border-8 border-[#2e2621] rounded-sm shadow-xl flex overflow-hidden">
      {/* Chalk texture / Dust */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/noise.png)',
          backgroundSize: '200px',
          filter: 'contrast(1.5)'
        }}
      />

      {/* Chalk Tray */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#2e2621] shadow-sm" />

      {/* Scribbles (Static) */}
      {/* Scribbles (Static) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] text-[#e0e0e0aa] font-handwriting text-[10px] -rotate-3 opacity-70">
          SUBJ-89: FAILED
        </div>
        <div className="absolute top-[5%] left-[40%] text-[#ff0000aa] font-handwriting text-[12px] rotate-2 opacity-50">
          DO NOT OPEN
        </div>
        <div className="absolute bottom-[20%] left-[35%] text-[#ffffff88] font-handwriting text-[9px] -rotate-6 opacity-60">
          They are watching
        </div>
        <div className="absolute top-[40%] right-[40%] text-[#ffffffaa] font-handwriting text-[8px] rotate-12 opacity-40">
          t → ∞ (TRAPPED)
        </div>
        <div className="absolute bottom-[10%] right-[10%] text-[#e0e0e0aa] font-handwriting text-[10px] -rotate-3 opacity-50">
          VITALS: CRITICAL
        </div>
        <div className="absolute top-[15%] right-[5%] text-[#ffffff66] font-handwriting text-[24px] rotate-45 opacity-20 font-bold">
          ?
        </div>
        <div className="absolute inset-[20%] border border-white/10 rounded-full w-[40px] h-[40px] opacity-30" />
      </div>

      {/* Dynamic Assets */}
      <AnimatePresence>
        {/* Module 2: Lung Diagram (The Gasp) */}
        {true && (
          <motion.div
            className="absolute left-[15%] top-[10%] w-[38%]"
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 0.8, filter: 'blur(0.5px)' }}
          >
            <img
              src={useGameStore(s => s.activeJumpscare) === 'BD_BLOODY' ? "/images/board_lung_bloody.png" : "/images/board_lung.png"}
              alt="Lung Diagram"
              className="w-full h-full object-contain mix-blend-screen opacity-90 invert-[0.1]" // Chalk look
            />
            <div className="text-[6px] text-center text-white/50 font-mono mt-1">RESPIRATORY FAILURE</div>
          </motion.div>
        )}

        {/* Module 3: Defibrillator (The Parasite) */}
        {true && (
          <motion.div
            className="absolute right-[15%] top-[15%] w-[30%]"
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 0.8, filter: 'blur(0.5px)' }}
          >
            <img
              src="/images/board_defib.png"
              alt="Defib Schematic"
              className="w-full h-full object-contain mix-blend-screen opacity-90"
              style={{ filter: 'invert(1) brightness(1.5)' }} // Invert black lines to white chalk
            />
            <div className="text-[6px] text-center text-white/50 font-mono mt-1">VOLTAGE REGULATION</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
