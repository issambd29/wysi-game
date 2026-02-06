import { motion } from "framer-motion";
import { Move, Wind, Droplets, Zap } from "lucide-react";

export default function Controls() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
          Command the Elements
        </h1>
        <p className="text-lg text-white/60 font-body">
          Master these ancient techniques to heal the land.
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
              <Move className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Movement</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Use <kbd className="bg-white/10 px-2 py-1 rounded text-white font-sans text-sm mx-1">W</kbd>
                <kbd className="bg-white/10 px-2 py-1 rounded text-white font-sans text-sm mx-1">A</kbd>
                <kbd className="bg-white/10 px-2 py-1 rounded text-white font-sans text-sm mx-1">S</kbd>
                <kbd className="bg-white/10 px-2 py-1 rounded text-white font-sans text-sm mx-1">D</kbd>
                or Arrow Keys to navigate the sacred grove.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Purification</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Your presence automatically cleanses nearby corruption. 
                Stand near withered plants to restore their vitality.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Wind className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Gust</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Press <kbd className="bg-white/10 px-2 py-1 rounded text-white font-sans text-sm mx-1">Space</kbd> 
                to release a burst of wind, scattering dark spores away from you.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Droplets className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-accent mb-2">Nurture</h3>
              <p className="text-white/60 font-body leading-relaxed">
                Hold <kbd className="bg-white/10 px-2 py-1 rounded text-white font-sans text-sm mx-1">E</kbd> 
                near water sources to gather essence, then release near saplings to accelerate growth.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Background decoration image */}
      {/* Stone carvings or runes in a forest */}
      <div className="fixed inset-0 z-[-1] opacity-20">
         <img 
          src="https://pixabay.com/get/gcaab5ceb4c5fa1f0cef0ed3dd3df2e67df0df5e4e43be28babb6fc621830a6f9cffae11342f73c416658425c373dcfe310080c4fa1e9ad827337659a1b92bcbb_1280.jpg"
          alt="Ancient Textures"
          className="w-full h-full object-cover object-center grayscale mix-blend-overlay"
        />
      </div>
    </div>
  );
}
