# DEADLOCK - QA Checklist

## 1. Core Functionality Tests

### 1.1 Game Start
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| START-01 | 시작 화면 표시 | 타이틀, 로딩 바, 시작 버튼 보임 | [ ] |
| START-02 | 에셋 로딩 | 프로그레스 바가 진행됨 | [ ] |
| START-03 | 로딩 완료 후 시작 버튼 | 버튼 활성화됨 | [ ] |
| START-04 | 시작 버튼 클릭 | 게임 시작, intro phase로 전환 | [ ] |
| START-05 | 오디오 자동재생 | ambience 루프 시작 | [ ] |

### 1.2 Monster System
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| MON-01 | 초기 distance | 100에서 시작 | [ ] |
| MON-02 | distance 감소 | 시간이 지나면 감소 | [ ] |
| MON-03 | threat 계산 | distance 감소 → threat 증가 | [ ] |
| MON-04 | distance = 0 | Game Over 트리거 | [ ] |
| MON-05 | Phase별 속도 | 각 Phase에서 속도 다름 | [ ] |
| MON-06 | dt cap | 탭 전환 후 복귀해도 급격한 변화 없음 | [ ] |

### 1.3 Task System
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| TASK-01 | Task 할당 | distance 증가 | [ ] |
| TASK-02 | 쿨다운 시작 | 할당 후 버튼 비활성화 | [ ] |
| TASK-03 | 쿨다운 완료 | 시간 후 버튼 다시 활성화 | [ ] |
| TASK-04 | 학습 감쇠 | 같은 Task 반복 시 효과 감소 | [ ] |
| TASK-05 | Active Task 중복 방지 | Task 진행 중 다른 Task 할당 불가 | [ ] |
| TASK-06 | Task 복귀 페널티 | returnPenalty 적용됨 | [ ] |
| TASK-07 | serverCheck 속도 증가 | 영구적으로 monsterSpeed 증가 | [ ] |
| TASK-08 | garbageCollection 블랙아웃 | 2초간 화면 어두워짐 | [ ] |
| TASK-09 | packetCapture 힌트 | hintToken +1 | [ ] |
| TASK-10 | codeReview 입력 지연 | inputLag 적용됨 | [ ] |
| TASK-11 | Final Compile 중 Task | 모든 Task 비활성화 | [ ] |

### 1.4 Puzzle System
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| PUZ-01 | 첫 퍼즐 표시 | prompt와 starterCode 표시 | [ ] |
| PUZ-02 | 정답 입력 | 성공 메시지 + 다음 스텝 | [ ] |
| PUZ-03 | 오답 입력 | 에러 메시지 + 페널티 | [ ] |
| PUZ-04 | 모듈 완료 | 다음 모듈로 진행 | [ ] |
| PUZ-05 | mustInclude 검증 | 토큰 포함 시 통과 | [ ] |
| PUZ-06 | exact 검증 | 정확히 일치해야 통과 | [ ] |
| PUZ-07 | 공백 정규화 | 여분의 공백 무시 | [ ] |
| PUZ-08 | 힌트 사용 | 힌트 표시 + hintTokens 감소 | [ ] |
| PUZ-09 | 터미널 로그 | 성공/실패 메시지 표시 | [ ] |

### 1.5 Progression System
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| PROG-01 | intro → phase1 | 첫 Task 후 전환 | [ ] |
| PROG-02 | phase1 → phase2 | 2개 모듈 완료 후 전환 | [ ] |
| PROG-03 | phase2 → phase3 | 3개 모듈 완료 후 전환 | [ ] |
| PROG-04 | phase3 → finalCompile | 5개 모듈 완료 후 전환 | [ ] |
| PROG-05 | Final Compile 시작 | 60초 카운트다운 시작 | [ ] |
| PROG-06 | Compile 진행률 | 0%에서 100%로 증가 | [ ] |
| PROG-07 | Compile 완료 | 엔딩 화면 표시 | [ ] |

### 1.6 Endings
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| END-01 | Good 엔딩 조건 | mistakes ≤ 3, hints ≤ 2 | [ ] |
| END-02 | Neutral 엔딩 조건 | mistakes ≤ 8 | [ ] |
| END-03 | Bad 엔딩 조건 | mistakes > 8 | [ ] |
| END-04 | Secret 엔딩 조건 | !usedServerCheck && neverLookedAtDoor | [ ] |
| END-05 | Game Over 화면 | 점프스케어 + 재시작 버튼 | [ ] |
| END-06 | 엔딩 통계 표시 | 시간, 실수, 힌트, Task 수 | [ ] |
| END-07 | 재시작 버튼 | 게임 초기화 + 시작 화면 | [ ] |

---

## 2. UI/UX Tests

### 2.1 View Mode (Look Up)
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| VIEW-01 | 기본 상태 | MONITOR 모드 | [ ] |
| VIEW-02 | 상단 20% 마우스 진입 | DOOR 모드 전환 | [ ] |
| VIEW-03 | DOOR 모드 | 방 배경 선명, 모니터 흐림 | [ ] |
| VIEW-04 | DOOR 모드 입력 | CodeEditor 비활성화 | [ ] |
| VIEW-05 | 마우스 벗어남 | MONITOR 모드 복귀 | [ ] |
| VIEW-06 | 전환 애니메이션 | 부드러운 400ms 전환 | [ ] |

### 2.2 Parallax
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| PARA-01 | 마우스 이동 | 레이어별 다른 이동량 | [ ] |
| PARA-02 | 배경 레이어 | 10px 이동 | [ ] |
| PARA-03 | 중간 레이어 | 6px 이동 | [ ] |
| PARA-04 | 전경 레이어 | 3px 이동 | [ ] |
| PARA-05 | 스프링 댐핑 | 부드러운 움직임, 끊김 없음 | [ ] |

### 2.3 Flashlight
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| FLASH-01 | 기본 상태 | 마우스 위치에 밝은 원 | [ ] |
| FLASH-02 | threat 증가 | 원 반경 감소 | [ ] |
| FLASH-03 | 높은 threat | 플리커 효과 | [ ] |
| FLASH-04 | 블랙아웃 | 완전히 어두움 | [ ] |
| FLASH-05 | 블랙아웃 해제 | 2초 후 복구 | [ ] |

### 2.4 CRT Effects
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| CRT-01 | 스캔라인 | 수평선 보임 | [ ] |
| CRT-02 | 노이즈 | 미세한 노이즈 움직임 | [ ] |
| CRT-03 | 비네트 | 가장자리 어두움 | [ ] |
| CRT-04 | 플리커 | 높은 threat에서 깜빡임 | [ ] |

### 2.5 Glitch Effects
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| GLIT-01 | 낮은 threat | 글리치 없음 | [ ] |
| GLIT-02 | 높은 threat | 크로마틱 수차 | [ ] |
| GLIT-03 | 글리치 스파이크 | 일시적 강한 글리치 | [ ] |
| GLIT-04 | 코드 부패 표시 | "HELP ME" 등 표시 | [ ] |
| GLIT-05 | 검증 무결성 | 표시 부패와 무관하게 검증 정확 | [ ] |

---

## 3. Audio Tests

### 3.1 Background Audio
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| AUD-01 | Ambience | 게임 시작 시 재생 | [ ] |
| AUD-02 | Heartbeat (낮은 threat) | 거의 안 들림 | [ ] |
| AUD-03 | Heartbeat (높은 threat) | 크게 들림 | [ ] |
| AUD-04 | Footsteps (Task 없음) | threat에 따라 볼륨 | [ ] |
| AUD-05 | Footsteps (Task 진행 중) | 음소거 | [ ] |
| AUD-06 | Breathing (threat < 0.5) | 음소거 | [ ] |
| AUD-07 | Breathing (threat > 0.5) | 볼륨 증가 | [ ] |

### 3.2 SFX
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| SFX-01 | 퍼즐 성공 | success 사운드 | [ ] |
| SFX-02 | 퍼즐 실패 | error 사운드 | [ ] |
| SFX-03 | Task 할당 | taskAssign 사운드 | [ ] |
| SFX-04 | Task 복귀 | taskReturn 사운드 | [ ] |
| SFX-05 | 글리치 스파이크 | glitch 사운드 | [ ] |
| SFX-06 | Game Over | jumpscare 사운드 | [ ] |
| SFX-07 | Compile 시작 | compileStart 사운드 | [ ] |
| SFX-08 | Compile 성공 | compileSuccess 사운드 | [ ] |

### 3.3 Audio Controls
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| CTRL-01 | 음소거 토글 | 모든 오디오 음소거 | [ ] |
| CTRL-02 | 음소거 해제 | 오디오 복구 | [ ] |
| CTRL-03 | 볼륨 조절 | 마스터 볼륨 조절 | [ ] |

---

## 4. Edge Cases & Stress Tests

### 4.1 Rapid Interaction
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| EDGE-01 | Task 버튼 연타 | 한 번만 할당됨 | [ ] |
| EDGE-02 | Submit 연타 | 중복 제출 방지 | [ ] |
| EDGE-03 | View 모드 빠른 전환 | 애니메이션 정상 | [ ] |

### 4.2 Browser Behavior
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| EDGE-04 | 탭 전환 후 복귀 | 게임 상태 유지, dt cap 작동 | [ ] |
| EDGE-05 | 창 최소화 후 복귀 | 정상 동작 | [ ] |
| EDGE-06 | 브라우저 뒤로 가기 | 적절한 처리 | [ ] |
| EDGE-07 | 페이지 새로고침 | 시작 화면으로 | [ ] |

### 4.3 Memory & Performance
| Test ID | Test Case | Expected Result | Pass |
|---------|-----------|-----------------|------|
| PERF-01 | 10분 플레이 | 메모리 안정 (< 200MB) | [ ] |
| PERF-02 | 프레임 레이트 | 60fps 유지 | [ ] |
| PERF-03 | 오디오 루프 | 메모리 누수 없음 | [ ] |

---

## 5. Compatibility Tests

### 5.1 Browser Support
| Browser | Version | Result | Notes |
|---------|---------|--------|-------|
| Chrome | Latest | [ ] | |
| Firefox | Latest | [ ] | |
| Safari | Latest | [ ] | |
| Edge | Latest | [ ] | |

### 5.2 Screen Sizes
| Size | Resolution | Result | Notes |
|------|------------|--------|-------|
| Desktop Large | 1920x1080 | [ ] | |
| Desktop Medium | 1440x900 | [ ] | |
| Desktop Small | 1280x720 | [ ] | |
| Laptop | 1366x768 | [ ] | |

---

## 6. Scenario Tests

### 6.1 Full Playthrough Scenarios

#### Scenario A: Normal Play (예상 12분)
```
1. 시작 화면에서 시작
2. 각 모듈 1-2회 실패 허용
3. Task 10-15회 사용
4. 문 가끔 확인
5. Final Compile 완료
Expected: Neutral 엔딩
```
- [ ] Pass

#### Scenario B: Perfect Play (예상 10분)
```
1. 모든 퍼즐 첫 시도 성공
2. Task 최소 사용
3. 문 절대 안 봄
4. serverCheck 미사용
Expected: Secret 엔딩
```
- [ ] Pass

#### Scenario C: Struggling Play (예상 15분)
```
1. 많은 퍼즐 실패 (8회 이상)
2. 힌트 많이 사용
3. Task 과다 사용
Expected: Bad 엔딩
```
- [ ] Pass

#### Scenario D: Death Scenario
```
1. Task 전혀 사용 안 함
2. distance 0까지 대기
Expected: Game Over
```
- [ ] Pass

### 6.2 Specific Tests

#### Test: Task Learning Decay
```
1. 게임 시작
2. copy Task 5회 연속 사용
3. 각 사용마다 distance boost 기록
Expected: 18 → 14.8 → 12.1 → 9.9 → 8.1 (점점 감소)
```
- [ ] Pass

#### Test: Glitch Fairness
```
1. 높은 threat 상태 유지
2. 코드 입력 (표시가 부패되어 보임)
3. 정확한 답 입력 후 Submit
Expected: 성공 (표시와 관계없이)
```
- [ ] Pass

#### Test: DOOR Mode Input Block
```
1. DOOR 모드 전환
2. 키보드로 타이핑 시도
Expected: 입력 무시됨
```
- [ ] Pass

---

## 7. Bug Report Template

```
### Bug ID: BUG-XXX

**Severity:** Critical / High / Medium / Low

**Summary:**
[한 줄 요약]

**Steps to Reproduce:**
1. [단계 1]
2. [단계 2]
3. [단계 3]

**Expected Result:**
[예상 결과]

**Actual Result:**
[실제 결과]

**Environment:**
- Browser:
- OS:
- Screen:

**Screenshots/Video:**
[첨부]

**Notes:**
[추가 정보]
```

---

## 8. Pre-Release Checklist

### 8.1 Code Quality
- [ ] TypeScript 에러 없음 (`npm run type-check`)
- [ ] ESLint 경고 최소화 (`npm run lint`)
- [ ] console.log 제거 (디버깅용)
- [ ] 주석 정리

### 8.2 Build & Deploy
- [ ] `npm run build` 성공
- [ ] 빌드 크기 확인 (< 5MB excluding audio)
- [ ] Vercel/Netlify 배포 성공
- [ ] HTTPS 확인
- [ ] 오디오 파일 로드 확인 (CORS)

### 8.3 Final Verification
- [ ] 시작 → 클리어 전체 플레이 가능
- [ ] 모든 엔딩 도달 가능
- [ ] 심각한 버그 없음
- [ ] 오디오 모두 재생됨
- [ ] 성능 안정적

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Playtester 1 | | | |
| Playtester 2 | | | |

**Release Approved:** [ ] Yes [ ] No

**Notes:**
