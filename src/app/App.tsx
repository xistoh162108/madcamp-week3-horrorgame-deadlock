import { useState, useEffect } from 'react';
import { useGameStore, selectThreat, selectMonitorState } from '@game/store';
import { useGameLoop } from '@game/loop/useGameLoop';
import { useInputHandler } from '@game/loop/useInputHandler';
import { GameShell } from '@ui/layout/GameShell';
import { MonitorFrame } from '@ui/panels/MonitorFrame';
import { CodeEditor } from '@ui/panels/CodeEditor';
import { Terminal } from '@ui/panels/Terminal';
import { StartScreen } from '@ui/overlays/StartScreen';
import { EndScreens } from '@ui/overlays/EndScreens';
import { GlitchOverlay } from '@ui/overlays/GlitchOverlay';
import { Howler } from 'howler';
import { AudioManager } from '@game/systems/audioSystem';

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const actions = useGameStore((state) => state.actions);
  const threat = useGameStore(selectThreat);
  const terminalLogs = useGameStore((state) => state.terminalLogs);
  const editorText = useGameStore((state) => state.editorText);
  const lastSubmitResult = useGameStore((state) => state.lastSubmitResult);
  const monitorState = useGameStore(selectMonitorState);

  // Fake Loading Sequence
  useEffect(() => {
    let mounted = true;
    let progress = 0;

    const interval = setInterval(() => {
      if (!mounted) return;

      const increment = Math.random() * 0.05 + 0.01;
      progress = Math.min(1, progress + increment);
      setLoadingProgress(progress);

      if (progress >= 1) {
        setIsLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Global Event Listeners
  useEffect(() => {
    AudioManager.instance.preload();

    const handleClick = () => {
      AudioManager.instance.playOneShot('click');
    };

    const handleMouseMove = (e: MouseEvent) => {
      actions.handleMouseMove(e.clientX, e.clientY);
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [actions]);

  // Start the game loop
  useGameLoop();

  // Handle global keyboard inputs
  useInputHandler();

  // Handle game start
  const handleStart = () => {
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume();
    }

    setIsStarted(true);
    actions.startGame();
  };

  // Handle restart
  const handleRestart = () => {
    actions.restartGame(); // Need to implement this in store if not exists, but prompt 8 might have added it.
    // Checked store.ts, restartGame exists.
  };

  // Handle code submission
  const handleSubmit = () => {
    actions.submitAnswer();
  };

  // Show start screen if not started
  if (!isStarted) {
    return (
      <StartScreen
        onStart={handleStart}
        loadingProgress={loadingProgress}
        isLoaded={isLoaded}
      />
    );
  }

  return (
    <>
      <GameShell
        monitorContent={
          <>
            <MonitorFrame glitchIntensity={threat * 0.3}>
              <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0 relative">
                  <CodeEditor
                    prompt="Fix the authentication logic below:"
                    value={editorText}
                    onChange={actions.setEditorText}
                    onSubmit={handleSubmit}
                    disabled={monitorState === 'OFF'}
                    feedback={lastSubmitResult ? lastSubmitResult.status : null}
                    feedbackId={lastSubmitResult ? lastSubmitResult.id : 0}
                  />
                </div>
                <div className="h-[180px] border-t border-crt-green/30">
                  <Terminal logs={terminalLogs} maxVisible={8} />
                </div>
              </div>
            </MonitorFrame>
          </>
        }
      />
      <GlitchOverlay />
      <EndScreens onRestart={handleRestart} />
    </>
  );
}

export default App;
