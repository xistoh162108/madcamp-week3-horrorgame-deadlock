# DEADLOCK - Technical Specification v2.0

## 1. TypeScript Type Definitions

### 1.1 Core Types (types.ts)
```typescript
// ============================================
// PHASE & GAME STATE
// ============================================

export type Phase =
  | "loading"      // 에셋 로딩 중
  | "start"        // 시작 화면
  | "playing"      // 메인 게임플레이
  | "finalCompile" // 최종 컴파일 (60초)
  | "ending"       // 엔딩 표시
  | "gameOver";    // 게임 오버

export type EndingType = "good" | "neutral" | "bad" | "secret";

// ============================================
// VIEW SYSTEM (NEW)
// ============================================

export type MonitorState = "ON" | "OFF" | "BOOTING";

// ============================================
// DOOR SYSTEM (NEW)
// ============================================

export type DoorState = "OPEN" | "CLOSED";

// ============================================
// MONSTER SYSTEM (NEW)
// ============================================

export type MonsterState =
  | "IDLE"          // 평상시 (멀리 있음)
  | "APPROACHING"   // 접근 중
  | "TELEGRAPHING"  // 공격 예고 중 (3-5초)
  | "ATTACKING";    // 침입 시도

export interface TelegraphEvent {
  startTime: number;     // 시작 시점 (ms)
  duration: number;      // 지속 시간 (3-5초)
  impactTime: number;    // 공격 시점 (ms)
  isReal: boolean;       // 60% true, 40% false
}

// ============================================
// PUZZLE SYSTEM (유지)
// ============================================

export type PuzzleModuleId =
  | "NETWORK_AUTH"
  | "DOOR_LOCK_OVERRIDE"
  | "ROOT_PERMISSION"
  | "LOG_SANITIZER"
  | "EMERGENCY_EXIT";

export interface PuzzleModule {
  id: PuzzleModuleId;
  title: string;
  narrativeIntro: string;
  steps: PuzzleStep[];
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

export type ValidationRule =
  | { type: "mustInclude"; tokens: string[] }
  | { type: "exact"; answer: string }
  | { type: "regex"; pattern: string };

export interface StepEffect {
  logMessage: string;
  sound?: SoundId;
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
  intensity: number;      // 0-1, Heat 기반
  spike: number;          // 0-1, 이벤트 기반 (감쇠)
}

// ============================================
// AUDIO SYSTEM
// ============================================

export type SoundId =
  // Loops
  | "humming"
  | "footsteps"
  | "breathing"
  // Telegraph
  | "doorRattle"
  | "monsterGrowl"
  | "strobeBuzz"
  // Events
  | "doorClose"
  | "doorOpen"
  | "doorBang"
  | "doorBurst"
  | "monsterRepelled"
  | "monsterRetreat"
  | "jumpscare"
  | "blackout"
  | "powerUp"
  | "bootStart"
  | "bootComplete"
  | "monitorOff"
  | "typing"
  | "compileStart"
  | "compileSuccess"
  | "error"
  | "success";

export interface AudioMix {
  humming: number;
  footsteps: number;
  breathing: number;
  master: number;
}
```

---

## 2. Zustand Store Schema

### 2.1 Store Interface (store.ts)
```typescript
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface GameState {
  // ===== Core =====
  phase: Phase;
  timeElapsed: number;              // seconds

  // ===== Heat System (NEW) =====
  powerLoad: number;                // 0-100+ (100 초과 시 블랙아웃)
  isBlackout: boolean;
  blackoutTimer: number;            // 남은 블랙아웃 시간 (5초)

  // ===== View System (NEW) =====
  monitorState: MonitorState;       // ON, OFF, BOOTING
  bootTimer: number;                // 부팅 남은 시간 (1.5초)

  // ===== Door System (NEW) =====
  doorState: DoorState;             // OPEN, CLOSED
  isDoorHeld: boolean;              // SPACE 홀드 중
  doorClosedDuration: number;       // 문이 닫혀있던 누적 시간

  // ===== Monster System (NEW) =====
  monsterDistance: number;          // 0-100
  monsterState: MonsterState;
  telegraph: TelegraphEvent | null;

  // ===== Puzzles (유지) =====
  puzzleDefs: PuzzleModule[];
  currentModuleIndex: number;
  moduleProgress: Record<PuzzleModuleId, ModuleProgress>;
  editorText: string;
  hintTokens: number;
  totalMistakes: number;
  totalHintsUsed: number;

  // ===== UI =====
  terminalLogs: string[];

  // ===== Effects =====
  glitch: GlitchState;

  // ===== Audio =====
  audioEnabled: boolean;
  audioMix: AudioMix;

  // ===== Compile =====
  compileProgress: number;          // 0-1
  compileTimeRemaining: number;     // seconds

  // ===== Ending =====
  endingType: EndingType | null;
  neverClosedDoor: boolean;         // Secret ending 조건

  // ===== Actions =====
  actions: GameActions;
}

interface GameActions {
  // Game Flow
  startGame: () => void;
  restartGame: () => void;

  // Heat System
  addHeat: (amount: number) => void;
  updateHeat: (dt: number) => void;
  triggerBlackout: () => void;
  updateBlackout: (dt: number) => void;

  // View System
  toggleMonitor: () => void;
  updateBoot: (dt: number) => void;

  // Door System
  startHoldingDoor: () => void;
  stopHoldingDoor: () => void;
  updateDoor: (dt: number) => void;

  // Monster System
  updateMonster: (dt: number) => void;
  startTelegraph: () => void;
  resolveTelegraph: () => void;

  // Puzzles
  setEditorText: (text: string) => void;
  submitAnswer: () => void;
  useHint: () => void;

  // UI
  addTerminalLog: (message: string) => void;

  // Effects
  updateEffects: (dt: number) => void;
  triggerGlitchSpike: (intensity: number) => void;

  // Audio
  setAudioEnabled: (enabled: boolean) => void;
  updateAudioMix: () => void;

  // Progression
  checkPhaseTransition: () => void;
  updateCompile: (dt: number) => void;
}
```

### 2.2 Initial State
```typescript
const initialState: Omit<GameState, "actions"> = {
  // Core
  phase: "loading",
  timeElapsed: 0,

  // Heat System
  powerLoad: 0,
  isBlackout: false,
  blackoutTimer: 0,

  // View System
  monitorState: "ON",
  bootTimer: 0,

  // Door System
  doorState: "OPEN",
  isDoorHeld: false,
  doorClosedDuration: 0,

  // Monster System
  monsterDistance: 100,
  monsterState: "IDLE",
  telegraph: null,

  // Puzzles
  puzzleDefs: [], // loaded from JSON
  currentModuleIndex: 0,
  moduleProgress: {
    NETWORK_AUTH: { stepIndex: 0, completed: false, mistakes: 0 },
    DOOR_LOCK_OVERRIDE: { stepIndex: 0, completed: false, mistakes: 0 },
    ROOT_PERMISSION: { stepIndex: 0, completed: false, mistakes: 0 },
    LOG_SANITIZER: { stepIndex: 0, completed: false, mistakes: 0 },
    EMERGENCY_EXIT: { stepIndex: 0, completed: false, mistakes: 0 },
  },
  editorText: "",
  hintTokens: 0,
  totalMistakes: 0,
  totalHintsUsed: 0,

  // UI
  terminalLogs: [],

  // Effects
  glitch: {
    intensity: 0,
    spike: 0,
  },

  // Audio
  audioEnabled: true,
  audioMix: {
    humming: 0.2,
    footsteps: 0,
    breathing: 0,
    master: 0.8,
  },

  // Compile
  compileProgress: 0,
  compileTimeRemaining: 60,

  // Ending
  endingType: null,
  neverClosedDoor: true,
};
```

### 2.3 Selectors
```typescript
export const selectCurrentModule = (state: GameState) =>
  state.puzzleDefs[state.currentModuleIndex];

export const selectCurrentStep = (state: GameState) => {
  const module = selectCurrentModule(state);
  if (!module) return null;
  const progress = state.moduleProgress[module.id];
  return module.steps[progress.stepIndex];
};

export const selectCompletedModuleCount = (state: GameState) =>
  Object.values(state.moduleProgress).filter((p) => p.completed).length;

export const selectTotalGlitch = (state: GameState) =>
  Math.min(1, state.glitch.intensity + state.glitch.spike);

export const selectCanType = (state: GameState) =>
  state.monitorState === "ON" && !state.isBlackout;

export const selectCanCloseDoor = (state: GameState) =>
  state.monitorState === "OFF" && !state.isBlackout;
```

---

## 3. Constants (constants.ts)

```typescript
// ============================================
// HEAT SYSTEM
// ============================================

export const HEAT = {
  PASSIVE_DRAIN_ON: 2.0,      // 모니터 ON: +2%/초
  TYPING_COST: 1.0,           // 타이핑: +1%/키
  DOOR_HOLD_COST: 15.0,       // 문 홀드: +15%/초
  COMPILE_COST: 30.0,         // 컴파일: +30% 즉시
  COOLING_RATE: 0.5,          // 모니터 OFF: -0.5%/초
  BLACKOUT_THRESHOLD: 100,
  BLACKOUT_DURATION: 5.0,
};

// ============================================
// BOOT SYSTEM
// ============================================

export const BOOT = {
  DURATION: 1.5,              // 부팅 시퀀스 시간
};

// ============================================
// MONSTER SYSTEM
// ============================================

export const MONSTER = {
  BASE_SPEED: 2.0,            // 기본 이동 속도 (거리/초)
  BLACKOUT_SPEED_MULT: 3.0,   // 블랙아웃 중 속도 배율
  TELEGRAPH_DISTANCE: 15,     // Telegraph 트리거 거리
  TELEGRAPH_DURATION_MIN: 3.0,
  TELEGRAPH_DURATION_MAX: 5.0,
  REAL_ATTACK_CHANCE: 0.6,    // 60% 진짜 공격
  REPEL_DISTANCE_MIN: 50,
  REPEL_DISTANCE_MAX: 80,
};

// ============================================
// DOOR SYSTEM
// ============================================

export const DOOR = {
  SAFE_DURATION: 1.0,         // 1-Second Rule
};

// ============================================
// EFFECTS
// ============================================

export const EFFECTS = {
  GLITCH_SPIKE_DECAY: 0.3,    // 초당 감쇠
  MAX_GLITCH_FROM_HEAT: 0.4,  // Heat 100%일 때 최대 글리치
};

// ============================================
// UI
// ============================================

export const UI = {
  TERMINAL_MAX_LOGS: 50,
  TERMINAL_VISIBLE_LINES: 10,
};

// ============================================
// AUDIO THRESHOLDS
// ============================================

export const AUDIO_THRESHOLDS = {
  HUMMING: { minDistance: 50, maxDistance: 100, volume: 0.2 },
  FOOTSTEPS: { minDistance: 30, maxDistance: 50, volume: 0.5 },
  BREATHING: { minDistance: 15, maxDistance: 30, volume: 0.8 },
};
```

---

## 4. System Implementations

### 4.1 Heat System
```typescript
// src/game/systems/heatSystem.ts

export function updateHeat(state: GameState, dt: number): Partial<GameState> {
  if (state.isBlackout) return {};

  let { powerLoad, monitorState, isDoorHeld } = state;

  // 모니터 상태에 따른 Heat 변화
  if (monitorState === "ON" || monitorState === "BOOTING") {
    powerLoad += HEAT.PASSIVE_DRAIN_ON * dt;
  } else if (monitorState === "OFF") {
    powerLoad -= HEAT.COOLING_RATE * dt;
  }

  // 문 홀드 비용 (모니터 OFF에서만)
  if (isDoorHeld && monitorState === "OFF") {
    powerLoad += HEAT.DOOR_HOLD_COST * dt;
  }

  // 범위 제한
  powerLoad = Math.max(0, powerLoad);

  // 블랙아웃 체크
  if (powerLoad >= HEAT.BLACKOUT_THRESHOLD) {
    return {
      powerLoad: HEAT.BLACKOUT_THRESHOLD,
      isBlackout: true,
      blackoutTimer: HEAT.BLACKOUT_DURATION,
      doorState: "OPEN",
      doorClosedDuration: 0,
      monitorState: "OFF",
    };
  }

  return { powerLoad };
}

export function updateBlackout(state: GameState, dt: number): Partial<GameState> {
  if (!state.isBlackout) return {};

  const newTimer = state.blackoutTimer - dt;

  if (newTimer <= 0) {
    return {
      isBlackout: false,
      blackoutTimer: 0,
    };
  }

  return { blackoutTimer: newTimer };
}

export function addTypingHeat(state: GameState, charCount: number): Partial<GameState> {
  return {
    powerLoad: state.powerLoad + HEAT.TYPING_COST * charCount,
  };
}

export function addCompileHeat(state: GameState): Partial<GameState> {
  return {
    powerLoad: state.powerLoad + HEAT.COMPILE_COST,
  };
}
```

### 4.2 View System
```typescript
// src/game/systems/viewSystem.ts

export function toggleMonitor(state: GameState): Partial<GameState> {
  if (state.isBlackout) return {};

  if (state.monitorState === "ON") {
    return { monitorState: "OFF" };
  } else if (state.monitorState === "OFF") {
    return {
      monitorState: "BOOTING",
      bootTimer: BOOT.DURATION,
    };
  }

  return {};
}

export function updateBoot(state: GameState, dt: number): Partial<GameState> {
  if (state.monitorState !== "BOOTING") return {};

  const newTimer = state.bootTimer - dt;

  if (newTimer <= 0) {
    return {
      monitorState: "ON",
      bootTimer: 0,
    };
  }

  return { bootTimer: newTimer };
}
```

### 4.3 Door System
```typescript
// src/game/systems/doorSystem.ts

export function updateDoor(state: GameState, dt: number): Partial<GameState> {
  const { doorState, isDoorHeld, monitorState, isBlackout, doorClosedDuration } = state;

  // 블랙아웃 중이면 문 강제 오픈
  if (isBlackout) {
    return { doorState: "OPEN", doorClosedDuration: 0 };
  }

  // 모니터 ON/BOOTING이면 문 조작 불가
  if (monitorState !== "OFF") {
    // 하지만 닫혀있던 시간은 계속 누적
    if (doorState === "CLOSED") {
      return { doorClosedDuration: doorClosedDuration + dt };
    }
    return {};
  }

  // SPACE 홀드 중
  if (isDoorHeld) {
    if (doorState === "OPEN") {
      return {
        doorState: "CLOSED",
        doorClosedDuration: dt,
        neverClosedDoor: false, // Secret ending 조건 해제
      };
    } else {
      return { doorClosedDuration: doorClosedDuration + dt };
    }
  } else {
    // SPACE 뗌 → 문 열림
    if (doorState === "CLOSED") {
      return {
        doorState: "OPEN",
        doorClosedDuration: 0,
      };
    }
  }

  return {};
}
```

### 4.4 Monster System (Telegraph + 60/40)
```typescript
// src/game/systems/monsterSystem.ts

export function updateMonster(state: GameState, dt: number): Partial<GameState> {
  if (state.phase === "gameOver" || state.phase === "ending") {
    return {};
  }

  let { monsterDistance, monsterState, isBlackout, telegraph } = state;

  // Telegraph 진행 중이면 거리 감소 없음
  if (monsterState === "TELEGRAPHING" && telegraph) {
    const now = Date.now();
    if (now >= telegraph.impactTime) {
      // Telegraph 종료 - resolve 필요
      return {}; // resolveTelegraph 액션에서 처리
    }
    return {};
  }

  // 블랙아웃 중이면 급접근
  if (isBlackout) {
    monsterDistance -= MONSTER.BASE_SPEED * MONSTER.BLACKOUT_SPEED_MULT * dt;
  } else if (monsterState === "APPROACHING" || monsterState === "IDLE") {
    monsterDistance -= MONSTER.BASE_SPEED * dt;

    // IDLE → APPROACHING 전환 (distance < 50)
    if (monsterDistance < 50 && monsterState === "IDLE") {
      monsterState = "APPROACHING";
    }
  }

  monsterDistance = Math.max(0, monsterDistance);

  // Telegraph 트리거 체크
  if (monsterDistance <= MONSTER.TELEGRAPH_DISTANCE &&
      monsterState === "APPROACHING" &&
      !telegraph) {
    // startTelegraph 액션에서 처리
    return { monsterDistance, monsterState };
  }

  // Distance 0 체크 (블랙아웃 중 사망)
  if (monsterDistance <= 0 && !telegraph) {
    return {
      monsterDistance: 0,
      monsterState: "ATTACKING",
      phase: "gameOver",
    };
  }

  return { monsterDistance, monsterState };
}

export function startTelegraph(state: GameState): Partial<GameState> {
  const duration = MONSTER.TELEGRAPH_DURATION_MIN +
    Math.random() * (MONSTER.TELEGRAPH_DURATION_MAX - MONSTER.TELEGRAPH_DURATION_MIN);

  const isReal = Math.random() < MONSTER.REAL_ATTACK_CHANCE;
  const now = Date.now();

  return {
    monsterState: "TELEGRAPHING",
    telegraph: {
      startTime: now,
      duration,
      impactTime: now + duration * 1000,
      isReal,
    },
  };
}

export function resolveTelegraph(state: GameState): Partial<GameState> {
  const { telegraph, doorState, doorClosedDuration } = state;

  if (!telegraph) return {};

  // 40% - Fake-out
  if (!telegraph.isReal) {
    const repelDistance = MONSTER.REPEL_DISTANCE_MIN +
      Math.random() * (MONSTER.REPEL_DISTANCE_MAX - MONSTER.REPEL_DISTANCE_MIN);

    return {
      monsterDistance: repelDistance,
      monsterState: "IDLE",
      telegraph: null,
    };
  }

  // 60% - Real Attack
  // 1-Second Rule 체크
  if (doorState === "CLOSED" && doorClosedDuration >= DOOR.SAFE_DURATION) {
    // 생존!
    const repelDistance = MONSTER.REPEL_DISTANCE_MIN +
      Math.random() * (MONSTER.REPEL_DISTANCE_MAX - MONSTER.REPEL_DISTANCE_MIN);

    return {
      monsterDistance: repelDistance,
      monsterState: "IDLE",
      telegraph: null,
    };
  }

  // BREACH - Game Over
  return {
    monsterDistance: 0,
    monsterState: "ATTACKING",
    telegraph: null,
    phase: "gameOver",
  };
}
```

### 4.5 Effects System
```typescript
// src/game/systems/effectsSystem.ts

export function updateEffects(state: GameState, dt: number): Partial<GameState> {
  // Glitch intensity from Heat
  const heatRatio = state.powerLoad / HEAT.BLACKOUT_THRESHOLD;
  const baseIntensity = heatRatio * EFFECTS.MAX_GLITCH_FROM_HEAT;

  // Spike decay
  const newSpike = Math.max(0, state.glitch.spike - EFFECTS.GLITCH_SPIKE_DECAY * dt);

  return {
    glitch: {
      intensity: baseIntensity,
      spike: newSpike,
    },
  };
}
```

### 4.6 Audio System
```typescript
// src/game/systems/audioSystem.ts

export function updateAudioMix(state: GameState): Partial<GameState> {
  const { monsterDistance, monsterState, isBlackout } = state;

  // 블랙아웃 중이면 사운드 음소거 (시각적 공포)
  if (isBlackout) {
    return {
      audioMix: {
        humming: 0,
        footsteps: 0,
        breathing: 0,
        master: state.audioMix.master,
      },
    };
  }

  // 거리 기반 볼륨 계산
  let humming = 0;
  let footsteps = 0;
  let breathing = 0;

  if (monsterDistance > AUDIO_THRESHOLDS.HUMMING.minDistance) {
    humming = AUDIO_THRESHOLDS.HUMMING.volume;
  }

  if (monsterDistance <= AUDIO_THRESHOLDS.FOOTSTEPS.maxDistance &&
      monsterDistance > AUDIO_THRESHOLDS.FOOTSTEPS.minDistance) {
    footsteps = AUDIO_THRESHOLDS.FOOTSTEPS.volume;
  }

  if (monsterDistance <= AUDIO_THRESHOLDS.BREATHING.maxDistance &&
      monsterDistance > AUDIO_THRESHOLDS.BREATHING.minDistance) {
    breathing = AUDIO_THRESHOLDS.BREATHING.volume;
  }

  // Telegraph 중이면 사운드 최대
  if (monsterState === "TELEGRAPHING") {
    breathing = 1.0;
    footsteps = 1.0;
  }

  return {
    audioMix: {
      humming,
      footsteps,
      breathing,
      master: state.audioMix.master,
    },
  };
}
```

---

## 5. Game Loop

```typescript
// src/game/loop/useGameLoop.ts

const MAX_DELTA_TIME = 0.05; // 50ms cap

export function useGameLoop() {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const { phase, actions, telegraph, monsterState } = useGameStore();

  useEffect(() => {
    if (phase === "loading" || phase === "start" || phase === "ending" || phase === "gameOver") {
      return;
    }

    const loop = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const rawDt = (currentTime - lastTimeRef.current) / 1000;
      const dt = Math.min(rawDt, MAX_DELTA_TIME);
      lastTimeRef.current = currentTime;

      // System update order
      // 1. Boot sequence
      actions.updateBoot(dt);

      // 2. Heat + Blackout
      actions.updateHeat(dt);
      actions.updateBlackout(dt);

      // 3. Door (1-Second Rule 타이머)
      actions.updateDoor(dt);

      // 4. Monster (Telegraph 체크 포함)
      actions.updateMonster(dt);

      // 5. Telegraph resolve 체크
      if (monsterState === "TELEGRAPHING" && telegraph) {
        if (Date.now() >= telegraph.impactTime) {
          actions.resolveTelegraph();
        }
      }

      // 6. Telegraph 트리거 체크
      const state = useGameStore.getState();
      if (state.monsterDistance <= MONSTER.TELEGRAPH_DISTANCE &&
          state.monsterState === "APPROACHING" &&
          !state.telegraph) {
        actions.startTelegraph();
      }

      // 7. Effects
      actions.updateEffects(dt);

      // 8. Audio mix
      actions.updateAudioMix();

      // 9. Compile (finalCompile 중)
      if (phase === "finalCompile") {
        actions.updateCompile(dt);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [phase, actions, telegraph, monsterState]);
}
```

---

## 6. Input Handling

```typescript
// src/hooks/useKeyboardInput.ts

export function useKeyboardInput() {
  const { monitorState, isBlackout, actions } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBlackout) return;

      switch (e.code) {
        case "Tab":
          e.preventDefault();
          actions.toggleMonitor();
          break;

        case "Space":
          e.preventDefault();
          if (monitorState === "OFF") {
            actions.startHoldingDoor();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        actions.stopHoldingDoor();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [monitorState, isBlackout, actions]);
}
```

---

## 7. Component Contracts

### 7.1 Room Layout (CSS-Only)
```typescript
// src/ui/room/RoomLayout.tsx
interface RoomLayoutProps {
  monitorState: MonitorState;
}

// 3분할 레이아웃: Hallway | Desk | Chalkboard
// 모니터 OFF일 때만 표시
```

### 7.2 Monitor View
```typescript
// src/ui/room/MonitorView.tsx
interface MonitorViewProps {
  monitorState: MonitorState;
  bootProgress: number; // 0-1
}

// 모니터 ON: 코드 에디터 표시
// 모니터 BOOTING: 부팅 애니메이션
// 모니터 OFF: 검은 화면
```

### 7.3 Door Component
```typescript
// src/ui/room/Door.tsx
interface DoorProps {
  doorState: DoorState;
  doorClosedDuration: number;
  isDoorHeld: boolean;
}

// 1-Second Rule 인디케이터 표시
// doorClosedDuration >= 1.0 → "✓ SECURED"
// doorClosedDuration < 1.0 → "0.5s / 1.0s"
```

### 7.4 Heat Bar
```typescript
// src/ui/panels/HeatBar.tsx
interface HeatBarProps {
  powerLoad: number;
  isHeating: boolean; // monitorState !== "OFF"
}

// 게이지 + 방향 표시 (▲/▼)
// 70% 이상: 노란색
// 85% 이상: 빨간색 + 깜빡임
```

### 7.5 Strobe Light
```typescript
// src/ui/room/StrobeLight.tsx
interface StrobeLightProps {
  monsterState: MonsterState;
  monsterDistance: number;
}

// 불규칙 깜빡임 (CSS keyframes)
// Telegraph 중: 광란 모드
```

### 7.6 Monster Eyes
```typescript
// src/ui/room/MonsterEyes.tsx
interface MonsterEyesProps {
  visible: boolean; // strobeOn && distance < 50
  distance: number;
}

// 거리에 따라 크기/밝기 변화
// CSS circles with box-shadow glow
```
