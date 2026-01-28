import type { GameState, TaskId, GlitchState } from '../types';
import { BALANCE, HEAT } from '../constants';

export interface TaskUpdate {
  taskCooldowns?: Record<TaskId, number>;
  activeTask?: GameState['activeTask'];
  glitch?: GlitchState;
  monsterSpeed?: number;
  triggerBlackout?: number;
  log?: string;
}

/**
 * Calculates task cooldown and active task updates
 * Pure function - returns updates to be applied
 */
export function calculateTaskUpdate(
  state: Pick<GameState, 'activeTask' | 'taskCooldowns' | 'taskDefs' | 'glitch' | 'monsterSpeed'>,
  dt: number
): TaskUpdate {
  const { activeTask, taskCooldowns, taskDefs, glitch, monsterSpeed } = state;
  const updates: TaskUpdate = {};

  // Update cooldowns
  const newCooldowns = { ...taskCooldowns };
  let cooldownsChanged = false;
  for (const taskId of Object.keys(newCooldowns) as TaskId[]) {
    if (newCooldowns[taskId] > 0) {
      newCooldowns[taskId] = Math.max(0, newCooldowns[taskId] - dt);
      cooldownsChanged = true;
    }
  }
  if (cooldownsChanged) {
    updates.taskCooldowns = newCooldowns;
  }

  // Update active task
  if (activeTask) {
    const remaining = activeTask.remaining - dt;

    if (remaining <= 0) {
      // Task completed - monster returns
      const task = taskDefs[activeTask.id];
      const penalty = task.returnPenalty;

      updates.activeTask = null;
      updates.glitch = {
        ...glitch,
        spike: Math.min(1, glitch.spike + penalty.glitchSpike),
        inputLag: 0,
      };

      if (penalty.speedBurst > 0) {
        updates.monsterSpeed = Math.min(BALANCE.SPEED_CAP, monsterSpeed + penalty.speedBurst);
      }

      if (penalty.blackout) {
        updates.triggerBlackout = HEAT.BLACKOUT_DURATION;
      }

      updates.log = task.flavorText.return;
    } else {
      updates.activeTask = { ...activeTask, remaining };
    }
  }

  return updates;
}
