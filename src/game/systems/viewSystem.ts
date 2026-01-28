/**
 * View System v2.0
 *
 * Manages monitor state transitions (ON/OFF/BOOTING).
 * - ON -> OFF: Instant
 * - OFF -> BOOTING -> ON: 1.5 second delay
 * - During blackout: No transitions allowed
 */

import { BOOT } from '@game/constants';
import type { MonitorState } from '@game/types';

export interface ViewState {
  monitorState: MonitorState;
  bootTimer: number;
  isBlackout: boolean;
}

export interface ViewUpdate {
  monitorState?: MonitorState;
  bootTimer?: number;
}

/**
 * Toggle monitor state (TAB key)
 * @param state Current view state
 * @returns Partial state update
 */
export function toggleMonitor(state: ViewState): ViewUpdate {
  const { monitorState, isBlackout } = state;

  // Cannot toggle during blackout
  if (isBlackout) return {};

  if (monitorState === 'ON') {
    // Instant OFF
    return { monitorState: 'OFF' };
  } else if (monitorState === 'OFF') {
    // Start boot sequence
    return {
      monitorState: 'BOOTING',
      bootTimer: BOOT.DURATION,
    };
  }

  // If BOOTING, ignore toggle request
  return {};
}

/**
 * Update boot sequence timer
 * @param state Current view state
 * @param dt Delta time in seconds
 * @returns Partial state update
 */
export function updateBoot(state: ViewState, dt: number): ViewUpdate {
  const { monitorState, bootTimer } = state;

  if (monitorState !== 'BOOTING') return {};

  const newTimer = bootTimer - dt;
  if (newTimer <= 0) {
    // Boot complete
    return { monitorState: 'ON', bootTimer: 0 };
  }

  return { bootTimer: newTimer };
}

/**
 * Get boot progress (0-1)
 * @param bootTimer Current boot timer
 * @returns Progress value 0-1
 */
export function getBootProgress(bootTimer: number): number {
  return 1 - (bootTimer / BOOT.DURATION);
}

/**
 * Check if coding is allowed
 * @param monitorState Current monitor state
 * @param isBlackout Whether in blackout
 * @returns Whether coding is allowed
 */
export function canCode(monitorState: MonitorState, isBlackout: boolean): boolean {
  return monitorState === 'ON' && !isBlackout;
}

/**
 * Check if door control is allowed
 * @param monitorState Current monitor state
 * @param isBlackout Whether in blackout
 * @returns Whether door control is allowed
 */
export function canControlDoor(monitorState: MonitorState, isBlackout: boolean): boolean {
  return monitorState === 'OFF' && !isBlackout;
}

/**
 * Get monitor state display text
 * @param monitorState Current monitor state
 * @returns Display string
 */
export function getMonitorStateText(monitorState: MonitorState): string {
  switch (monitorState) {
    case 'ON':
      return 'MONITOR ON';
    case 'OFF':
      return 'MONITOR OFF';
    case 'BOOTING':
      return 'BOOTING...';
  }
}
