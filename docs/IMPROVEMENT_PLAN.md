# DEADLOCK 프로젝트 마스터 플랜 v2.0

**Version:** 2.0.0
**Last Updated:** 2026-01-27
**Status:** Implementation Ready

---

## 1. 핵심 게임플레이 요약

### 1.1 One-Line Pitch
> 플레이어는 서버실에 갇혀 탈출 스크립트를 코딩해야 한다. 하지만 모니터를 켜면 Heat가 쌓이고, 괴물은 소리로만 감지할 수 있으며, 진짜 공격인지 페이크인지 **도박**해야 한다.

### 1.2 새로운 코어 루프
```
┌─────────────────────────────────────────────────────────────┐
│                    MONITOR ON (코딩 모드)                    │
│  • 코드 작성 & 컴파일                                        │
│  • Heat 증가: +2%/초 (패시브) + 1%/키 + 30%/컴파일          │
│  • 위험: 괴물/문을 볼 수 없음, 문 닫기 불가                   │
└─────────────────────────────────────────────────────────────┘
                    ↕ [TAB] 토글 (OFF→ON: 1.5초 부팅 딜레이)
┌─────────────────────────────────────────────────────────────┐
│                    MONITOR OFF (방어 모드)                   │
│  • Heat 쿨링: -0.5%/초 (매우 느림)                          │
│  • 괴물 감시: 스트로브 조명 + 오디오                          │
│  • 문 닫기: [SPACE] 홀드 (+15%/초)                          │
└─────────────────────────────────────────────────────────────┘

                Heat > 100% → BLACKOUT (5초, 문 강제 OPEN)
```

---

## 2. 핵심 메커니즘

### 2.1 Heat Debt System (자원 관리)
| Action | Heat Cost |
|--------|-----------|
| 모니터 ON (패시브) | +2%/초 |
| 타이핑 | +1%/키 |
| 컴파일 | +30% 즉시 |
| 문 홀드 | +15%/초 |
| 모니터 OFF (쿨링) | -0.5%/초 |

**Blackout**: Heat ≥ 100% → 5초간 무력화, 문 강제 OPEN

### 2.2 60/40 Gamble System (공포의 핵심)

괴물이 공격 범위에 도달하면 **Telegraph Phase** 시작:
- 3-5초간 명확한 경고 (으르렁, 문 흔들림, 스트로브)
- 플레이어는 이 소리를 듣고 반응해야 함

**공격 결과:**
| 확률 | 결과 | 플레이어 대응 |
|------|------|---------------|
| **60%** | Real Attack | 문을 1초 이상 닫아야 생존 |
| **40%** | Fake-out | 괴물이 물러남 (Heat 낭비 가능) |

**설계 의도**: 매번 도박입니다.
- 문을 닫으면? Heat를 낭비할 수 있음 (40%)
- 무시하면? 60% 확률로 사망

### 2.3 1-Second Pre-Close Rule (반사신경 ≠ 생존)

```
Telegraph 시작 ──[3-5초]──> Impact 시점 (T)
                              ↓
              문이 T-1초 전부터 닫혀있어야 생존

예시:
- Telegraph 시작 (T=0)
- Impact 예정 (T=4초)
- 문이 T=3초 이전에 닫혀있어야 함
- T=3.5초에 닫으면? → DEATH (너무 늦음)
```

**설계 의도**: 반사적 반응이 아닌 **예측**이 필요합니다.

---

## 3. 기술 아키텍처

### 3.1 상태 구조 (Zustand)
```typescript
interface GameState {
  // HEAT SYSTEM
  powerLoad: number;           // 0-100+
  isBlackout: boolean;
  blackoutTimer: number;

  // VIEW SYSTEM
  monitorState: 'ON' | 'OFF' | 'BOOTING';
  bootTimer: number;

  // DOOR SYSTEM
  doorState: 'OPEN' | 'CLOSED';
  isDoorHeld: boolean;
  doorClosedDuration: number;  // 1-Second Rule 추적

  // MONSTER SYSTEM
  monsterState: 'IDLE' | 'APPROACHING' | 'TELEGRAPHING' | 'ATTACKING';
  monsterDistance: number;
  currentTelegraph: TelegraphEvent | null;

  // PUZZLE SYSTEM (기존 유지)
  puzzleDefs: PuzzleModule[];
  currentModuleIndex: number;
  moduleProgress: Record<string, ModuleProgress>;
  editorText: string;
}
```

### 3.2 상수 정의
```typescript
const HEAT = {
  PASSIVE_RATE_ON: 2.0,       // +2%/초
  TYPING_COST: 1.0,           // +1%/키
  COMPILE_COST: 30.0,         // +30%
  DOOR_HOLD_COST: 15.0,       // +15%/초
  COOLING_RATE: 0.5,          // -0.5%/초
  BLACKOUT_THRESHOLD: 100,
  BLACKOUT_DURATION: 5.0,
};

const BOOT = {
  DURATION: 1.5,              // 부팅 시퀀스
};

const MONSTER = {
  BASE_SPEED: 2.0,            // 거리/초
  BLACKOUT_SPEED: 6.0,        // 블랙아웃 시 3배
  ATTACK_THRESHOLD: 10,       // Telegraph 트리거 거리
  TELEGRAPH_MIN: 3.0,         // 최소 경고 시간
  TELEGRAPH_MAX: 5.0,         // 최대 경고 시간
  REAL_ATTACK_CHANCE: 0.6,    // 60% 진짜 공격
  REPEL_DISTANCE_MIN: 50,
  REPEL_DISTANCE_MAX: 80,
};

const DOOR = {
  SAFE_DURATION: 1.0,         // 1-Second Rule
};
```

### 3.3 시스템 파일 구조
```
src/game/systems/
├── heatSystem.ts     # powerLoad 계산, blackout 트리거
├── viewSystem.ts     # ON/OFF/BOOTING 전환
├── doorSystem.ts     # 문 상태 + doorClosedDuration 추적
├── monsterSystem.ts  # 상태 머신 + Telegraph + 60/40 로직
├── effectsSystem.ts  # 글리치, CRT 효과
└── audioSystem.ts    # 거리 기반 믹싱 + Telegraph 사운드
```

---

## 4. UI/UX 설계

### 4.1 Room Layout (CSS-Only, 3분할)
```
┌─────────────────┬─────────────────────────┬─────────────────────┐
│                 │                         │                     │
│   HALLWAY       │      DESK & MONITOR     │    CHALKBOARD       │
│   & DOOR        │                         │                     │
│                 │      ┌───────────┐      │   "DON'T LOOK       │
│   ┌─────────┐   │      │  MONITOR  │      │    BACK"            │
│   │ ▓▓▓▓▓▓▓ │   │      │   (OFF)   │      │                     │
│   │ 👁️   👁️ │   │      │  ▓▓▓▓▓▓▓  │      │   "SYNTAX ERROR     │
│   │ ▓▓▓▓▓▓▓ │   │      └───────────┘      │    = DEATH"         │
│   └─────────┘   │      ┌───────────┐      │                     │
│                 │      │   DESK    │      │   "HOLD THE DOOR    │
│   [STROBE]      │      └───────────┘      │    FOR 1 SECOND"    │
│                 │                         │                     │
├─────────────────┴─────────────────────────┴─────────────────────┤
│  HEAT: ████████████░░░░░░░░ 62%  │  [SPACE: Hold Door]  │  TAB  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Monitor View (코딩 모드)
```
╔═══════════════════════════════════════════════════════════╗
║  DEADLOCK OS v0.0.1                              [■][□][×]║
╠═══════════════════════════════════════════════════════════╣
║  > MODULE: NETWORK_AUTH                                   ║
║  > Decrypt the authentication token...                    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ const token = decrypt(                              │  ║
║  │   "xK9#mL2@",                                       │  ║
║  │   ____                                              │  ║
║  │ );                                                  │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║  [HINT: 0]  [RESET]                         [COMPILE]     ║
╠═══════════════════════════════════════════════════════════╣
║  HEAT: ████████████████░░░░ 78% ▲    [TAB: Turn OFF]      ║
╚═══════════════════════════════════════════════════════════╝
```

### 4.3 Door UI 요소
- **문 상태**: 열림/닫힘 애니메이션 (Framer Motion)
- **1-Second 인디케이터**: 닫힌 시간 표시 (0.0s → 1.0s → ✓ SECURED)
- **스트로브 조명**: 불규칙 깜빡임 (0.5-2초 간격)
- **괴물 눈**: 거리 기반 크기/밝기 (distance < 50에서만 표시)

---

## 5. 오디오 설계

### 5.1 No Visual HUD - Sound-First Horror
괴물의 위치는 **소리로만** 알 수 있습니다:

| 거리 | 사운드 | 볼륨 |
|------|--------|------|
| 100-50 | 환경 허밍 | 0.2 |
| 50-20 | 발소리 | 0.5 |
| 20-10 | 거친 숨소리 | 0.8 |
| < 10 | 문 덜컹거림 (Telegraph) | 1.0 |

### 5.2 Telegraph Audio (공격 경고)
괴물은 **절대 조용히 공격하지 않습니다**:
- 문 손잡이 덜컹거림
- 으르렁거리는 소리
- 스트로브 조명 광란

이 소리가 들리면 3-5초 내에 결정해야 합니다:
- 문을 닫는다 (Heat 소모, 40% 낭비 가능성)
- 무시한다 (60% 사망 위험)

---

## 6. 구현 로드맵

### Phase 1: Foundation (Day 1)
- [x] 문서 업데이트 (v2.0)
- [ ] Heat System 구현
- [ ] View System (ON/OFF/BOOTING)
- [ ] Door System (hold + duration tracking)

### Phase 2: Monster AI (Day 2)
- [ ] Monster State Machine
- [ ] Telegraph System (3-5s warning)
- [ ] 60/40 Real vs Fake Logic
- [ ] 1-Second Pre-Close Rule

### Phase 3: UI/UX (Day 3)
- [ ] CSS-only Room Layout
- [ ] Door + Strobe + Monster Eyes
- [ ] Heat Bar
- [ ] Monitor View Integration

### Phase 4: Audio (Day 4)
- [ ] Distance-based audio mixing
- [ ] Telegraph sound cues
- [ ] Event sounds (compile, blackout, etc.)

### Phase 5: Polish (Day 5)
- [ ] CRT + Glitch effects
- [ ] Final Compile sequence
- [ ] 4 Endings
- [ ] Balance tuning
- [ ] Deploy

---

## 7. 핵심 플레이 시나리오

### 시나리오 A: 성공적인 방어
```
1. 코딩 중 (Heat 55%)
2. 발소리 커짐 → 괴물 접근
3. 으르렁 소리 → Telegraph 시작! (Real, 4초)
4. TAB → 모니터 OFF
5. SPACE 홀드 → 문 닫힘 (Heat +15%/초)
6. 1초 경과 → "✓ SECURED"
7. Impact 시점 → 문 닫혀있음 → 괴물 격퇴!
8. 괴물 Distance 65로 리셋
9. SPACE 뗌, TAB → 코딩 재개
```

### 시나리오 B: 성공적인 무시 (도박 승리)
```
1. Telegraph 시작 (Fake, 3.5초)
2. 플레이어: "Heat 아껴야지... 무시한다"
3. Impact 시점 → Fake였음 → 괴물 물러남
4. Heat 절약 성공!
```

### 시나리오 C: 늦은 반응 (사망)
```
1. Telegraph 시작 (Real, 4초)
2. 플레이어: T=3.2초에 반응
3. 문 닫힘 → 0.8초만 유지됨
4. Impact (T=4초) → 1초 미달 → BREACH
5. 점프스케어 → GAME OVER
```

### 시나리오 D: 블랙아웃 사망
```
1. Heat 93%, 마지막 컴파일!
2. 컴파일 (+30%) → Heat 123%
3. BLACKOUT 발동 → 5초 무력화
4. 문 강제 OPEN
5. 괴물 3배속 접근
6. Telegraph 시작 → 문 못 닫음
7. BREACH → GAME OVER
```

---

## 8. 기존 코드와의 통합

### 유지
- 퍼즐 시스템 (5개 모듈, validation)
- 글리치 효과 (display only)
- 4개 엔딩 분기 (조건만 수정)
- AudioManager 구조

### 대체
| 기존 | 새로운 |
|------|--------|
| `monsterDistance` 자동 감소 | Telegraph 기반 공격 |
| `viewMode` (MONITOR/DOOR) | `monitorState` (ON/OFF/BOOTING) |
| 태스크 시스템 (boost) | Heat System (대체) |
| ParallaxRoom | CSS-only Room |

### 새로운 엔딩 조건
```typescript
function determineEnding(): EndingType {
  const { totalMistakes, hintsUsed, neverClosedDoor } = getState();

  // Secret: 문을 한 번도 안 닫고 클리어 (극한 도박)
  if (neverClosedDoor) return 'secret';

  // Good: 실수 3회 이하, 힌트 2회 이하
  if (totalMistakes <= 3 && hintsUsed <= 2) return 'good';

  // Neutral: 실수 8회 이하
  if (totalMistakes <= 8) return 'neutral';

  // Bad: 많은 실수
  return 'bad';
}
```

---

## 9. 밸런스 가이드라인

### Heat 경제
- **목표**: 플레이어가 항상 Heat를 의식하되, 블랙아웃은 실수의 결과여야 함
- **테스트**: 평균 플레이에서 Heat 40-70% 유지가 "정상"
- **조정 포인트**: `HEAT.PASSIVE_RATE_ON`, `HEAT.COOLING_RATE`

### 60/40 도박
- **목표**: 긴장감 있지만 불공평하지 않음
- **테스트**: 플레이어가 "내 선택이었다"고 느껴야 함
- **주의**: 연속 Real 공격은 frustrating → pseudo-random 고려

### Telegraph 타이밍
- **목표**: 충분한 반응 시간이지만 긴장감 유지
- **테스트**: 3초 = 긴장, 5초 = 여유
- **조정 포인트**: `MONSTER.TELEGRAPH_MIN`, `MONSTER.TELEGRAPH_MAX`

---

## 10. 완료 조건 (Definition of Done)

### Must Have (필수)
- [ ] Heat System 완전 동작
- [ ] View Switching (ON/OFF/BOOTING) 동작
- [ ] Door System + 1-Second Rule 동작
- [ ] Monster AI + Telegraph + 60/40 동작
- [ ] CSS-only Room Layout
- [ ] 5개 퍼즐 모듈 완료 가능
- [ ] Final Compile 60초 + 엔딩
- [ ] Game Over 처리
- [ ] 배포 완료

### Should Have (권장)
- [ ] Strobe Light 효과
- [ ] Monster Eyes (거리 기반)
- [ ] Chalkboard 힌트
- [ ] 거리 기반 공포 사운드
- [ ] Boot Sequence 애니메이션

### Nice to Have (시간 남으면)
- [ ] Secret 엔딩
- [ ] localStorage 체크포인트
- [ ] 볼륨 슬라이더 UI

---

## 11. 관련 문서

| 문서 | 내용 |
|------|------|
| [00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md) | 프로젝트 전체 개요 |
| [01-GAME-DESIGN.md](./01-GAME-DESIGN.md) | 게임 메카닉 상세 |
| [02-TECHNICAL-SPEC.md](./02-TECHNICAL-SPEC.md) | 기술 스펙, 타입, API |
| [03-CONTENT-SPEC.md](./03-CONTENT-SPEC.md) | 퍼즐/스토리 콘텐츠 |
| [04-AUDIO-VISUAL-SPEC.md](./04-AUDIO-VISUAL-SPEC.md) | 오디오/비주얼 스펙 |
| [05-IMPLEMENTATION-GUIDE.md](./05-IMPLEMENTATION-GUIDE.md) | 구현 가이드 |
