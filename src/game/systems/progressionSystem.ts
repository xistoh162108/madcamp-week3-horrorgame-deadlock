import type { Phase } from '../types';
import { PHASE_MODULE_REQUIREMENTS, BALANCE } from '../constants';

export interface PhaseTransitionResult {
  newPhase: Phase;
  newSpeed: number;
  logMessage: string;
}

/**
 * Checks if a phase transition should occur based on current state.
 */
export function checkPhaseTransition(
  phase: Phase,
  completedModules: number,
  totalTasksAssigned: number
): PhaseTransitionResult | null {
  
  // INTRO -> PHASE 1: After 1 task assigned
  if (phase === 'intro') {
    if (totalTasksAssigned >= 1) {
      return {
        newPhase: 'phase1',
        newSpeed: BALANCE.PHASE_SPEEDS.phase1,
        logMessage: '[SYSTEM] Threat Level Increasing. Entering PHASE 1.'
      };
    }
  }

  // PHASE 1 -> PHASE 2: After 2 modules completed
  else if (phase === 'phase1') {
    if (completedModules >= PHASE_MODULE_REQUIREMENTS.phase2) {
      return {
        newPhase: 'phase2',
        newSpeed: BALANCE.PHASE_SPEEDS.phase2,
        logMessage: '[SYSTEM] Security escalation detected. Entering PHASE 2.'
      };
    }
  }

  // PHASE 2 -> PHASE 3: After 3 modules completed
  else if (phase === 'phase2') {
    if (completedModules >= PHASE_MODULE_REQUIREMENTS.phase3) {
      return {
        newPhase: 'phase3',
        newSpeed: BALANCE.PHASE_SPEEDS.phase3,
        logMessage: '[SYSTEM] CRITICAL: Zombie process proximity alert. Entering PHASE 3.'
      };
    }
  }
  
  // PHASE 3 -> FINAL COMPILE must be triggered explicitly when all modules are done
  // This is typically handled in the puzzle submission logic because it immediately starts the compilation sequence

  return null;
}
