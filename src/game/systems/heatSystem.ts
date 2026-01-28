/**
 * Heat System v2.0
 *
 * Manages powerLoad (heat) accumulation and blackout mechanics.
 * - Monitor ON: +2%/sec passive drain
 * - Typing: +1%/keystroke
 * - Compile: +30% instant
 * - Door Hold: +15%/sec
 * - Monitor OFF: -0.5%/sec cooling
 * - Heat >= 100%: BLACKOUT (5 seconds, door forced open)
 */

import { HEAT } from '@game/constants';
import type { MonitorState, DoorState } from '@game/types';

export interface HeatState {
  powerLoad: number;
  isBlackout: boolean;
  blackoutTimer: number;
  monitorState: MonitorState;
  isDoorHeld: boolean;
  doorState: DoorState;
  doorClosedDuration: number;
  completedModules: number;
}

export interface HeatUpdate {
  powerLoad?: number;
  isBlackout?: boolean;
  blackoutTimer?: number;
  doorState?: DoorState;
  doorClosedDuration?: number;
  monitorState?: MonitorState;
  isDoorHeld?: boolean;
}

/**
 * Update the heat system each frame.
 * Manages power load accumulation, cooling, and blackout triggers based on monitor and door state.
 * 
 * @param state - The current state related to heat and power
 * @param dt - Delta time in seconds since the last update
 * @returns A partial state update for the heat system
 */
export function updateHeat(state: HeatState, dt: number): HeatUpdate {
  const { powerLoad, monitorState, isDoorHeld, isBlackout, blackoutTimer, completedModules } = state;

  // Calculate entropy multipliers based on completed modules
  // scaling = 1 + (maxScaling - 1) * (completed / total)
  // But simpler: multiplier = 1 + (0.1 * completed) up to 1.5
  const heatMultiplier = Math.min(HEAT.SCALING_MAX_HEAT, 1 + (completedModules * 0.1));
  const coolingMultiplier = Math.max(HEAT.SCALING_MIN_COOLING, 1 - (completedModules * 0.04));

  // During blackout: countdown only
  if (isBlackout) {
    const newTimer = blackoutTimer - dt;
    if (newTimer <= 0) {
      return {
        isBlackout: false,
        blackoutTimer: 0,
        powerLoad: HEAT.BLACKOUT_RESET_HEAT,
      };
    }
    return { blackoutTimer: newTimer };
  }

  let newPowerLoad = powerLoad;

  // Heat accumulation/cooling based on monitor state
  if (monitorState === 'ON' || monitorState === 'BOOTING') {
    newPowerLoad += HEAT.PASSIVE_RATE_ON * heatMultiplier * dt;
  } else if (monitorState === 'OFF') {
    newPowerLoad = Math.max(0, newPowerLoad - HEAT.COOLING_RATE * coolingMultiplier * dt);
  }

  // Door hold cost (only when monitor OFF)
  if (isDoorHeld && monitorState === 'OFF') {
    newPowerLoad += HEAT.DOOR_HOLD_COST * heatMultiplier * dt;
  }

  // Blackout trigger
  if (newPowerLoad >= HEAT.BLACKOUT_THRESHOLD) {
    return {
      powerLoad: HEAT.BLACKOUT_THRESHOLD,
      isBlackout: true,
      blackoutTimer: HEAT.BLACKOUT_DURATION,
      doorState: 'OPEN',
      doorClosedDuration: 0,
      monitorState: 'OFF',
      isDoorHeld: false,
    };
  }

  return { powerLoad: Math.max(0, newPowerLoad) };
}

/**
 * Add heat from typing
 * @param currentHeat Current powerLoad
 * @param charCount Number of characters typed
 * @param completedModules Number of completed modules for entropy
 * @returns New powerLoad value
 */
export function addTypingHeat(currentHeat: number, charCount: number = 1, completedModules: number = 0): number {
  const multiplier = Math.min(HEAT.SCALING_MAX_HEAT, 1 + (completedModules * 0.1));
  return currentHeat + (HEAT.TYPING_COST * charCount * multiplier);
}

/**
 * Add heat from compiling
 * @param currentHeat Current powerLoad
 * @param completedModules Number of completed modules for entropy
 * @returns New powerLoad value
 */
export function addCompileHeat(currentHeat: number, completedModules: number = 0): number {
  const multiplier = Math.min(HEAT.SCALING_MAX_HEAT, 1 + (completedModules * 0.1));
  return currentHeat + (HEAT.COMPILE_COST * multiplier);
}

/**
 * Get heat danger level for UI
 * @param powerLoad Current heat percentage
 * @returns Danger level string
 */
export function getHeatDangerLevel(powerLoad: number): 'safe' | 'warning' | 'danger' | 'critical' {
  if (powerLoad >= 80) return 'critical';
  if (powerLoad >= 60) return 'danger';
  if (powerLoad >= 40) return 'warning';
  return 'safe';
}

/**
 * Get heat color for UI
 * @param powerLoad Current heat percentage
 * @returns Tailwind color class
 */
export function getHeatColor(powerLoad: number): string {
  if (powerLoad >= 80) return 'bg-red-500';
  if (powerLoad >= 60) return 'bg-orange-500';
  if (powerLoad >= 40) return 'bg-yellow-500';
  return 'bg-green-500';
}
