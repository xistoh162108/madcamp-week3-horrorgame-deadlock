# DEADLOCK: The Admin of Room 104

## Project Overview Document

**Version:** 3.3.0 (Diegetic UI Update)
**Last Updated:** 2026-01-27
**Platform:** Web (React + Vite + Tailwind CSS)
**Visual Style:** CSS-driven "Dark Server Room" (No external image assets)

---

## 1. Game Identity

### 1.1 One-Line Description
> 플레이어는 서버실에 갇혀 탈출 스크립트를 코딩해야 한다. 하지만 모니터를 켜면 Heat가 쌓이고, 괴물은 소리로만 감지할 수 있으며, 진짜 공격인지 페이크인지 **도박**해야 한다.

### 1.2 Genre Tags
- 2D Psychological Horror
- Coding Simulation
- Survival
- Resource Management

### 1.3 Core Fantasy
> "내 익숙한 코딩 화면이 생존 전장이 된다. 소리에 귀 기울이고, 공포와 자원 사이에서 도박해야 한다."

### 1.4 Unique Selling Points
1. **Heat Debt System** - 모든 행동에 비용, 느린 회복
2. **Diegetic UI** - HUD가 없음. 모든 정보는 서버 랙의 게이지와 LED로 확인
3. **Entropy System** - 진행될수록 열 발생 증가, 냉각 성능 하락
4. **Integrated Defense** - 인터콤, 아크 플래시 등 물리적 장치 조작
5. **The Play Dead Gamble** - 침입 시 30% 확률의 공포(Music Box)를 동반한 도박

---

## 2. The Core Loop

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
│  • Heat 쿨링: -0.5%/초 (진행할수록 느려짐)                   │
│  • 상호작용: 인터콤(RESET), 아크 플래시(REPEL), 문 닫기(SPACE) │
│  • 특수: 죽은 척하기 (침입 시 최후의 수단, 70% 생존)          │
└─────────────────────────────────────────────────────────────┘

                Heat > 100% → BLACKOUT (5초, 모든 방어 수단 차단)
```

---

## 3. The Horror: Audio Telegraph & 60/40 Gamble

### 3.1 괴물은 절대 조용히 공격하지 않습니다

공격 전 **3-5초** 동안 명확한 "Aggressive Cue"가 재생됩니다:
- 문 손잡이 덜컹거림
- 으르렁거리는 소리
- 스트로브 조명 광란

### 3.2 진짜인가, 페이크인가? (60/40)

| 확률 | 결과 | 플레이어 반응 |
|------|------|--------------|
| **60%** | Real Attack | 문을 1초 이상 닫아야 생존 |
| **40%** | Fake-out | 괴물이 물러남 (Heat 낭비 가능) |

**설계 의도**: 매번 도박입니다.
- 문을 닫으면? Heat를 낭비할 수 있음 (40%)
- 무시하면? 60% 확률로 죽음

### 3.3 The 1-Second Pre-Close Rule

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

---

## 4. Target Metrics

### 4.1 Playtime
| Metric | Target |
|--------|--------|
| First Clear | 10-15분 |
| Speedrun | 7분 |
| Full Exploration | 20분 |

### 4.2 Technical Targets
| Metric | Target |
|--------|--------|
| Initial Load | < 3초 |
| Frame Rate | 60fps stable |
| Memory | < 200MB |
| Bundle Size | < 5MB |

### 4.3 Horror Metrics
| Metric | Target |
|--------|--------|
| "심장 뛰었다" 순간 | 최소 3회 per playthrough |
| Jump Scare | 최대 2회 (남용 금지) |
| 긴장 지속 구간 | Phase 2 이후 70% |

---

## 5. Tech Stack

### 5.1 Core Dependencies
```json
{
  "react": "^18.3.1",
  "vite": "^6.0.5",
  "typescript": "^5.6.0",
  "tailwindcss": "^3.4.17",
  "zustand": "^4.5.7",
  "framer-motion": "^11.18.2",
  "howler": "^2.2.4"
}
```

### 5.2 Development Tools
- **IDE:** VSCode with TypeScript, Tailwind IntelliSense
- **Browser:** Chrome DevTools (Performance tab)
- **Audio:** AI-generated or Audacity

### 5.3 Deployment
- **Host:** Vercel or Netlify
- **CI/CD:** GitHub Actions (optional)

---

## 6. File Structure (New)

```
src/
├── game/
│   ├── store.ts              # Zustand 전체 상태
│   ├── types.ts              # TypeScript 타입
│   ├── constants.ts          # HEAT, MONSTER, DOOR 상수
│   ├── systems/
│   │   ├── heatSystem.ts     # 🆕 Heat 로직
│   │   ├── monsterSystem.ts  # 🔄 Telegraph + 60/40 + Breach
│   │   ├── doorSystem.ts     # 🆕 1-Second Rule 타이머
│   │   ├── viewSystem.ts     # 🆕 ON/OFF/BOOTING
│   │   ├── puzzleSystem.ts   # 유지
│   │   └── audioSystem.ts    # 🔄 거리 기반
│   └── loop/
│       └── useGameLoop.ts    # 🔄 새 시스템 통합
├── ui/
│   ├── room/                 # 🆕 CSS-only Room
│   │   ├── RoomLayout.tsx    # 3분할 레이아웃
│   │   ├── HallwaySection.tsx
│   │   ├── DeskSection.tsx
│   │   ├── ChalkboardSection.tsx
│   │   ├── Door.tsx          # 문 + 1-Second 인디케이터
│   │   ├── StrobeLight.tsx
│   │   └── MonsterEyes.tsx
│   ├── panels/
│   │   ├── CodeEditor.tsx    # 🔄 타이핑 비용 추가
│   │   ├── HeatBar.tsx       # 🆕
│   │   └── Terminal.tsx
│   └── overlays/
│       ├── BootSequence.tsx  # 🆕
│       ├── BlackoutOverlay.tsx # 🆕
│       └── EndScreens.tsx
```

---

## 7. Definition of Done (완료 조건)

### 7.1 Must Have (필수)
- [x] Heat System (powerLoad 0-100+, 블랙아웃)
- [x] View Switching (ON/OFF/BOOTING, 1.5초 부팅)
- [x] Door System (1-Second Rule 타이머)
- [x] Monster AI (Telegraph + 60/40 Real/Fake)
- [ ] Diegetic UI Overhaul (HUD 제거, 서버 랙 통합)
- [ ] Entropy System (난이도 가변 적용)
- [ ] Defense Mechanics (Intercom, Arc Flash)
- [ ] Play Dead Logic (침입 시 생존 도박)
- [ ] Final Compile 60초 + 엔딩

### 7.2 Should Have (권장)
- [ ] Strobe Light 효과
- [ ] Monster Eyes (거리 기반)
- [ ] Chalkboard (힌트)
- [ ] 거리 기반 공포 사운드
- [ ] Boot Sequence 애니메이션

### 7.3 Nice to Have (시간 남으면)
- [ ] Secret 엔딩
- [ ] localStorage 체크포인트
- [ ] 볼륨 슬라이더 UI

---

## 8. Document Index

| Document | Purpose |
|----------|---------|
| [01-GAME-DESIGN.md](./01-GAME-DESIGN.md) | 게임 메카닉 상세 (Heat, 60/40, 1-Second Rule) |
| [02-TECHNICAL-SPEC.md](./02-TECHNICAL-SPEC.md) | 상태 스키마, 시스템 API, 코드 구조 |
| [03-CONTENT-SPEC.md](./03-CONTENT-SPEC.md) | 퍼즐/스토리 콘텐츠 |
| [04-AUDIO-VISUAL-SPEC.md](./04-AUDIO-VISUAL-SPEC.md) | 오디오 스펙, CSS 비주얼 |
| [05-IMPLEMENTATION-GUIDE.md](./05-IMPLEMENTATION-GUIDE.md) | Phase별 구현 가이드 |
| [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md) | 마스터 개선 계획 |
