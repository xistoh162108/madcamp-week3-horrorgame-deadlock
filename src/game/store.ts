import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  Phase,
  ViewMode,
  TaskId,
  TaskDefinition,
  PuzzleModule,
  GlitchState,
  FlashlightState,
  AudioMix,
  EndingType,
  GameState,
  GameActions,
  MonitorState,
  DoorState,
  MonsterState,
} from './types';
import {
  BALANCE,
  AUDIO,
  INITIAL_TASK_COOLDOWNS,
  INITIAL_TASK_USAGE,
  INITIAL_MODULE_PROGRESS,
  HEAT,
  BOOT,
  DEFENSE,
  STEALTH,
  MONSTER,
} from './constants';

import { submitPuzzleAnswer } from './systems/puzzleSystem';
import { checkPhaseTransition } from './systems/progressionSystem';

import { calculateEffectsUpdate } from './systems/effectsSystem';
import { calculateAudioMix, AudioManager } from './systems/audioSystem';
import { updateMonsterV2 } from './systems/monsterSystem';

// Import JSON data
import puzzlesData from './data/puzzles.json';
import tasksData from './data/tasks.json';

// ============================================
// INITIAL STATE
// ============================================

const initialGlitchState: GlitchState = {
  intensity: 0,
  spike: 0,
  cursorInvert: false,
  inputLag: 0,
};

const initialFlashlightState: FlashlightState = {
  enabled: true,
  radius: BALANCE.FLASHLIGHT_BASE_RADIUS,
  battery: 100,
  flickerIntensity: 0,
  strobeIntensity: 0,
};

const initialAudioMix: AudioMix = {
  ambience: AUDIO.AMBIENCE_BASE,
  heartbeat: AUDIO.HEARTBEAT_BASE,
  footsteps: AUDIO.FOOTSTEPS_BASE,
  breathing: 0,
  monsterBreath: 0,
  master: AUDIO.MASTER_VOLUME,
};

// Convert tasks array to Record
const taskDefsFromJson = tasksData.tasks.reduce((acc, task) => {
  acc[task.id as TaskId] = task as TaskDefinition;
  return acc;
}, {} as Record<TaskId, TaskDefinition>);

// ============================================
// STORE TYPE
// ============================================

type StoreState = GameState & { actions: GameActions };

// ============================================
// CREATE STORE
// ============================================

export const useGameStore = create<StoreState>()(
  subscribeWithSelector((set, get) => ({
    // ==========================================
    // STATE
    // ==========================================

    // Core
    phase: 'start' as Phase,
    timeElapsed: 0,

    // ===== v2.0 HEAT SYSTEM =====
    powerLoad: 0,
    isBlackout: false,
    blackoutTimer: 0,

    // ===== v2.0 VIEW SYSTEM =====
    monitorState: 'ON' as MonitorState,
    bootTimer: 0,

    // ===== v2.0 DOOR SYSTEM =====
    doorState: 'OPEN' as DoorState,
    isDoorHeld: false,
    doorClosedDuration: 0,

    // ===== v2.0 MONSTER SYSTEM =====
    monsterState: 'IDLE' as MonsterState,
    monsterDistance: BALANCE.INITIAL_DISTANCE,
    monsterSpeed: BALANCE.INITIAL_SPEED,
    threat: 0,
    threatEased: 0,
    currentTelegraph: null,

    // Tasks
    taskDefs: taskDefsFromJson,
    activeTask: null,
    taskCooldowns: { ...INITIAL_TASK_COOLDOWNS },
    taskUsageCount: { ...INITIAL_TASK_USAGE },
    tasksDisabled: false,
    totalTasksAssigned: 0,

    // Puzzles
    puzzleDefs: puzzlesData.modules as PuzzleModule[],
    currentModuleIndex: 0,
    moduleProgress: { ...INITIAL_MODULE_PROGRESS },
    editorText: '',
    hintTokens: 0,
    // v2.0 Stats
    neverClosedDoor: true,

    // UI
    viewMode: 'MONITOR' as ViewMode,
    terminalLogs: [],

    // Effects
    glitch: { ...initialGlitchState },
    flashlight: { ...initialFlashlightState },
    blackoutRemaining: 0,

    // Audio
    audioEnabled: true,
    audioMix: { ...initialAudioMix },

    // Compile
    compileProgress: 0,
    compileTimeRemaining: BALANCE.COMPILE_DURATION,

    // Ending/Stats
    endingType: null,
    totalMistakes: 0,
    totalHintsUsed: 0,
    usedServerCheck: false,
    neverLookedAtDoor: true,
    lastSubmitResult: null,

    // v3.3 Diegetic Components
    isPlayDead: false,
    mouseStillTime: 0,
    lastMousePos: { x: 0, y: 0 },
    isIntercomPlaying: false,

    // v3.3 Jumpscare
    activeJumpscare: null,
    triggeredJumpscares: [],

    // ==========================================
    // ACTIONS
    // ==========================================

    actions: {
      // ----------------------------------------
      // Game Flow
      // ----------------------------------------

      startGame: () => {
        const { actions } = get();
        set({
          phase: 'intro',

          // v2.0 Systems initialization
          powerLoad: 0,
          isBlackout: false,
          monitorState: 'ON',
          doorState: 'OPEN',
          monsterState: 'IDLE',
          monsterDistance: BALANCE.INITIAL_DISTANCE,
          monsterSpeed: BALANCE.PHASE_SPEEDS.intro,

          terminalLogs: [],
        });
        actions.addTerminalLog('[BOOT] BIO-KERNEL v4.2.0 Loaded');
        actions.addTerminalLog('[SYSTEM] Establishing Neural Link...');
        actions.addTerminalLog('[CONNECT] Subject 89 Connected');
        actions.addTerminalLog('[STATUS] Vitals: UNSTABLE');
        actions.addTerminalLog('[WARNING] External Comms: OFFLINE');
        actions.addTerminalLog('[WARNING] Containment Breach Detected');
        actions.addTerminalLog('');
        actions.addTerminalLog('[INFO] Monitor controls: TAB to toggle ON/OFF');
        actions.addTerminalLog('[INFO] Door controls: SPACE to close (Monitor must be OFF)');
        actions.addTerminalLog('[WARNING] High CPU usage increases Heat. Heat > 100% = BLACKOUT');
        actions.addTerminalLog('');
        actions.addTerminalLog('[PROTOCOL] Stabilization required. Complete all modules.');
        actions.addTerminalLog('[PROTOCOL] Assign background tasks to mitigate system entropy.');

        // Initialize Audio Loops
        AudioManager.instance.startLoops();

        // Load first puzzle
        const puzzles = get().puzzleDefs;
        if (puzzles.length > 0) {
          const firstModule = puzzles[0];
          actions.addTerminalLog('');
          actions.addTerminalLog(firstModule.narrativeIntro);
          if (firstModule.steps.length > 0) {
            set({ editorText: firstModule.steps[0].starterCode });
          }
        }
      },

      restartGame: () => {
        set({
          phase: 'start',
          timeElapsed: 0,

          // v2.0 Heat System
          powerLoad: 0,
          isBlackout: false,
          blackoutTimer: 0,

          // v2.0 View System
          monitorState: 'ON',
          bootTimer: 0,

          // v2.0 Door System
          doorState: 'OPEN',
          isDoorHeld: false,
          doorClosedDuration: 0,

          // v2.0 Monster System
          monsterState: 'IDLE',
          monsterDistance: BALANCE.INITIAL_DISTANCE,
          monsterSpeed: BALANCE.INITIAL_SPEED,
          threat: 0,
          threatEased: 0,
          currentTelegraph: null,

          // Tasks
          activeTask: null,
          taskCooldowns: { ...INITIAL_TASK_COOLDOWNS },
          taskUsageCount: { ...INITIAL_TASK_USAGE },
          tasksDisabled: false,
          totalTasksAssigned: 0,

          // Puzzles
          currentModuleIndex: 0,
          moduleProgress: { ...INITIAL_MODULE_PROGRESS },
          editorText: '',
          hintTokens: 0,
          totalMistakes: 0,
          totalHintsUsed: 0,

          // Stats
          neverClosedDoor: true,

          // UI
          viewMode: 'MONITOR',
          terminalLogs: [],

          // Effects
          glitch: { ...initialGlitchState },
          flashlight: { ...initialFlashlightState },
          blackoutRemaining: 0,

          // Compile
          compileProgress: 0,
          compileTimeRemaining: BALANCE.COMPILE_DURATION,

          // Ending
          endingType: null,
          usedServerCheck: false,
          neverLookedAtDoor: true,

          // v3.3 Diegetic Components
          isPlayDead: false,
          mouseStillTime: 0,
          lastMousePos: { x: 0, y: 0 },
          isIntercomPlaying: false,
        });

        // Reset audio immediately
        AudioManager.instance.resetEvents();
        get().actions.updateAudioMix();
      },

      setPhase: (phase: Phase) => {
        const currentPhase = get().phase;
        if (currentPhase === phase) return;

        set({
          phase,
          monsterSpeed: BALANCE.PHASE_SPEEDS[phase],
        });

        const { actions } = get();
        if (phase !== 'loading' && phase !== 'start' && phase !== 'ending' && phase !== 'gameOver') {
          actions.addTerminalLog(`[SYSTEM] Entering ${phase.toUpperCase()}...`);
        }

        // Trigger effects for specific phases
        if (phase === 'finalCompile') {
          get().actions.startFinalCompile();
        }
      },

      // ----------------------------------------
      // Monster
      // ----------------------------------------

      updateMonster: (dt: number) => {
        const { phase, monsterDistance, monsterSpeed, activeTask } = get();

        // Don't update in certain phases
        if (phase === 'loading' || phase === 'start' || phase === 'ending' || phase === 'gameOver') {
          return;
        }

        // Don't decrease distance if task is active (monster is away)
        if (activeTask) {
          return;
        }

        // Calculate new distance
        const newDistance = Math.max(0, monsterDistance - monsterSpeed * dt);

        // Calculate threat values
        const threat = 1 - newDistance / 100;
        const threatEased = Math.pow(threat, 1.6);

        // Check for game over
        if (newDistance <= 0) {
          set({
            monsterDistance: 0,
            threat: 1,
            threatEased: 1,
            phase: 'gameOver',
          });
          // Play jumpscare at max volume (plus slight boost if engine permits)
          AudioManager.instance.playOneShot('jumpscare', 1.0);
          get().actions.updateAudioMix(); // Silence loops
          get().actions.addTerminalLog('[CRITICAL] BREACH DETECTED');
          get().actions.addTerminalLog('[SYSTEM] PROCESS TERMINATED');
          return;
        }

        set({
          monsterDistance: newDistance,
          threat,
          threatEased,
          timeElapsed: get().timeElapsed + dt,
        });
      },

      // ----------------------------------------
      // Tasks
      // ----------------------------------------

      assignTask: (taskId: TaskId) => {
        const { taskDefs, taskCooldowns, taskUsageCount, activeTask, tasksDisabled, phase } = get();

        // Validation
        if (activeTask !== null) return;
        if (taskCooldowns[taskId] > 0) return;
        if (tasksDisabled) return;
        if (phase === 'finalCompile' || phase === 'gameOver' || phase === 'ending') return;

        const task = taskDefs[taskId];
        if (!task) return;

        AudioManager.instance.playOneShot('taskAssign');

        // Calculate boost with learning decay
        const usageCount = taskUsageCount[taskId];
        const decayMultiplier = Math.pow(BALANCE.LEARNING_DECAY, usageCount);
        const effectiveBoost = task.distanceBoost * decayMultiplier;

        // Apply boost
        const newDistance = Math.min(100, get().monsterDistance + effectiveBoost);

        // Apply permanent speed increase
        const newSpeed = Math.min(
          BALANCE.SPEED_CAP,
          get().monsterSpeed + task.speedIncrease
        );

        // Track serverCheck usage for secret ending
        const usedServerCheck = taskId === 'serverCheck' ? true : get().usedServerCheck;

        // Update state
        set({
          monsterDistance: newDistance,
          monsterSpeed: newSpeed,
          activeTask: { id: taskId, remaining: task.durationSec },
          taskCooldowns: {
            ...taskCooldowns,
            [taskId]: task.cooldownSec,
          },
          taskUsageCount: {
            ...taskUsageCount,
            [taskId]: usageCount + 1,
          },
          totalTasksAssigned: get().totalTasksAssigned + 1,
          usedServerCheck,
        });

        // Apply side effects
        if (task.sideEffect) {
          if (task.sideEffect.type === 'hint') {
            set({ hintTokens: get().hintTokens + task.sideEffect.value });
          } else if (task.sideEffect.type === 'inputLag') {
            set({
              glitch: {
                ...get().glitch,
                inputLag: task.sideEffect.value,
              },
            });
          }
        }

        // Log
        get().actions.addTerminalLog(task.flavorText.assign);

        // Check phase transition after first task
        // Now handled in checkPhaseTransition called by loop, or we can call it here to be instant
        get().actions.checkPhaseTransition();
      },

      updateTasks: (dt: number) => {
        const { activeTask, taskCooldowns, taskDefs, glitch } = get();

        // Update cooldowns
        const newCooldowns = { ...taskCooldowns };
        let cooldownsChanged = false;
        for (const taskId of Object.keys(newCooldowns) as TaskId[]) {
          if (newCooldowns[taskId] > 0) {
            newCooldowns[taskId] = Math.max(0, newCooldowns[taskId] - dt);
            cooldownsChanged = true;
          }
        }
        if (cooldownsChanged) {
          set({ taskCooldowns: newCooldowns });
        }

        // Update active task
        if (activeTask) {
          const remaining = activeTask.remaining - dt;

          if (remaining <= 0) {
            // Task completed - monster returns
            const task = taskDefs[activeTask.id];
            const penalty = task.returnPenalty;

            // Apply return penalties
            set({
              activeTask: null,
              glitch: {
                ...glitch,
                spike: Math.min(1, glitch.spike + penalty.glitchSpike),
                inputLag: 0, // Clear input lag when task ends
              },
            });

            // Apply speed burst
            if (penalty.speedBurst > 0) {
              set({
                monsterSpeed: Math.min(
                  BALANCE.SPEED_CAP,
                  get().monsterSpeed + penalty.speedBurst
                ),
              });
            }

            // Trigger blackout
            if (penalty.blackout) {
              get().actions.triggerBlackout(HEAT.BLACKOUT_DURATION);
            }

            // Log
            get().actions.addTerminalLog(task.flavorText.return);
          } else {
            set({ activeTask: { ...activeTask, remaining } });
          }
        }
      },

      // ----------------------------------------
      // Puzzles
      // ----------------------------------------

      setEditorText: (text: string) => {
        const currentText = get().editorText;

        // If length increased (typing), play dynamic sound
        if (text.length > currentText.length) {
          const { powerLoad, currentModuleIndex } = get();
          const heatRatio = powerLoad / 100;
          const progressRatio = currentModuleIndex / 5;
          const intensity = (heatRatio * 0.7) + (progressRatio * 0.3);

          AudioManager.instance.playTypingSound(intensity);

          // Typing generates heat
          set((state) => ({
            powerLoad: Math.min(1000, state.powerLoad + HEAT.TYPING_COST), // Uncapped heat, capped by blackout
          }));
        }

        set({ editorText: text });
      },

      submitAnswer: () => {
        const state = get();
        const { actions } = state; // Destructure actions from state

        if (state.phase === 'finalCompile' || state.phase === 'gameOver' || state.phase === 'ending') {
          return;
        }

        // Start compilation sound
        AudioManager.instance.playOneShot('compileStart');

        const result = submitPuzzleAnswer(state, state.editorText);

        if (!result) return;

        if (result.isCorrect) {
          // Success sound (slight delay for impact)
          setTimeout(() => {
            const currentModule = state.puzzleDefs[state.currentModuleIndex];

            // Special audio event for Module 2 Completion
            if (currentModule && currentModule.id === 'THE_GASP') {
              AudioManager.instance.playGaspToFan();
            } else {
              AudioManager.instance.playOneShot('success');
            }
          }, 500);
          result.logs.forEach(log => actions.addTerminalLog(log));

          // Apply distance change
          if (result.distanceChange) {
            set({
              monsterDistance: Math.min(
                100,
                get().monsterDistance + result.distanceChange
              ),
            });
          }

          // Update progression
          if (result.nextStep) {
            const currentModuleId = state.puzzleDefs[state.currentModuleIndex].id;
            const newModuleProgress = {
              ...state.moduleProgress,
              [currentModuleId]: {
                ...state.moduleProgress[currentModuleId],
                stepIndex: result.nextStep.stepIndex,
                completed: result.nextStep.completed
              }
            };

            set({ moduleProgress: newModuleProgress });

            if (result.nextStep.completed) {
              // Determine if we should move to next module
              if (result.nextStep.moduleIndex !== undefined && result.nextStep.moduleIndex > state.currentModuleIndex) {
                if (result.nextStep.moduleIndex < state.puzzleDefs.length) {
                  set({
                    currentModuleIndex: result.nextStep.moduleIndex,
                    editorText: result.editorText
                  });
                  if (result.narrative) {
                    actions.addTerminalLog('');
                    actions.addTerminalLog(result.narrative);
                  }
                } else {
                  // All modules complete
                  actions.startFinalCompile();
                }
              }

              actions.checkPhaseTransition();
            } else {
              // Functionally just updating text for next step
              set({ editorText: result.editorText });
            }
          }
          // Use flash effect for success if we had UI state for it, but store handles logic.
        } else {
          // Failure
          // Play error sound after delay
          setTimeout(() => {
            AudioManager.instance.playOneShot('error');

            // Play run sound if needed
            if (result.soundToPlay === 'run') {
              const currentDistance = result.monsterDistance !== undefined ? result.monsterDistance : state.monsterDistance;
              const threat = 1 - (currentDistance / 100);
              const volume = 0.2 + Math.pow(threat, 3) * 0.8;
              AudioManager.instance.playOneShot('run', volume);
            }
          }, 500);

          result.logs.forEach(log => actions.addTerminalLog(log));

          // Update mistakes count
          const currentModuleId = state.puzzleDefs[state.currentModuleIndex].id;
          const progress = state.moduleProgress[currentModuleId];

          set({
            monsterDistance: result.monsterDistance !== undefined ? result.monsterDistance : state.monsterDistance,
            totalMistakes: state.totalMistakes + 1,
            moduleProgress: {
              ...state.moduleProgress,
              [currentModuleId]: {
                ...progress,
                mistakes: progress.mistakes + 1,
              },
            },
          });

          if (result.glitchSpike) {
            actions.triggerGlitchSpike(result.glitchSpike);
          }
        }

        // Update feedback
        set({ lastSubmitResult: { status: result.isCorrect ? 'success' : 'error', id: Date.now() } });
      },

      useHint: () => {
        const { hintTokens, puzzleDefs, currentModuleIndex, moduleProgress, actions } = get();

        if (hintTokens <= 0) {
          actions.addTerminalLog('[ERROR] No hint tokens available.');
          return;
        }

        const currentModule = puzzleDefs[currentModuleIndex];
        if (!currentModule) return;

        const progress = moduleProgress[currentModule.id];
        const currentStep = currentModule.steps[progress.stepIndex];
        if (!currentStep || currentStep.hints.length === 0) return;

        // Get a random hint
        const hintIndex = Math.min(get().totalHintsUsed, currentStep.hints.length - 1);
        const hint = currentStep.hints[hintIndex];

        set({
          hintTokens: hintTokens - 1,
          totalHintsUsed: get().totalHintsUsed + 1,
        });

        actions.addTerminalLog(`[HINT] ${hint}`);
      },

      loadPuzzles: (puzzles: PuzzleModule[]) => {
        set({ puzzleDefs: puzzles });
      },

      loadTasks: (tasks: TaskDefinition[]) => {
        const taskDefs = tasks.reduce((acc, task) => {
          acc[task.id] = task;
          return acc;
        }, {} as Record<TaskId, TaskDefinition>);
        set({ taskDefs });
      },

      // ----------------------------------------
      // UI
      // ----------------------------------------

      setViewMode: (mode: ViewMode) => {
        const currentMode = get().viewMode;
        if (currentMode === mode) return;

        // Play transition sounds
        if (mode === 'DOOR') {
          AudioManager.instance.playOneShot('close');
        } else if (mode === 'MONITOR') {
          AudioManager.instance.playOneShot('open');
        }

        set({ viewMode: mode });

        // Track for secret ending
        if (mode === 'DOOR') {
          set({ neverLookedAtDoor: false });
        }
      },

      addTerminalLog: (message: string) => {
        set((state) => ({
          terminalLogs: [...state.terminalLogs.slice(-49), message],
        }));
      },

      clearTerminalLogs: () => {
        set({ terminalLogs: [] });
      },

      // ----------------------------------------
      // Effects
      // ----------------------------------------

      updateEffects: (dt: number) => {
        const effectsUpdate = calculateEffectsUpdate(get(), dt);
        set(effectsUpdate);
      },

      triggerGlitchSpike: (intensity: number) => {
        set((state) => ({
          glitch: {
            ...state.glitch,
            spike: Math.min(1, state.glitch.spike + intensity),
          },
        }));
      },

      triggerStrobeFrenzy: (duration: number) => {
        // duration is passed but for now we use a fixed decay in effectsSystem
        console.log(`Strobe frenzy triggered for ${duration}s`);
        set((state) => ({
          flashlight: {
            ...state.flashlight,
            strobeIntensity: 1.0,
          }
        }));
      },

      triggerBlackout: (duration: number) => {
        set({
          isBlackout: true,
          blackoutTimer: duration,
          powerLoad: HEAT.BLACKOUT_THRESHOLD,
          monitorState: 'OFF',
          doorState: 'OPEN',
          doorClosedDuration: 0,
          isDoorHeld: false,
          isIntercomPlaying: false,
        });

        // Force stop effects
        AudioManager.instance.stopSound('intercom');
        AudioManager.instance.stopSound('close');
        AudioManager.instance.stopSound('doorBang');

        get().actions.addTerminalLog('[SYSTEM] BLACKOUT - System Failure');
      },

      // ----------------------------------------
      // Audio
      // ----------------------------------------

      setAudioEnabled: (enabled: boolean) => {
        set({ audioEnabled: enabled });
        if (!enabled) {
          AudioManager.instance.setMasterVolume(0);
        } else {
          AudioManager.instance.setMasterVolume(get().audioMix.master);
        }
      },

      updateAudioMix: () => {
        if (!get().audioEnabled) return;
        const mix = calculateAudioMix(get());
        set({ audioMix: mix });
        AudioManager.instance.updateMix(mix);
      },

      // ----------------------------------------
      // Progression
      // ----------------------------------------

      checkPhaseTransition: () => {
        const { phase, moduleProgress, totalTasksAssigned, actions } = get();

        // Count completed modules
        const completedCount = Object.values(moduleProgress).filter(p => p.completed).length;

        // Use system to check transition
        const transition = checkPhaseTransition(phase, completedCount, totalTasksAssigned);

        if (transition) {
          actions.setPhase(transition.newPhase);
          set({ monsterSpeed: transition.newSpeed });
          actions.addTerminalLog(transition.logMessage);
        }
      },

      updateCompile: (dt: number) => {
        const { phase, compileTimeRemaining, actions } = get();

        if (phase !== 'finalCompile') return;

        const newRemaining = compileTimeRemaining - dt;
        const newProgress = 1 - newRemaining / BALANCE.COMPILE_DURATION;

        // Log progress milestones
        const oldProgress = get().compileProgress;
        const milestones = [0.1, 0.25, 0.5, 0.75, 0.9];
        for (const milestone of milestones) {
          if (oldProgress < milestone && newProgress >= milestone) {
            actions.addTerminalLog(`[COMPILE] ${Math.floor(milestone * 100)}% complete...`);
          }
        }

        if (newRemaining <= 0) {
          // Compile complete
          set({
            compileProgress: 1,
            compileTimeRemaining: 0,
            phase: 'ending',
            endingType: actions.determineEnding(),
          });
          actions.addTerminalLog('[COMPILE] 100% - COMPILE SUCCESSFUL');
          actions.addTerminalLog('[SYSTEM] escape.exe ready');
        } else {
          set({
            compileProgress: newProgress,
            compileTimeRemaining: newRemaining,
          });
        }
      },

      startFinalCompile: () => {
        const { actions } = get();

        set({
          phase: 'finalCompile',
          tasksDisabled: true,
          compileProgress: 0,
          compileTimeRemaining: BALANCE.COMPILE_DURATION,
          monsterSpeed: BALANCE.PHASE_SPEEDS.finalCompile,
        });

        actions.addTerminalLog('');
        actions.addTerminalLog('[SYSTEM] ========================================');
        actions.addTerminalLog('[COMPILE] INITIATING FINAL COMPILE...');
        actions.addTerminalLog('[WARNING] All tasks disabled during compilation.');
        actions.addTerminalLog('[WARNING] DO NOT INTERRUPT THE PROCESS.');
        actions.addTerminalLog('[SYSTEM] ========================================');
      },

      determineEnding: (): EndingType => {
        const { totalMistakes, totalHintsUsed, neverClosedDoor } = get();

        // Secret: Never closed door (pure skill/luck)
        if (neverClosedDoor) return 'secret';

        // Good: Few mistakes
        if (totalMistakes <= 3 && totalHintsUsed <= 2) return 'good';

        // Neutral: Average performance
        if (totalMistakes <= 8) return 'neutral';

        // Bad: Many mistakes
        return 'bad';
      },

      // ----------------------------------------
      // v2.0 Systems
      // ----------------------------------------

      toggleMonitor: () => {
        const { monitorState, isBlackout, actions, threat } = get();

        if (isBlackout) return;

        if (monitorState === 'ON') {
          // JUMPSCARE: Reflection (Shutdown)
          // Higher chance if threat is high or random
          if (Math.random() < 0.3 + (threat * 0.4)) {
            actions.triggerJumpscare('MN_REFLECT', 1500);
            AudioManager.instance.playOneShot('breathBehind', 1.0);
          }

          set({ monitorState: 'OFF' });
          AudioManager.instance.playOneShot('close', 0.8);
        } else if (monitorState === 'OFF') {
          set({
            monitorState: 'BOOTING',
            bootTimer: BOOT.DURATION,
          });

          // JUMPSCARE: Boot Glitch
          // 10% base chance + threat boost
          if (Math.random() < 0.1 + (threat * 0.2)) {
            actions.triggerJumpscare('MN_GLITCH', 500);
            AudioManager.instance.playOneShot('digitalScream', 0.6);
          }

          AudioManager.instance.playOneShot('open', 0.8);
        }
      },

      startHoldingDoor: () => {
        const { monitorState, isBlackout, isDoorHeld, actions, threat } = get();

        // Can only control door when monitor OFF
        if (monitorState !== 'OFF' || isBlackout || isDoorHeld) return;

        set({
          isDoorHeld: true,
          neverClosedDoor: false, // Player closed door at least once
        });

        // JUMPSCARE: Door Slam
        // 15% chance
        const isSlam = Math.random() < 0.15 + (threat * 0.1);

        if (isSlam) {
          get().actions.addHeat(HEAT.DOOR_CLOSE_COST * 1.5); // Accidental slam costs more?
          actions.triggerJumpscare('DO_SLAM', 500);
          AudioManager.instance.playOneShot('doorSlam', 1.0); // Loud slam
        } else {
          get().actions.addHeat(HEAT.DOOR_CLOSE_COST); // Instant cost
          AudioManager.instance.playOneShot('close', 0.8);
        }
      },

      stopHoldingDoor: () => {
        const { isDoorHeld } = get();
        if (isDoorHeld) {
          set({ isDoorHeld: false });
          AudioManager.instance.playOneShot('open', 0.8);
        }
      },

      updateHeat: (dt: number) => {
        const { powerLoad, monitorState, isDoorHeld, isBlackout, blackoutTimer } = get();

        // During blackout: countdown only
        if (isBlackout) {
          const newTimer = blackoutTimer - dt;
          if (newTimer <= 0) {
            set({
              isBlackout: false,
              blackoutTimer: 0,
              powerLoad: HEAT.BLACKOUT_RESET_HEAT,
            });
            get().actions.addTerminalLog('[SYSTEM] Power restored');
          } else {
            set({ blackoutTimer: newTimer });
          }
          return;
        }

        const completedModules = selectCompletedModuleCount(get());
        const heatMultiplier = Math.min(HEAT.SCALING_MAX_HEAT, 1 + (completedModules * 0.1));
        const coolingMultiplier = Math.max(HEAT.SCALING_MIN_COOLING, 1 - (completedModules * 0.04));

        let newPowerLoad = powerLoad;

        // Heat accumulation/cooling
        if (monitorState === 'ON' || monitorState === 'BOOTING') {
          newPowerLoad += HEAT.PASSIVE_RATE_ON * heatMultiplier * dt;
        } else if (monitorState === 'OFF') {
          newPowerLoad = Math.max(0, newPowerLoad - HEAT.COOLING_RATE * coolingMultiplier * dt);
        }

        // Door hold cost (only when monitor OFF)
        if (isDoorHeld && monitorState === 'OFF') {
          newPowerLoad += HEAT.DOOR_HOLD_COST * heatMultiplier * dt;
        }

        // Intercom active drain
        if (get().isIntercomPlaying) {
          newPowerLoad += DEFENSE.INTERCOM_DRAIN_RATE * heatMultiplier * dt;
        }

        // Blackout trigger
        if (newPowerLoad >= HEAT.BLACKOUT_THRESHOLD) {
          set({
            powerLoad: HEAT.BLACKOUT_THRESHOLD,
            isBlackout: true,
            blackoutTimer: HEAT.BLACKOUT_DURATION,
            doorState: 'OPEN',
            doorClosedDuration: 0,
            monitorState: 'OFF',
            isDoorHeld: false,
            isIntercomPlaying: false, // Force stop intercom
          });

          // Force stop audio effects
          AudioManager.instance.stopSound('intercom');
          AudioManager.instance.stopSound('close');
          AudioManager.instance.stopSound('doorBang');

          get().actions.addTerminalLog('[CRITICAL] BLACKOUT - Power overload!');
          get().actions.addTerminalLog('[WARNING] Door controls disabled');
        } else {
          set({ powerLoad: Math.max(0, newPowerLoad) });
        }
      },

      updateBoot: (dt: number) => {
        const { monitorState, bootTimer } = get();

        if (monitorState !== 'BOOTING') return;

        const newTimer = bootTimer - dt;
        if (newTimer <= 0) {
          set({ monitorState: 'ON', bootTimer: 0 });
        } else {
          set({ bootTimer: newTimer });
        }
      },

      updateDoor: (dt: number) => {
        const { doorState, isDoorHeld, doorClosedDuration, monitorState, isBlackout } = get();

        // Blackout forces door open
        if (isBlackout) {
          if (doorState === 'CLOSED') {
            set({ doorState: 'OPEN', doorClosedDuration: 0 });
          }
          return;
        }

        // Can only control door when monitor OFF
        if (monitorState === 'ON' || monitorState === 'BOOTING') {
          // Door stays in current state, but timer accumulates if closed
          if (doorState === 'CLOSED') {
            set({ doorClosedDuration: doorClosedDuration + dt });
          }
          return;
        }

        // Space held: close/keep door closed
        if (isDoorHeld) {
          if (doorState === 'OPEN') {
            set({
              doorState: 'CLOSED',
              doorClosedDuration: dt,
            });
          } else {
            set({ doorClosedDuration: doorClosedDuration + dt });
          }
        } else {
          // Space released: open door
          if (doorState === 'CLOSED') {
            set({ doorState: 'OPEN', doorClosedDuration: 0 });
          }
        }
      },

      addHeat: (amount: number) => {
        const { powerLoad, actions } = get();
        const completedModules = selectCompletedModuleCount(get());
        const heatMultiplier = Math.min(HEAT.SCALING_MAX_HEAT, 1 + (completedModules * 0.1));

        const scaledAmount = amount * heatMultiplier;
        const newHeat = powerLoad + scaledAmount;

        set({ powerLoad: newHeat });

        if (newHeat >= HEAT.BLACKOUT_THRESHOLD) {
          actions.triggerBlackout(HEAT.BLACKOUT_DURATION);
        }
      },

      // ----------------------------------------
      // v2.0 Monster System
      // ----------------------------------------

      updateMonsterV2Action: (dt: number) => {
        const state = get();
        const { actions } = state;

        // Build the monster system state
        const monsterSystemState = {
          phase: state.phase,
          monsterDistance: state.monsterDistance,
          monsterSpeed: state.monsterSpeed,
          monsterState: state.monsterState,
          currentTelegraph: state.currentTelegraph,
          isBlackout: state.isBlackout,
          doorState: state.doorState,
          doorClosedDuration: state.doorClosedDuration,
          activeTask: state.activeTask,
          timeElapsed: state.timeElapsed,
          monitorState: state.monitorState,
          mouseStillTime: state.mouseStillTime,
          isPlayDead: state.isPlayDead,
        };

        // Get the update from the pure function
        const update = updateMonsterV2(monsterSystemState, dt);

        // Apply updates
        if (update.monsterDistance !== undefined) {
          set({ monsterDistance: update.monsterDistance });
        }
        if (update.monsterState !== undefined) {
          set({ monsterState: update.monsterState });
        }
        if (update.threat !== undefined) {
          set({ threat: update.threat });
        }
        if (update.threatEased !== undefined) {
          set({ threatEased: update.threatEased });
        }
        if (update.timeElapsed !== undefined) {
          set({ timeElapsed: update.timeElapsed });
        }
        if (update.currentTelegraph !== undefined) {
          set({ currentTelegraph: update.currentTelegraph });
        }
        if (update.phase !== undefined) {
          set({ phase: update.phase });
        }

        // Add logs if any
        if (update.logs) {
          update.logs.forEach(log => actions.addTerminalLog(log));
        }

        // Handle Audio/Strobe triggers
        if (update.triggerAudio) {
          if (update.triggerAudio === 'voice_mom') {
            AudioManager.instance.playMomVoice();
          } else if (update.triggerAudio === 'voice_child') {
            AudioManager.instance.playChildCry();
          } else if (update.triggerAudio === 'voice_man') {
            AudioManager.instance.playManShout();
          } else {
            AudioManager.instance.playOneShot(update.triggerAudio, 0.8);
          }
        }
        if (update.triggerStrobe) {
          actions.triggerStrobeFrenzy(update.triggerStrobe);
        }

        // Handle game over
        if (update.phase === 'gameOver') {
          AudioManager.instance.playOneShot('jumpscare');
        }

        // ============================
        // JUMPSCARE SYSTEM (Random)
        // ============================
        // Only trigger if no active jumpscare and game is actively played (not start/loading/gameover)
        if (!state.activeJumpscare && state.phase !== 'start' && state.phase !== 'loading' && state.phase !== 'gameOver') {
          const rand = Math.random();
          const isRoomView = state.monitorState === 'OFF';

          if (isRoomView) {
            // Room Jumpscares (Hallway, Desk, Server)
            if (rand < 0.0003) {
              // Inverted Face (0.0% - 0.03%)
              actions.triggerJumpscare('HL_INV_FACE', 1500);
              AudioManager.instance.playOneShot('jumpscareSting', 0.7);
            } else if (rand < 0.0006) {
              // Bloody Board (0.03% - 0.06%)
              actions.triggerJumpscare('BD_BLOODY', 5000);
            } else if (rand < 0.0010) {
              // Server Rack Eyes (0.06% - 0.10%)
              // 'props_many_eyes.png'
              actions.triggerJumpscare('SR_EYES', 3000);
              AudioManager.instance.playOneShot('manyWhispers', 0.8);
            }
          } else {
            // Monitor Jumpscares
            if (rand < 0.0003) {
              actions.triggerJumpscare('MS_CURSOR', 3000);
            }
          }
        }

      },

      // v3.3 Diegetic Actions
      useIntercom: () => {
        const { powerLoad, actions, isIntercomPlaying } = get();
        if (isIntercomPlaying) return;

        const cost = DEFENSE.INTERCOM_INITIAL_COST;

        set({
          isIntercomPlaying: true,
          powerLoad: powerLoad + cost,
          monsterDistance: Math.min(100, get().monsterDistance + DEFENSE.INTERCOM_DISTANCE_BOOST + (Math.random() * DEFENSE.INTERCOM_VARIANCE)),
        });

        actions.addTerminalLog('[SYSTEM] Intercom broadcasting to Hallway 105...');
        AudioManager.instance.playOneShot('intercom', 0.8);

        // Cooldown based on sound duration (approx 15s)
        setTimeout(() => {
          set({ isIntercomPlaying: false });
        }, 15000);

        // Check blackout after cost
        if (get().powerLoad >= HEAT.BLACKOUT_THRESHOLD) {
          actions.triggerBlackout(HEAT.BLACKOUT_DURATION);
        }
      },


      setPlayDead: (active: boolean) => {
        set({ isPlayDead: active, mouseStillTime: 0 });
      },

      handleMouseMove: (x: number, y: number) => {
        const { lastMousePos } = get();
        const dx = Math.abs(x - lastMousePos.x);
        const dy = Math.abs(y - lastMousePos.y);

        if (dx > STEALTH.MOUSE_STILL_THRESHOLD || dy > STEALTH.MOUSE_STILL_THRESHOLD) {
          set({ mouseStillTime: 0, lastMousePos: { x, y } });
        } else {
          set({ lastMousePos: { x, y } });
        }
      },

      updateStealth: (dt: number) => {
        const { isPlayDead, mouseStillTime } = get();
        if (isPlayDead) {
          set({ mouseStillTime: mouseStillTime + dt });
        }

        // Random Insect Cursor (Example of random subtle effect)
        // Implementation logic handled in component usually, but state could be here.
      },

      // v3.3 Jumpscare Actions
      triggerJumpscare: (id: string, duration: number = 1000) => {
        const { triggeredJumpscares } = get();

        // If unique scare and already triggered, skip? 
        // For now, let caller decide unique ID vs reusable ID.
        // e.g. "BOOT_GLITCH_ONCE" vs "BOOT_GLITCH"

        set({
          activeJumpscare: id,
          triggeredJumpscares: [...triggeredJumpscares, id]
        });

        if (duration > 0) {
          setTimeout(() => {
            get().actions.clearJumpscare();
          }, duration);
        }
      },

      clearJumpscare: () => {
        set({ activeJumpscare: null });
      },
    },
  }))
);

// ============================================
// SELECTORS
// ============================================

export const selectTotalGlitch = (state: StoreState) =>
  Math.min(1, state.glitch.intensity + state.glitch.spike);

export const selectCompletedModuleCount = (state: StoreState) =>
  Object.values(state.moduleProgress).filter((p) => p.completed).length;

export const selectCurrentModule = (state: StoreState) =>
  state.puzzleDefs[state.currentModuleIndex];

export const selectCurrentStep = (state: StoreState) => {
  const module = state.puzzleDefs[state.currentModuleIndex];
  if (!module) return null;
  const progress = state.moduleProgress[module.id];
  return module.steps[progress.stepIndex] || null;
};

export const selectCanAssignTask = (taskId: TaskId) => (state: StoreState) =>
  state.activeTask === null &&
  state.taskCooldowns[taskId] <= 0 &&
  !state.tasksDisabled &&
  state.phase !== 'gameOver' &&
  state.phase !== 'ending' &&
  state.phase !== 'finalCompile';

export const selectFlashlight = (state: StoreState) => state.flashlight;
export const selectIsBlackout = (state: StoreState) => state.blackoutRemaining > 0;

export const selectPhase = (state: StoreState) => state.phase;
export const selectPowerLoad = (state: StoreState) => state.powerLoad;
export const selectMonitorState = (state: StoreState) => state.monitorState;
export const selectMonsterState = (state: StoreState) => state.monsterState;
export const selectDoorState = (state: StoreState) => state.doorState;
export const selectIsDoorHeld = (state: StoreState) => state.isDoorHeld;
export const selectDoorClosedDuration = (state: StoreState) => state.doorClosedDuration;
export const selectMonsterDistance = (state: StoreState) => state.monsterDistance;
export const selectThreat = (state: StoreState) => state.threat;
export const selectThreatEased = (state: StoreState) => state.threatEased;
