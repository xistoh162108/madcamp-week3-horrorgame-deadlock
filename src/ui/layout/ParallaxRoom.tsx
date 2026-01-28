import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';
import { useGameStore } from '@game/store';
import { UI } from '@game/constants';

interface ParallaxRoomProps {
  mousePosition: { normalizedX: number; normalizedY: number };
}

export function ParallaxRoom({ mousePosition }: ParallaxRoomProps) {
  const threat = useGameStore(state => state.threat);
  
  // Motion values for smooth interpolation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for camera movement
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Update motion values when prop changes
  useEffect(() => {
    mouseX.set(mousePosition.normalizedX);
    mouseY.set(mousePosition.normalizedY);
  }, [mousePosition.normalizedX, mousePosition.normalizedY, mouseX, mouseY]);

  // Calculate transforms for each layer
  // Movement is opposite to mouse direction (mouse right -> room moves left)
  const backX = useTransform(smoothX, [-1, 1], [UI.PARALLAX_BACK_INTENSITY, -UI.PARALLAX_BACK_INTENSITY]);
  const backY = useTransform(smoothY, [-1, 1], [UI.PARALLAX_BACK_INTENSITY, -UI.PARALLAX_BACK_INTENSITY]);

  const midX = useTransform(smoothX, [-1, 1], [UI.PARALLAX_MID_INTENSITY, -UI.PARALLAX_MID_INTENSITY]);
  const midY = useTransform(smoothY, [-1, 1], [UI.PARALLAX_MID_INTENSITY, -UI.PARALLAX_MID_INTENSITY]);

  const frontX = useTransform(smoothX, [-1, 1], [UI.PARALLAX_FRONT_INTENSITY, -UI.PARALLAX_FRONT_INTENSITY]);
  const frontY = useTransform(smoothY, [-1, 1], [UI.PARALLAX_FRONT_INTENSITY, -UI.PARALLAX_FRONT_INTENSITY]);
  
  // Slight rotation for the room feels more 3D
  const rotateX = useTransform(smoothY, [-1, 1], [UI.PARALLAX_ROTATION_INTENSITY, -UI.PARALLAX_ROTATION_INTENSITY]);
  const rotateY = useTransform(smoothX, [-1, 1], [-UI.PARALLAX_ROTATION_INTENSITY, UI.PARALLAX_ROTATION_INTENSITY]);

  // Door opening animation based on threat
  // Threat 0 -> closed (0deg)
  // Threat 1 -> open (30deg?)
  const doorRotateY = useSpring(threat * 45, { stiffness: 50, damping: 20 });
  const shadowOpacity = useTransform(doorRotateY, [0, 45], [0, 0.8]);

  return (
    <motion.div 
      className="absolute inset-0 overflow-hidden bg-[#050505]"
      style={{ perspective: 1000 }}
    >
      {/* Container with general rotation */}
      <motion.div
        className="relative w-full h-full transform-style-3d"
        style={{ rotateX, rotateY }}
      >
        {/* Layer 1: Background (Furthest) - Concrete walls, pipes */}
        <motion.div 
          className="absolute inset-[-20px] bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ 
            x: backX, 
            y: backY,
            backgroundImage: 'radial-gradient(circle at 50% 50%, #222 0%, #000 100%)',
          }}
        >
            <div className="absolute inset-0 border-l border-r border-[#111] w-[80%] mx-auto" />
            
            {/* THE DOOR */}
            <div className="absolute top-[20%] left-[10%] w-[120px] h-[300px] border-8 border-[#1a1a1a] bg-[#0d0d0d]">
                {/* Door Body */}
                <motion.div 
                    className="w-full h-full bg-[#151515] origin-left border-r border-[#000]"
                    style={{ rotateY: doorRotateY }}
                >
                    <div className="absolute top-[50%] right-[10px] w-2 h-2 rounded-full bg-[#333]" />
                </motion.div>
                
                {/* Eyes in the dark behind door */}
                <motion.div 
                    className="absolute top-[40%] left-[60%] w-full h-[60%] pointer-events-none"
                    style={{ opacity: shadowOpacity }}
                >
                    <div className="w-1 h-1 bg-red-500 rounded-full absolute top-10 left-4 shadow-[0_0_5px_red] animate-pulse" />
                    <div className="w-1 h-1 bg-red-500 rounded-full absolute top-10 left-10 shadow-[0_0_5px_red] animate-pulse" style={{ animationDelay: '0.2s' }} />
                </motion.div>
            </div>

            <div className="absolute top-[20%] w-full h-1 bg-[#111]" />
            <div className="absolute top-[60%] w-full h-1 bg-[#111]" />
        </motion.div>

        {/* Layer 2: Midground - Desk, furniture shapes */}
        <motion.div 
          className="absolute inset-[-10px]"
          style={{ x: midX, y: midY }}
        >
             {/* Simple shapes to represent room structure */}
             <div className="absolute bottom-0 left-[10%] w-[10%] h-[60%] bg-[#0a0a0a] blur-[2px]" />
             <div className="absolute top-[10%] right-[15%] w-[100px] h-[120px] bg-[#111] rounded-sm transform rotate-3" />
        </motion.div>

        {/* Layer 3: Foreground (Closest) - Cables, dust */}
        <motion.div 
          className="absolute inset-[-5px] pointer-events-none"
          style={{ x: frontX, y: frontY }}
        >
            <div className="absolute top-0 right-[20%] w-[2px] h-[30%] bg-[#1a1a1a]" />
            <div className="absolute bottom-[10%] left-[5%] w-[200px] h-[2px] bg-[#1a1a1a] transform -rotate-12" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
