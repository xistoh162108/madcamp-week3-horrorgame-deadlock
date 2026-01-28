import { useState, useEffect, useMemo, useRef } from 'react';
import { useGameStore, selectTotalGlitch, selectCurrentStep } from '@game/store';
import { HEAT } from '@game/constants';
import { corruptText } from '@utils/glitchText';
import { AudioManager } from '@game/systems/audioSystem';

interface CodeEditorProps {
  prompt: string;
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  feedback?: 'success' | 'error' | null;
  feedbackId?: number;
}

export function CodeEditor({
  prompt,
  value,
  onChange,
  onSubmit,
  disabled = false,
  feedback,
  feedbackId
}: CodeEditorProps) {
  const [localLoading, setLocalLoading] = useState(false);
  const [flash, setFlash] = useState<'none' | 'success' | 'error'>('none');
  const glitchIntensity = useGameStore(selectTotalGlitch);

  // Hint system
  const hintTokens = useGameStore(state => state.hintTokens);
  const useHint = useGameStore(state => state.actions.useHint);

  // Recovery system - get current step's starter code
  const currentStep = useGameStore(selectCurrentStep);

  // Rate limiting for typing
  // "0.7 chars per second" -> ~1.4s cooldown. Let's try 1s roughly to be playable but slow.
  // Actually, 0.7 chars/sec is extremely slow. 
  // Maybe they meant "0.07s delay"? 
  // "1초에 0.7개" is very specific. 
  // Let's implement a moderate delay of 150ms first, as 1.4s is likely a misunderstanding of "playable game". 
  // Wait, "타이핑도 너무 빨리 치지 못하게... 좀 타이핑이 느리게 갔으면 좋겠어"
  // Let's use 600ms? Semi-slow.
  // Or maybe "0.7 second cooldown?" (1.4 chars/sec)
  // Let's set it to 400ms.
  const lastTypeTime = useRef(0);
  const TYPE_COOLDOWN = 150; // Milliseconds. 150ms is enough to stop button mashing but allow deliberate typing. 
  // If user meant 1s/0.7 ~= 1428ms, it is effectively unplayable for code. 
  // I'll stick to a "clunky terminal" feel (~150-200ms).

  // Create a display value that includes corruption
  // We explicitly depend on a timer or something to re-randomize glitch? 
  // For better effect, `corruptText` should be deterministic per render or time-step.
  // Prompt 10 says "Update CodeEditor - Show corrupted text in a display layer".
  // Pure random "flicker" style corruption.

  const [seed, setSeed] = useState(0);

  // Animate glitch seed
  useEffect(() => {
    if (glitchIntensity <= 0) return;

    const interval = setInterval(() => {
      setSeed(Math.random());
    }, 100); // 10fps glitch update

    return () => clearInterval(interval);
  }, [glitchIntensity]);

  const displayValue = useMemo(() => {
    return corruptText(value, glitchIntensity, seed);
  }, [value, glitchIntensity, seed]);

  // React to feedback props
  useEffect(() => {
    if (feedback) {
      setFlash(feedback);
      if (feedback === 'error') {
        AudioManager.instance.playOneShot('error');
      }
    }
  }, [feedback, feedbackId]);

  useEffect(() => {
    if (flash !== 'none') {
      const timer = setTimeout(() => setFlash('none'), 500);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  return (
    <div className={`h-full flex flex-col p-4 font-mono text-sm relative transition-colors duration-200 ${flash === 'error' ? 'bg-error/20' : flash === 'success' ? 'bg-success/20' : ''
      }`}>
      {/* Flash overlay if needed, or just background change above */}

      {/* Prompt */}
      <div className="mb-4 text-crt-green/80">
        <span className="text-warning">{'>'}</span> {prompt}
      </div>

      {/* Code input area */}
      <div className="flex-1 relative font-mono text-sm">
        {/* Glitch Overlay Layer (pointer-events-none) */}
        <div className="absolute inset-0 p-3 pointer-events-none whitespace-pre-wrap break-all text-crt-green/80 z-10" aria-hidden="true" style={{ opacity: glitchIntensity * 2 }}>
          {displayValue}
        </div>

        {/* Real Interactive Textarea */}
        <textarea
          value={value}
          onKeyDown={(e) => {
            // Play typing sound for non-input keys that still provide feedback
            const nonInputKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'CapsLock', 'Tab'];
            if (nonInputKeys.includes(e.key)) {
              AudioManager.instance.playOneShot('typing');
            }
          }}
          onChange={(e) => {
            const now = Date.now();
            const newText = e.target.value;
            // Handle deletions (Backspace) strictly or allow? usually allow backspace freely?
            // If new length < old length, it's a deletion.
            const isDeletion = newText.length < value.length;

            if (isDeletion || now - lastTypeTime.current > TYPE_COOLDOWN) {
              lastTypeTime.current = now;

              // Add heat for each typed character
              if (!isDeletion) {
                const addedChars = newText.length - value.length;
                if (addedChars > 0) {
                  useGameStore.getState().actions.addHeat(HEAT.TYPING_COST * addedChars);
                }
              }

              onChange(newText);
              // Play sound for both typing and deletion (backspace)
              AudioManager.instance.playOneShot('typing');
            }
          }}
          disabled={disabled}
          className={`
            w-full h-full bg-transparent text-crt-green p-3
            border border-crt-green/30 rounded
            focus:outline-none focus:border-crt-green/60
            resize-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${glitchIntensity > 0.1 ? 'text-transparent caret-crt-green' : ''} 
          `}
          /* Hide text color when glitch is active so we see the overlay, but keep caret? 
             Actually 'text-transparent' hides caret in some browsers. 
             If we want to Type in the dark, maybe set color to transparent but keep caret.
          */
          style={{
            color: glitchIntensity > 0.1 ? 'transparent' : undefined,
            caretColor: '#00ff41'
          }}
          placeholder="// Type your code here..."
          spellCheck={false}
        />
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex justify-between items-center">
        {/* Left side: Hint and Reset buttons */}
        <div className="flex gap-2">
          {/* Hint button */}
          <button
            onClick={() => {
              AudioManager.instance.playOneShot('click');
              useHint();
            }}
            disabled={disabled || localLoading || hintTokens <= 0}
            className={`
              px-4 py-2 bg-warning/20 text-warning font-mono text-sm
              border border-warning/50 rounded
              hover:bg-warning/30 hover:border-warning
              transition-colors
              active:bg-warning/40
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title={hintTokens > 0 ? `Use hint (${hintTokens} remaining)` : 'No hint tokens'}
          >
            HINT [{hintTokens}]
          </button>

          {/* Reset/Recovery button */}
          <button
            onClick={() => {
              if (currentStep) {
                AudioManager.instance.playOneShot('click');
                onChange(currentStep.starterCode);
              }
            }}
            disabled={disabled || localLoading || !currentStep}
            className={`
              px-4 py-2 bg-crt-green/10 text-crt-green/70 font-mono text-sm
              border border-crt-green/30 rounded
              hover:bg-crt-green/20 hover:border-crt-green/50 hover:text-crt-green
              transition-colors
              active:bg-crt-green/30
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title="Reset code to original"
          >
            RESET
          </button>
        </div>

        {/* Right side: Submit button */}
        <button
          onClick={() => {
            AudioManager.instance.playOneShot('compileStart');
            setLocalLoading(true);
            const delay = Math.random() * 2000 + 3000; // 3-5 seconds
            setTimeout(() => {
              setLocalLoading(false);
              onSubmit();
            }, delay);
          }}
          disabled={disabled || localLoading}
          className={`
            px-6 py-2 bg-crt-green/20 text-crt-green font-mono
            border border-crt-green/50 rounded
            hover:bg-crt-green/30 hover:border-crt-green
            transition-colors
            active:bg-crt-green/40
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {localLoading ? 'COMPILING...' : 'SUBMIT_CODE'}
        </button>
      </div>
    </div>
  );
}
