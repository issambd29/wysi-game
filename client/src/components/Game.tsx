import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Wind, Sparkles, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameProps {
  onExit: () => void;
  nickname: string;
}

export function Game({ onExit, nickname }: GameProps) {
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple "cleaning" game logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOver) return;
      setParticles(prev => [
        ...prev,
        { id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [gameOver]);

  const cleanPollution = (id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
    setScore(s => s + 10);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* Game Header */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-white/50 text-xs tracking-widest uppercase">Guardian</p>
            <p className="text-white font-display text-xl">{nickname}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-white/50 text-xs tracking-widest uppercase">Energy</p>
            <p className="text-accent font-display text-2xl">{score}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onExit}
            className="rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>

      {/* Game Canvas / Area */}
      <div className="relative w-full max-w-4xl aspect-video bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className="absolute cursor-pointer group"
              onClick={() => cleanPollution(p.id)}
            >
              <div className="w-8 h-8 bg-destructive/40 rounded-full blur-md group-hover:bg-destructive/60 transition-colors" />
              <Wind className="absolute inset-0 w-8 h-8 text-destructive/80 p-1" />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {particles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/20">
            <Sparkles className="w-12 h-12 animate-pulse" />
          </div>
        )}

        {/* Ambient Nature */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
      </div>

      <div className="mt-8 text-center space-y-2">
        <p className="text-white/70 font-body italic">"Cleanse the pollution to restore the forest's heartbeat."</p>
        <div className="flex items-center justify-center gap-4 text-white/40 text-sm uppercase tracking-tighter">
          <span>Move: Auto</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>Action: Click to Purify</span>
        </div>
      </div>
    </motion.div>
  );
}
