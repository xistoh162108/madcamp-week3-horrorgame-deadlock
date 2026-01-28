# DEADLOCK - Audio & Visual Specification

## 1. Audio System

### 1.1 Audio File Requirements

#### Format Specification
| Property | Requirement |
|----------|-------------|
| Primary Format | WebM (Opus codec) |
| Fallback Format | MP3 (128kbps+) |
| Sample Rate | 44.1kHz |
| Channels | Stereo (2ch) |
| Bit Depth | 16-bit |

#### File Naming Convention
```
/public/audio/
├── ambience.webm
├── ambience.mp3
├── heartbeat.webm
├── heartbeat.mp3
├── footsteps.webm
├── footsteps.mp3
├── breathing.webm
├── breathing.mp3
└── sfx.webm          # Sound sprite
└── sfx.mp3
```

### 1.2 Audio Asset Specifications

#### 1.2.1 Ambience (Loop)
| Property | Value |
|----------|-------|
| Filename | `ambience.webm/.mp3` |
| Duration | 30-60 seconds |
| Loop | Yes (seamless) |
| Content | Server room hum, distant ventilation, electrical buzz |
| Volume Range | 0.3 - 0.5 |
| Notes | Low frequency dominant, creates unease |

**Production Notes:**
- 저주파수(100-200Hz) 웅웅거림이 기본
- 가끔 들리는 기계 클릭음 (5-10초 간격)
- 먼 환기 팬 소리
- 루프 끊김 없이 자연스럽게 연결

#### 1.2.2 Heartbeat (Loop)
| Property | Value |
|----------|-------|
| Filename | `heartbeat.webm/.mp3` |
| Duration | 2-3 seconds |
| Loop | Yes |
| BPM | 70-80 (normal) → 120-140 (high threat) |
| Volume Range | 0.1 - 0.8 |
| Notes | Plays faster at higher threat |

**Production Notes:**
- 두근두근 소리 (lub-dub)
- 저음역대 강조
- 위협도에 따라 재생 속도 조절 (playbackRate)
- threatEased 0.0: 거의 안들림
- threatEased 1.0: 귀를 압도

#### 1.2.3 Footsteps (Loop or One-shots)
| Property | Value |
|----------|-------|
| Filename | `footsteps.webm/.mp3` |
| Duration | 1.5-2 seconds (loop) |
| Loop | Yes |
| Content | Heavy dragging footsteps, shuffling |
| Volume Range | 0.05 - 0.65 |
| Notes | Volume/pan based on monsterDistance |

**Production Notes:**
- 무거운 발끌기 소리
- 금속 바닥 위 드래그
- 불규칙한 리듬 (정상적이지 않음)
- 가끔 멈추는 듯한 페이드 (긴장감)

**거리에 따른 처리:**
```typescript
// Distance → Volume mapping
if (distance > 80) volume = 0.05;      // 거의 안들림
else if (distance > 50) volume = 0.2;  // 먼 발소리
else if (distance > 25) volume = 0.45; // 복도에 있음
else volume = 0.65;                     // 문 바로 밖
```

#### 1.2.4 Breathing (Loop)
| Property | Value |
|----------|-------|
| Filename | `breathing.webm/.mp3` |
| Duration | 3-4 seconds |
| Loop | Yes |
| Content | Heavy, raspy breathing |
| Volume Range | 0 - 0.6 |
| Notes | Only audible when threat > 0.5 |

**Production Notes:**
- 거친 숨소리
- 천식 같은 휘파람 소리 섞임
- 숨을 참았다가 내쉬는 패턴
- threatEased 0.5 이하: 음소거
- threatEased 1.0: 귀 바로 옆에서 들리는 느낌

### 1.3 Sound Effects (SFX Sprite)

#### Sprite Configuration
```javascript
const sfx = new Howl({
  src: ["/audio/sfx.webm", "/audio/sfx.mp3"],
  sprite: {
    typing: [0, 100],          // 0.1s - 키보드 타이핑
    error: [200, 500],         // 0.5s - 에러 비프
    success: [800, 700],       // 0.7s - 성공 차임
    glitch: [1600, 400],       // 0.4s - 글리치 노이즈
    doorCreak: [2100, 1200],   // 1.2s - 문 삐걱
    taskAssign: [3400, 800],   // 0.8s - 태스크 시작
    taskReturn: [4300, 1000],  // 1.0s - 태스크 복귀
    jumpscare: [5400, 600],    // 0.6s - 점프스케어
    compileStart: [6100, 1500], // 1.5s - 컴파일 시작
    compileSuccess: [7700, 2000] // 2.0s - 컴파일 성공
  }
});
```

#### Individual SFX Specifications

| ID | Duration | Description | When Played |
|----|----------|-------------|-------------|
| `typing` | 0.1s | 기계식 키보드 클릭 | 각 키 입력 |
| `error` | 0.5s | 8bit 에러 비프 | 퍼즐 실패 |
| `success` | 0.7s | 상승 차임 | 퍼즐 성공 |
| `glitch` | 0.4s | 디지털 노이즈 | 글리치 스파이크 |
| `doorCreak` | 1.2s | 오래된 문 삐걱 | DOOR 모드 전환 |
| `taskAssign` | 0.8s | 발소리 멀어짐 | Task 할당 |
| `taskReturn` | 1.0s | 발소리 다가옴 | Task 완료 |
| `jumpscare` | 0.6s | 고주파 금속 비명 | Game Over |
| `compileStart` | 1.5s | 기계 작동음 | Final Compile 시작 |
| `compileSuccess` | 2.0s | 승리 팡파레 | 컴파일 완료 |

### 1.4 Audio Mixing Logic

#### Threat-Based Mixing
```typescript
function calculateAudioMix(threatEased: number, activeTask: boolean): AudioMix {
  return {
    ambience: lerp(0.5, 0.3, threatEased),  // 위협↑ → 약간 감소
    heartbeat: lerp(0.1, 0.8, threatEased), // 위협↑ → 크게 증가
    footsteps: activeTask ? 0 : lerp(0.05, 0.65, threatEased),
    breathing: threatEased > 0.5 ? (threatEased - 0.5) * 1.2 : 0,
    master: 0.8 // 사용자 조절 가능
  };
}
```

#### Volume Transition Rules
- **Fade Duration:** 300ms (급격한 변화 방지)
- **Cross-fade:** 루프 전환 시 100ms 오버랩
- **Mute Transition:** 즉시 아닌 150ms 페이드

### 1.5 Howler.js Implementation

#### Singleton Audio Manager
```typescript
// src/game/systems/audioSystem.ts
import { Howl, Howler } from "howler";

class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Howl> = new Map();
  private currentVolumes: AudioMix = { ... };

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async preload(): Promise<void> {
    const audioFiles = [
      { id: "ambience", src: ["/audio/ambience.webm", "/audio/ambience.mp3"], loop: true },
      { id: "heartbeat", src: ["/audio/heartbeat.webm", "/audio/heartbeat.mp3"], loop: true },
      { id: "footsteps", src: ["/audio/footsteps.webm", "/audio/footsteps.mp3"], loop: true },
      { id: "breathing", src: ["/audio/breathing.webm", "/audio/breathing.mp3"], loop: true },
      { id: "sfx", src: ["/audio/sfx.webm", "/audio/sfx.mp3"], sprite: { ... } },
    ];

    for (const file of audioFiles) {
      await this.loadSound(file);
    }
  }

  private loadSound(config: AudioConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const howl = new Howl({
        src: config.src,
        loop: config.loop ?? false,
        sprite: config.sprite,
        preload: true,
        onload: () => {
          this.sounds.set(config.id, howl);
          resolve();
        },
        onloaderror: (_, err) => reject(err),
      });
    });
  }

  setVolume(id: string, volume: number, duration = 300): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.fade(sound.volume(), volume, duration);
    }
  }

  play(id: string, spriteId?: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      if (spriteId) {
        sound.play(spriteId);
      } else if (!sound.playing()) {
        sound.play();
      }
    }
  }

  stopAll(): void {
    this.sounds.forEach(sound => sound.stop());
  }
}

export const audioManager = AudioManager.getInstance();
```

---

## 2. Visual Effects

### 2.1 CRT Monitor Effect

#### CSS Implementation
```css
/* src/ui/panels/MonitorFrame.css */

.monitor-crt {
  position: relative;
  border-radius: 2% / 3%;
  overflow: hidden;
  background: #0a0a0a;

  /* Vignette effect */
  box-shadow:
    inset 0 0 100px rgba(0, 0, 0, 0.5),
    inset 0 0 50px rgba(0, 0, 0, 0.3);
}

/* Scanlines */
.monitor-crt::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  mix-blend-mode: multiply;
  opacity: 0.7;
  z-index: 10;
}

/* Noise overlay */
.monitor-crt::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("/images/noise.png");
  background-size: 128px 128px;
  opacity: var(--noise-opacity, 0.04);
  animation: noise 0.15s steps(3) infinite;
  z-index: 11;
}

@keyframes noise {
  0% { transform: translate(0, 0); }
  33% { transform: translate(-2%, 3%); }
  66% { transform: translate(1%, -2%); }
  100% { transform: translate(-1%, 1%); }
}

/* Flicker effect (threat-based) */
.monitor-crt.flickering {
  animation: flicker 0.1s infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.97; }
}

/* Screen curve reflection */
.monitor-crt .screen-glare {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 50%
  );
  pointer-events: none;
  z-index: 12;
}
```

#### React Component
```tsx
// src/ui/panels/MonitorFrame.tsx
interface MonitorFrameProps {
  glitchIntensity: number;
  children: React.ReactNode;
}

export function MonitorFrame({ glitchIntensity, children }: MonitorFrameProps) {
  const noiseOpacity = 0.04 + glitchIntensity * 0.04;
  const isFlickering = glitchIntensity > 0.3;

  return (
    <div
      className={`monitor-crt ${isFlickering ? "flickering" : ""}`}
      style={{ "--noise-opacity": noiseOpacity } as React.CSSProperties}
    >
      <div className="screen-content">
        {children}
      </div>
      <div className="screen-glare" />
    </div>
  );
}
```

### 2.2 Parallax + Flashlight Integration

#### Parallax Layers
```
┌─────────────────────────────────────────┐
│           LAYER STRUCTURE               │
├─────────────────────────────────────────┤
│                                         │
│  Layer 0: Background (Room/Door)        │
│    - translateX: mouseX * -10px         │
│    - translateY: mouseY * -10px         │
│    - z-index: 0                         │
│                                         │
│  Layer 1: Midground (Desk/Props)        │
│    - translateX: mouseX * -6px          │
│    - translateY: mouseY * -6px          │
│    - z-index: 1                         │
│                                         │
│  Layer 2: Foreground (Monitor)          │
│    - translateX: mouseX * -3px          │
│    - translateY: mouseY * -3px          │
│    - rotateX: mouseY * 2deg             │
│    - rotateY: mouseX * -2deg            │
│    - z-index: 2                         │
│                                         │
│  Layer 3: Flashlight Overlay            │
│    - mask follows mouse exactly         │
│    - z-index: 100                       │
│                                         │
└─────────────────────────────────────────┘
```

#### Implementation
```tsx
// src/ui/layout/ParallaxRoom.tsx
import { motion, useSpring } from "framer-motion";

interface ParallaxRoomProps {
  mousePosition: { x: number; y: number }; // normalized -1 to 1
}

export function ParallaxRoom({ mousePosition }: ParallaxRoomProps) {
  // Smooth spring animation
  const springConfig = { stiffness: 100, damping: 30 };
  const x = useSpring(mousePosition.x, springConfig);
  const y = useSpring(mousePosition.y, springConfig);

  const layers = [
    { id: "background", intensity: 10, zIndex: 0, image: "/images/room-bg.png" },
    { id: "midground", intensity: 6, zIndex: 1, image: "/images/desk.png" },
    { id: "foreground", intensity: 3, zIndex: 2, image: "/images/monitor-frame.png" },
  ];

  return (
    <div className="parallax-container">
      {layers.map((layer) => (
        <motion.div
          key={layer.id}
          className={`parallax-layer layer-${layer.id}`}
          style={{
            zIndex: layer.zIndex,
            x: useTransform(x, (v) => v * -layer.intensity),
            y: useTransform(y, (v) => v * -layer.intensity),
            backgroundImage: `url(${layer.image})`,
          }}
        />
      ))}
    </div>
  );
}
```

#### Flashlight Overlay
```tsx
// src/ui/layout/FlashlightOverlay.tsx
interface FlashlightOverlayProps {
  mouseX: number; // pixels
  mouseY: number; // pixels
  radius: number;
  flickerIntensity: number;
  isBlackout: boolean;
}

export function FlashlightOverlay({
  mouseX,
  mouseY,
  radius,
  flickerIntensity,
  isBlackout,
}: FlashlightOverlayProps) {
  // Flicker effect
  const [flickerOffset, setFlickerOffset] = useState(0);

  useEffect(() => {
    if (flickerIntensity > 0) {
      const interval = setInterval(() => {
        setFlickerOffset(Math.random() * flickerIntensity * 20);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [flickerIntensity]);

  const effectiveRadius = isBlackout ? 0 : radius - flickerOffset;

  return (
    <div
      className="flashlight-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: `radial-gradient(
          circle ${effectiveRadius}px at ${mouseX}px ${mouseY}px,
          transparent 0%,
          transparent 60%,
          rgba(0, 0, 0, 0.7) 80%,
          rgba(0, 0, 0, 0.95) 100%
        )`,
        pointerEvents: "none",
        zIndex: 100,
        transition: isBlackout ? "none" : "background 0.1s ease-out",
      }}
    />
  );
}
```

### 2.3 Look Up (MONITOR ↔ DOOR) Transition

#### Framer Motion Variants
```tsx
// src/ui/layout/RoomContainer.tsx
import { motion, AnimatePresence } from "framer-motion";

const roomVariants = {
  MONITOR: {
    scale: 1.2,
    filter: "blur(4px)",
    y: -50,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  DOOR: {
    scale: 1.0,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const monitorVariants = {
  MONITOR: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  DOOR: {
    opacity: 0.3,
    scale: 0.8,
    y: 300,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

interface RoomContainerProps {
  viewMode: "MONITOR" | "DOOR";
  children: React.ReactNode;
}

export function RoomContainer({ viewMode, children }: RoomContainerProps) {
  return (
    <div className="room-wrapper">
      {/* Trigger Zone (top 20%) */}
      <div
        className="trigger-zone"
        onMouseEnter={() => setViewMode("DOOR")}
        onMouseLeave={() => setViewMode("MONITOR")}
      />

      {/* Room Background */}
      <motion.div
        className="room-background"
        variants={roomVariants}
        animate={viewMode}
      >
        <ParallaxRoom mousePosition={mousePos} />
      </motion.div>

      {/* Monitor Frame */}
      <motion.div
        className="monitor-container"
        variants={monitorVariants}
        animate={viewMode}
      >
        {children}
      </motion.div>
    </div>
  );
}
```

### 2.4 Glitch Effect

#### Visual-Only Corruption
```tsx
// src/ui/overlays/GlitchOverlay.tsx
interface GlitchOverlayProps {
  intensity: number; // 0-1
}

export function GlitchOverlay({ intensity }: GlitchOverlayProps) {
  if (intensity < 0.1) return null;

  return (
    <div
      className="glitch-overlay"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {/* Chromatic Aberration */}
      <div
        className="chromatic-aberration"
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(90deg,
              rgba(255, 0, 0, ${intensity * 0.1}) 0%,
              transparent 10%,
              transparent 90%,
              rgba(0, 255, 255, ${intensity * 0.1}) 100%
            )
          `,
          mixBlendMode: "screen",
        }}
      />

      {/* Screen Tear Lines */}
      {intensity > 0.3 && (
        <div
          className="tear-lines"
          style={{
            position: "absolute",
            inset: 0,
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent ${Math.floor(20 / intensity)}px,
              rgba(255, 255, 255, ${intensity * 0.05}) ${Math.floor(20 / intensity)}px,
              rgba(255, 255, 255, ${intensity * 0.05}) ${Math.floor(20 / intensity) + 2}px
            )`,
            animation: `tearMove ${0.5 / intensity}s linear infinite`,
          }}
        />
      )}
    </div>
  );
}
```

#### Text Corruption (Display Only)
```tsx
// src/utils/glitchText.ts
import { GLITCH_TEXTS } from "../game/data/story.json";

export function corruptText(
  originalText: string,
  intensity: number,
  seed: number
): string {
  if (intensity < 0.1) return originalText;

  const random = createSeededRandom(seed);
  let result = originalText;

  // Character substitution
  const corruptions = GLITCH_TEXTS.codeCorruptions;
  for (const { from, to } of corruptions) {
    if (random() < intensity * 0.3) {
      result = result.replace(from, to);
    }
  }

  // Random inserts (rare)
  if (intensity > 0.5 && random() < intensity * 0.1) {
    const insert = randomChoice(GLITCH_TEXTS.randomInserts, random);
    const pos = Math.floor(random() * result.length);
    result = result.slice(0, pos) + insert + result.slice(pos);
  }

  return result;
}
```

**Critical Rule:** 이 함수는 **표시용**으로만 사용. 검증 로직은 항상 원본 `editorText`를 사용.

---

## 3. Image Assets

### 3.1 Required Images

| Filename | Size | Description |
|----------|------|-------------|
| `room-bg.png` | 1920x1080 | 어두운 서버룸, 문 포함 |
| `desk.png` | 1920x1080 | 책상, 소품 (투명 배경) |
| `monitor-frame.png` | 800x600 | CRT 모니터 프레임 (투명 중앙) |
| `door-shadow.png` | 400x800 | 문 틈 그림자 (애니메이션용) |
| `noise.png` | 128x128 | 타일 가능한 노이즈 텍스처 |

### 3.2 AI Generation Prompts

#### Room Background
```
"1980s computer server room at night, dark and eerie atmosphere,
single CRT monitor glowing green, metal door with small window,
cinematic horror lighting, 4K, photorealistic, vignette edges"
```

#### Desk/Props
```
"Old wooden desk with scattered papers, coffee mug, vintage keyboard,
dark atmosphere, top-down perspective, transparent background PNG,
horror game asset, 4K quality"
```

### 3.3 Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| CRT Glow | Terminal Green | `#00ff41` |
| CRT Background | Near Black | `#0a0a0a` |
| Error | Blood Red | `#ff0040` |
| Warning | Amber | `#ffaa00` |
| Success | Cyan | `#00ffff` |
| Room Ambient | Dark Blue | `#0a0a1a` |
| Flashlight Edge | Warm | `#1a1510` |

---

## 4. Animation Timing

### 4.1 Standard Durations
| Animation | Duration | Easing |
|-----------|----------|--------|
| View Mode Transition | 400ms | easeOut |
| Glitch Spike | 200ms | linear |
| Terminal Log Appear | 50ms/char | linear |
| Cooldown Ring | 1s tick | linear |
| Compile Progress | 60s total | linear |
| Jump Scare Flash | 100ms | instant |

### 4.2 Framer Motion Spring Configs
```typescript
const SPRING_CONFIGS = {
  // Parallax movement
  parallax: { stiffness: 100, damping: 30 },

  // View mode switch
  viewSwitch: { type: "spring", stiffness: 200, damping: 25 },

  // UI elements
  uiPop: { type: "spring", stiffness: 500, damping: 30 },

  // Smooth drag
  drag: { type: "spring", stiffness: 150, damping: 20 },
};
```
