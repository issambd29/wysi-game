import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Wind, Sparkles, Trophy, X, Shield, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";

interface GameObject {
  id: number;
  x: number;
  y: number;
  type: "bottle" | "bag" | "can" | "barrel" | "oil" | "ewaste";
  speed: number;
  isToxic: boolean;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: "shield" | "beam" | "slow";
}

interface GameProps {
  onExit: () => void;
  nickname: string;
}

export function Game({ onExit, nickname }: GameProps) {
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const [playerPosition, setPlayerPosition] = useState(50);
  const [pollution, setPollution] = useState<GameObject[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);

  const gameLoopRef = useRef<number>();
  const lastShotRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const lastPowerUpRef = useRef<number>(0);

  // Game Constants
  const PLAYER_Y = 90;
  const SHOT_SPEED = 2;
  const POLLUTION_TYPES = ["bottle", "bag", "can", "barrel", "oil", "ewaste"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === "ArrowLeft" || e.key === "a") setPlayerPosition(p => Math.max(5, p - 5));
      if (e.key === "ArrowRight" || e.key === "d") setPlayerPosition(p => Math.min(95, p + 5));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (gameOver) return;

      setTime(t => t + 1/60);
      
      // Automatic Shooting
      const shotCooldown = activePowerUp === "beam" ? 150 : 300;
      if (timestamp - lastShotRef.current > shotCooldown) {
        setProjectiles(prev => [...prev, { id: Date.now(), x: playerPosition, y: PLAYER_Y }]);
        lastShotRef.current = timestamp;
      }

      // Spawn Pollution
      const spawnRate = Math.max(500, 2000 - (level * 200));
      if (timestamp - lastSpawnRef.current > spawnRate) {
        const type = POLLUTION_TYPES[Math.floor(Math.random() * POLLUTION_TYPES.length)] as any;
        setPollution(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: -10,
          type,
          speed: (0.2 + Math.random() * 0.3) * (activePowerUp === "slow" ? 0.5 : 1) * (1 + level * 0.1),
          isToxic: Math.random() > 0.8
        }]);
        lastSpawnRef.current = timestamp;
      }

      // Spawn Power-ups
      if (timestamp - lastPowerUpRef.current > 15000) {
        const types: ("shield" | "beam" | "slow")[] = ["shield", "beam", "slow"];
        setPowerUps(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: -10,
          type: types[Math.floor(Math.random() * types.length)]
        }]);
        lastPowerUpRef.current = timestamp;
      }

      // Update State
      setProjectiles(prev => prev.map(p => ({ ...p, y: p.y - SHOT_SPEED })).filter(p => p.y > -5));
      
      setPollution(prev => {
        let newHealth = health;
        const remaining = prev.filter(p => {
          const newY = p.y + p.speed;
          if (newY > 100) {
            if (activePowerUp !== "shield") {
              newHealth -= p.isToxic ? 15 : 5;
            }
            return false;
          }
          return true;
        }).map(p => ({ ...p, y: p.y + p.speed }));
        
        if (newHealth <= 0 && !gameOver) {
          setGameOver(true);
          setHealth(0);
        } else {
          setHealth(newHealth);
        }
        return remaining;
      });

      setPowerUps(prev => prev.map(p => ({ ...p, y: p.y + 0.2 })).filter(p => p.y < 105));

      // Collision Detection
      setProjectiles(prevProj => {
        let hitIndices: number[] = [];
        const nextProj = prevProj.filter((proj, pIdx) => {
          let hit = false;
          setPollution(prevPol => {
            const hitPolIdx = prevPol.findIndex(pol => 
              Math.abs(pol.x - proj.x) < 5 && Math.abs(pol.y - proj.y) < 5
            );
            if (hitPolIdx !== -1) {
              hit = true;
              setScore(s => s + 10);
              setHealth(h => Math.min(100, h + 1));
              return prevPol.filter((_, i) => i !== hitPolIdx);
            }
            return prevPol;
          });
          return !hit;
        });
        return nextProj;
      });

      // Power-up Collection
      setPowerUps(prev => {
        const collected = prev.find(p => Math.abs(p.x - playerPosition) < 5 && Math.abs(p.y - PLAYER_Y) < 5);
        if (collected) {
          setActivePowerUp(collected.type);
          setPowerUpTimer(10);
          return prev.filter(p => p.id !== collected.id);
        }
        return prev;
      });

      // Level Up
      setLevel(Math.floor(score / 500) + 1);

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [playerPosition, health, gameOver, score, level, activePowerUp]);

  useEffect(() => {
    if (powerUpTimer > 0) {
      const timer = setInterval(() => setPowerUpTimer(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setActivePowerUp(null);
    }
  }, [powerUpTimer]);

  const resetGame = () => {
    setScore(0);
    setHealth(100);
    setTime(0);
    setLevel(1);
    setGameOver(false);
    setPollution([]);
    setProjectiles([]);
    setPowerUps([]);
    setActivePowerUp(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* HUD */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10 font-display">
        <div className="flex items-center gap-6">
          <div className="text-left">
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Guardian</p>
            <p className="text-white text-xl tracking-widest">{nickname}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-left">
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Nature Health</p>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    health < 30 ? "bg-destructive" : "bg-primary"
                  )}
                  style={{ width: `${health}%` }}
                />
              </div>
              <span className={health < 30 ? "text-destructive" : "text-primary"}>{health}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="text-center">
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Energy Score</p>
            <p className="text-accent text-3xl">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Level</p>
            <p className="text-white text-3xl">{level}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full hover:bg-white/10 ml-4">
            <X className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>

      {/* Game Stage */}
      <div className="relative w-full max-w-5xl aspect-video bg-gradient-to-b from-black/40 to-primary/5 rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)]">
        
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-primary/40 to-transparent" />
        </div>

        {/* Pollution */}
        {pollution.map((p) => (
          <motion.div
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div className={`relative ${p.isToxic ? "scale-125" : "scale-100"}`}>
              <div className={`w-10 h-10 rounded-full blur-md ${p.isToxic ? "bg-destructive/60" : "bg-orange-900/40"}`} />
              <div className="absolute inset-0 flex items-center justify-center text-white/80">
                {p.type === "barrel" ? <Shield className="w-5 h-5 text-destructive rotate-180" /> : <Wind className="w-5 h-5" />}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Projectiles */}
        {projectiles.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute w-1 h-4 bg-accent rounded-full shadow-[0_0_10px_#fbbf24]"
          />
        ))}

        {/* PowerUps */}
        {powerUps.map((p) => (
          <motion.div
            key={p.id}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-8 h-8 bg-accent/20 rounded-lg border border-accent/50 flex items-center justify-center backdrop-blur-sm">
              {p.type === "shield" && <Shield className="w-4 h-4 text-accent" />}
              {p.type === "beam" && <Zap className="w-4 h-4 text-accent" />}
              {p.type === "slow" && <Clock className="w-4 h-4 text-accent" />}
            </div>
          </motion.div>
        ))}

        {/* Player */}
        <motion.div
          animate={{ x: `${playerPosition}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-10 left-0 -translate-x-1/2"
        >
          <div className="relative">
            {/* Shield Visual */}
            {activePowerUp === "shield" && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -inset-8 rounded-full border-2 border-accent/30 bg-accent/5 blur-sm" 
              />
            )}
            
            <div className="w-16 h-16 bg-primary/40 rounded-2xl backdrop-blur-md border border-primary/60 flex items-center justify-center relative z-10 shadow-lg shadow-primary/20">
              <Leaf className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-primary/40 blur-xl" />
          </div>
        </motion.div>

        {/* Power-up HUD Overlay */}
        <AnimatePresence>
          {activePowerUp && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-8 bottom-8 bg-accent/10 border border-accent/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 text-accent font-display text-sm"
            >
              {activePowerUp === "shield" && <Shield className="w-4 h-4" />}
              {activePowerUp === "beam" && <Zap className="w-4 h-4" />}
              {activePowerUp === "slow" && <Clock className="w-4 h-4" />}
              <span className="uppercase tracking-widest">{activePowerUp}</span>
              <span className="w-px h-3 bg-accent/30" />
              <span>{powerUpTimer}s</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Screen */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <Trophy className="w-16 h-16 text-accent mb-6" />
              <h2 className="text-5xl font-display text-white mb-2 tracking-tighter">SURVIVAL ENDED</h2>
              <p className="text-white/60 font-body mb-8 max-w-md">Nature has succumbed to the weight of pollution. Your legacy as a guardian remains in the soil.</p>
              
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Final Score</p>
                  <p className="text-white text-4xl font-display">{score}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Time Survived</p>
                  <p className="text-white text-4xl font-display">{Math.floor(time)}s</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={resetGame} className="px-8 py-6 rounded-full bg-primary hover:bg-primary/80 text-white font-display tracking-widest text-lg">
                  REBIND SPIRIT
                </Button>
                <Button variant="outline" onClick={onExit} className="px-8 py-6 rounded-full border-white/20 text-white font-display tracking-widest text-lg">
                  LEAVE REALM
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center gap-12 text-white/30 font-display text-[10px] tracking-[0.4em] uppercase">
        <div className="flex items-center gap-3">
          <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">A / D</kbd>
          <span>to move</span>
        </div>
        <div className="flex items-center gap-3">
          <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">AUTO</kbd>
          <span>eco-energy beams</span>
        </div>
      </div>
    </motion.div>
  );
}
