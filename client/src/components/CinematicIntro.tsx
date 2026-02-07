import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, TreePine, Droplets, Wind, Skull, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CinematicIntroProps {
  onComplete: () => void;
  onSkip: () => void;
}

const SCENES = [
  {
    id: "nature",
    duration: 4000,
    title: "In the beginning...",
    subtitle: "Nature thrived in perfect balance",
    bg: "radial-gradient(ellipse at 50% 60%, hsl(150, 40%, 12%) 0%, hsl(160, 30%, 6%) 60%, #000 100%)",
    icons: [
      { Icon: TreePine, color: "text-emerald-400", x: "20%", y: "40%", delay: 0.3 },
      { Icon: Leaf, color: "text-green-400", x: "50%", y: "35%", delay: 0.6 },
      { Icon: Droplets, color: "text-sky-400", x: "75%", y: "45%", delay: 0.9 },
      { Icon: TreePine, color: "text-emerald-500", x: "35%", y: "55%", delay: 1.2 },
      { Icon: Wind, color: "text-teal-300", x: "65%", y: "30%", delay: 1.5 },
    ],
    particleColor: "rgba(74,222,128,0.3)",
    glowColor: "rgba(74,222,128,0.08)",
  },
  {
    id: "pollution",
    duration: 4000,
    title: "But darkness fell...",
    subtitle: "Pollution rained from the skies, choking the land",
    bg: "radial-gradient(ellipse at 50% 30%, hsl(40, 15%, 10%) 0%, hsl(30, 10%, 5%) 60%, #000 100%)",
    icons: [
      { Icon: Skull, color: "text-red-400", x: "30%", y: "25%", delay: 0.2 },
      { Icon: AlertTriangle, color: "text-orange-400", x: "55%", y: "20%", delay: 0.5 },
      { Icon: Skull, color: "text-red-500", x: "70%", y: "35%", delay: 0.8 },
      { Icon: AlertTriangle, color: "text-yellow-500", x: "40%", y: "40%", delay: 1.1 },
      { Icon: Skull, color: "text-red-300", x: "25%", y: "50%", delay: 1.4 },
    ],
    particleColor: "rgba(200,80,50,0.2)",
    glowColor: "rgba(200,80,50,0.06)",
  },
  {
    id: "darkness",
    duration: 4000,
    title: "Nature grew weak...",
    subtitle: "The forests withered, rivers turned dark",
    bg: "radial-gradient(ellipse at 50% 50%, hsl(0, 8%, 6%) 0%, hsl(0, 5%, 3%) 60%, #000 100%)",
    icons: [
      { Icon: TreePine, color: "text-zinc-600", x: "25%", y: "45%", delay: 0.3 },
      { Icon: Leaf, color: "text-zinc-700", x: "50%", y: "40%", delay: 0.6 },
      { Icon: Droplets, color: "text-zinc-600", x: "70%", y: "50%", delay: 0.9 },
    ],
    particleColor: "rgba(100,100,100,0.15)",
    glowColor: "rgba(80,80,80,0.04)",
  },
  {
    id: "awakening",
    duration: 5000,
    title: "The Earth Keeper awakens",
    subtitle: "Nature gives you one chance. Protect it.",
    bg: "radial-gradient(ellipse at 50% 50%, hsl(150, 35%, 10%) 0%, hsl(140, 25%, 5%) 40%, #000 100%)",
    icons: [
      { Icon: Sparkles, color: "text-amber-400", x: "45%", y: "35%", delay: 0.5 },
      { Icon: Leaf, color: "text-emerald-300", x: "50%", y: "42%", delay: 1.0 },
      { Icon: Sparkles, color: "text-amber-300", x: "55%", y: "35%", delay: 1.5 },
    ],
    particleColor: "rgba(250,200,50,0.2)",
    glowColor: "rgba(74,222,128,0.12)",
  },
];

export function CinematicIntro({ onComplete, onSkip }: CinematicIntroProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);

  useEffect(() => {
    if (currentScene < SCENES.length - 1) {
      const timer = setTimeout(() => {
        setCurrentScene(s => s + 1);
      }, SCENES[currentScene].duration);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowPlayButton(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScene]);

  const scene = SCENES[currentScene];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#000" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: scene.bg }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: scene.id === "pollution" ? -20 : 20 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: scene.id === "pollution" ? [-(i * 10), 400] : [i * 20, -(i * 15)],
                  x: [0, (i % 2 === 0 ? 15 : -15)],
                }}
                transition={{
                  duration: 4 + (i % 3) * 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "linear",
                }}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${5 + (i * 5) % 90}%`,
                  top: scene.id === "pollution" ? "0%" : "80%",
                  backgroundColor: scene.particleColor,
                  boxShadow: `0 0 6px ${scene.particleColor}`,
                }}
              />
            ))}
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${scene.glowColor} 0%, transparent 60%)`,
            }}
          />

          {scene.icons.map(({ Icon, color, x, y, delay }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{
                opacity: [0, 0.7, 0.5],
                scale: [0.3, 1.1, 1],
                y: [10, 0, -5],
              }}
              transition={{ duration: 2, delay, ease: "easeOut" }}
              className="absolute"
              style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
            >
              <Icon className={`w-10 h-10 ${color}`} style={{ filter: `drop-shadow(0 0 10px currentColor)` }} />
            </motion.div>
          ))}

          <div className="relative z-10 text-center px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-4xl md:text-6xl font-display text-white/90 mb-4 tracking-tight"
              style={{ textShadow: "0 0 40px rgba(255,255,255,0.1)" }}
            >
              {scene.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 1 }}
              className="text-lg md:text-xl font-body text-white/50 max-w-lg mx-auto"
            >
              {scene.subtitle}
            </motion.p>

            {scene.id === "awakening" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="mt-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)",
                    boxShadow: "0 0 60px rgba(74,222,128,0.1)",
                  }}
                >
                  <Leaf className="w-14 h-14 text-emerald-400" style={{ filter: "drop-shadow(0 0 15px rgba(74,222,128,0.5))" }} />
                </motion.div>
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {showPlayButton && scene.id === "awakening" && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
                className="absolute bottom-[18%] z-20"
              >
                <Button
                  size="lg"
                  onClick={onComplete}
                  className="rounded-full text-lg font-display tracking-[0.3em] uppercase overflow-visible border border-emerald-400/40"
                  style={{
                    background: "linear-gradient(135deg, rgba(6,78,59,0.8) 0%, rgba(22,101,52,0.6) 100%)",
                    boxShadow: "0 0 50px rgba(74,222,128,0.2), 0 0 100px rgba(74,222,128,0.1)",
                  }}
                  data-testid="button-play-now"
                >
                  <Leaf className="w-5 h-5 mr-2 text-emerald-300" />
                  <span className="text-white">PLAY NOW</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2">
          {SCENES.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 rounded-full transition-all duration-500 ${
                i <= currentScene ? "bg-white/30 w-6" : "bg-white/10 w-3"
              }`}
            />
          ))}
        </div>
        <button
          onClick={onSkip}
          className="text-white/20 text-xs font-display tracking-[0.3em] uppercase hover:text-white/40 transition-colors"
          data-testid="button-skip-intro"
        >
          SKIP
        </button>
      </div>
    </motion.div>
  );
}
