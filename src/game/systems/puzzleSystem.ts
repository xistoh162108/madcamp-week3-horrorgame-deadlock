import type { GameState, PuzzleModule, PuzzleStep } from '../types';
import { validateAnswer } from '../../utils/normalizeText';
import { BALANCE } from '../constants';

export interface PuzzleUpdate {
    isCorrect: boolean;
    nextStep?: {
        stepIndex: number;
        completed: boolean;
        moduleIndex?: number;
    };
    logs: string[];
    distanceChange?: number;
    monsterDistance?: number;
    glitchSpike?: number;
    editorText?: string;
    narrative?: string;
    soundToPlay?: string;
}

export function getCurrentStep(state: GameState): { module: PuzzleModule, step: PuzzleStep } | null {
    const { puzzleDefs, currentModuleIndex, moduleProgress } = state;
    const currentModule = puzzleDefs[currentModuleIndex];
    if (!currentModule) return null;

    const progress = moduleProgress[currentModule.id];
    const currentStep = currentModule.steps[progress.stepIndex];
    
    if (!currentStep) return null;

    return { module: currentModule, step: currentStep };
}

export function submitPuzzleAnswer(state: GameState, code: string): PuzzleUpdate | null {
    const current = getCurrentStep(state);
    if (!current) return null;

    const { module, step } = current;
    const isCorrect = validateAnswer(code, step.validation);
    const logs: string[] = [];

    if (isCorrect) {
        logs.push(step.onSuccess.logMessage);
        
        let distanceChange = 0;
        if (step.onSuccess.distanceChange) {
            distanceChange = step.onSuccess.distanceChange;
        }

        const nextStepIndex = state.moduleProgress[module.id].stepIndex + 1;
        const moduleCompleted = nextStepIndex >= module.steps.length;

        let nextModuleIndex = state.currentModuleIndex;
        let nextEditorText = "";
        let narrative = "";

        if (moduleCompleted) {
            logs.push(`[SYSTEM] Module ${module.title} COMPLETE`);
            nextModuleIndex++;
            const nextModule = state.puzzleDefs[nextModuleIndex];
            if (nextModule) {
               nextEditorText = nextModule.steps[0]?.starterCode || "";
               narrative = nextModule.narrativeIntro;
            }
        } else {
             nextEditorText = module.steps[nextStepIndex]?.starterCode || "";
        }

        return {
            isCorrect: true,
            logs,
            distanceChange,
            nextStep: {
                stepIndex: nextStepIndex,
                completed: moduleCompleted,
                moduleIndex: nextModuleIndex
            },
            editorText: nextEditorText,
            narrative
        };

    } else {
        logs.push(step.onFail.logMessage);
        const failPenalty = BALANCE.FAIL_PENALTY[state.phase] || 8;
        
        let soundToPlay = undefined;
        // Calculate probability based on monster distance
        // Distance 100 (Safe) -> Threat 0 -> Probability 10%
        // Distance 0 (Danger) -> Threat 1 -> Probability 90%
        const threat = 1 - (state.monsterDistance / 100);
        const runSoundProbability = 0.1 + (threat * 0.8);

        if (Math.random() < runSoundProbability) {
             soundToPlay = 'run';
        }

        return {
            isCorrect: false,
            logs,
            monsterDistance: Math.max(0, state.monsterDistance - failPenalty),
            glitchSpike: step.onFail.glitchSpike,
            soundToPlay
        };
    }
}
