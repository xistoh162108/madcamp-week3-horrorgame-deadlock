// ============================================
// PHASE & GAME STATE
// ============================================

export type Phase =
  | "loading"
  | "start"
  | "intro"
  | "phase1"
  | "phase2"
  | "phase3"
  | "finalCompile"
  | "ending"
  | "gameOver";

export type EndingType = "good" | "neutral" | "bad" | "secret";

export type ViewMode = "MONITOR" | "DOOR";

// ============================================
// v2.0 SYSTEMS
// ============================================

export type MonitorState = "ON" | "OFF" | "BOOTING";

export type DoorState = "OPEN" | "CLOSED";

export type MonsterState = "IDLE" | "APPROACHING" | "TELEGRAPHING" | "ATTACKING" | "BREACHED";

export interface TelegraphEvent {
  startTime: number;
  duration: number;        // 3-5 seconds
  impactTime: number;      // When attack hits
  isReal: boolean;         // 60% real, 40% fake
  audioPlayed: boolean;
}

// ============================================
// TASK SYSTEM
// ============================================

export type TaskId =
  | "copy"
  | "serverCheck"
  | "codeReview"
  | "packetCapture"
  | "garbageCollection";

export interface TaskSideEffect {
  type: "hint" | "inputLag" | "cursorInvert";
  value: number;
}

export interface TaskReturnPenalty {
  glitchSpike: number;
  speedBurst: number;
  blackout: boolean;
}

export interface TaskFlavorText {
  assign: string;
  return: string;
}

export interface TaskDefinition {
  id: TaskId;
  label: string;
  description: string;
  icon: string;
  durationSec: number;
  cooldownSec: number;
  distanceBoost: number;
  speedIncrease: number;
  returnPenalty: TaskReturnPenalty;
  sideEffect: TaskSideEffect | null;
  flavorText: TaskFlavorText;
}

export interface ActiveTask {
  id: TaskId;
  remaining: number;
}

// ============================================
// PUZZLE SYSTEM
// ============================================

export type PuzzleModuleId =
  | "THE_SHELL"
  | "THE_GASP"
  | "THE_PARASITE"
  | "THE_MIRROR"
  | "THE_ASCENSION";

export type ValidationRule =
  | { type: "mustInclude"; tokens: string[] }
  | { type: "exact"; answer: string }
  | { type: "regex"; pattern: string };

export interface StepEffect {
  distanceChange?: number;
  glitchSpike?: number;
  logMessage: string;
  sound?: SoundId;
}

export interface PuzzleStep {
  id: string;
  prompt: string;
  starterCode: string;
  validation: ValidationRule;
  hints: string[];
  onSuccess: StepEffect;
  onFail: StepEffect;
}

export interface PuzzleModule {
  id: PuzzleModuleId;
  title: string;
  order: number;
  narrativeIntro: string;
  steps: PuzzleStep[];
}

export interface ModuleProgress {
  stepIndex: number;
  completed: boolean;
  mistakes: number;
}

// ============================================
// EFFECTS SYSTEM
// ============================================

export interface GlitchState {
  intensity: number;
  spike: number;
  cursorInvert: boolean;
  inputLag: number;
}

export interface FlashlightState {
  enabled: boolean;
  radius: number;
  battery: number;
  flickerIntensity: number;
  strobeIntensity: number; // intensity for the telegraph strobe effect
}

// ============================================
// AUDIO SYSTEM
// ============================================

export type SoundId =
  | "ambience"
  | "heartbeat"
  | "footsteps"
  | "breathing"
  | "monsterBreath"
  | "typing"
  | "error"
  | "success"
  | "glitch"
  | "doorCreak"
  | "taskAssign"
  | "taskReturn"
  | "compileStart"
  | "compileSuccess"
  | "jumpscare"
  | "run"
  | "whisper"
  | "doorBang"
  | "slithering"
  | "click"
  | "open"
  | "close"
  | "knocks"
  | "growl"
  | "scraping"
  | "doorRattle"
  | "doorBurst"
  | "musicBox"
  | "intercom"
  | "arcFlashZap"
  | "monsterRetreat"
  | "gauge_twitch"
  | "led_hum"
  | "voice_mom"
  | "voice_child"
  | "voice_man"
  | "digitalScream"
  | "breathBehind"
  | "doorSlam"
  | "jumpscareSting"
  | "manyWhispers";

export interface AudioMix {
  ambience: number;
  heartbeat: number;
  heartbeatRate?: number; // Heartbeat rate (1.0 - 1.3)
  footsteps: number;
  breathing: number; // Human breathing (self)
  breathingRate?: number; // Human breathing rate (1.0 - 1.7)
  monsterBreath: number; // Monster breathing
  master: number;
  creepyPresence?: number;
  heatDrone?: number;
}

// ============================================
// STORE STATE
// ============================================

export interface GameState {
  // Core
  phase: Phase;
  timeElapsed: number;

  // ===== v2.0 HEAT SYSTEM =====
  powerLoad: number;           // 0-100+
  isBlackout: boolean;
  blackoutTimer: number;

  // ===== v2.0 VIEW SYSTEM =====
  monitorState: MonitorState;  // 'ON' | 'OFF' | 'BOOTING'
  bootTimer: number;

  // ===== v2.0 DOOR SYSTEM =====
  doorState: DoorState;        // 'OPEN' | 'CLOSED'
  isDoorHeld: boolean;
  doorClosedDuration: number;

  // ===== v2.0 MONSTER SYSTEM =====
  monsterState: MonsterState;  // 'IDLE' | 'APPROACHING' | 'TELEGRAPHING' | 'ATTACKING'
  monsterDistance: number;
  monsterSpeed: number;
  threat: number;
  threatEased: number;
  currentTelegraph: TelegraphEvent | null;

  // Tasks
  taskDefs: Record<TaskId, TaskDefinition>;
  activeTask: ActiveTask | null;
  taskCooldowns: Record<TaskId, number>;
  taskUsageCount: Record<TaskId, number>;
  tasksDisabled: boolean;
  totalTasksAssigned: number;

  // Puzzles
  puzzleDefs: PuzzleModule[];
  currentModuleIndex: number;
  moduleProgress: Record<PuzzleModuleId, ModuleProgress>;
  editorText: string;
  hintTokens: number;
  totalMistakes: number;
  totalHintsUsed: number;
  lastSubmitResult: { status: 'success' | 'error'; id: number } | null;

  // v2.0 Stats
  neverClosedDoor: boolean;

  // UI
  viewMode: ViewMode;
  terminalLogs: string[];

  // Effects
  glitch: GlitchState;
  flashlight: FlashlightState;
  blackoutRemaining: number;

  // Audio
  audioEnabled: boolean;
  audioMix: AudioMix;

  // Compile
  compileProgress: number;
  compileTimeRemaining: number;

  // v3.3 Diegetic Components
  isPlayDead: boolean;
  mouseStillTime: number;
  lastMousePos: { x: number; y: number };
  isIntercomPlaying: boolean;

  // v3.3 Jumpscare
  activeJumpscare: string | null;
  triggeredJumpscares: string[];

  // Ending
  endingType: EndingType | null;
  usedServerCheck: boolean;
  neverLookedAtDoor: boolean;
}

// ============================================
// STORE ACTIONS
// ============================================

export interface GameActions {
  // Game Flow
  startGame: () => void;
  restartGame: () => void;
  setPhase: (phase: Phase) => void;
  triggerJumpscare: (id: string, duration?: number) => void;
  clearJumpscare: () => void;

  // Monster
  updateMonster: (dt: number) => void;

  // Tasks
  assignTask: (taskId: TaskId) => void;
  updateTasks: (dt: number) => void;

  // Puzzles
  setEditorText: (text: string) => void;
  submitAnswer: () => void;
  useHint: () => void;
  loadPuzzles: (puzzles: PuzzleModule[]) => void;
  loadTasks: (tasks: TaskDefinition[]) => void;

  // UI
  setViewMode: (mode: ViewMode) => void;
  addTerminalLog: (message: string) => void;
  clearTerminalLogs: () => void;

  // Effects
  updateEffects: (dt: number) => void;
  triggerGlitchSpike: (intensity: number) => void;
  triggerBlackout: (duration: number) => void;
  triggerStrobeFrenzy: (duration: number) => void;

  // v2.0 Actions
  toggleMonitor: () => void;
  startHoldingDoor: () => void;
  stopHoldingDoor: () => void;
  updateHeat: (dt: number) => void;
  updateBoot: (dt: number) => void;
  updateDoor: (dt: number) => void;
  addHeat: (amount: number) => void;
  updateMonsterV2Action: (dt: number) => void;

  // v3.3 Diegetic Actions
  useIntercom: () => void;
  setPlayDead: (active: boolean) => void;
  handleMouseMove: (x: number, y: number) => void;

  // Audio
  setAudioEnabled: (enabled: boolean) => void;
  updateAudioMix: () => void;

  // Progression
  checkPhaseTransition: () => void;
  updateCompile: (dt: number) => void;
  startFinalCompile: () => void;
  determineEnding: () => EndingType;
  updateStealth: (dt: number) => void;
}

export type GameStore = GameState & { actions: GameActions };
