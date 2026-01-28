# DEADLOCK - 48-Hour Development Timeline

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         48-HOUR SPRINT MAP                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  DAY 1 (0-24h): "Make It Run"                                          │
│  ════════════════════════════                                          │
│  [0-4h]   Setup & Layout     ████████                                  │
│  [4-8h]   Store & Loop       ████████                                  │
│  [8-12h]  Monster & Tasks    ████████                                  │
│  [12-16h] Puzzle System      ████████                                  │
│  [16-20h] Progression        ████████                                  │
│  [20-24h] Basic Audio        ████████                                  │
│                                                                         │
│  DAY 2 (24-48h): "Make It Scary"                                       │
│  ═══════════════════════════════                                       │
│  [24-28h] Look Up + Parallax ████████                                  │
│  [28-32h] Flashlight + CRT   ████████                                  │
│  [32-36h] Full Audio Mix     ████████                                  │
│  [36-40h] Glitch + Polish    ████████                                  │
│  [40-44h] Endings + Start    ████████                                  │
│  [44-48h] QA + Deploy        ████████                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Day 1: "Make It Run" (Hours 0-24)

### Hour 0-4: Project Setup & Base Layout

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Create Vite + React + TS project | 15min | Critical |
| Install dependencies (zustand, framer-motion, howler, tailwind) | 10min | Critical |
| Configure Tailwind + aliases | 15min | Critical |
| Create folder structure | 10min | Critical |
| Implement GameShell.tsx | 30min | Critical |
| Implement MonitorFrame.tsx (basic) | 30min | Critical |
| Implement TaskPanel.tsx (placeholder) | 20min | Critical |
| Implement Terminal.tsx (basic) | 20min | Critical |
| Implement StatusPanel.tsx (basic) | 20min | Critical |
| Test: All components render | 10min | Critical |

#### Deliverables
- [ ] Project runs with `npm run dev`
- [ ] Basic layout visible (monitor center, panels right/bottom)
- [ ] No TypeScript errors

#### Checkpoint Test
```
✓ Open localhost:5173
✓ See dark screen with monitor frame
✓ See task panel on right
✓ See terminal at bottom
```

---

### Hour 4-8: Zustand Store & Game Loop

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Create types.ts with all interfaces | 30min | Critical |
| Create constants.ts with balance values | 20min | Critical |
| Create store.ts with initial state | 40min | Critical |
| Implement useGameLoop.ts (RAF + dt) | 40min | Critical |
| Create placeholder system files | 20min | Critical |
| Wire loop into App.tsx | 20min | Critical |
| Add basic state display for debugging | 20min | High |
| Test: Loop runs, dt is correct | 20min | Critical |

#### Deliverables
- [ ] Store created with all state
- [ ] Game loop running (console.log dt)
- [ ] No double-RAF issue

#### Checkpoint Test
```
✓ Console shows dt values ~0.016 (60fps)
✓ dt never exceeds 0.05 (cap working)
✓ Tab away and back: no spike
```

---

### Hour 8-12: Monster & Task Systems

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Implement monsterSystem.ts | 40min | Critical |
| Update StatusPanel with threat bar | 30min | Critical |
| Create tasks.json with 5 tasks | 30min | Critical |
| Implement taskSystem.ts | 60min | Critical |
| Update TaskPanel with real buttons | 40min | Critical |
| Add cooldown visualization | 30min | High |
| Test: Assign task → distance increases | 20min | Critical |
| Test: Learning decay working | 10min | High |

#### Deliverables
- [ ] Monster distance decreases over time
- [ ] Threat bar fills up
- [ ] Tasks can be assigned
- [ ] Cooldowns work
- [ ] Learning decay reduces effectiveness

#### Checkpoint Test
```
✓ Game starts, distance at 100
✓ Distance slowly decreases
✓ Click task → distance jumps up
✓ Same task again → smaller jump
✓ Cooldown prevents spam
```

---

### Hour 12-16: Puzzle System

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Create puzzles.json with 5 modules | 45min | Critical |
| Create normalizeText.ts utilities | 20min | Critical |
| Implement puzzleSystem.ts | 60min | Critical |
| Update CodeEditor.tsx | 40min | Critical |
| Update Terminal.tsx with logs | 30min | Critical |
| Test: Complete first module | 20min | Critical |
| Test: Fail penalty applies | 15min | High |

#### Deliverables
- [ ] Puzzles load from JSON
- [ ] Code editor shows prompt + starter
- [ ] Submit validates answer
- [ ] Success advances step
- [ ] Fail applies penalty
- [ ] Terminal shows logs

#### Checkpoint Test
```
✓ First puzzle prompt visible
✓ Type correct answer → success message
✓ Type wrong answer → error + distance penalty
✓ Complete module → next module starts
```

---

### Hour 16-20: Progression System

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Implement progressionSystem.ts | 40min | Critical |
| Add phase transitions | 30min | Critical |
| Scale monster speed by phase | 20min | Critical |
| Scale fail penalties by phase | 20min | High |
| Update StatusPanel with phase display | 20min | High |
| Implement finalCompile trigger | 30min | Critical |
| Add compile progress bar | 30min | Critical |
| Test: Full playthrough to compile | 30min | Critical |

#### Deliverables
- [ ] Phase advances as modules complete
- [ ] Speed increases each phase
- [ ] Final compile starts after module 5
- [ ] Compile progress bar works

#### Checkpoint Test
```
✓ Complete 2 modules → Phase 2 starts
✓ Monster noticeably faster in Phase 2
✓ Complete all modules → Final Compile
✓ 60 second countdown visible
```

---

### Hour 20-24: Basic Audio

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Set up AudioManager singleton | 30min | Critical |
| Add placeholder audio files (or download) | 30min | Critical |
| Implement audio preloading | 30min | Critical |
| Add ambience loop | 20min | Critical |
| Add heartbeat (threat-based) | 30min | Critical |
| Add basic SFX (error/success) | 30min | High |
| Test: Audio plays, no crashes | 30min | Critical |

#### Deliverables
- [ ] Ambience plays on game start
- [ ] Heartbeat volume increases with threat
- [ ] Error/success sounds work
- [ ] No audio memory leaks

#### Checkpoint Test
```
✓ Start game → hear ambience
✓ Distance drops → heartbeat louder
✓ Puzzle fail → error beep
✓ Puzzle success → success chime
```

---

## Day 2: "Make It Scary" (Hours 24-48)

### Hour 24-28: Look Up + Parallax

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Implement viewMode state | 20min | Critical |
| Create TriggerZone component | 20min | Critical |
| Implement RoomContainer variants | 40min | Critical |
| Add MonitorFrame transition | 30min | Critical |
| Create mouse position hook | 20min | Critical |
| Implement ParallaxRoom.tsx | 50min | Critical |
| Test: Smooth transitions | 30min | Critical |
| Test: Parallax movement | 20min | Critical |

#### Deliverables
- [ ] Mouse to top → room visible (DOOR mode)
- [ ] Mouse away → monitor focused (MONITOR mode)
- [ ] Input disabled in DOOR mode
- [ ] Parallax layers move smoothly

#### Checkpoint Test
```
✓ Move mouse to top → room un-blurs
✓ Monitor slides down and fades
✓ Can't type in DOOR mode
✓ Mouse movement → subtle room panning
```

---

### Hour 28-32: Flashlight + CRT Effects

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Implement FlashlightOverlay.tsx | 40min | Critical |
| Connect flashlight to mouse position | 20min | Critical |
| Add radius shrink with threat | 20min | High |
| Add flicker effect | 30min | High |
| Implement CRT scanlines (CSS) | 30min | Critical |
| Add noise overlay | 20min | High |
| Add vignette effect | 15min | High |
| Test: Blackout on task return | 25min | Critical |

#### Deliverables
- [ ] Dark overlay with light circle at mouse
- [ ] Flashlight shrinks as threat increases
- [ ] CRT scanlines visible
- [ ] Noise texture animated
- [ ] Vignette darkens edges

#### Checkpoint Test
```
✓ Can only see where mouse points
✓ High threat → smaller light circle
✓ Occasional flicker
✓ Monitor has retro CRT look
✓ garbageCollection → brief blackout
```

---

### Hour 32-36: Full Audio Mix

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Add footsteps audio (threat-based) | 30min | Critical |
| Add breathing audio (high threat) | 30min | High |
| Implement threat-based mixing formula | 30min | Critical |
| Add task assign/return sounds | 20min | High |
| Add door creak (DOOR mode) | 20min | Medium |
| Add typing sounds | 20min | Medium |
| Add compile sounds | 20min | High |
| Test: Full audio experience | 30min | Critical |

#### Deliverables
- [ ] Footsteps audible, volume by distance
- [ ] Breathing at high threat
- [ ] Smooth volume transitions
- [ ] All events have sounds

#### Checkpoint Test
```
✓ Low threat: quiet ambience only
✓ Mid threat: footsteps, heartbeat
✓ High threat: breathing, loud heartbeat
✓ Task assigned → footsteps fade
✓ Task returns → footsteps resume
```

---

### Hour 36-40: Glitch + Polish

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Implement GlitchOverlay.tsx | 40min | Critical |
| Add chromatic aberration | 20min | High |
| Add screen tear effect | 20min | High |
| Create glitch text utility | 30min | Critical |
| Apply to code display (NOT validation!) | 30min | Critical |
| Add glitch spike on events | 20min | High |
| Polish StatusPanel animations | 20min | Medium |
| Polish TaskPanel visuals | 20min | Medium |

#### Deliverables
- [ ] Glitch overlay appears at high threat
- [ ] Code display occasionally corrupted
- [ ] Validation still works correctly
- [ ] Spikes on puzzle fail

#### Checkpoint Test
```
✓ High threat → screen has color artifacts
✓ Code shows "HELP ME" randomly (display)
✓ Type correct answer → still validates
✓ Puzzle fail → brief glitch spike
```

---

### Hour 40-44: Endings + Start Screen

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Create EndScreens.tsx | 40min | Critical |
| Implement 4 endings (good/neutral/bad/secret) | 30min | Critical |
| Implement Game Over screen | 30min | Critical |
| Add jumpscare sequence | 20min | High |
| Create StartScreen.tsx | 40min | Critical |
| Add loading progress | 20min | High |
| Add restart functionality | 20min | Critical |
| Test: All endings reachable | 30min | Critical |

#### Deliverables
- [ ] Start screen with title and loading
- [ ] All 4 endings display correctly
- [ ] Game over has brief scare
- [ ] Stats shown on ending
- [ ] Restart button works

#### Checkpoint Test
```
✓ Game starts at start screen
✓ Click Start → game begins
✓ Die → Game Over screen
✓ Complete → ending based on performance
✓ Restart → fresh game
```

---

### Hour 44-48: QA + Deploy

#### Tasks
| Task | Time | Priority |
|------|------|----------|
| Run QA test matrix (8 scenarios) | 60min | Critical |
| Fix critical bugs | 60min | Critical |
| Performance check (no memory leaks) | 30min | High |
| Build production bundle | 15min | Critical |
| Deploy to Vercel/Netlify | 15min | Critical |
| Post-deploy testing | 30min | Critical |
| Final documentation update | 15min | Medium |
| Celebrate! | ∞ | Critical |

#### QA Matrix
| Test | Pass | Notes |
|------|------|-------|
| Fresh start → complete game | [ ] | |
| Task spam (same task 5x) | [ ] | |
| Puzzle fail 3x same step | [ ] | |
| DOOR mode only (no coding) | [ ] | |
| No tasks used | [ ] | |
| Audio mute/unmute | [ ] | |
| Tab away and back | [ ] | |
| Rapid clicking | [ ] | |

#### Deliverables
- [ ] All QA tests pass
- [ ] No critical bugs
- [ ] Deployed and accessible
- [ ] Share URL with friends!

---

## Emergency Cuts (If Behind Schedule)

### If Hour 24 and Not Complete Day 1:
- Skip: Task usage count badges
- Skip: Terminal typewriter animation
- Simplify: Use 3 tasks instead of 5
- Simplify: Use 3 modules instead of 5

### If Hour 36 and Not Complete:
- Skip: Breathing audio
- Skip: Screen tear glitch
- Skip: Door creak sound
- Skip: Secret ending
- Simplify: Basic glitch (just opacity flicker)

### If Hour 44 and Not Complete:
- Skip: Start screen (go straight to game)
- Skip: Stats on ending
- Simplify: Single ending (just "escaped" or "died")

### Absolute Minimum Viable Product:
- [ ] Monster distance decreases
- [ ] Tasks push it back
- [ ] Puzzles can be solved
- [ ] Game Over when distance = 0
- [ ] Win when all puzzles done
- [ ] At least heartbeat audio
- [ ] Basic flashlight effect

---

## Milestone Checkpoints

| Hour | Checkpoint | Must Have |
|------|------------|-----------|
| 4 | Layout visible | GameShell renders |
| 8 | Loop running | dt in console |
| 12 | Tasks work | Click → distance up |
| 16 | Puzzles work | Solve → advance |
| 20 | Progression works | Phases change |
| 24 | Audio plays | Heartbeat audible |
| 28 | View switch works | DOOR mode transitions |
| 32 | Flashlight works | Light follows mouse |
| 36 | Audio complete | All sounds play |
| 40 | Glitch works | Visual corruption |
| 44 | Endings work | Can win/lose |
| 48 | Deployed | URL accessible |
