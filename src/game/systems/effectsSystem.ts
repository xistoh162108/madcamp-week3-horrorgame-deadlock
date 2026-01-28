import type { GameState, GlitchState, FlashlightState } from '../types';
import { BALANCE } from '../constants';

export interface EffectsUpdate {
  glitch: GlitchState;
  flashlight: FlashlightState;
  blackoutRemaining: number;
}

/**
 * Calculates visual effects based on threat level
 * Pure function - returns updates to be applied
 */
export function calculateEffectsUpdate(
  state: Pick<GameState, 'threatEased' | 'glitch' | 'flashlight' | 'blackoutRemaining'>,
  dt: number
): EffectsUpdate {
  const { threatEased, glitch, flashlight, blackoutRemaining } = state;

  // Update glitch intensity from threat
  const baseIntensity = threatEased * BALANCE.MAX_GLITCH_INTENSITY;

  // Decay spike
  const newSpike = Math.max(0, glitch.spike - BALANCE.SPIKE_DECAY_RATE * dt);

  // Update flashlight
  const radiusReduction = threatEased * BALANCE.FLASHLIGHT_THREAT_REDUCTION;
  const newRadius = BALANCE.FLASHLIGHT_BASE_RADIUS - radiusReduction;
  const flickerIntensity = threatEased * 0.3;

  // Decay blackout
  const newBlackout = Math.max(0, blackoutRemaining - dt);

  // Decay strobe
  const newStrobe = Math.max(0, flashlight.strobeIntensity - 2.0 * dt); // Quick decay

  return {
    glitch: {
      ...glitch,
      intensity: baseIntensity,
      spike: newSpike,
    },
    flashlight: {
      ...flashlight,
      radius: newRadius,
      flickerIntensity,
      strobeIntensity: newStrobe,
    },
    blackoutRemaining: newBlackout,
  };
}
