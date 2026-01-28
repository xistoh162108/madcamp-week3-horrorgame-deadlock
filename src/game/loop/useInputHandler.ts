import { useEffect } from 'react';
import { useGameStore } from '../store';

export function useInputHandler() {
    const actions = useGameStore(state => state.actions);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;

            const state = useGameStore.getState();
            const { monitorState, isBlackout, phase } = state;

            // Disable inputs in non-gameplay phases
            if (phase === 'loading' || phase === 'start' || phase === 'gameOver' || phase === 'ending') {
                return;
            }

            if (isBlackout) return;

            switch (e.code) {
                case 'Tab':
                    e.preventDefault();
                    actions.toggleMonitor();
                    break;

                case 'Space':
                    // Space shouldn't trigger if typing in a text area, 
                    // but our logic says it only works when monitor is OFF, 
                    // and you can't type when monitor is OFF.
                    if (monitorState === 'OFF') {
                        e.preventDefault();
                        actions.startHoldingDoor();
                    }
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                actions.stopHoldingDoor();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [actions]);
}
