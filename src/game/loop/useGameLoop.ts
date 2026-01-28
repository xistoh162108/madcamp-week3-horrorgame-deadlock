import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store';
import type { Phase } from '../types';


// Phases where the game loop should run
const ACTIVE_PHASES: Phase[] = ['intro', 'phase1', 'phase2', 'phase3', 'finalCompile', 'ending', 'gameOver'];

export function useGameLoop() {
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());

  const loop = useCallback((timestamp: number) => {
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    const state = useGameStore.getState();
    const { phase, actions } = state;

    // Run loop during gameplay phases
    if (ACTIVE_PHASES.includes(phase)) {
      // 1. Boot sequence
      actions.updateBoot(dt);

      // 2. Heat system
      actions.updateHeat(dt);

      // 3. Door system
      actions.updateDoor(dt);

      // 4. Monster AI + Telegraph
      actions.updateMonsterV2Action(dt);

      // 5. Effects
      actions.updateEffects(dt);

      // 6. Audio mix
      actions.updateAudioMix();

      // Extra: Progression and Legacy
      actions.checkPhaseTransition();
      actions.updateTasks(dt);

      if (phase === 'finalCompile') {
        actions.updateCompile(dt);
      }

      // 7. v3.3 Stealth
      actions.updateStealth(dt);
    }

    frameRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [loop]);
}
