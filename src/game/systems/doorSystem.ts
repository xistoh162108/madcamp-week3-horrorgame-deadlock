/**
 * Door System v2.0
 *
 * Manages door state and the 1-Second Pre-Close Rule.
 * - SPACE hold: Close door (only when Monitor OFF)
 * - SPACE release: Open door
 * - Door must be closed >= 1 second before monster attack to survive
 * - Blackout forces door OPEN
 */

import { DOOR } from '@game/constants';
import type { MonitorState, DoorState } from '@game/types';

export interface DoorSystemState {
  doorState: DoorState;
  isDoorHeld: boolean;
  doorClosedDuration: number;
  monitorState: MonitorState;
  isBlackout: boolean;
}

export interface DoorUpdate {
  doorState?: DoorState;
  doorClosedDuration?: number;
}

/**
 * Update the door system each frame.
 * Manages door opening/closing state and the 1-second security timer.
 * 
 * @param state - The current state related to the door system
 * @param dt - Delta time in seconds since the last update
 * @returns A partial state update for the door system
 */
export function updateDoor(state: DoorSystemState, dt: number): DoorUpdate {
  const { doorState, isDoorHeld, doorClosedDuration, monitorState, isBlackout } = state;

  // Blackout forces door open
  if (isBlackout) {
    if (doorState === 'CLOSED') {
      return { doorState: 'OPEN', doorClosedDuration: 0 };
    }
    return {};
  }

  // Can only control door when monitor OFF
  if (monitorState === 'ON' || monitorState === 'BOOTING') {
    // Door stays in current state, but timer accumulates if closed
    if (doorState === 'CLOSED') {
      return { doorClosedDuration: doorClosedDuration + dt };
    }
    return {};
  }

  // Monitor OFF - door can be controlled
  if (isDoorHeld) {
    // Space held: close/keep door closed
    if (doorState === 'OPEN') {
      return {
        doorState: 'CLOSED',
        doorClosedDuration: dt,
      };
    } else {
      // Door already closed, accumulate time
      return { doorClosedDuration: doorClosedDuration + dt };
    }
  } else {
    // Space released: open door
    if (doorState === 'CLOSED') {
      return { doorState: 'OPEN', doorClosedDuration: 0 };
    }
  }

  return {};
}

/**
 * Check if door has been closed long enough to be "secure"
 * (1-Second Rule: door must be closed >= 1 second before attack)
 * @param doorClosedDuration Time door has been closed
 * @returns Whether door is secure
 */
export function isDoorSecure(doorClosedDuration: number): boolean {
  return doorClosedDuration >= DOOR.SAFE_DURATION;
}

/**
 * Check if door is properly closed and secure
 * @param doorState Current door state
 * @param doorClosedDuration Time door has been closed
 * @returns Whether door will block an attack
 */
export function willBlockAttack(doorState: DoorState, doorClosedDuration: number): boolean {
  return doorState === 'CLOSED' && isDoorSecure(doorClosedDuration);
}

/**
 * Get door security status for UI
 * @param doorState Current door state
 * @param doorClosedDuration Time door has been closed
 * @returns Status string
 */
export function getDoorStatus(
  doorState: DoorState,
  doorClosedDuration: number
): 'open' | 'closing' | 'secured' {
  if (doorState === 'OPEN') return 'open';
  if (doorClosedDuration < DOOR.SAFE_DURATION) return 'closing';
  return 'secured';
}

/**
 * Get door timer display text
 * @param doorState Current door state
 * @param doorClosedDuration Time door has been closed
 * @returns Display string
 */
export function getDoorTimerText(doorState: DoorState, doorClosedDuration: number): string {
  if (doorState === 'OPEN') return '';
  if (doorClosedDuration >= DOOR.SAFE_DURATION) return '✓ SECURED';
  return `${doorClosedDuration.toFixed(1)}s`;
}

/**
 * Get the required close duration for security
 * @returns Required seconds
 */
export function getRequiredCloseDuration(): number {
  return DOOR.SAFE_DURATION;
}
