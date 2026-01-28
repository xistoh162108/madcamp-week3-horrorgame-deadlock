// Legacy systems
export type { MonsterUpdate, MonsterSystemState } from './monsterSystem';

// v2.0 Monster System
export {
  updateMonsterV2,
  getTelegraphRemainingTime,
  getTelegraphProgress,
  isInTelegraphWarning,
  getMonsterDangerLevel,
  calculateThreat,
  getMonsterResetState,
} from './monsterSystem';

export { calculateTaskUpdate } from './taskSystem';
export type { TaskUpdate } from './taskSystem';

export { calculateEffectsUpdate } from './effectsSystem';
export type { EffectsUpdate } from './effectsSystem';

export { calculateAudioMix } from './audioSystem';

export { checkPhaseTransition } from './progressionSystem';
export type { PhaseTransitionResult } from './progressionSystem';

// ============================================
// v2.0 Systems
// ============================================

// Heat System
export {
  updateHeat,
  addTypingHeat,
  addCompileHeat,
  getHeatDangerLevel,
  getHeatColor,
} from './heatSystem';
export type { HeatState, HeatUpdate } from './heatSystem';

// View System
export {
  toggleMonitor,
  updateBoot,
  getBootProgress,
  canCode,
  canControlDoor,
  getMonitorStateText,
} from './viewSystem';
export type { ViewState, ViewUpdate } from './viewSystem';

// Door System
export {
  updateDoor,
  isDoorSecure,
  willBlockAttack,
  getDoorStatus,
  getDoorTimerText,
  getRequiredCloseDuration,
} from './doorSystem';
export type { DoorSystemState, DoorUpdate } from './doorSystem';
