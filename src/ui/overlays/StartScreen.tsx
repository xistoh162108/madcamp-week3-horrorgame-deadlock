import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StartScreenProps {
    onStart: () => void;
    loadingProgress: number; // 0 to 1
    isLoaded: boolean;
}

export function StartScreen({
    onStart,
    loadingProgress,
    isLoaded,
}: StartScreenProps) {
    const [showPressStart, setShowPressStart] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            const timer = setTimeout(() => setShowPressStart(true), 500);
            return () => clearTimeout(timer);
        }
    }, [isLoaded]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden" style={{ backgroundColor: '#000' }}>
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[url('/images/scanlines.png')] opacity-10 pointer-events-none" />
            <div className="absolute inset-0 bg-crt-dark opacity-90" style={{ backgroundColor: '#0a0a0a' }} />

            {/* Animated Background Noise/Vignette */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)'
                }}
            />

            <div className="relative z-10 flex flex-col items-center w-full max-w-3xl px-8">
                {/* Title Block */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-8xl font-mono font-bold text-crt-green mb-2 crt-glow tracking-tighter animate-pulse-slow">
                        DEADLOCK
                    </h1>
                    <p className="text-crt-green/60 font-mono text-xl tracking-[0.5em] uppercase">
                        The Admin of Room 104
                    </p>
                </motion.div>

                {/* Loading / Start Section */}
                <div className="w-full max-w-md h-24 flex flex-col items-center justify-center">
                    {!isLoaded ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full space-y-2"
                        >
                            <div className="flex justify-between text-crt-green/40 font-mono text-xs uppercase">
                                <span>System Initialization</span>
                                <span>{Math.floor(loadingProgress * 100)}%</span>
                            </div>
                            <div className="w-full h-1 bg-crt-green/20">
                                <motion.div
                                    className="h-full bg-crt-green"
                                    style={{ width: `${loadingProgress * 100}%` }}
                                />
                            </div>
                            <div className="text-crt-green/20 font-mono text-xs truncate">
                                {loadingProgress < 0.2 && "Loading core modules..."}
                                {loadingProgress >= 0.2 && loadingProgress < 0.5 && "Mounting file system..."}
                                {loadingProgress >= 0.5 && loadingProgress < 0.8 && "Initializing audio engine..."}
                                {loadingProgress >= 0.8 && "Establishing secure connection..."}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onStart}
                            className="group relative px-12 py-4 mb-4"
                        >
                            <div className="absolute inset-0 border border-crt-green/40 group-hover:border-crt-green transition-colors" />
                            <div className="absolute inset-0 bg-crt-green/0 group-hover:bg-crt-green/10 transition-colors" />

                            <span className="font-mono text-xl text-crt-green tracking-widest uppercase group-hover:text-white transition-colors">
                                [ Initialize ]
                            </span>
                        </motion.button>
                    )}
                </div>

                {/* Footer */}
                <motion.div
                    animate={{ opacity: showPressStart ? [0, 1, 0] : 0 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mt-12 text-crt-green/30 font-mono text-sm uppercase tracking-wider"
                >
                    {isLoaded && "Press Button to Begin Escape Sequence"}
                </motion.div>
            </div>

            {/* Mobile Warning */}
            <div className="absolute bottom-4 left-4 flex flex-col items-start text-xs font-mono">
                <div className="text-crt-green/20">v0.0.1 // EARLY ACCESS</div>
                <div className="md:hidden text-error/60 mt-1 animate-pulse">
                    [!] PHYSICAL KEYBOARD REQUIRED FOR OPTIMAL EXPERIENCE
                </div>
            </div>
        </div>
    );
}

