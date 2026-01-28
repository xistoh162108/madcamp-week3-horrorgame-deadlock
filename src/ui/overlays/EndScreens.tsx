import { useGameStore } from '@game/store';
import { motion } from 'framer-motion';
import storyData from '@game/data/story.json';

interface EndScreensProps {
  onRestart: () => void;
}

export function EndScreens({ onRestart }: EndScreensProps) {
  const endingType = useGameStore((state) => state.endingType);
  const phase = useGameStore((state) => state.phase);

  // Stats
  const timeElapsed = useGameStore((state) => state.timeElapsed);
  const totalMistakes = useGameStore((state) => state.totalMistakes);
  const totalHintsUsed = useGameStore((state) => state.totalHintsUsed);
  const totalTasksAssigned = useGameStore((state) => state.totalTasksAssigned);

  if (phase !== 'ending' && phase !== 'gameOver') return null;

  // Use 'gameOver' type for Game Over phase
  const type = phase === 'gameOver' ? 'gameOver' : (endingType || 'bad');

  // Cast storyData.endings to any to access dynamic properties safely
  const endingsData = storyData.endings as Record<string, any>;
  const content = endingsData[type];

  // Assuming storyData matches the structure we need. 
  // If content is undefined (shouldn't be), we provide a fallback
  if (!content) {
    console.error(`Missing ending data for type: ${type}`);
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isGood = type === 'good' || type === 'secret';
  const isBad = type === 'bad' || type === 'gameOver';

  const titleColor = isGood ? 'text-success' : (isBad ? 'text-error' : 'text-warning');
  const borderColor = isGood ? 'border-success/30' : (isBad ? 'border-error/30' : 'border-warning/30');

  // Background Image for Endings
  const bgImage = type === 'gameOver' || type === 'bad' ? '/images/ending_bad.png' : (isGood ? '/images/ending_good.png' : 'none');

  return (
    <div className="absolute inset-0 z-[100] pointer-events-auto">
      {/* Jumpscare Flash - Visible IMMEDIATELY (ignores parent fade-in) */}
      {type === 'gameOver' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [1, 1.2, 1.5, 2] }}
          transition={{ duration: 0.5, times: [0, 0.1, 0.4, 0.5], ease: "easeOut" }}
          className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none bg-black"
        >
          <img src="/images/jumpscare_flash.png" alt="Jumpscare" className="w-full h-full object-cover mix-blend-lighten" />
          <div className="absolute inset-0 bg-red-600/30 mix-blend-color-dodge animate-pulse" />
        </motion.div>
      )}

      {/* Main Content & Background - Slow Fade In */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 flex items-center justify-center text-center p-8 backdrop-blur-sm overflow-hidden"
        style={{
          backgroundColor: bgImage !== 'none' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.95)',
          backgroundImage: bgImage !== 'none' ? `url(${bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className={`max-w-2xl w-full border ${borderColor} bg-black/50 p-10 rounded-sm relative overflow-hidden`}>

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-4xl font-mono font-bold mb-8 ${titleColor} tracking-widest uppercase`}
          >
            {content.title}
          </motion.h1>

          {/* Narrative Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 2 }}
            className="space-y-4 mb-10 font-mono text-crt-green/80 text-lg leading-relaxed"
          >
            {Array.isArray(content.text) && content.text.map((line: string, i: number) => (
              <p key={i} className={line === "" ? "h-4" : ""}>{line}</p>
            ))}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="border-t border-crt-green/10 pt-6 mb-8 flex flex-col items-center gap-2 font-mono text-sm text-center"
          >
            <div className="flex gap-8 justify-center">
              <p className="text-crt-green/60">TIME: <span className="text-white ml-2">{formatTime(timeElapsed)}</span></p>
              <p className="text-crt-green/60">TASKS: <span className="text-white ml-2">{totalTasksAssigned}</span></p>
            </div>
            <div className="flex gap-8 justify-center">
              <p className="text-crt-green/60">ERRORS: <span className="text-error ml-2">{totalMistakes}</span></p>
              <p className="text-crt-green/60">HINTS: <span className="text-warning ml-2">{totalHintsUsed}</span></p>
            </div>
            <div className="mt-4 italic text-crt-green/40">
              "{content.stats}"
            </div>
          </motion.div>

          {/* Restart Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
            onClick={onRestart}
            className="px-8 py-3 bg-crt-green/10 border border-crt-green/30 text-crt-green hover:bg-crt-green/20 hover:text-white transition-all font-mono uppercase tracking-widest text-sm"
          >
            {type === 'gameOver' ? 'REBOOT SYSTEM' : 'PLAY AGAIN'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
