import { motion } from "framer-motion";
import { MoveHorizontal, Crosshair, Package, Sparkles, Timer, Wind, Shield, Zap, Heart, Clock, Pause, Trophy } from "lucide-react";

export default function Controls() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-16 space-y-4"
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
          How to Play
        </h1>
        <p className="text-lg text-white/60 font-body">
          Learn the controls and mechanics to defend Earth from pollution.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl w-full"
      >
        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <MoveHorizontal className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Movement</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Press <kbd className="bg-white/10 px-2 py-1 rounded text-white font-sans text-sm mx-1">A</kbd>
                to move left and
                <kbd className="bg-white/10 px-2 py-1 rounded text-white font-sans text-sm mx-1">D</kbd>
                to move right. Guide your keeper across the bottom of the screen to dodge falling garbage.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Crosshair className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Auto-Shooting</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Your keeper automatically fires purification shots upward. Hit falling garbage to destroy it before it reaches the ground and damages Earth.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Package className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Garbage Collection</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Catch falling garbage containers directly with your keeper for bonus points. Collecting trash earns more than just shooting it.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Combo System</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Chain rapid hits together to build combos. Higher combos multiply your score. Keep hitting garbage quickly to maintain your streak.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Wind className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Wind Effects</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Watch for the wind indicator in the HUD. Wind pushes falling garbage sideways, making it harder to predict where trash will land.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Power-Ups</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Collect glowing power-ups that fall from the sky. Four types available:
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.06]">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-white/50 text-xs font-body">Rapid Fire</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.06]">
                  <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-white/50 text-xs font-body">Shield</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.06]">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-white/50 text-xs font-body">Score Boost</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.06]">
                  <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-white/50 text-xs font-body">Heal</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Win Timer</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Survive for 1 minute to save Earth. A countdown timer in the HUD tracks your remaining time. It turns amber under 30 seconds and red under 10.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Pause className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Pause</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Press <kbd className="bg-white/10 px-2 py-1 rounded text-white font-sans text-sm mx-1">ESC</kbd>
                at any time to pause the game. From there you can resume, restart the level, or exit to the home screen.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
