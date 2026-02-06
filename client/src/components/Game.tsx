import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sparkles, Trophy, X, Shield, Zap, Clock, TreePine, Mountain, Flower2, FlaskRound, ShoppingBag, Package, Trash2, Droplets, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface GameObject {
  id: number;
  x: number;
  y: number;
  type: "bottle" | "bag" | "can" | "barrel" | "oil" | "ewaste";
  speed: number;
  isToxic: boolean;
  rotation: number;
  rotationSpeed: number;
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
  type: "shield" | "beam" | "slow" | "seed";
}

interface GameProps {
  onExit: () => void;
  nickname: string;
}

const GARBAGE_CONFIG: Record<string, { icon: typeof Trash2; label: string; iconColor: string; color: string; toxicColor: string }> = {
  bottle: { icon: FlaskRound, label: "Plastic", iconColor: "text-sky-300", color: "bg-sky-800/50 border-sky-500/40", toxicColor: "bg-red-900/50 border-red-500/50" },
  bag: { icon: ShoppingBag, label: "Bag", iconColor: "text-amber-300", color: "bg-amber-800/50 border-amber-500/40", toxicColor: "bg-red-900/50 border-red-500/50" },
  can: { icon: Package, label: "Can", iconColor: "text-zinc-300", color: "bg-zinc-700/50 border-zinc-400/40", toxicColor: "bg-red-900/50 border-red-500/50" },
  barrel: { icon: Trash2, label: "Toxic", iconColor: "text-orange-300", color: "bg-orange-800/50 border-orange-500/40", toxicColor: "bg-red-900/60 border-red-400/60" },
  oil: { icon: Droplets, label: "Oil", iconColor: "text-violet-300", color: "bg-violet-800/50 border-violet-500/40", toxicColor: "bg-red-900/50 border-red-500/50" },
  ewaste: { icon: Cpu, label: "E-waste", iconColor: "text-teal-300", color: "bg-teal-800/50 border-teal-500/40", toxicColor: "bg-red-900/50 border-red-500/50" },
};

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
  const [showSeedBurst, setShowSeedBurst] = useState(false);
  const [collected, setCollected] = useState(0);

  const gameLoopRef = useRef<number>();
  const lastShotRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const lastPowerUpRef = useRef<number>(0);

  const PLAYER_Y = 85;
  const SHOT_SPEED = 2;
  const CONTAINER_Y = 95;
  const CONTAINER_WIDTH = 12;
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
      
      const shotCooldown = activePowerUp === "beam" ? 150 : 300;
      if (timestamp - lastShotRef.current > shotCooldown) {
        setProjectiles(prev => [...prev, { id: Date.now(), x: playerPosition, y: PLAYER_Y }]);
        lastShotRef.current = timestamp;
      }

      const spawnRate = Math.max(300, 2000 - (level * 300));
      if (timestamp - lastSpawnRef.current > spawnRate) {
        const type = POLLUTION_TYPES[Math.floor(Math.random() * POLLUTION_TYPES.length)] as any;
        const isToxic = Math.random() > 0.8 - (level * 0.05);
        setPollution(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: -10,
          type,
          speed: (0.15 + Math.random() * 0.25) * (activePowerUp === "slow" ? 0.4 : 1) * (1 + level * 0.15),
          isToxic,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 3
        }]);
        lastSpawnRef.current = timestamp;
      }

      if (timestamp - lastPowerUpRef.current > 15000) {
        const types: ("shield" | "beam" | "slow" | "seed")[] = ["shield", "beam", "slow", "seed"];
        setPowerUps(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: -10,
          type: types[Math.floor(Math.random() * types.length)]
        }]);
        lastPowerUpRef.current = timestamp;
      }

      setProjectiles(prev => prev.map(p => ({ ...p, y: p.y - SHOT_SPEED })).filter(p => p.y > -5));
      
      setPollution(prev => {
        let newHealth = health;
        const remaining = prev.filter(p => {
          const newY = p.y + p.speed;
          if (newY > CONTAINER_Y) {
            const inContainer = Math.abs(p.x - playerPosition) < CONTAINER_WIDTH;
            if (inContainer) {
              setCollected(c => c + 1);
              setScore(s => s + (p.isToxic ? 25 : 15));
              setHealth(h => Math.min(100, h + 3));
            } else {
              if (activePowerUp !== "shield") {
                newHealth -= p.isToxic ? 15 : 5;
              }
            }
            return false;
          }
          return true;
        }).map(p => ({ 
          ...p, 
          y: p.y + p.speed,
          rotation: p.rotation + p.rotationSpeed
        }));
        
        if (newHealth <= 0 && !gameOver) {
          setGameOver(true);
          setHealth(0);
        } else {
          setHealth(newHealth);
        }
        return remaining;
      });

      setPowerUps(prev => prev.map(p => ({ ...p, y: p.y + 0.2 })).filter(p => p.y < 105));

      setProjectiles(prevProj => {
        const nextProj = prevProj.filter((proj) => {
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

      setPowerUps(prev => {
        const found = prev.find(p => Math.abs(p.x - playerPosition) < 5 && Math.abs(p.y - PLAYER_Y) < 5);
        if (found) {
          if (found.type === "seed") {
            setPollution([]);
            setScore(s => s + 100);
            setHealth(h => Math.min(100, h + 20));
            setShowSeedBurst(true);
            setTimeout(() => setShowSeedBurst(false), 1000);
          } else {
            setActivePowerUp(found.type);
            setPowerUpTimer(10);
          }
          return prev.filter(p => p.id !== found.id);
        }
        return prev;
      });

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
    setCollected(0);
  };

  const healthPct = health / 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* HUD */}
      <div className="absolute top-8 left-8 right-8 flex flex-wrap justify-between items-center z-10 font-display gap-4">
        <div className="flex items-center gap-6 flex-wrap">
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
              <span className={cn("text-sm", health < 30 ? "text-destructive" : "text-primary")}>{health}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8 flex-wrap">
          <div className="text-center">
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Score</p>
            <p className="text-accent text-3xl" data-testid="text-score">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Collected</p>
            <p className="text-primary text-3xl" data-testid="text-collected">{collected}</p>
          </div>
          <div className="text-center">
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Level</p>
            <p className="text-white text-3xl" data-testid="text-level">{level}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full ml-2" data-testid="button-exit-game">
            <X className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>

      {/* Game Stage */}
      <div className="relative w-full max-w-5xl aspect-video rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)]">
        
        {/* Nature Background */}
        <div className="absolute inset-0">
          {/* Sky gradient - shifts based on health */}
          <div 
            className="absolute inset-0 transition-all duration-2000"
            style={{
              background: health > 60
                ? `linear-gradient(to bottom, 
                    hsl(200, 60%, ${12 + healthPct * 8}%) 0%, 
                    hsl(180, 40%, ${10 + healthPct * 6}%) 40%, 
                    hsl(140, 50%, ${8 + healthPct * 10}%) 100%)`
                : health > 30
                ? `linear-gradient(to bottom,
                    hsl(30, 30%, 12%) 0%,
                    hsl(20, 20%, 10%) 40%,
                    hsl(100, 20%, 10%) 100%)`
                : `linear-gradient(to bottom,
                    hsl(0, 20%, 10%) 0%,
                    hsl(0, 15%, 8%) 40%,
                    hsl(0, 10%, 6%) 100%)`
            }}
          />

          {/* Stars/particles in sky */}
          {[...Array(20)].map((_, i) => (
            <div 
              key={`star-${i}`}
              className="absolute w-[2px] h-[2px] bg-white/20 rounded-full animate-pulse"
              style={{ 
                left: `${(i * 17 + 3) % 100}%`, 
                top: `${(i * 7 + 2) % 40}%`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}

          {/* Mountains - far */}
          <div className="absolute bottom-[30%] left-0 right-0 flex items-end justify-center pointer-events-none">
            <Mountain className={cn("w-32 h-20 transition-colors duration-1000", health > 50 ? "text-emerald-900/40" : "text-zinc-800/40")} />
            <Mountain className={cn("w-48 h-28 -ml-8 transition-colors duration-1000", health > 50 ? "text-emerald-900/50" : "text-zinc-800/50")} />
            <Mountain className={cn("w-40 h-24 -ml-12 transition-colors duration-1000", health > 50 ? "text-emerald-900/35" : "text-zinc-800/35")} />
            <Mountain className={cn("w-36 h-20 -ml-6 transition-colors duration-1000", health > 50 ? "text-emerald-900/45" : "text-zinc-800/45")} />
          </div>

          {/* Trees */}
          <div className="absolute bottom-[15%] left-0 right-0 flex items-end justify-around pointer-events-none px-4">
            {[...Array(7)].map((_, i) => (
              <TreePine 
                key={`tree-${i}`}
                className={cn(
                  "transition-all duration-1000",
                  health > 50 ? "text-emerald-800/60" : health > 25 ? "text-yellow-900/40" : "text-zinc-800/30"
                )}
                style={{ 
                  width: `${24 + (i % 3) * 8}px`, 
                  height: `${32 + (i % 3) * 12}px`,
                  transform: `translateX(${(i % 2 === 0 ? -1 : 1) * (i * 3)}px)`
                }}
              />
            ))}
          </div>

          {/* Flowers at ground level */}
          <div className="absolute bottom-[10%] left-0 right-0 flex items-end justify-around pointer-events-none px-8">
            {health > 40 && [...Array(5)].map((_, i) => (
              <Flower2
                key={`flower-${i}`}
                className="text-primary/20 animate-pulse"
                style={{ 
                  width: "12px", 
                  height: "12px",
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>

          {/* Ground / grass */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[12%] transition-colors duration-1000"
            style={{
              background: health > 50
                ? 'linear-gradient(to bottom, hsl(120, 40%, 12%) 0%, hsl(100, 30%, 8%) 100%)'
                : health > 25
                ? 'linear-gradient(to bottom, hsl(60, 20%, 10%) 0%, hsl(40, 15%, 7%) 100%)'
                : 'linear-gradient(to bottom, hsl(0, 10%, 10%) 0%, hsl(0, 8%, 6%) 100%)'
            }}
          />

          {/* Light rays when healthy */}
          {health > 60 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div
                  key={`ray-${i}`}
                  className="absolute top-0 bg-gradient-to-b from-yellow-200/5 to-transparent"
                  style={{
                    left: `${20 + i * 25}%`,
                    width: '60px',
                    height: '60%',
                    transform: `rotate(${-5 + i * 5}deg)`,
                    transformOrigin: 'top center'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pollution Machine (Top) */}
        <div className="absolute top-0 left-0 right-0 h-6 flex justify-around items-start z-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-14 h-8 bg-zinc-900/80 border-x border-b border-zinc-600/30 rounded-b-lg flex flex-col items-center">
              <div className="w-8 h-1 bg-zinc-700/60 mt-1" />
              <div className="flex gap-1 mt-1">
                <div className="w-2 h-2 bg-red-500/30 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-orange-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="w-6 h-[2px] bg-red-900/20 mt-1 blur-[1px]" />
            </div>
          ))}
        </div>

        {/* Health damage overlay */}
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 z-[5] ${health < 30 ? "bg-red-900/15" : "bg-transparent"}`} />

        {/* Seed Burst Effect */}
        <AnimatePresence>
          {showSeedBurst && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 2 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <div className="w-full h-full bg-primary/20 rounded-full blur-3xl animate-ping" />
              <div className="absolute flex flex-col items-center">
                <Sparkles className="w-20 h-20 text-primary mb-4" />
                <span className="text-primary font-display text-4xl tracking-tighter">SEED BURST</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating leaves */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: [0, 0.15, 0], y: "-100%", x: ["0%", (i % 2 === 0 ? "40%" : "-40%"), "0%"] }}
              transition={{ repeat: Infinity, duration: 18 + i * 4, ease: "linear", delay: i * 3 }}
              className="absolute text-primary/10 select-none"
              style={{ left: `${10 + i * 22}%` }}
            >
              <Leaf className="w-8 h-8 rotate-45" />
            </motion.div>
          ))}
        </div>

        {/* Garbage Fall */}
        {pollution.map((p) => {
          const config = GARBAGE_CONFIG[p.type] || GARBAGE_CONFIG.bottle;
          const Icon = config.icon;
          return (
            <div
              key={p.id}
              style={{ 
                left: `${p.x}%`, 
                top: `${p.y}%`,
                transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`
              }}
              className="absolute z-[6]"
            >
              <div className={`relative ${p.isToxic ? "scale-[1.2]" : "scale-100"}`}>
                <div className={`w-9 h-9 rounded-md flex items-center justify-center border ${p.isToxic ? config.toxicColor : config.color}`}>
                  <Icon className={`w-5 h-5 ${p.isToxic ? "text-red-400" : config.iconColor}`} />
                </div>
                {p.isToxic && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-50" />
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-5 bg-gradient-to-b from-white/10 to-transparent" />
              </div>
            </div>
          );
        })}

        {/* Projectiles */}
        {projectiles.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute w-1.5 h-5 bg-accent rounded-full shadow-[0_0_12px_rgba(251,191,36,0.6)] z-[6]"
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
            className="absolute -translate-x-1/2 -translate-y-1/2 z-[7]"
          >
            <div className="w-8 h-8 bg-accent/20 rounded-lg border border-accent/50 flex items-center justify-center backdrop-blur-sm">
              {p.type === "shield" && <Shield className="w-4 h-4 text-accent" />}
              {p.type === "beam" && <Zap className="w-4 h-4 text-accent" />}
              {p.type === "slow" && <Clock className="w-4 h-4 text-accent" />}
              {p.type === "seed" && <Leaf className="w-4 h-4 text-accent" />}
            </div>
          </motion.div>
        ))}

        {/* Garbage Container + Player */}
        <motion.div
          animate={{ x: `${playerPosition}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-0 left-0 -translate-x-1/2 z-[8]"
        >
          <div className="relative flex flex-col items-center">
            {/* Guardian (shooter) */}
            <div className="relative mb-1">
              {activePowerUp === "shield" && (
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -inset-6 rounded-full border-2 border-accent/30 bg-accent/5 blur-sm" 
                />
              )}
              
              <div className="w-12 h-12 bg-primary/50 rounded-xl backdrop-blur-md border border-primary/60 flex items-center justify-center relative z-10 shadow-lg shadow-primary/30">
                <Leaf className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>

            {/* Garbage Container */}
            <div className="relative w-20 h-8" data-testid="garbage-container">
              <div className="absolute inset-0 bg-emerald-900/70 border-2 border-emerald-600/50 rounded-b-lg rounded-t-sm overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] text-emerald-300/50 font-display uppercase tracking-widest">recycle</span>
                </div>
              </div>
              {/* Container glow when collecting */}
              {collected > 0 && (
                <div className="absolute -inset-1 bg-primary/10 rounded-lg blur-md -z-10" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Power-up HUD Overlay */}
        <AnimatePresence>
          {activePowerUp && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-4 bottom-4 bg-accent/10 border border-accent/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-accent font-display text-xs z-10"
            >
              {activePowerUp === "shield" && <Shield className="w-3.5 h-3.5" />}
              {activePowerUp === "beam" && <Zap className="w-3.5 h-3.5" />}
              {activePowerUp === "slow" && <Clock className="w-3.5 h-3.5" />}
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
              className="absolute inset-0 z-20 bg-black/70 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <Trophy className="w-16 h-16 text-accent mb-6" />
              <h2 className="text-5xl font-display text-white mb-2 tracking-tighter">SURVIVAL ENDED</h2>
              <p className="text-white/60 font-body mb-8 max-w-md">Nature does not fight back. It waits for someone to protect it.</p>
              
              <div className="grid grid-cols-3 gap-6 mb-12">
                <div>
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Final Score</p>
                  <p className="text-white text-3xl font-display">{score}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Collected</p>
                  <p className="text-primary text-3xl font-display">{collected}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Time Survived</p>
                  <p className="text-white text-3xl font-display">{Math.floor(time)}s</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={resetGame} className="px-8 rounded-full bg-primary text-white font-display tracking-widest" data-testid="button-restart-game">
                  REBIND SPIRIT
                </Button>
                <Button variant="outline" onClick={onExit} className="px-8 rounded-full border-white/20 text-white font-display tracking-widest" data-testid="button-leave-game">
                  LEAVE REALM
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center gap-8 text-white/30 font-display text-[10px] tracking-[0.4em] uppercase flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px]">A / D</kbd>
          <span>move</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px]">AUTO</kbd>
          <span>eco-beams</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary/60">Container catches garbage for bonus</span>
        </div>
      </div>
    </motion.div>
  );
}
