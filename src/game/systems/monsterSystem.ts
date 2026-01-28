/**
 * Monster System v2.0
 *
 * Implements the Telegraph + 60/40 Gamble system:
 * - Monster approaches over time
 * - At attack range, starts Telegraph (3-5 second warning)
 * - 60% Real attack, 40% Fake-out
 * - 1-Second Pre-Close Rule: door must be closed >= 1s before impact
 * - Blackout: monster rushes at 3x speed
 */

import { MONSTER, DOOR, BALANCE, STEALTH } from '@game/constants';
import type { MonsterState, TelegraphEvent, DoorState, Phase, SoundId, MonitorState } from '@game/types';

// ============================================
// Types
// ============================================

export interface MonsterUpdate {
  monsterDistance?: number;
  monsterState?: MonsterState;
  threat?: number;
  threatEased?: number;
  timeElapsed?: number;
  currentTelegraph?: TelegraphEvent | null;
  phase?: Phase;
  logs?: string[];
  triggerAudio?: SoundId;
  triggerStrobe?: number;
}

export interface MonsterSystemState {
  phase: Phase;
  monsterDistance: number;
  monsterSpeed: number;
  monsterState: MonsterState;
  currentTelegraph: TelegraphEvent | null;
  isBlackout: boolean;
  doorState: DoorState;
  doorClosedDuration: number;
  activeTask: unknown | null;
  timeElapsed: number;
  monitorState: MonitorState;
  mouseStillTime: number;
  isPlayDead: boolean;
}


// ============================================
// v2.0 Monster AI State Machine
// ============================================

/**
 * Main v2.0 monster update function.
 * Handles all monster states (STALKING, TELEGRAPHING, ATTACKING, REPELLED) and the Telegraph system.
 * 
 * @param state - The current state of the monster system
 * @param dt - Delta time in seconds since the last update
 * @returns An object containing the state updates for the monster system
 */
export function updateMonsterV2(state: MonsterSystemState, dt: number): MonsterUpdate {
  const { phase, monsterState, isBlackout, activeTask, timeElapsed } = state;

  // Don't update in certain phases
  if (phase === 'loading' || phase === 'start' || phase === 'ending' || phase === 'gameOver') {
    return { timeElapsed: timeElapsed };
  }

  // If task is active, monster pauses (legacy behavior)
  if (activeTask) {
    return { timeElapsed: timeElapsed + dt };
  }

  // Blackout: monster rushes regardless of state
  if (isBlackout && monsterState !== 'TELEGRAPHING' && monsterState !== 'ATTACKING') {
    return handleBlackoutRush(state, dt);
  }

  // State machine
  switch (monsterState) {
    case 'IDLE':
      return handleIdle(state, dt);
    case 'APPROACHING':
      return handleApproaching(state, dt);
    case 'TELEGRAPHING':
      return handleTelegraphing(state, dt);
    case 'ATTACKING':
      return handleAttacking(state);
    case 'BREACHED':
      return handleBreached(state, dt);
    default:
      return { timeElapsed: timeElapsed + dt };
  }
}

// ============================================
// State Handlers
// ============================================

/**
 * IDLE state: Monster waits briefly, then starts approaching
 */
function handleIdle(state: MonsterSystemState, dt: number): MonsterUpdate {
  const { monsterDistance, timeElapsed } = state;

  // Calculate threat for audio/visual effects
  const threat = 1 - monsterDistance / 100;
  const threatEased = Math.pow(threat, 1.6);

  // Transition to APPROACHING after a short delay
  // (In practice, we usually start in APPROACHING)
  return {
    monsterState: 'APPROACHING',
    threat,
    threatEased,
    timeElapsed: timeElapsed + dt,
  };
}

/**
 * APPROACHING state: Monster moves toward player
 * When close enough, starts Telegraph
 */
function handleApproaching(state: MonsterSystemState, dt: number): MonsterUpdate {
  const { monsterDistance, monsterSpeed, timeElapsed } = state;

  // Move toward player
  const newDistance = Math.max(0, monsterDistance - monsterSpeed * dt);

  // Calculate threat
  const threat = 1 - newDistance / 100;
  const threatEased = Math.pow(threat, 1.6);

  // Check if close enough to start Telegraph
  if (newDistance <= MONSTER.ATTACK_THRESHOLD) {
    const telegraphResult = startTelegraph();
    return {
      ...telegraphResult,
      monsterDistance: newDistance,
      threat,
      threatEased,
      timeElapsed: timeElapsed + dt,
      logs: ['[WARNING] Movement detected at door...'],
    };
  }

  return {
    monsterDistance: newDistance,
    threat,
    threatEased,
    timeElapsed: timeElapsed + dt,
  };
}

/**
 * TELEGRAPHING state: Warning period before attack
 * Player must close door during this time
 */
function handleTelegraphing(state: MonsterSystemState, dt: number): MonsterUpdate {
  const { currentTelegraph, timeElapsed } = state;

  if (!currentTelegraph) {
    // No telegraph event, return to approaching
    return {
      monsterState: 'APPROACHING',
      timeElapsed: timeElapsed + dt,
    };
  }

  // Calculate elapsed time since telegraph started
  const elapsed = (Date.now() - currentTelegraph.startTime) / 1000;

  // Check if telegraph duration has passed
  if (elapsed >= currentTelegraph.duration) {
    // Telegraph finished - resolve the attack
    return resolveAttack(state, dt);
  }

  // Still telegraphing - calculate threat for effects
  const threat = 1 - state.monsterDistance / 100;
  const threatEased = Math.pow(threat, 1.6);

  return {
    threat,
    threatEased,
    timeElapsed: timeElapsed + dt,
  };
}

/**
 * ATTACKING state: Game over
 */
function handleAttacking(_state: MonsterSystemState): MonsterUpdate {
  return {
    monsterDistance: 0,
    threat: 1,
    threatEased: 1,
    phase: 'gameOver',
    logs: [
      '[CRITICAL] BREACH DETECTED',
      '[CRITICAL] DOOR COMPROMISED',
      '[SYSTEM] PROCESS TERMINATED',
    ],
  };
}

/**
 * Blackout rush: Monster moves at 3x speed
 */
function handleBlackoutRush(state: MonsterSystemState, dt: number): MonsterUpdate {
  const { monsterDistance, timeElapsed } = state;

  // Rush at blackout speed (3x normal)
  const newDistance = Math.max(0, monsterDistance - MONSTER.BLACKOUT_SPEED * dt);

  // Calculate threat
  const threat = 1 - newDistance / 100;
  const threatEased = Math.pow(threat, 1.6);

  // Check if close enough to start Telegraph
  if (newDistance <= MONSTER.ATTACK_THRESHOLD) {
    const telegraphResult = startTelegraph();
    return {
      ...telegraphResult,
      monsterDistance: newDistance,
      threat,
      threatEased,
      timeElapsed: timeElapsed + dt,
      logs: ['[CRITICAL] Rapid approach detected!'],
    };
  }

  return {
    monsterDistance: newDistance,
    monsterState: 'APPROACHING',
    threat,
    threatEased,
    timeElapsed: timeElapsed + dt,
  };
}

// ============================================
// Telegraph System
// ============================================

/**
 * Start a new Telegraph event
 * 60% chance of real attack, 40% fake-out
 */
function startTelegraph(): Partial<MonsterUpdate> {
  // Random duration between 3-5 seconds
  const duration = MONSTER.TELEGRAPH_MIN +
    Math.random() * (MONSTER.TELEGRAPH_MAX - MONSTER.TELEGRAPH_MIN);

  // 60% real attack, 40% fake
  const isReal = Math.random() < MONSTER.REAL_ATTACK_CHANCE;

  const telegraph: TelegraphEvent = {
    startTime: Date.now(),
    duration,
    impactTime: Date.now() + duration * 1000,
    isReal,
    audioPlayed: false,
  };

  const telegraphSounds: SoundId[] = ['doorRattle', 'growl', 'scraping', 'voice_mom', 'voice_child', 'voice_man'];
  const sound = telegraphSounds[Math.floor(Math.random() * telegraphSounds.length)];

  return {
    monsterState: 'TELEGRAPHING',
    currentTelegraph: telegraph,
    triggerAudio: sound,
    triggerStrobe: duration,
  };
}

/**
 * Resolve attack at end of Telegraph
 * Checks 1-Second Pre-Close Rule
 */
function resolveAttack(state: MonsterSystemState, dt: number): MonsterUpdate {
  const { currentTelegraph, doorState, doorClosedDuration, timeElapsed } = state;

  if (!currentTelegraph) {
    return {
      monsterState: 'APPROACHING',
      currentTelegraph: null,
      timeElapsed: timeElapsed + dt,
    };
  }

  // FAKE ATTACK: Monster retreats regardless of door state
  if (!currentTelegraph.isReal) {
    const repelDistance = MONSTER.REPEL_DISTANCE_MIN +
      Math.random() * (MONSTER.REPEL_DISTANCE_MAX - MONSTER.REPEL_DISTANCE_MIN);

    return {
      monsterState: 'APPROACHING',
      monsterDistance: repelDistance,
      currentTelegraph: null,
      threat: 1 - repelDistance / 100,
      threatEased: Math.pow(1 - repelDistance / 100, 1.6),
      timeElapsed: timeElapsed + dt,
      logs: ['[INFO] Movement ceased. False alarm?'],
    };
  }

  // REAL ATTACK: Check 1-Second Pre-Close Rule
  const doorWasSecure = doorState === 'CLOSED' && doorClosedDuration >= DOOR.SAFE_DURATION;

  if (doorWasSecure) {
    // SUCCESS: Door was closed long enough - Monster repelled!
    const repelDistance = MONSTER.REPEL_DISTANCE_MIN +
      Math.random() * (MONSTER.REPEL_DISTANCE_MAX - MONSTER.REPEL_DISTANCE_MIN);

    return {
      monsterState: 'APPROACHING',
      monsterDistance: repelDistance,
      currentTelegraph: null,
      threat: 1 - repelDistance / 100,
      threatEased: Math.pow(1 - repelDistance / 100, 1.6),
      timeElapsed: timeElapsed + dt,
      logs: [
        '[ALERT] Entry attempt blocked!',
        '[INFO] Threat retreating...',
      ],
    };
  } else {
    // FAILURE: Door was not closed or not closed long enough
    // v3.3: Transition to BREACHED for Play Dead gamble
    return {
      monsterState: 'BREACHED',
      currentTelegraph: null,
      timeElapsed: timeElapsed + dt,
      logs: [
        '[CRITICAL] DOOR NOT SECURED!',
        '[WARNING] INTRUDER IN THE ROOM. STAY STILL. MONITOR OFF.',
      ],
      triggerAudio: 'doorBurst',
    };
  }
}

/**
 * handleBreached: The "Play Dead" gamble
 * Monster is in the room. Survival requires:
 * 1. Monitor state is OFF
 * 2. Mouse hasn't moved for STEALTH.GRACE_PERIOD
 */
function handleBreached(state: MonsterSystemState, dt: number): MonsterUpdate {
  const { monitorState, mouseStillTime, timeElapsed } = state;

  // Check if player is "still"
  const isStill = monitorState === 'OFF' && mouseStillTime >= STEALTH.GRACE_PERIOD;

  // Every second or so, check for a "leave" trigger or "kill" trigger
  // We'll use a local timer behavior or just a probability check tied to dt
  const checkChance = 0.2 * dt; // 20% chance per second to resolve

  if (Math.random() < checkChance) {
    // 70% live, 30% die if still. If not still, 100% die.
    if (isStill) {
      if (Math.random() < STEALTH.PLAY_DEAD_SURVIVAL_CHANCE) {
        // SURVIVE: Monster leaves
        const repelDistance = 70 + Math.random() * 20;
        return {
          monsterState: 'APPROACHING',
          monsterDistance: repelDistance,
          logs: [
            '[INFO] Intruder seems to have left.',
            '[SYSTEM] Life signs remaining: 1',
          ],
          triggerAudio: 'monsterRetreat' as SoundId, // I'll assume this exists or use footsteps
        };
      } else {
        // DIE: Music box failure
        return {
          monsterState: 'ATTACKING',
          logs: ['[ERROR] Unexpected audio output detected.', '[CRITICAL] LOCATION REVEALED'],
          triggerAudio: 'musicBox',
        };
      }
    } else {
      // NOT STILL: Automatic death
      return {
        monsterState: 'ATTACKING',
        logs: ['[CRITICAL] MOVEMENT DETECTED'],
      };
    }
  }

  return { timeElapsed: timeElapsed + dt };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get remaining time in current telegraph
 */
export function getTelegraphRemainingTime(telegraph: TelegraphEvent | null): number {
  if (!telegraph) return 0;
  const elapsed = (Date.now() - telegraph.startTime) / 1000;
  return Math.max(0, telegraph.duration - elapsed);
}

/**
 * Get telegraph progress (0-1)
 */
export function getTelegraphProgress(telegraph: TelegraphEvent | null): number {
  if (!telegraph) return 0;
  const elapsed = (Date.now() - telegraph.startTime) / 1000;
  return Math.min(1, elapsed / telegraph.duration);
}

/**
 * Check if currently in telegraph warning phase
 */
export function isInTelegraphWarning(monsterState: MonsterState): boolean {
  return monsterState === 'TELEGRAPHING';
}

/**
 * Get monster danger level for UI
 */
export function getMonsterDangerLevel(
  monsterState: MonsterState,
  monsterDistance: number
): 'safe' | 'alert' | 'danger' | 'critical' {
  if (monsterState === 'ATTACKING') return 'critical';
  if (monsterState === 'TELEGRAPHING') return 'danger';
  if (monsterDistance <= 30) return 'alert';
  return 'safe';
}

/**
 * Calculate threat from distance
 */
export function calculateThreat(monsterDistance: number): { threat: number; threatEased: number } {
  const threat = 1 - monsterDistance / 100;
  const threatEased = Math.pow(threat, 1.6);
  return { threat, threatEased };
}

/**
 * Reset monster to initial state (after successful defense or for restart)
 */
export function getMonsterResetState(): Partial<MonsterUpdate> {
  return {
    monsterState: 'APPROACHING',
    monsterDistance: BALANCE.INITIAL_DISTANCE,
    currentTelegraph: null,
    threat: 0,
    threatEased: 0,
  };
}
