import { useGameStore, selectCompletedModuleCount, selectPowerLoad } from '@game/store';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { AudioManager } from '@game/systems/audioSystem';

export function ServerRackSection() {
    const powerLoad = useGameStore(selectPowerLoad);
    const completedModules = useGameStore(selectCompletedModuleCount);
    const actions = useGameStore(s => s.actions);
    const activeJumpscare = useGameStore(s => s.activeJumpscare);
    const lastTwitchTime = useRef(0);

    // Gauge Twitch Sound
    useEffect(() => {
        if (powerLoad > 85 && Date.now() - lastTwitchTime.current > 500) {
            AudioManager.instance.playOneShot('gauge_twitch', 0.5);
            lastTwitchTime.current = Date.now();
        }
    }, [powerLoad]);

    return (
        <div
            className="relative h-full bg-[#0a0a0a] border-l border-[#1a1a1a] p-4 flex flex-col gap-6 items-center justify-center"
            style={{
                backgroundImage: 'url(/images/server_rack_texture.jpeg)',
                backgroundSize: 'cover',
                backgroundBlendMode: 'multiply',
            }}
        >
            {/* Analog Heat Gauge */}
            <div className="flex flex-col items-center gap-2">
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Power Load</div>
                <div className="relative w-32 h-32 rounded-full border-4 border-[#1a1a1a] bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                    {/* Gauge Background Scale */}
                    <div className="absolute inset-2 rounded-full border border-gray-800" />

                    {/* Needle */}
                    <motion.div
                        className="absolute bottom-1/2 left-1/2 w-1 h-14 bg-red-600 origin-bottom -translate-x-1/2"
                        animate={{
                            rotate: (powerLoad / 100) * 180 - 90,
                            x: powerLoad > 80 ? [0, -1, 1, 0] : 0
                        }}
                        transition={{
                            rotate: { type: 'spring', stiffness: 50, damping: 10 },
                            x: { repeat: Infinity, duration: 0.1 }
                        }}
                    />

                    {/* Center Hub */}
                    <div className="z-10 w-4 h-4 rounded-full bg-[#222] border-2 border-[#111]" />

                    {/* Warning Lights */}
                    {powerLoad > 85 && (
                        <motion.div
                            className="absolute inset-0 bg-red-900/20"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                        />
                    )}
                </div>
                <div className="text-xs font-mono text-gray-400">{Math.round(powerLoad)}%</div>
            </div>

            {/* Module LEDs */}
            <div className="flex flex-col items-center gap-2 mt-4">
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Modules</div>
                <div className="flex gap-2 p-2 bg-[#0d0d0d] rounded border border-[#1a1a1a]">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-shadow duration-300 ${i < completedModules
                                ? 'bg-green-500 shadow-[0_0_10px_#00ff00]'
                                : 'bg-gray-800'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Intercom Button */}
            <div className="mt-8 flex flex-col items-center gap-2">
                <button
                    onClick={() => actions.useIntercom()}
                    className="group relative w-16 h-16 rounded-full bg-red-900 border-4 border-red-950 flex items-center justify-center active:translate-y-1 transition-transform"
                >
                    <div className="w-10 h-10 rounded-full bg-red-800 border-2 border-red-900 group-hover:bg-red-700 transition-colors" />
                    <div className="absolute -top-6 text-[10px] text-red-500 font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Remote Intercom
                    </div>
                </button>
                <div className="text-[10px] text-gray-600 font-mono uppercase">Intercom</div>
            </div>

            {/* Server Rack Detail - wires/etc */}
            <div className="absolute bottom-4 right-4 opacity-10">
                <pre className="text-[6px] leading-[6px] text-green-500">
                    {`
  | | | | | | | | |
  |               |
  |  [:::::::::]  |
  |  [:::::::::]  |
  |  [:::::::::]  |
          `}
                </pre>
            </div>

            {/* Rack Scribbles/Notes (Thematic) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Sticky Note */}
                <div className="absolute top-[30%] right-[15%] w-12 h-12 bg-yellow-200/80 rotate-3 shadow-md flex items-center justify-center p-1">
                    <div className="text-[6px] font-handwriting text-black leading-tight text-center">
                        DO NOT REBOOT
                    </div>
                </div>

                {/* Scrawled Warning */}
                <div className="absolute top-[45%] left-[20%] text-red-500/60 font-handwriting text-[10px] -rotate-6 tracking-widest uppercase">
                    It Burns
                </div>

                {/* System Label with Graffiti */}
                <div className="absolute bottom-[20%] left-[10%] right-[10%] border-t border-white/10 pt-2">
                    <div className="text-[6px] font-mono text-white/30">SYSTEM STATUS: CRITICAL</div>
                    <div className="absolute top-0 right-10 text-white/40 font-handwriting text-[8px] -rotate-2">
                        NO HOPE
                    </div>
                </div>

                <div className="absolute top-[20%] left-[10%] text-white/20 font-handwriting text-[16px] rotate-90">
                    HELP
                </div>
            </div>

            {/* JUMPSCARE: EYES */}
            <AnimatePresence>
                {activeJumpscare === 'SR_EYES' && (
                    <motion.div
                        className="absolute inset-0 z-50 pointer-events-none mix-blend-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.5, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.1 }}
                    >
                        <img
                            src="/images/props_many_eyes.png"
                            className="w-full h-full object-cover opacity-80"
                            alt="Eyes"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
