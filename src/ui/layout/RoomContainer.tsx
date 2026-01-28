import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, selectFlashlight, selectIsBlackout } from '@game/store';
import { useMousePosition } from '../../utils/useMousePosition';
import { ParallaxRoom } from './ParallaxRoom';
import { FlashlightOverlay } from './FlashlightOverlay';
import { RoomLayout } from '../room/RoomLayout';

interface RoomContainerProps {
  children: ReactNode;
}

export function RoomContainer({ children }: RoomContainerProps) {
  const monitorState = useGameStore((state) => state.monitorState);
  const flashlight = useGameStore(selectFlashlight);
  const isBlackout = useGameStore(selectIsBlackout);

  const mouse = useMousePosition();

  // Determine if room view should be prominent (monitor OFF or BOOTING)
  const isRoomView = monitorState === 'OFF' || monitorState === 'BOOTING' || isBlackout;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-crt-dark">
      {/* v2.0 CSS Room Layout (always rendered, visibility controlled by state) */}
      <div className="absolute inset-0 z-0">
        <RoomLayout />
      </div>

      {/* Legacy Parallax Room (can be removed or kept for additional atmosphere) */}
      <div className="absolute inset-0 z-1 pointer-events-none opacity-30">
        <ParallaxRoom mousePosition={mouse} />
      </div>

      {/* Flashlight Overlay */}
      {flashlight.enabled && (
        <FlashlightOverlay
          mouseX={mouse.x}
          mouseY={mouse.y}
          radius={flashlight.radius}
          flickerIntensity={flashlight.flickerIntensity}
          isBlackout={isBlackout}
        />
      )}

      {/* Monitor Content Container with Motion */}
      <motion.div
        className="relative z-10"
        initial={false}
        animate={isRoomView ? 'room' : 'monitor'}
        variants={{
          monitor: {
            scale: 1,
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 30,
              filter: { type: 'tween' }
            }
          },
          room: {
            scale: 0.85,
            y: 300,
            opacity: 0,
            filter: 'blur(8px)',
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 30,
              filter: { type: 'tween' }
            }
          }
        }}
      >
        {children}
      </motion.div>

      {/* Blackout overlay */}
      {isBlackout && (
        <motion.div
          className="absolute inset-0 z-50 bg-black pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.95, 1, 0.95] }}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
      )}

      {/* Room view hint when monitor is ON */}
      {monitorState === 'ON' && (
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-[10px] font-mono text-[#444]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          [TAB] LOOK AT DOOR
        </motion.div>
      )}
    </div>
  );
}

