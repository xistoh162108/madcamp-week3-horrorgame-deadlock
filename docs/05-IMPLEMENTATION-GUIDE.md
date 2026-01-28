# DEADLOCK - Implementation Guide v3.3 (Diegetic UI)

**Version:** 3.3.0
**Last Updated:** 2026-01-27

---

## 1. Development Environment Setup

### 1.1 Project Initialization
```bash
# 1. Create Vite project
npm create vite@latest deadlock -- --template react-ts
cd deadlock

# 2. Install dependencies
npm install zustand framer-motion howler tailwindcss postcss autoprefixer

# 3. Install dev dependencies
npm install -D @types/howler

# 4. Initialize Tailwind
npx tailwindcss init -p
```

### 1.2 Tailwind Configuration
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crt: {
          green: "#00ff41",
          dark: "#0a0a0a",
          glow: "#00ff4133",
        },
        error: "#ff0040",
        warning: "#ffaa00",
        success: "#00ffff",
        heat: {
          low: "#00ff41",
          mid: "#ffaa00",
          high: "#ff4444",
          critical: "#ff0000",
        },
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "'Courier New'", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "flicker": "flicker 0.1s infinite",
        "scanline": "scanline 8s linear infinite",
        "strobe": "strobe 0.1s infinite",
        "telegraph": "telegraph 0.5s ease-in-out infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.97" },
        },
        scanline: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
        strobe: {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
        telegraph: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px)" },
          "75%": { transform: "translateX(2px)" },
        },
      },
    },
  },
  plugins: [],
};
```

### 1.3 Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@game": path.resolve(__dirname, "./src/game"),
      "@ui": path.resolve(__dirname, "./src/ui"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "zustand", "framer-motion"],
          audio: ["howler"],
        },
      },
    },
  },
});
```

---

## 2. Implementation Phases

### Phase Overview (v2.0)
```
Phase 1: Foundation & Core Systems (Day 1)
├── Step 1: Project scaffold & new state structure
├── Step 2: Heat System (powerLoad, blackout)
├── Step 3: View System (ON/OFF/BOOTING)
└── Step 4: Door System (hold mechanics)

Phase 2: Monster & Telegraph (Day 2)
├── Step 5: Monster AI State Machine
├── Step 6: Telegraph System (3-5s warning)
├── Step 7: 60/40 Real vs Fake Logic
└── Step 8: 1-Second Pre-Close Rule

Phase 3: CSS Room & UI (Day 3)
├── Step 9: 3-Section Room Layout (CSS-only)
├── Step 10: Door + Strobe + Monster Eyes
├── Step 11: Monitor View Integration
└── Step 12: Heat Bar & Status UI

Phase 4: Audio & Polish (Day 4)
├── Step 13: Distance-based audio system
├── Step 14: Telegraph audio cues
├── Step 15: CRT + Glitch effects
└── Step 16: Final Compile + Endings

Phase 5: QA & Deploy (Day 5)
├── Step 17: Balance tuning
├── Step 18: Bug fixes
└── Step 19: Deploy
```

---

## 3. Phase 1: Foundation & Core Systems

### Step 1: New State Structure

**Task:** Update the Zustand store with v2.0 state schema.

**File:** `src/game/store.ts`

```typescript
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface GameState {
  // ===== PHASE =====
  phase: Phase;

  // ===== HEAT SYSTEM =====
  powerLoad: number;           // 0-100+
  isBlackout: boolean;
  blackoutTimer: number;

  // ===== VIEW SYSTEM =====
  monitorState: MonitorState;  // 'ON' | 'OFF' | 'BOOTING'
  bootTimer: number;

  // ===== DOOR SYSTEM =====
  doorState: DoorState;        // 'OPEN' | 'CLOSED'
  isDoorHeld: boolean;
  doorClosedDuration: number;

  // ===== MONSTER SYSTEM =====
  monsterState: MonsterState;  // 'IDLE' | 'APPROACHING' | 'TELEGRAPHING' | 'ATTACKING'
  monsterDistance: number;     // 0-100
  currentTelegraph: TelegraphEvent | null;

  // ===== PUZZLE SYSTEM =====
  puzzleDefs: PuzzleModule[];
  currentModuleIndex: number;
  moduleProgress: Record<string, ModuleProgress>;
  editorText: string;

  // ===== STATS =====
  totalMistakes: number;
  hintsUsed: number;
  neverClosedDoor: boolean;

  // ===== ACTIONS =====
  actions: GameActions;
}

const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state...
    actions: {
      // Action implementations...
    }
  }))
);
```

### Step 2: Heat System

**Task:** Implement powerLoad mechanics with blackout.

**File:** `src/game/systems/heatSystem.ts`

```typescript
import { HEAT } from '@game/constants';

export function updateHeat(state: GameState, dt: number): Partial<GameState> {
  let { powerLoad, monitorState, isDoorHeld, isBlackout, blackoutTimer } = state;

  // During blackout: countdown only
  if (isBlackout) {
    blackoutTimer -= dt;
    if (blackoutTimer <= 0) {
      return { isBlackout: false, blackoutTimer: 0, powerLoad: 50 };
    }
    return { blackoutTimer };
  }

  // Heat accumulation/cooling
  if (monitorState === 'ON') {
    powerLoad += HEAT.PASSIVE_RATE_ON * dt;
  } else if (monitorState === 'OFF') {
    powerLoad = Math.max(0, powerLoad - HEAT.COOLING_RATE * dt);
  }

  // Door hold cost (only when monitor OFF)
  if (isDoorHeld && monitorState === 'OFF') {
    powerLoad += HEAT.DOOR_HOLD_COST * dt;
  }

  // Blackout trigger
  if (powerLoad >= HEAT.BLACKOUT_THRESHOLD) {
    return {
      powerLoad: HEAT.BLACKOUT_THRESHOLD,
      isBlackout: true,
      blackoutTimer: HEAT.BLACKOUT_DURATION,
      doorState: 'OPEN',
      doorClosedDuration: 0,
      monitorState: 'OFF',
    };
  }

  return { powerLoad: Math.max(0, powerLoad) };
}
```

### Step 3: View System

**Task:** Implement ON/OFF/BOOTING monitor states.

**File:** `src/game/systems/viewSystem.ts`

```typescript
import { BOOT } from '@game/constants';

export function toggleMonitor(state: GameState): Partial<GameState> {
  const { monitorState, isBlackout } = state;

  if (isBlackout) return {};

  if (monitorState === 'ON') {
    return { monitorState: 'OFF' };
  } else if (monitorState === 'OFF') {
    return {
      monitorState: 'BOOTING',
      bootTimer: BOOT.DURATION,
    };
  }

  return {};
}

export function updateBoot(state: GameState, dt: number): Partial<GameState> {
  if (state.monitorState !== 'BOOTING') return {};

  const newTimer = state.bootTimer - dt;
  if (newTimer <= 0) {
    return { monitorState: 'ON', bootTimer: 0 };
  }

  return { bootTimer: newTimer };
}
```

### Step 4: Door System

**Task:** Implement door hold mechanics with duration tracking.

**File:** `src/game/systems/doorSystem.ts`

```typescript
export function updateDoor(state: GameState, dt: number): Partial<GameState> {
  const { doorState, isDoorHeld, doorClosedDuration, monitorState, isBlackout } = state;

  // Blackout forces door open
  if (isBlackout) {
    return { doorState: 'OPEN', doorClosedDuration: 0 };
  }

  // Can only control door when monitor OFF
  if (monitorState === 'ON') {
    // Door stays in current state, but timer accumulates if closed
    if (doorState === 'CLOSED') {
      return { doorClosedDuration: doorClosedDuration + dt };
    }
    return {};
  }

  // Space held: close/keep door closed
  if (isDoorHeld) {
    if (doorState === 'OPEN') {
      return { doorState: 'CLOSED', doorClosedDuration: dt };
    }
    return { doorClosedDuration: doorClosedDuration + dt };
  }

  // Space released: open door
  if (doorState === 'CLOSED') {
    return { doorState: 'OPEN', doorClosedDuration: 0 };
  }

  return {};
}
```

---

## 4. Phase 2: Monster & Telegraph System

### Step 5: Monster AI State Machine

**Task:** Implement monster states and transitions.

**File:** `src/game/systems/monsterSystem.ts`

```typescript
import { MONSTER } from '@game/constants';

type MonsterState = 'IDLE' | 'APPROACHING' | 'TELEGRAPHING' | 'ATTACKING';

export function updateMonster(state: GameState, dt: number): Partial<GameState> {
  const { monsterState, monsterDistance, currentTelegraph, isBlackout } = state;

  // Blackout: monster rushes
  if (isBlackout) {
    const newDistance = monsterDistance - MONSTER.BLACKOUT_SPEED * dt;
    if (newDistance <= MONSTER.ATTACK_THRESHOLD) {
      return startTelegraph(state);
    }
    return { monsterDistance: newDistance };
  }

  switch (monsterState) {
    case 'IDLE':
      return handleIdle(state, dt);
    case 'APPROACHING':
      return handleApproaching(state, dt);
    case 'TELEGRAPHING':
      return handleTelegraphing(state, dt);
    case 'ATTACKING':
      return handleAttacking(state);
    default:
      return {};
  }
}
```

### Step 6: Telegraph System

**Task:** Implement 3-5 second audio/visual warning.

```typescript
interface TelegraphEvent {
  startTime: number;
  duration: number;        // 3-5 seconds
  impactTime: number;      // When attack hits
  isReal: boolean;         // 60% real, 40% fake
  audioPlayed: boolean;
}

function startTelegraph(state: GameState): Partial<GameState> {
  const duration = MONSTER.TELEGRAPH_MIN +
    Math.random() * (MONSTER.TELEGRAPH_MAX - MONSTER.TELEGRAPH_MIN);

  const isReal = Math.random() < 0.6; // 60% real attack

  const telegraph: TelegraphEvent = {
    startTime: Date.now(),
    duration,
    impactTime: Date.now() + duration * 1000,
    isReal,
    audioPlayed: false,
  };

  return {
    monsterState: 'TELEGRAPHING',
    currentTelegraph: telegraph,
  };
}

function handleTelegraphing(state: GameState, dt: number): Partial<GameState> {
  const { currentTelegraph } = state;
  if (!currentTelegraph) return { monsterState: 'IDLE' };

  const elapsed = (Date.now() - currentTelegraph.startTime) / 1000;

  if (elapsed >= currentTelegraph.duration) {
    // Telegraph finished - resolve attack
    return resolveAttack(state);
  }

  return {};
}
```

### Step 7: 60/40 Real vs Fake Logic

**Task:** Implement attack resolution with 1-Second Rule.

```typescript
function resolveAttack(state: GameState): Partial<GameState> {
  const { currentTelegraph, doorState, doorClosedDuration } = state;

  if (!currentTelegraph) return { monsterState: 'IDLE' };

  // Fake attack - monster retreats regardless
  if (!currentTelegraph.isReal) {
    return {
      monsterState: 'IDLE',
      monsterDistance: MONSTER.REPEL_DISTANCE_MIN +
        Math.random() * (MONSTER.REPEL_DISTANCE_MAX - MONSTER.REPEL_DISTANCE_MIN),
      currentTelegraph: null,
    };
  }

  // Real attack - check 1-Second Rule
  const doorWasClosed = doorState === 'CLOSED' &&
    doorClosedDuration >= DOOR.SAFE_DURATION;

  if (doorWasClosed) {
    // SUCCESS: Monster repelled
    return {
      monsterState: 'IDLE',
      monsterDistance: MONSTER.REPEL_DISTANCE_MIN +
        Math.random() * (MONSTER.REPEL_DISTANCE_MAX - MONSTER.REPEL_DISTANCE_MIN),
      currentTelegraph: null,
    };
  } else {
    // FAILURE: Breach -> Game Over
    return {
      monsterState: 'ATTACKING',
      currentTelegraph: null,
    };
  }
}
```

### Step 8: 1-Second Pre-Close Rule

**The Critical Rule:**
```
Telegraph Start ──[3-5 seconds]──> Impact Time (T)
                                      ↓
                Door must be closed by T-1s to survive

Example:
- Telegraph starts at T=0
- Impact at T=4s
- Door must be closed BEFORE T=3s
- If closed at T=3.5s → DEATH (too late)
```

---

## 5. Phase 3: CSS Room & UI

### Step 9: 3-Section Room Layout

**Task:** Create CSS-only room with 3 sections.

**File:** `src/ui/room/RoomLayout.tsx`

```tsx
export function RoomLayout() {
  const monitorState = useGameStore(s => s.monitorState);

  return (
    <div className="relative w-full h-full bg-[#050505]">
      {/* Room visible when monitor OFF */}
      <motion.div
        className="absolute inset-0 grid grid-cols-[1fr_2fr_1fr]"
        animate={{
          opacity: monitorState === 'ON' ? 0 : 1,
          filter: monitorState === 'ON' ? 'blur(20px)' : 'blur(0px)'
        }}
      >
        <HallwaySection />
        <DeskSection />
        <ChalkboardSection />
      </motion.div>

      {/* Monitor overlay when ON */}
      {monitorState !== 'OFF' && <MonitorView />}
    </div>
  );
}
```

### Step 10: Door + Strobe + Monster Eyes

**File:** `src/ui/room/HallwaySection.tsx`

```tsx
export function HallwaySection() {
  return (
    <div className="relative h-full bg-[#0a0a0a] border-r border-[#1a1a1a]">
      <StrobeLight />
      <Door />
      <MonsterEyes />
    </div>
  );
}

function StrobeLight() {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    const flicker = () => {
      setIsOn(true);
      setTimeout(() => setIsOn(false), 50 + Math.random() * 100);
      setTimeout(flicker, 500 + Math.random() * 1500);
    };
    const timer = setTimeout(flicker, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`absolute inset-0 transition-colors duration-75 ${
      isOn ? 'bg-red-900/30' : 'bg-transparent'
    }`} />
  );
}

function MonsterEyes({ visible }: { visible: boolean }) {
  const distance = useGameStore(s => s.monsterDistance);
  const eyeSize = Math.max(2, 8 - distance / 15);

  if (distance > 50) return null;

  return (
    <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2">
      <div className="flex gap-4">
        <div
          className="rounded-full bg-red-500 animate-pulse"
          style={{
            width: eyeSize,
            height: eyeSize,
            boxShadow: `0 0 ${eyeSize * 2}px red`,
          }}
        />
        <div
          className="rounded-full bg-red-500 animate-pulse"
          style={{
            width: eyeSize,
            height: eyeSize,
            boxShadow: `0 0 ${eyeSize * 2}px red`,
            animationDelay: '0.2s',
          }}
        />
      </div>
    </div>
  );
}
```

### Step 11: Door Component with 1-Second Indicator

**File:** `src/ui/room/Door.tsx`

```tsx
export function Door() {
  const doorState = useGameStore(s => s.doorState);
  const doorClosedDuration = useGameStore(s => s.doorClosedDuration);
  const isSafe = doorClosedDuration >= DOOR.SAFE_DURATION;

  return (
    <div className="absolute top-[20%] left-[10%] w-[120px] h-[300px]">
      {/* Door Frame */}
      <div className="w-full h-full border-8 border-[#1a1a1a] bg-[#0d0d0d]">
        {/* Door Body */}
        <motion.div
          className="w-full h-full bg-[#151515] origin-left"
          animate={{ rotateY: doorState === 'CLOSED' ? 0 : -75 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="absolute top-[50%] right-[10px] w-2 h-2 rounded-full bg-[#333]" />
        </motion.div>
      </div>

      {/* 1-Second Rule Indicator */}
      {doorState === 'CLOSED' && (
        <div className={`mt-2 text-center text-sm font-mono ${
          isSafe ? 'text-green-500' : 'text-red-500 animate-pulse'
        }`}>
          {isSafe ? '✓ SECURED' : `${doorClosedDuration.toFixed(1)}s`}
        </div>
      )}
    </div>
  );
}
```

### Step 12: Heat Bar

**File:** `src/ui/panels/HeatBar.tsx`

```tsx
export function HeatBar() {
  const powerLoad = useGameStore(s => s.powerLoad);
  const isBlackout = useGameStore(s => s.isBlackout);

  const getColor = () => {
    if (powerLoad >= 80) return 'bg-red-500';
    if (powerLoad >= 60) return 'bg-orange-500';
    if (powerLoad >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>HEAT</span>
        <span className={powerLoad >= 80 ? 'text-red-500 animate-pulse' : ''}>
          {powerLoad.toFixed(0)}%
        </span>
      </div>
      <div className="h-3 bg-gray-800 rounded overflow-hidden">
        <motion.div
          className={`h-full ${getColor()} ${isBlackout ? 'animate-pulse' : ''}`}
          animate={{ width: `${Math.min(powerLoad, 100)}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
      {isBlackout && (
        <div className="text-red-500 text-xs text-center mt-1 animate-pulse">
          ⚠ BLACKOUT
        </div>
      )}
    </div>
  );
}
```

---

## 6. Phase 4: Audio & Polish

### Step 13: Distance-Based Audio

**File:** `src/game/systems/audioSystem.ts`

```typescript
const AUDIO_LAYERS = {
  ambience: { baseVolume: 0.3, threatMultiplier: -0.1 },
  heartbeat: { baseVolume: 0.1, threatMultiplier: 0.6 },
  footsteps: { baseVolume: 0.1, threatMultiplier: 0.5 },
  breathing: { baseVolume: 0, threshold: 0.5, aboveThreshold: 0.8 },
};

export function updateAudioMix(state: GameState): void {
  const threat = 1 - (state.monsterDistance / 100);
  const threatEased = Math.pow(threat, 1.6);

  Object.entries(AUDIO_LAYERS).forEach(([id, config]) => {
    let volume = config.baseVolume + (threatEased * (config.threatMultiplier || 0));

    if (config.threshold && threat < config.threshold) {
      volume = 0;
    } else if (config.threshold) {
      volume = config.aboveThreshold * (threat - config.threshold) / (1 - config.threshold);
    }

    AudioManager.setVolume(id, Math.max(0, Math.min(1, volume)));
  });
}
```

### Step 14: Telegraph Audio Cues

**The monster NEVER attacks silently:**

```typescript
const TELEGRAPH_SOUNDS = {
  doorRattle: 'door_rattle.mp3',     // Door handle jiggling
  growl: 'monster_growl.mp3',         // Low growling
  scraping: 'metal_scraping.mp3',     // Claws on metal
};

function playTelegraphAudio(telegraph: TelegraphEvent): void {
  // Play aggressive cue sound
  const sounds = Object.values(TELEGRAPH_SOUNDS);
  const sound = sounds[Math.floor(Math.random() * sounds.length)];
  AudioManager.play(sound, { volume: 0.8 });

  // Strobe light sync
  triggerStrobeFrenzy(telegraph.duration);
}
```

### Step 15: CRT + Glitch Effects

**File:** `src/ui/overlays/GlitchOverlay.tsx`

```tsx
export function GlitchOverlay() {
  const glitch = useGameStore(s => s.glitch);
  const intensity = glitch.intensity + glitch.spike;

  if (intensity < 0.1) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Chromatic Aberration */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background: `linear-gradient(90deg,
            rgba(255,0,0,${intensity * 0.1}) 0%,
            transparent 50%,
            rgba(0,255,255,${intensity * 0.1}) 100%
          )`,
          transform: `translateX(${intensity * 5}px)`,
        }}
      />

      {/* Screen Tear Lines */}
      {intensity > 0.3 && (
        <div
          className="absolute w-full h-1 bg-white/20"
          style={{
            top: `${Math.random() * 100}%`,
            opacity: intensity,
          }}
        />
      )}
    </div>
  );
}
```

### Step 16: Final Compile & Endings

```typescript
function determineEnding(): EndingType {
  const state = getState();

  // Secret: Never closed door (pure skill/luck)
  if (state.neverClosedDoor) return 'secret';

  // Good: Few mistakes
  if (state.totalMistakes <= 3 && state.hintsUsed <= 2) return 'good';

  // Neutral: Average performance
  if (state.totalMistakes <= 8) return 'neutral';

  // Bad: Many mistakes
  return 'bad';
}
```

---

## 7. Input Handling

### Keyboard Bindings

```typescript
function useInputHandler() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { monitorState, isBlackout } = getState();

      if (isBlackout) return;

      switch (e.code) {
        case 'Tab':
          e.preventDefault();
          actions.toggleMonitor();
          break;

        case 'Space':
          e.preventDefault();
          if (monitorState === 'OFF') {
            actions.startHoldingDoor();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        actions.stopHoldingDoor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
}
```

### Typing Cost in CodeEditor

```tsx
// CodeEditor.tsx
onChange={(e) => {
  const newLength = e.target.value.length;
  const oldLength = editorText.length;

  // Add heat for each typed character
  if (newLength > oldLength) {
    const addedChars = newLength - oldLength;
    actions.addHeat(HEAT.TYPING_COST * addedChars);
  }

  actions.setEditorText(e.target.value);
}}
```

---

## 8. Game Loop Integration

```typescript
function useGameLoop() {
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      const state = getState();

      if (state.phase === 'playing') {
        // 1. Boot sequence
        const bootUpdate = updateBoot(state, dt);

        // 2. Heat system
        const heatUpdate = updateHeat(state, dt);

        // 3. Door system
        const doorUpdate = updateDoor(state, dt);

        // 4. Monster AI + Telegraph
        const monsterUpdate = updateMonster(state, dt);

        // 5. Effects
        const effectsUpdate = updateEffects(state, dt);

        // 6. Audio mix
        updateAudioMix(state);

        // Apply all updates
        setState({
          ...bootUpdate,
          ...heatUpdate,
          ...doorUpdate,
          ...monsterUpdate,
          ...effectsUpdate,
        });
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current!);
  }, []);
}
```

---

## 9. Common Issues & Solutions

### Issue 1: Telegraph Not Triggering
**Symptom:** Monster attacks without warning
**Solution:** Ensure `startTelegraph()` is called when `monsterDistance <= MONSTER.ATTACK_THRESHOLD`

### Issue 2: Door Timer Resets Unexpectedly
**Symptom:** Door shows unsafe even when held
**Solution:** Check that `doorClosedDuration` only resets when door physically opens

### Issue 3: Heat Accumulates Too Fast
**Symptom:** Blackout happens too quickly
**Solution:** Verify `dt` is capped at 0.05s and heat rates match constants

### Issue 4: 60/40 Feels Unfair
**Symptom:** Players complain about RNG
**Solution:** Ensure telegraph duration gives enough reaction time (3-5s)

### Issue 5: Audio Context Blocked
**Symptom:** No sound on first load
**Solution:** Call `Howler.ctx.resume()` on first user interaction

---

## 10. Testing Scenarios

### Scenario 1: Successful Defense (Real Attack)
```
1. Player coding, Heat at 50%
2. Monster reaches attack range
3. Telegraph starts (REAL, 4s duration)
4. Player hears growling + door rattling
5. TAB → Monitor OFF
6. SPACE → Door closes
7. Hold for 1+ seconds → "✓ SECURED"
8. Attack resolves → Monster repelled to 60-80
9. Release SPACE, TAB → Resume coding
```

### Scenario 2: Successful Ignore (Fake Attack)
```
1. Telegraph starts (FAKE, 3.5s duration)
2. Player hears warning sounds
3. Player gambles: doesn't close door
4. Attack resolves → Fake, monster retreats anyway
5. Player saved Heat by not closing door
```

### Scenario 3: Failed Defense
```
1. Telegraph starts (REAL, 4s duration)
2. Player reacts at T=3.5s (0.5s left)
3. Door closes but only held for 0.5s
4. Attack at T=4s → Door timer < 1s
5. BREACH → Game Over
```

### Scenario 4: Blackout Death
```
1. Heat at 92%
2. Player compiles (+30%) → Heat 122%
3. BLACKOUT triggers
4. Door forced OPEN
5. Monster rushes (3x speed)
6. Telegraph during blackout
7. Player can't close door
8. BREACH → Game Over
```

---

## 11. Deployment Checklist

- [ ] Heat balance feels fair (not too punishing, not too easy)
- [ ] 60/40 gamble creates tension (not frustration)
- [ ] Audio cues are clear and distinguishable
- [ ] 1-Second Rule is communicated via UI
- [ ] Boot delay creates meaningful downtime
- [ ] All 5 puzzles completable
- [ ] 4 endings achievable
- [ ] Performance: 60fps stable
- [ ] Audio plays without issues
- [ ] Mobile gracefully degrades (or shows warning)
