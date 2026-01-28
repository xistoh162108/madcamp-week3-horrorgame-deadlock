import { Howl, Howler } from 'howler';
import type { GameState, AudioMix, SoundId } from '../types';
import { AUDIO } from '../constants';

const AUDIO_LAYERS = {
  ambience: { baseVolume: 0.3, threatMultiplier: -0.1 },
  heartbeat: { baseVolume: 0.1, threatMultiplier: 0.6 },
  footsteps: { baseVolume: 0.1, threatMultiplier: 0.5 },
  breathing: { baseVolume: 0, threshold: 0.5, aboveThreshold: 0.8 },
};

/**
 * Calculates audio mix based on threat level
 * Pure function - returns new audio mix
 */
export function calculateAudioMix(
  state: Pick<GameState, 'monsterDistance' | 'audioMix' | 'phase' | 'powerLoad' | 'isBlackout'>
): AudioMix {
  const { monsterDistance, audioMix, phase, powerLoad, isBlackout } = state;

  // Silence gameplay loops during non-gameplay phases
  if (phase === 'gameOver' || phase === 'ending' || phase === 'start' || phase === 'loading') {
    return {
      ambience: AUDIO.AMBIENCE_BASE,
      heartbeat: 0,
      footsteps: 0,
      breathing: 0,
      monsterBreath: 0,
      master: audioMix.master,
    };
  }

  const threat = 1 - (monsterDistance / 100);
  const threatEased = Math.pow(threat, 1.6);

  const mix: AudioMix = {
    ambience: 0,
    heartbeat: 0,
    footsteps: 0,
    breathing: 0,
    monsterBreath: 0,
    master: audioMix.master,
    heatDrone: 0, // New property for heat stress
  };

  // Apply layer configuration
  Object.entries(AUDIO_LAYERS).forEach(([id, config]: [string, any]) => {
    let volume = config.baseVolume + (threatEased * (config.threatMultiplier || 0));

    if (config.threshold !== undefined) {
      if (threat < config.threshold) {
        volume = 0;
      } else {
        // config.aboveThreshold * (threat - config.threshold) / (1 - config.threshold)
        volume = config.aboveThreshold * (threat - config.threshold) / (1 - config.threshold);
      }
    }

    (mix as any)[id] = Math.max(0, Math.min(1, volume));
  });

  // 1. Blackout Logic: Server sound (ambience) turns off
  if (isBlackout) {
    mix.ambience = 0;
  } else {
    // Normal ambience scaling with distance
    // mix.ambience is already set by the loop above, but we can refine it
  }

  // 2. Heat System: High Frequency Drone (using ambience)
  // Scaling ambience volume further with powerLoad to simulate stress
  const heatRatio = powerLoad / 100;
  if (heatRatio > 0.6) {
    // Increase ambience volume and creepy presence as heat rises
    const heatStress = Math.pow((heatRatio - 0.6) / 0.4, 2);
    mix.heatDrone = heatStress;
    mix.ambience = Math.min(1.0, mix.ambience + heatStress * 0.4);
  }

  // Keep monster breath logic from original but maybe tweak or just keep as extra
  mix.monsterBreath = threatEased > AUDIO.MONSTER_BREATH_THRESHOLD
    ? Math.pow((threatEased - AUDIO.MONSTER_BREATH_THRESHOLD) / (1 - AUDIO.MONSTER_BREATH_THRESHOLD), 2) * AUDIO.MONSTER_BREATH_MAX
    : 0;

  // Additional rates and presence for compatibility
  mix.heartbeatRate = 1.0 + threatEased * 0.3;
  mix.breathingRate = 1.0 + threatEased * 0.3;
  mix.creepyPresence = threatEased;

  return mix;
}


export class AudioManager {
  private static _instance: AudioManager;

  private loops: Partial<Record<SoundId, Howl>> = {};
  private sfxMap: Partial<Record<SoundId, Howl>> = {};
  private initialized = false;

  // Guaranteed Event Flags
  private hasPlayedWhisper = false;
  private hasPlayedDoorBang = false;

  private lastAmbienceTarget = -1; // Initialize with -1 to force first update

  private constructor() { }

  static get instance() {
    if (!this._instance) {
      this._instance = new AudioManager();
    }
    return this._instance;
  }

  preload() {
    if (this.initialized) return;

    // Load background loops
    const loopFiles = ['ambience', 'heartbeat', 'footsteps', 'breathing', 'monsterBreath'];
    loopFiles.forEach((name) => {
      this.loops[name as SoundId] = new Howl({
        src: [`/audio/${name}.mp3`, `/audio/${name}.webm`],
        loop: true,
        volume: 0,
        autoplay: false,
      });
    });

    // 1. Load Main SFX Sprite
    this.sfxMap['sprite' as SoundId] = new Howl({
      src: ['/audio/sfx.mp3', '/audio/sfx.webm'],
      sprite: {
        typing: [0, 100],
        error: [200, 500],
        success: [800, 700],
        glitch: [1600, 400],
        doorCreak: [2100, 1200],
        taskAssign: [3400, 800],
        taskReturn: [4300, 1000],
        jumpscare: [5400, 600],
        compileStart: [6100, 1500],
        compileSuccess: [7700, 2000],
      },
      volume: 0.8,
    });

    // 2. Load Standalone SFX Files (Not in sprite)
    const standaloneSounds: Record<string, string> = {
      run: 'run',
      whisper: 'whisper',
      doorBang: 'doorBang',
      slithering: 'slithering',
      click: 'click',
      open: 'open',
      close: 'close',
      knocks: 'knocks',
      intercom: 'intercom_broadcast',
      arcFlashZap: 'arc_flash_zap',
      doorBurst: 'door_burst',
      monsterRetreat: 'monster_retreat',
      gauge_twitch: 'gauge_twitch',
      led_hum: 'led_hum',
      musicBox: 'music_box',
      digitalScream: 'sfx_digital_scream',
      breathBehind: 'sfx_breath_behind',
      doorSlam: 'sfx_door_slam_impact',
      jumpscareSting: 'sfx_jmpscare_sting',
      manyWhispers: 'sfx_many_whispers',
    };

    Object.entries(standaloneSounds).forEach(([id, filename]) => {
      // Prioritize .mp3 for standalone files as they seem to be mp3-only in many cases
      const path = `/audio/${filename}`;

      this.sfxMap[id as SoundId] = new Howl({
        src: [`${path}.mp3`, `${path}.webm`],
        volume: 0.8,
      });

      // Special volume overrides
      if (id === 'doorBang' || id === 'doorBurst') {
        this.sfxMap[id as SoundId]?.volume(1.0);
      }
    });

    this.initialized = true;
  }

  startLoops() {
    Object.values(this.loops).forEach(sound => {
      if (!sound.playing()) sound.play();
    });
  }

  stopAll() {
    Howler.unload();
  }

  resetEvents() {
    this.hasPlayedWhisper = false;
    this.hasPlayedDoorBang = false;
  }

  play(id: SoundId) {
    // Check if it's a sprite
    const spriteHowl = this.sfxMap['sprite' as SoundId];
    if (spriteHowl && (spriteHowl as any)._sprite[id]) {
      spriteHowl.play(id);
      return;
    }

    if (id in this.loops) {
      const sound = this.loops[id];
      if (sound && !sound.playing()) sound.play();
    } else if (id in this.sfxMap) {
      // It's a standalone SFX
      const sound = this.sfxMap[id];
      if (sound) sound.play();
    }
  }

  stopSound(id: SoundId) {
    // 1. Check Standalone SFX
    if (id in this.sfxMap) {
      this.sfxMap[id]?.stop();
    }
    // 2. Check Loops
    if (id in this.loops) {
      this.loops[id]?.stop();
    }
    // 3. Check Sprite (Stop specific sprite ID? Howler stops whole sprite usually if passed ID? No, play returns ID.)
    // Since we don't track instance IDs for sprite shots, we can't stop just one 'doorCreak' easily without stopping all sprite sounds.
    // However, Intercom is standalone. Door is mostly standalone or short.
    // If 'doorBang' is standalone, we can stop it.
  }

  playOneShot(id: SoundId, volume?: number) {
    // Check if it's a sprite
    const spriteHowl = this.sfxMap['sprite' as SoundId];
    if (spriteHowl && (spriteHowl as any)._sprite[id]) {
      const soundId = spriteHowl.play(id);
      if (volume !== undefined) {
        spriteHowl.volume(volume, soundId);
      }
      return;
    }

    if (id in this.sfxMap) {
      const sound = this.sfxMap[id];
      if (sound) {
        const soundId = sound.play();
        if (volume !== undefined) {
          sound.volume(volume, soundId);
        }
      }
    }
  }

  /**
   * Plays evolving typing sound based on heat or progress
   */
  playTypingSound(intensity: number) {
    // intensity 0-1 (based on Heat or Progress)

    // Normal typing
    if (intensity < 0.5) {
      this.playOneShot('typing', 0.5 + Math.random() * 0.3);
    }
    // Flesh/Wet typing (High Heat/Progress)
    else {
      // Ideally we use a different sound file 'sfx_typing_flesh'
      // For now, we simulate it by pitching down the click and adding a squelch if possible
      const spriteHowl = this.sfxMap['sprite' as SoundId];
      if (spriteHowl) {
        const id = spriteHowl.play('typing');
        spriteHowl.rate(0.6 + Math.random() * 0.2, id); // Lower pitch = heavier/wetter
        spriteHowl.volume(0.8, id);
      }
    }
  }

  // ============================================
  // Voice Simulation Helpers (Audio Substitution)
  // ============================================

  /**
   * Simulates "Mom" voice: High pitch whisper, distorted
   */
  playMomVoice() {
    // Substitution: whisper.mp3 with high pitch
    const id = this.sfxMap['whisper']?.play();
    if (id !== undefined && this.sfxMap['whisper']) {
      this.sfxMap['whisper'].rate(1.2, id); // Higher pitch = feminine/soft
      this.sfxMap['whisper'].volume(AUDIO.WHISPER_MAX * 0.8, id);
    }
  }

  /**
   * Simulates "Child" cry: Distorted whine
   */
  playChildCry() {
    // Substitution: monster_retreat (whine) + run (breath)
    const whineId = this.sfxMap['monsterRetreat']?.play();
    if (whineId !== undefined && this.sfxMap['monsterRetreat']) {
      this.sfxMap['monsterRetreat'].rate(1.5, whineId); // Very high pitch = child-like/siren
      this.sfxMap['monsterRetreat'].volume(0.4, whineId);
    }

    const breathId = this.sfxMap['run']?.play();
    if (breathId !== undefined && this.sfxMap['run']) {
      this.sfxMap['run'].rate(1.2, breathId);
      this.sfxMap['run'].volume(0.3, breathId);
    }
  }

  /**
   * Simulates "Man" shout: Low quality radio shout
   */
  playManShout() {
    // Substitution: intercom (garbled) + doorBang (impact)
    const radioId = this.sfxMap['intercom']?.play();
    if (radioId !== undefined && this.sfxMap['intercom']) {
      this.sfxMap['intercom'].rate(0.8, radioId); // Lower pitch = male/heavy
      this.sfxMap['intercom'].volume(0.6, radioId);
    }
    this.playOneShot('doorBang', 0.8);
  }

  /**
   * Simulates "Gasp -> Fan" transformation
   */
  playGaspToFan() {
    // 1. Sharp intake (Breathing start)
    const breath = this.loops['breathing'];
    const ambience = this.loops['ambience'];

    if (breath && ambience) {
      // Gasp
      breath.volume(0.8);
      breath.rate(1.5); // Fast intake
      breath.play();

      // Fade out breath quickly
      breath.fade(0.8, 0, 1500);

      // Spin up fan (Ambience pitch shift)
      ambience.volume(0);
      ambience.rate(0.5); // Start low
      ambience.play();
      ambience.fade(0, 0.5, 2000); // Fade in

      // Ramping rate doesn't work well in Howler without tweening library, 
      // so we just jump to high speed after delay or just keep it weird.
      setTimeout(() => {
        ambience.rate(1.2); // Fan whirring high
      }, 1000);

      // Reset after effect
      setTimeout(() => {
        breath.stop();
        // Ambience returns to normal control by updateMix loop next frame
      }, 3500);
    }
  }

  setMasterVolume(vol: number) {
    Howler.volume(vol);
  }

  updateMix(mix: AudioMix) {
    if (!this.initialized) return;

    this.setMasterVolume(mix.master);

    // Ambience (Server Sound) with Robust Volume Management
    const ambience = this.loops['ambience'];
    if (ambience) {
      const targetVol = mix.ambience;

      // Only trigger updates if target has changed significantly
      if (Math.abs(targetVol - this.lastAmbienceTarget) > 0.001) {
        const currentVol = ambience.volume();

        // 1. Blackout Event (Target goes to 0)
        if (targetVol === 0 && this.lastAmbienceTarget > 0) {
          // Force stop any existing fade and fade out fast
          ambience.fade(currentVol, 0, 300);
        }
        // 2. Power Restore Event (Target goes from 0 to >0)
        else if (this.lastAmbienceTarget === 0 && targetVol > 0) {
          // Fade in slowly from 0
          ambience.volume(0);
          ambience.fade(0, targetVol, 3000);
        }
        // 3. Normal Volume Change (Heat/Distance scaling)
        else {
          // Smooth fade to new target (500ms) to prevent sudden jumps
          ambience.fade(currentVol, targetVol, 500);
        }

        this.lastAmbienceTarget = targetVol;
      }
    }

    this.loops['heartbeat']?.volume(mix.heartbeat);
    this.loops['heartbeat']?.rate(mix.heartbeatRate ?? 1.0);

    this.loops['footsteps']?.volume(mix.footsteps);

    this.loops['breathing']?.volume(mix.breathing);
    this.loops['breathing']?.rate(mix.breathingRate ?? 1.0);

    this.loops['monsterBreath']?.volume(mix.monsterBreath || 0);

    // Forced Events (One-time guarantees)
    const threat = mix.creepyPresence || 0;

    // 1. Guaranteed Whisper at medium threat (around 50%)
    if (!this.hasPlayedWhisper && threat > 0.5) {
      this.playOneShot('whisper', AUDIO.WHISPER_MAX * 0.9);
      this.hasPlayedWhisper = true;
    }

    // 2. Guaranteed Door Bang at high threat (around 80%)
    if (!this.hasPlayedDoorBang && threat > 0.8) {
      this.playOneShot('doorBang', 1.0);
      this.hasPlayedDoorBang = true;
    }

    // Random creepy SFX
    // Lowered threshold to 0.3 for earlier onset
    if (mix.creepyPresence && mix.creepyPresence > 0.3) {
      // Reduced base probability slightly (was 0.008)
      const baseChance = 0.005 * mix.creepyPresence;

      if (Math.random() < baseChance) {
        // Weighted selection: make whisper and doorBang rarer
        const rand = Math.random();
        let sound: SoundId;

        if (rand < 0.35) sound = 'glitch';       // 35%
        else if (rand < 0.6) sound = 'doorCreak'; // 25%
        else if (rand < 0.75) sound = 'whisper';  // 15%
        else if (rand < 0.85) sound = 'slithering'; // 10%
        else if (rand < 0.95) sound = 'knocks';   // 10% (Loud knocking)
        else sound = 'doorBang';                  // 5% (Rare jump scare)

        // Contextual volume
        let vol = 1.0;
        if (sound === 'whisper') vol = AUDIO.WHISPER_MAX * (0.5 + Math.random() * 0.5);
        if (sound === 'slithering') vol = AUDIO.SLITHERING_MAX;
        // Boosted volume for impact sounds
        if (sound === 'doorBang' || sound === 'knocks') vol = 1.0;

        this.playOneShot(sound, vol);
      }
    }
  }
}
