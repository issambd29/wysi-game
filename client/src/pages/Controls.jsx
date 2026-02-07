import { motion } from "framer-motion";
import { MoveHorizontal, Crosshair, Package, Sparkles, Timer, Wind, Shield, Zap, Heart, Clock, Pause, Trophy, Smartphone } from "lucide-react";

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
    <div className="min-h-screen pt-20 sm:pt-32 pb-24 sm:pb-12 px-4 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-8 sm:mb-16 space-y-3 sm:space-y-4"
      >
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
          How to Play
        </h1>
        <p className="text-sm sm:text-lg text-white/60 font-body px-2">
          Learn the controls and mechanics to defend Earth from pollution.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl w-full"
      >
        <motion.div variants={item} className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <MoveHorizontal className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-accent mb-2">Movement</h3>
              <p className="text-white/60 font-body text-sm leading-relaxed">
                Press <kbd className="bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-white font-sans text-xs sm:text-sm mx-0.5 sm:mx-1">A</kbd>
                to move left and
                <kbd className="bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-white font-sans text-xs sm:text-sm mx-0.5 sm:mx-1">D</kbd>
                to move right. Guide your keeper across the bottom of the screen.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-accent mb-2">Touch Controls</h3>
              <p className="text-white/60 font-body text-sm leading-relaxed">
                On mobile, use the on-screen arrow buttons at the bottom corners to move left and right. Shooting is automatic.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Crosshair className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-accent mb-2">Auto-Shooting</h3>
              <p className="text-white/60 font-body text-sm leading-relaxed">
                Your keeper automatically fires purification shots upward. Hit falling garbage to destroy it before it reaches the ground.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-accent mb-2">Garbage Collection</h3>
              <p className="text-white/60 font-body text-sm leading-relaxed">
                Catch falling garbage containers directly with your keeper for bonus points. Collecting trash earns more than shooting it.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-accent mb-2">Combo System</h3>
              <p className="text-white/60 font-body text-sm leading-relaxed">
                Chain rapid hits together to build combos. Higher combos multiply your score. Keep hitting garbage quickly to maintain your streak.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Wind className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-accent mb-2">Wind Effects</h3>
              <p className="text-white/60 font-body text-sm leading-relaxed">
                Watch for the wind indicator. Wind pushes falling garbage sideways, making it harder to predict where trash will land.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-accent mb-2">Power-Ups</h3>
              <p className="text-white/60 font-body text-sm leading-relaxed">
                Collect glowing power-ups that fall from the sky. Four types available:
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-2.5 sm:px-3 py-2 border border-white/[0.06]">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-white/50 text-xs font-body">Rapid Fire</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-2.5 sm:px-3 py-2 border border-white/[0.06]">
                  <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-white/50 text-xs font-body">Shield</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-2.5 sm:px-3 py-2 border border-white/[0.06]">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-white/50 text-xs font-body">Score Boost</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-2.5 sm:px-3 py-2 border border-white/[0.06]">
                  <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-white/50 text-xs font-body">Heal</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-sky-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-accent mb-2">Win Timer</h3>
              <p className="text-white/60 font-body text-sm leading-relaxed">
                Survive for 1 minute to save Earth. The countdown timer turns amber under 30 seconds and red under 10.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
