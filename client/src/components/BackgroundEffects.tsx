import { motion } from "framer-motion";

export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep overlay vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />
      
      {/* Floating Particles/Pollen */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-accent/30 blur-[1px]"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
            scale: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0, 0.6, 0],
            scale: [0, Math.random() * 2 + 1, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
          style={{
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
          }}
        />
      ))}

      {/* Light Shafts */}
      <div className="absolute top-[-20%] left-[20%] w-[200px] h-[150vh] bg-white/5 rotate-[25deg] blur-3xl transform-gpu pointer-events-none" />
      <div className="absolute top-[-20%] right-[30%] w-[300px] h-[150vh] bg-accent/5 rotate-[-15deg] blur-3xl transform-gpu pointer-events-none" />
    </div>
  );
}
