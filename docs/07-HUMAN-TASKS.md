# DEADLOCK - Human Tasks Checklist

## Overview

이 문서는 **AI Agent가 자동으로 할 수 없는 작업**들을 정리합니다.
주로 에셋 준비, 외부 서비스 설정, 창의적 결정이 필요한 작업들입니다.

---

## 1. 오디오 에셋 준비 (필수)

### 1.1 필수 오디오 파일 (최소 5개)

| 파일명 | 길이 | 타입 | 설명 | 구하는 방법 |
|--------|------|------|------|-------------|
| `ambience.webm/.mp3` | 30-60s | Loop | 서버룸 웅웅 소리 | 아래 참조 |
| `heartbeat.webm/.mp3` | 2-3s | Loop | 심장 박동 | 아래 참조 |
| `footsteps.webm/.mp3` | 1.5-2s | Loop | 발끌기 소리 | 아래 참조 |
| `breathing.webm/.mp3` | 3-4s | Loop | 거친 숨소리 | 아래 참조 |
| `sfx.webm/.mp3` | ~10s | Sprite | 효과음 모음 | 직접 합성 |

### 1.2 오디오 구하는 방법

#### Option A: 무료 사운드 라이브러리 (추천)
```
1. Freesound.org (무료, 크레딧 필요)
   - 검색: "server room ambience"
   - 검색: "heartbeat loop"
   - 검색: "footsteps drag horror"
   - 검색: "heavy breathing horror"

2. Pixabay Audio (무료, 상업적 사용 가능)
   - https://pixabay.com/sound-effects/

3. Zapsplat (무료 계정 필요)
   - https://www.zapsplat.com/
```

#### Option B: AI 생성 (실험적)
```
1. Suno AI - 음악/사운드 생성
2. ElevenLabs - 음성/숨소리
3. Stable Audio - 효과음
```

#### Option C: 직접 녹음
```
- 심장박동: 손으로 책상 두드리기 + 저음 이퀄라이저
- 발소리: 바닥에 발 끌기 녹음
- 숨소리: 직접 숨쉬기 녹음 (거칠게)
```

### 1.3 오디오 편집 체크리스트

- [ ] 모든 파일 WebM + MP3 두 포맷으로 저장
- [ ] 루프 파일은 끊김 없이 연결되는지 확인
- [ ] 볼륨 정규화 (-14 LUFS 권장)
- [ ] 파일을 `/public/audio/` 폴더에 저장

### 1.4 SFX Sprite 구성

sfx.webm/mp3 파일 하나에 다음 소리들을 순서대로 합성:

| ID | 시작(ms) | 길이(ms) | 내용 |
|----|----------|----------|------|
| typing | 0 | 100 | 키보드 클릭 |
| error | 200 | 500 | 에러 비프 |
| success | 800 | 700 | 성공 차임 |
| glitch | 1600 | 400 | 디지털 노이즈 |
| doorCreak | 2100 | 1200 | 문 삐걱 |
| taskAssign | 3400 | 800 | 발소리 멀어짐 |
| taskReturn | 4300 | 1000 | 발소리 다가옴 |
| jumpscare | 5400 | 600 | 고주파 비명 |
| compileStart | 6100 | 1500 | 기계 작동음 |
| compileSuccess | 7700 | 2000 | 승리 팡파레 |

**도구:** Audacity (무료) 사용하여 합성

---

## 2. 이미지 에셋 준비 (권장)

### 2.1 필수 이미지

| 파일명 | 크기 | 설명 | 구하는 방법 |
|--------|------|------|-------------|
| `noise.png` | 128x128 | 타일 노이즈 텍스처 | 아래 참조 |

### 2.2 선택 이미지 (있으면 더 좋음)

| 파일명 | 크기 | 설명 |
|--------|------|------|
| `room-bg.png` | 1920x1080 | 서버룸 배경 (문 포함) |
| `desk.png` | 1920x1080 | 책상 레이어 (투명 배경) |
| `monster-silhouette.png` | 200x400 | 문 창문에 비치는 그림자 |

### 2.3 노이즈 텍스처 만들기

#### Option A: 온라인 생성기
```
https://www.noisetexturegenerator.com/
- Type: White noise
- Size: 128x128
- Download as PNG
```

#### Option B: Photoshop/GIMP
```
1. 새 캔버스 128x128
2. 필터 → 노이즈 추가 (Gaussian, 20%)
3. 흑백으로 변환
4. PNG로 저장
```

### 2.4 AI 이미지 생성 프롬프트 (선택)

#### 서버룸 배경
```
"1980s corporate server room at night, dark and eerie atmosphere,
rows of old computer equipment with blinking lights, single metal door
with small reinforced window, green emergency exit sign above door,
dim fluorescent lighting with shadows, cinematic horror movie style,
photorealistic, 4K, wide angle shot, vignette effect on edges"
```

#### 책상 레이어
```
"Old wooden office desk from above angle, vintage CRT monitor off-screen,
mechanical keyboard, scattered papers, cold coffee mug, desk lamp off,
horror game aesthetic, dark atmosphere, transparent background PNG,
photorealistic details, 4K quality"
```

---

## 3. 폰트 설정 (선택)

### 3.1 추천 폰트

| 용도 | 폰트 | 링크 |
|------|------|------|
| 코드/터미널 | IBM Plex Mono | Google Fonts |
| UI 텍스트 | Inter | Google Fonts |
| 타이틀 | VT323 (레트로) | Google Fonts |

### 3.2 Google Fonts 추가 방법

```html
<!-- index.html <head>에 추가 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=VT323&display=swap" rel="stylesheet">
```

---

## 4. 배포 설정

### 4.1 Vercel 계정 생성
- [ ] https://vercel.com 가입
- [ ] GitHub 연동

### 4.2 Netlify 대안
- [ ] https://netlify.com 가입
- [ ] GitHub 연동 또는 드래그앤드롭

### 4.3 도메인 설정 (선택)
- [ ] 커스텀 도메인 구매 (필요시)
- [ ] DNS 설정

---

## 5. 게임 밸런스 테스트

AI가 할 수 없는 "느낌" 테스트:

### 5.1 공포 체감 테스트
- [ ] 혼자서 어두운 방에서 플레이
- [ ] 헤드폰 착용 필수
- [ ] 심장이 두근거리는 순간이 있는가?
- [ ] 문 보고 싶은 충동이 드는가?

### 5.2 난이도 체감 테스트
- [ ] 첫 플레이에서 클리어 가능한가?
- [ ] 너무 쉽지는 않은가?
- [ ] 불공정하다고 느껴지는 순간이 있는가?
- [ ] Task 선택에 전략적 고민이 있는가?

### 5.3 밸런스 조정 포인트

조정이 필요하면 `constants.ts`에서:
```typescript
// 너무 쉬우면:
BALANCE.BASE_SPEED = 1.5;  // 1.2에서 증가
BALANCE.COMPILE_DURATION = 75;  // 60에서 증가

// 너무 어려우면:
BALANCE.BASE_SPEED = 1.0;  // 1.2에서 감소
BALANCE.FAIL_PENALTY.phase1 = 6;  // 8에서 감소
```

---

## 6. 플레이테스터 모집 (선택)

### 6.1 테스터에게 물어볼 질문
1. 무서웠나요? (1-10)
2. 어디서 가장 긴장됐나요?
3. 불공정하다고 느낀 순간이 있나요?
4. 버그를 발견했나요?
5. 다시 플레이하고 싶나요?

### 6.2 피드백 수집
- [ ] Google Forms 설문 생성
- [ ] Discord 채널 개설
- [ ] 녹화 요청 (선택)

---

## 7. 크레딧 및 라이선스

### 7.1 사용한 에셋 크레딧 정리

게임 내 또는 README에 포함:

```
=== CREDITS ===

Audio:
- Ambience: [출처 및 작성자]
- Heartbeat: [출처 및 작성자]
- [기타 오디오...]

Fonts:
- IBM Plex Mono by IBM (SIL Open Font License)

Libraries:
- React (MIT License)
- Zustand (MIT License)
- Framer Motion (MIT License)
- Howler.js (MIT License)
- Tailwind CSS (MIT License)
```

### 7.2 라이선스 확인 체크리스트
- [ ] 모든 오디오 상업적 사용 가능 확인
- [ ] 모든 이미지 라이선스 확인
- [ ] 폰트 라이선스 확인
- [ ] 오픈소스 라이브러리 라이선스 준수

---

## 8. 마케팅/공유 (선택)

### 8.1 스크린샷 촬영
- [ ] 타이틀 화면
- [ ] 게임플레이 (긴장되는 순간)
- [ ] Game Over 화면
- [ ] 엔딩 화면

### 8.2 GIF/영상 제작
- [ ] 15-30초 게임플레이 GIF
- [ ] 1분 트레일러 (선택)

### 8.3 공유 플랫폼
- [ ] itch.io 업로드
- [ ] GitHub README
- [ ] Twitter/X 공유
- [ ] Reddit (r/WebGames, r/indiegaming)

---

## Quick Reference: 최소 필수 작업

**반드시 해야 하는 것 (없으면 게임 안됨):**
1. [ ] `ambience.webm/.mp3` 준비
2. [ ] `heartbeat.webm/.mp3` 준비
3. [ ] `sfx.webm/.mp3` 준비 (최소 error, success)
4. [ ] `noise.png` 준비
5. [ ] Vercel/Netlify 계정

**강력 권장 (없으면 공포 반감):**
1. [ ] `footsteps.webm/.mp3` 준비
2. [ ] `breathing.webm/.mp3` 준비
3. [ ] 전체 SFX sprite 완성

**있으면 좋음:**
1. [ ] 배경 이미지
2. [ ] 커스텀 폰트
3. [ ] 플레이테스트 피드백

---

## 예상 소요 시간

| 작업 | 예상 시간 |
|------|-----------|
| 오디오 검색 & 다운로드 | 1-2시간 |
| 오디오 편집 (Audacity) | 1-2시간 |
| 노이즈 텍스처 생성 | 15분 |
| AI 이미지 생성 (선택) | 1시간 |
| 배포 설정 | 30분 |
| 플레이테스트 | 2-3시간 |
| **총계** | **~6-8시간** |

이 작업들은 코딩과 병렬로 진행할 수 있습니다!
