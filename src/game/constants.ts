import type { Phase, TaskId, PuzzleModuleId, ModuleProgress } from "./types";

// ============================================
// GAME BALANCE
// ============================================

export const BALANCE = {
  // Monster
  INITIAL_DISTANCE: 100,
  INITIAL_SPEED: 1.5,
  SPEED_CAP: 5.0,

  // Phase-specific speeds
  PHASE_SPEEDS: {
    loading: 0,
    start: 0,
    intro: 1.5,
    phase1: 2.0,
    phase2: 2.8,
    phase3: 3.5,
    finalCompile: 5.0,
    ending: 0,
    gameOver: 0,
  } as Record<Phase, number>,

  // Tasks
  LEARNING_DECAY: 0.82,
  MAX_SPEED_INCREASE: 1.0,

  // Puzzle fail penalties by phase
  FAIL_PENALTY: {
    loading: 0,
    start: 0,
    intro: 6,
    phase1: 8,
    phase2: 10,
    phase3: 12,
    finalCompile: 15,
    ending: 0,
    gameOver: 0,
  } as Record<Phase, number>,

  // Final Compile
  COMPILE_DURATION: 60,
  COMPILE_SPEED_BOOST: 0.5,

  // Effects
  MAX_GLITCH_INTENSITY: 0.3,
  SPIKE_DECAY_RATE: 0.3,

  // Flashlight
  FLASHLIGHT_BASE_RADIUS: 400,
  FLASHLIGHT_MIN_RADIUS: 240,
  FLASHLIGHT_THREAT_REDUCTION: 120,

  // Endings thresholds
  GOOD_ENDING_MAX_MISTAKES: 3,
  GOOD_ENDING_MAX_HINTS: 2,
  NEUTRAL_ENDING_MAX_MISTAKES: 8,
} as const;

// ============================================
// UI CONSTANTS
// ============================================

export const UI = {
  // Terminal
  TERMINAL_MAX_LOGS: 50,
  TERMINAL_VISIBLE_LINES: 10,

  // View Mode
  DOOR_TRIGGER_ZONE_HEIGHT: 0.2, // 20% from top

  // Parallax intensities (px)
  PARALLAX_BACK_INTENSITY: 10,
  PARALLAX_MID_INTENSITY: 6,
  PARALLAX_FRONT_INTENSITY: 3,
  PARALLAX_ROTATION_INTENSITY: 2, // degrees

  // Animations
  VIEW_TRANSITION_DURATION: 0.4, // seconds
  LOG_TYPEWRITER_SPEED: 30, // ms per char

  // Monitor dimensions
  MONITOR_WIDTH: 800,
  MONITOR_HEIGHT: 600,

  // Panel dimensions
  TASK_PANEL_WIDTH: 280,
  TERMINAL_HEIGHT: 180,
  STATUS_PANEL_HEIGHT: 60,
} as const;

// ============================================
// TIMING
// ============================================

export const TIMING = {
  MAX_DELTA_TIME: 0.05, // 50ms cap
  AUDIO_FADE_DURATION: 300, // ms
  JUMPSCARE_DURATION: 500, // ms
  GLITCH_SPIKE_DURATION: 200, // ms
  FLICKER_INTERVAL: 100, // ms
} as const;

// ============================================
// CRT EFFECT VALUES
// ============================================

export const CRT = {
  SCANLINE_OPACITY: 0.7,
  NOISE_OPACITY_BASE: 0.04,
  NOISE_OPACITY_MAX: 0.08,
  VIGNETTE_INTENSITY: 0.35,
  FLICKER_INTERVAL: 120, // ms
  BORDER_RADIUS: "2% / 3%",
} as const;

// ============================================
// AUDIO MIXING
// ============================================

export const AUDIO = {
  // Base volumes (0-1)
  AMBIENCE_BASE: 0.3,
  AMBIENCE_MIN: 0.1,
  HEARTBEAT_BASE: 0.0,
  HEARTBEAT_MAX: 1.3,
  FOOTSTEPS_BASE: 0.0, // Silence when far
  FOOTSTEPS_MAX: 0.9,
  BREATHING_BASE: 0.1, // Human breathing constant
  BREATHING_MAX: 0.4, // Human breathing max stress
  MONSTER_BREATH_THRESHOLD: 0.7, // When monster breath starts becoming audible
  MONSTER_BREATH_MAX: 1.0,

  // Special SFX Volumes
  WHISPER_MAX: 0.6,
  SLITHERING_MAX: 0.5,

  // Default master volume
  MASTER_VOLUME: 1.0,
} as const;

// ============================================
// INITIAL STATE VALUES
// ============================================

export const INITIAL_TASK_COOLDOWNS: Record<TaskId, number> = {
  copy: 0,
  serverCheck: 0,
  codeReview: 0,
  packetCapture: 0,
  garbageCollection: 0,
};

export const INITIAL_TASK_USAGE: Record<TaskId, number> = {
  copy: 0,
  serverCheck: 0,
  codeReview: 0,
  packetCapture: 0,
  garbageCollection: 0,
};

export const INITIAL_MODULE_PROGRESS: Record<PuzzleModuleId, ModuleProgress> = {
  THE_SHELL: { stepIndex: 0, completed: false, mistakes: 0 },
  THE_GASP: { stepIndex: 0, completed: false, mistakes: 0 },
  THE_PARASITE: { stepIndex: 0, completed: false, mistakes: 0 },
  THE_MIRROR: { stepIndex: 0, completed: false, mistakes: 0 },
  THE_ASCENSION: { stepIndex: 0, completed: false, mistakes: 0 },
};

// ============================================
// PHASE TRANSITIONS
// ============================================

export const PHASE_MODULE_REQUIREMENTS: Record<Phase, number> = {
  loading: 0,
  start: 0,
  intro: 0,
  phase1: 0, // Starts after first task
  phase2: 2, // After 2 modules
  phase3: 3, // After 3 modules
  finalCompile: 5, // After all 5 modules
  ending: 5,
  gameOver: 0,
};

// ============================================
// COLOR PALETTE
// ============================================

export const COLORS = {
  CRT_GREEN: "#00ff41",
  CRT_DARK: "#0a0a0a",
  CRT_GLOW: "#00ff4133",
  ERROR: "#ff0040",
  WARNING: "#ffaa00",
  SUCCESS: "#00ffff",
  ROOM_AMBIENT: "#0a0a1a",
  FLASHLIGHT_EDGE: "#1a1510",
} as const;

// ============================================
// v2.0 HEAT SYSTEM
// ============================================

export const HEAT = {
  // Heat accumulation rates (%/sec)
  PASSIVE_RATE_ON: 1.8,      // Monitor ON passive drain
  TYPING_COST: 0.9,           // Per keystroke
  COMPILE_COST: 27.0,         // Instant on compile
  DOOR_CLOSE_COST: 15.0,      // Instant cost when closing door
  DOOR_HOLD_COST: 0.7,        // Per second holding door (Greatly reduced)

  // Heat cooling
  COOLING_RATE: 0.6,          // %/sec when Monitor OFF

  // v3.3 Entropy Scaling (Per completed module)
  // Step 0: 1.0x -> Step 5: 1.5x (Heat) / 0.8x (Cooling)
  SCALING_MAX_HEAT: 1.5,
  SCALING_MIN_COOLING: 0.8,

  // Blackout
  BLACKOUT_THRESHOLD: 100.0,  // Heat level that triggers blackout
  BLACKOUT_DURATION: 5.0,     // Seconds
  BLACKOUT_RESET_HEAT: 50.0,  // Heat level after blackout

  // UI Thresholds
  WARNING_THRESHOLD: 60,      // Warning at 60%
  CRITICAL_THRESHOLD: 85,     // Critical at 85%
} as const;

// ============================================
// v3.3 INTEGRATED DEFENSE
// ============================================

export const DEFENSE = {
  // Remote Intercom
  INTERCOM_INITIAL_COST: 5.0, // Instant
  INTERCOM_DRAIN_RATE: 1.4,   // %/sec during playback (~21% over 15s)
  INTERCOM_DISTANCE_BOOST: 60,// Base distance reset
  INTERCOM_VARIANCE: 20,      // Random variance

  // Arc Flash
  ARC_FLASH_COST: 40.0,       // % Heat
  ARC_FLASH_BLACKOUT_CHANCE: 0.7, // 70% chance to trigger blackout immediately
} as const;

// ============================================
// v3.3 STEALTH MECHANICS
// ============================================

export const STEALTH = {
  // Play Dead
  PLAY_DEAD_SURVIVAL_CHANCE: 0.7, // 70% live, 30% die
  MOUSE_STILL_THRESHOLD: 10,      // Max pixels mouse can move to be "still"
  GRACE_PERIOD: 0.5,              // Seconds to stop moving
} as const;

// ============================================
// v2.0 BOOT SYSTEM
// ============================================

export const BOOT = {
  DURATION: 1.5,              // Boot sequence duration (seconds)
} as const;

// ============================================
// v2.0 DOOR SYSTEM
// ============================================

export const DOOR = {
  SAFE_DURATION: 1.0,         // Seconds door must be closed before impact
} as const;

// ============================================
// v2.0 MONSTER SYSTEM
// ============================================

export const MONSTER = {
  // Telegraph System
  ATTACK_THRESHOLD: 10,       // Distance where telegraph triggers
  TELEGRAPH_MIN: 3.0,         // Minimum warning time (seconds)
  TELEGRAPH_MAX: 5.0,         // Maximum warning time (seconds)
  REAL_ATTACK_CHANCE: 0.6,    // 60% real, 40% fake

  // Attack Resolution
  REPEL_DISTANCE_MIN: 60,     // Min distance after successful defense
  REPEL_DISTANCE_MAX: 80,     // Max distance after successful defense

  // Blackout behavior
  BLACKOUT_SPEED: 6.0,        // Monster speed during blackout (units/sec)
} as const;
