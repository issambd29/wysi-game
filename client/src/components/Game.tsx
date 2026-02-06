import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sparkles, Trophy, X, Shield, Zap, Clock, TreePine, Mountain, Flower2, FlaskRound, ShoppingBag, Package, Trash2, Droplets, Cpu, Pause, Play, ChevronUp, Star } from "lucide-react";
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

interface ScorePopup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
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

const LEVEL_NAMES = [
  "Seedling",
  "Sapling",
  "Young Oak",
  "Forest Warden",
  "Grove Keeper",
  "Ancient Guardian",
  "Spirit of the Wild",
  "Primordial Force",
  "World Tree",
  "Gaia's Chosen",
];

const LEVEL_THRESHOLDS = [0, 300, 750, 1500, 2500, 4000, 6000, 8500, 12000, 16000];

export function Game({ onExit, nickname }: GameProps) {
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const [playerPosition, setPlayerPosition] = useState(50);
  const [pollution, setPollution] = useState<GameObject[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);

  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [showSeedBurst, setShowSeedBurst] = useState(false);
  const [collected, setCollected] = useState(0);
  const [destroyed, setDestroyed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [bgOffset, setBgOffset] = useState(0);

  const gameLoopRef = useRef<number>();
  const lastShotRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const lastPowerUpRef = useRef<number>(0);
  const comboTimerRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const pausedRef = useRef(false);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const healthRef = useRef(100);
  const gameOverRef = useRef(false);
  const playerPosRef = useRef(50);
  const activePowerUpRef = useRef<string | null>(null);
  const comboRef = useRef(0);
  const popupIdRef = useRef(0);

  const PLAYER_Y = 85;
  const SHOT_SPEED = 2;
  const CONTAINER_Y = 95;
  const CONTAINER_WIDTH = 12;
  const POLLUTION_TYPES: GameObject["type"][] = ["bottle", "bag", "can", "barrel", "oil", "ewaste"];
  const COMBO_TIMEOUT = 2000;

  scoreRef.current = score;
  levelRef.current = level;
  healthRef.current = health;
  gameOverRef.current = gameOver;
  playerPosRef.current = playerPosition;
  activePowerUpRef.current = activePowerUp;
  comboRef.current = combo;
  pausedRef.current = paused;

  const addPopup = useCallback((x: number, y: number, text: string, color: string) => {
    const id = ++popupIdRef.current;
    setScorePopups(prev => [...prev.slice(-8), { id, x, y, text, color }]);
    setTimeout(() => setScorePopups(prev => prev.filter(p => p.id !== id)), 1200);
  }, []);

  const incrementCombo = useCallback(() => {
    setCombo(c => {
      const newCombo = c + 1;
      setMaxCombo(m => Math.max(m, newCombo));
      return newCombo;
    });
    comboTimerRef.current = Date.now();
  }, []);

  const getComboMultiplier = useCallback(() => {
    if (comboRef.current >= 20) return 4;
    if (comboRef.current >= 10) return 3;
    if (comboRef.current >= 5) return 2;
    return 1;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (gameOverRef.current) return;
        keysRef.current.clear();
        setPaused(p => !p);
        return;
      }
      if (gameOverRef.current || pausedRef.current) return;
      keysRef.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let lastTimestamp = 0;

    const tick = (timestamp: number) => {
      if (gameOverRef.current) return;
      if (pausedRef.current) {
        gameLoopRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = lastTimestamp ? Math.min(timestamp - lastTimestamp, 50) : 16;
      lastTimestamp = timestamp;
      const dtScale = delta / 16.667;

      setBgOffset(prev => prev + 0.02 * dtScale);
      setTime(t => t + delta / 1000);

      const keys = keysRef.current;
      if (keys.has("arrowleft") || keys.has("a")) {
        setPlayerPosition(p => {
          const next = Math.max(5, p - 3 * dtScale);
          playerPosRef.current = next;
          return next;
        });
      }
      if (keys.has("arrowright") || keys.has("d")) {
        setPlayerPosition(p => {
          const next = Math.min(95, p + 3 * dtScale);
          playerPosRef.current = next;
          return next;
        });
      }

      if (Date.now() - comboTimerRef.current > COMBO_TIMEOUT && comboRef.current > 0) {
        setCombo(0);
      }

      const shotCooldown = activePowerUpRef.current === "beam" ? 150 : 300;
      if (timestamp - lastShotRef.current > shotCooldown) {
        setProjectiles(prev => [...prev, { id: Date.now() + Math.random(), x: playerPosRef.current, y: PLAYER_Y }]);
        lastShotRef.current = timestamp;
      }

      const currentLevel = levelRef.current;
      const spawnRate = Math.max(400, 2000 - (currentLevel * 250));
      if (timestamp - lastSpawnRef.current > spawnRate) {
        const type = POLLUTION_TYPES[Math.floor(Math.random() * POLLUTION_TYPES.length)];
        const toxicChance = Math.min(0.6, 0.15 + (currentLevel * 0.05));
        const isToxic = Math.random() < toxicChance;
        const baseSpeed = 0.12 + Math.random() * 0.2;
        const levelMultiplier = 1 + currentLevel * 0.12;
        const slowFactor = activePowerUpRef.current === "slow" ? 0.4 : 1;

        setPollution(prev => [...prev, {
          id: Date.now() + Math.random(),
          x: Math.random() * 85 + 7.5,
          y: -5,
          type,
          speed: baseSpeed * levelMultiplier * slowFactor,
          isToxic,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 4
        }]);
        lastSpawnRef.current = timestamp;
      }

      if (timestamp - lastPowerUpRef.current > 12000) {
        const types: PowerUp["type"][] = ["shield", "beam", "slow", "seed"];
        setPowerUps(prev => [...prev, {
          id: Date.now() + Math.random(),
          x: Math.random() * 85 + 7.5,
          y: -5,
          type: types[Math.floor(Math.random() * types.length)]
        }]);
        lastPowerUpRef.current = timestamp;
      }

      setProjectiles(prev => prev.map(p => ({ ...p, y: p.y - SHOT_SPEED * dtScale })).filter(p => p.y > -5));

      setPollution(prev => {
        let hDelta = 0;
        const remaining: GameObject[] = [];

        for (const p of prev) {
          const newY = p.y + p.speed * dtScale;
          if (newY > CONTAINER_Y) {
            const inContainer = Math.abs(p.x - playerPosRef.current) < CONTAINER_WIDTH;
            if (inContainer) {
              const mult = getComboMultiplier();
              const pts = (p.isToxic ? 25 : 15) * mult;
              setCollected(c => c + 1);
              setScore(s => s + pts);
              hDelta += 3;
              incrementCombo();
              addPopup(p.x, CONTAINER_Y - 5, `+${pts}`, "text-primary");
            } else {
              if (activePowerUpRef.current !== "shield") {
                const dmg = p.isToxic ? 15 : 5;
                hDelta -= dmg;
              }
              setCombo(0);
            }
          } else {
            remaining.push({ ...p, y: newY, rotation: p.rotation + p.rotationSpeed * dtScale });
          }
        }

        if (hDelta !== 0) {
          setHealth(h => {
            const next = Math.max(0, Math.min(100, h + hDelta));
            if (next <= 0) {
              setGameOver(true);
              gameOverRef.current = true;
            }
            return next;
          });
        }
        return remaining;
      });

      setPowerUps(prev => prev.map(p => ({ ...p, y: p.y + 0.2 * dtScale })).filter(p => p.y < 105));

      setProjectiles(prevProj => {
        const consumed = new Set<number>();
        setPollution(prevPol => {
          const nextPol = [...prevPol];
          for (const proj of prevProj) {
            const hitIdx = nextPol.findIndex(pol =>
              Math.abs(pol.x - proj.x) < 5 && Math.abs(pol.y - proj.y) < 5
            );
            if (hitIdx !== -1) {
              consumed.add(proj.id);
              const hitPol = nextPol[hitIdx];
              const mult = getComboMultiplier();
              const pts = 10 * mult;
              setScore(s => s + pts);
              setHealth(h => Math.min(100, h + 1));
              setDestroyed(d => d + 1);
              incrementCombo();
              addPopup(hitPol.x, hitPol.y, `+${pts}`, "text-accent");
              nextPol.splice(hitIdx, 1);
            }
          }
          return nextPol;
        });
        return prevProj.filter(p => !consumed.has(p.id));
      });

      setPowerUps(prev => {
        const found = prev.find(p => Math.abs(p.x - playerPosRef.current) < 6 && Math.abs(p.y - PLAYER_Y) < 6);
        if (found) {
          if (found.type === "seed") {
            setPollution([]);
            setScore(s => s + 100);
            setHealth(h => Math.min(100, h + 20));
            setShowSeedBurst(true);
            addPopup(50, 50, "+100 SEED BURST", "text-primary");
            setTimeout(() => setShowSeedBurst(false), 1000);
          } else {
            setActivePowerUp(found.type);
            activePowerUpRef.current = found.type;
            setPowerUpTimer(10);
            addPopup(found.x, found.y, found.type.toUpperCase(), "text-accent");
          }
          return prev.filter(p => p.id !== found.id);
        }
        return prev;
      });

      const currentScore = scoreRef.current;
      let newLevel = 1;
      for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (currentScore >= LEVEL_THRESHOLDS[i]) {
          newLevel = i + 1;
          break;
        }
      }
      if (newLevel > levelRef.current) {
        setLevel(newLevel);
        levelRef.current = newLevel;
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2500);
      }

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [addPopup, incrementCombo, getComboMultiplier]);

  useEffect(() => {
    if (paused || gameOver) return;
    if (powerUpTimer > 0) {
      const timer = setInterval(() => {
        setPowerUpTimer(t => {
          if (t <= 1) {
            setActivePowerUp(null);
            activePowerUpRef.current = null;
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [powerUpTimer, paused, gameOver]);

  const resetGame = () => {
    setScore(0);
    setHealth(100);
    setTime(0);
    setLevel(1);
    setGameOver(false);
    setPaused(false);
    setPollution([]);
    setProjectiles([]);
    setPowerUps([]);
    setActivePowerUp(null);
    setCollected(0);
    setDestroyed(0);
    setCombo(0);
    setMaxCombo(0);
    setScorePopups([]);
    setPowerUpTimer(0);
    scoreRef.current = 0;
    levelRef.current = 1;
    healthRef.current = 100;
    gameOverRef.current = false;
    playerPosRef.current = 50;
    activePowerUpRef.current = null;
    comboRef.current = 0;
    setPlayerPosition(50);
  };

  const healthPct = health / 100;
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const nextThreshold = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];
  const prevThreshold = LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)];
  const levelProgress = nextThreshold > prevThreshold ? ((score - prevThreshold) / (nextThreshold - prevThreshold)) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap justify-between items-start z-10 font-display gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-left">
            <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase">Guardian</p>
            <p className="text-white text-base tracking-widest">{nickname}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-left">
            <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase">Nature Health</p>
            <div className="flex items-center gap-2">
              <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500", health < 30 ? "bg-destructive" : "bg-primary")}
                  style={{ width: `${health}%` }}
                />
              </div>
              <span className={cn("text-xs tabular-nums", health < 30 ? "text-destructive" : "text-primary")} data-testid="text-health">{health}%</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-left">
            <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase">Level {level} — {levelName}</p>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-accent/70 transition-all duration-300" style={{ width: `${Math.min(100, levelProgress)}%` }} />
              </div>
              <span className="text-[9px] text-white/30 tabular-nums">{score}/{nextThreshold}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          {combo >= 3 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-full">
              <Star className="w-3 h-3 text-accent" />
              <span className="text-accent text-xs font-bold tabular-nums" data-testid="text-combo">{combo}x</span>
              {getComboMultiplier() > 1 && (
                <span className="text-accent/60 text-[9px]">({getComboMultiplier()}x pts)</span>
              )}
            </div>
          )}
          <div className="text-center">
            <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase">Score</p>
            <p className="text-accent text-2xl tabular-nums" data-testid="text-score">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase">Collected</p>
            <p className="text-primary text-2xl tabular-nums" data-testid="text-collected">{collected}</p>
          </div>
          <div className="text-center">
            <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase">Destroyed</p>
            <p className="text-orange-400 text-2xl tabular-nums" data-testid="text-destroyed">{destroyed}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setPaused(p => !p)} className="rounded-full" data-testid="button-pause-game">
              {paused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full" data-testid="button-exit-game">
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Game Stage */}
      <div className="relative w-full max-w-5xl aspect-video rounded-2xl border border-white/5 overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)]">

        {/* Nature Background */}
        <div className="absolute inset-0">
          {/* Sky */}
          <div
            className="absolute inset-0 transition-all duration-2000"
            style={{
              background: health > 60
                ? `linear-gradient(to bottom, 
                    hsl(210, 50%, ${10 + healthPct * 10}%) 0%, 
                    hsl(190, 35%, ${8 + healthPct * 8}%) 30%, 
                    hsl(150, 45%, ${6 + healthPct * 12}%) 70%,
                    hsl(130, 40%, ${5 + healthPct * 8}%) 100%)`
                : health > 30
                ? `linear-gradient(to bottom,
                    hsl(35, 25%, 10%) 0%,
                    hsl(25, 18%, 8%) 30%,
                    hsl(45, 15%, 7%) 70%,
                    hsl(80, 12%, 6%) 100%)`
                : `linear-gradient(to bottom,
                    hsl(0, 18%, 8%) 0%,
                    hsl(350, 12%, 6%) 30%,
                    hsl(340, 8%, 5%) 70%,
                    hsl(0, 6%, 4%) 100%)`
            }}
          />

          {/* Stars */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full animate-pulse"
              style={{
                left: `${(i * 13 + 7) % 100}%`,
                top: `${(i * 11 + 3) % 35}%`,
                width: `${i % 3 === 0 ? 2 : 1}px`,
                height: `${i % 3 === 0 ? 2 : 1}px`,
                backgroundColor: `rgba(255,255,255,${0.1 + (i % 4) * 0.05})`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + (i % 3)}s`
              }}
            />
          ))}

          {/* Moving clouds */}
          {health > 40 && [...Array(3)].map((_, i) => (
            <div
              key={`cloud-${i}`}
              className="absolute rounded-full transition-colors duration-2000"
              style={{
                left: `${((bgOffset * (0.3 + i * 0.1) * 50 + i * 35) % 130) - 15}%`,
                top: `${8 + i * 8}%`,
                width: `${80 + i * 30}px`,
                height: `${12 + i * 4}px`,
                background: health > 60
                  ? `radial-gradient(ellipse, rgba(255,255,255,${0.03 + i * 0.01}) 0%, transparent 70%)`
                  : `radial-gradient(ellipse, rgba(200,180,150,${0.02}) 0%, transparent 70%)`,
              }}
            />
          ))}

          {/* Far mountains */}
          <div className="absolute bottom-[30%] left-0 right-0 pointer-events-none" style={{ transform: `translateX(${Math.sin(bgOffset * 0.1) * 2}px)` }}>
            <div className="flex items-end justify-center">
              {[
                { w: 140, h: 80, ml: 0 },
                { w: 200, h: 110, ml: -30 },
                { w: 160, h: 95, ml: -40 },
                { w: 180, h: 85, ml: -20 },
                { w: 130, h: 70, ml: -25 },
              ].map((m, i) => (
                <Mountain
                  key={`mtn-${i}`}
                  className={cn("transition-colors duration-1000", health > 50 ? "text-emerald-900/40" : health > 25 ? "text-amber-900/30" : "text-zinc-800/30")}
                  style={{ width: `${m.w}px`, height: `${m.h}px`, marginLeft: `${m.ml}px` }}
                />
              ))}
            </div>
          </div>

          {/* Near mountains */}
          <div className="absolute bottom-[20%] left-0 right-0 pointer-events-none" style={{ transform: `translateX(${Math.sin(bgOffset * 0.15) * 3}px)` }}>
            <div className="flex items-end justify-around px-4">
              {[0, 1, 2].map(i => (
                <Mountain
                  key={`near-mtn-${i}`}
                  className={cn("transition-colors duration-1000", health > 50 ? "text-emerald-800/50" : health > 25 ? "text-amber-800/30" : "text-zinc-700/35")}
                  style={{ width: `${100 + i * 20}px`, height: `${50 + i * 15}px` }}
                />
              ))}
            </div>
          </div>

          {/* Trees */}
          <div className="absolute bottom-[12%] left-0 right-0 flex items-end justify-around pointer-events-none px-2" style={{ transform: `translateX(${Math.sin(bgOffset * 0.2) * 4}px)` }}>
            {[...Array(9)].map((_, i) => (
              <TreePine
                key={`tree-${i}`}
                className={cn(
                  "transition-all duration-1000",
                  health > 50 ? "text-emerald-800/60" : health > 25 ? "text-yellow-900/35" : "text-zinc-800/25"
                )}
                style={{
                  width: `${18 + (i % 4) * 6}px`,
                  height: `${28 + (i % 4) * 10}px`,
                  transform: `translateX(${(i % 2 === 0 ? -1 : 1) * (i * 2)}px)`
                }}
              />
            ))}
          </div>

          {/* Flowers */}
          {health > 40 && (
            <div className="absolute bottom-[9%] left-0 right-0 flex items-end justify-around pointer-events-none px-12">
              {[...Array(6)].map((_, i) => (
                <Flower2
                  key={`flower-${i}`}
                  className="text-primary/15 animate-pulse"
                  style={{ width: "10px", height: "10px", animationDelay: `${i * 0.4}s` }}
                />
              ))}
            </div>
          )}

          {/* Ground */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[10%] transition-colors duration-1000"
            style={{
              background: health > 50
                ? 'linear-gradient(to bottom, hsl(130, 35%, 10%) 0%, hsl(110, 25%, 7%) 100%)'
                : health > 25
                ? 'linear-gradient(to bottom, hsl(50, 15%, 8%) 0%, hsl(40, 10%, 6%) 100%)'
                : 'linear-gradient(to bottom, hsl(0, 8%, 8%) 0%, hsl(0, 5%, 5%) 100%)'
            }}
          />

          {/* Light rays */}
          {health > 55 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div
                  key={`ray-${i}`}
                  className="absolute top-0 bg-gradient-to-b from-yellow-200/4 to-transparent"
                  style={{
                    left: `${15 + i * 20}%`,
                    width: '50px',
                    height: '55%',
                    transform: `rotate(${-8 + i * 5 + Math.sin(bgOffset * 0.3 + i) * 2}deg)`,
                    transformOrigin: 'top center',
                    opacity: 0.6 + Math.sin(bgOffset * 0.5 + i * 2) * 0.3
                  }}
                />
              ))}
            </div>
          )}

          {/* Fireflies */}
          {health > 30 && [...Array(5)].map((_, i) => (
            <motion.div
              key={`firefly-${i}`}
              animate={{
                x: [0, 20, -10, 15, 0],
                y: [0, -15, 10, -5, 0],
                opacity: [0, 0.6, 0.3, 0.7, 0]
              }}
              transition={{ repeat: Infinity, duration: 6 + i * 2, ease: "easeInOut", delay: i * 1.5 }}
              className="absolute w-1 h-1 bg-yellow-300/40 rounded-full shadow-[0_0_4px_rgba(250,220,50,0.3)]"
              style={{ left: `${15 + i * 18}%`, top: `${40 + (i % 3) * 15}%` }}
            />
          ))}
        </div>

        {/* Pollution Machines */}
        <div className="absolute top-0 left-0 right-0 h-5 flex justify-around items-start z-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-12 h-6 bg-zinc-900/80 border-x border-b border-zinc-700/20 rounded-b flex flex-col items-center pt-0.5">
              <div className="w-6 h-[2px] bg-zinc-700/40" />
              <div className="flex gap-0.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-red-500/25 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-orange-500/15 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Damage overlay */}
        <div className={cn("absolute inset-0 pointer-events-none transition-all duration-1000 z-[5]", health < 25 ? "bg-red-900/15 shadow-[inset_0_0_60px_rgba(200,0,0,0.1)]" : "")} />

        {/* Seed Burst */}
        <AnimatePresence>
          {showSeedBurst && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 2 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <div className="w-full h-full bg-primary/15 rounded-full blur-3xl animate-ping" />
              <div className="absolute flex flex-col items-center">
                <Sparkles className="w-16 h-16 text-primary mb-2" />
                <span className="text-primary font-display text-3xl tracking-tighter">SEED BURST</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up Announcement */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            >
              <div className="flex flex-col items-center gap-1 px-8 py-4 bg-accent/10 border border-accent/30 backdrop-blur-xl rounded-2xl">
                <div className="flex items-center gap-2">
                  <ChevronUp className="w-5 h-5 text-accent" />
                  <span className="text-accent font-display text-lg tracking-[0.3em] uppercase">Level Up</span>
                  <ChevronUp className="w-5 h-5 text-accent" />
                </div>
                <span className="text-white font-display text-2xl tracking-tight">{levelName}</span>
                <span className="text-white/40 text-[10px] tracking-widest uppercase">Level {level}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating leaves */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: [0, 0.1, 0], y: "-100%", x: ["0%", (i % 2 === 0 ? "30%" : "-30%"), "0%"] }}
              transition={{ repeat: Infinity, duration: 20 + i * 5, ease: "linear", delay: i * 4 }}
              className="absolute text-primary/8 select-none"
              style={{ left: `${15 + i * 25}%` }}
            >
              <Leaf className="w-6 h-6 rotate-45" />
            </motion.div>
          ))}
        </div>

        {/* Score Popups */}
        <AnimatePresence>
          {scorePopups.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -30, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className={`absolute z-30 font-display text-sm font-bold pointer-events-none ${p.color}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Garbage */}
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
              <div className={`relative ${p.isToxic ? "scale-110" : ""}`}>
                <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${p.isToxic ? config.toxicColor : config.color}`}>
                  <Icon className={`w-4 h-4 ${p.isToxic ? "text-red-400" : config.iconColor}`} />
                </div>
                {p.isToxic && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-40" />
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-4 bg-gradient-to-b from-white/8 to-transparent" />
              </div>
            </div>
          );
        })}

        {/* Projectiles */}
        {projectiles.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute w-1 h-4 bg-accent rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)] z-[6]"
          />
        ))}

        {/* Power-Ups */}
        {powerUps.map((p) => (
          <motion.div
            key={p.id}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-[7]"
          >
            <div className="w-7 h-7 bg-accent/15 rounded-lg border border-accent/40 flex items-center justify-center backdrop-blur-sm">
              {p.type === "shield" && <Shield className="w-3.5 h-3.5 text-accent" />}
              {p.type === "beam" && <Zap className="w-3.5 h-3.5 text-accent" />}
              {p.type === "slow" && <Clock className="w-3.5 h-3.5 text-accent" />}
              {p.type === "seed" && <Leaf className="w-3.5 h-3.5 text-accent" />}
            </div>
          </motion.div>
        ))}

        {/* Player + Container */}
        <motion.div
          animate={{ x: `${playerPosition}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="absolute bottom-0 left-0 -translate-x-1/2 z-[8]"
        >
          <div className="relative flex flex-col items-center">
            <div className="relative mb-0.5">
              {activePowerUp === "shield" && (
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -inset-5 rounded-full border border-accent/25 bg-accent/5"
                />
              )}
              <div className="w-10 h-10 bg-primary/40 rounded-lg backdrop-blur-md border border-primary/50 flex items-center justify-center relative z-10 shadow-lg shadow-primary/20">
                <Leaf className="w-5 h-5 text-primary animate-pulse" />
              </div>
            </div>
            <div className="relative w-16 h-6" data-testid="garbage-container">
              <div className="absolute inset-0 bg-emerald-900/60 border border-emerald-600/40 rounded-b rounded-t-sm overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500/25" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[7px] text-emerald-300/40 font-display uppercase tracking-widest">recycle</span>
                </div>
              </div>
              {collected > 0 && (
                <div className="absolute -inset-1 bg-primary/8 rounded-lg blur-md -z-10" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Active Power-up indicator */}
        <AnimatePresence>
          {activePowerUp && (
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="absolute right-3 bottom-3 bg-accent/8 border border-accent/15 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-accent font-display text-[10px] z-10"
            >
              {activePowerUp === "shield" && <Shield className="w-3 h-3" />}
              {activePowerUp === "beam" && <Zap className="w-3 h-3" />}
              {activePowerUp === "slow" && <Clock className="w-3 h-3" />}
              <span className="uppercase tracking-widest">{activePowerUp}</span>
              <span className="w-px h-2.5 bg-accent/20" />
              <span className="tabular-nums">{powerUpTimer}s</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause Overlay */}
        <AnimatePresence>
          {paused && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black/60 backdrop-blur-lg flex flex-col items-center justify-center"
            >
              <Pause className="w-12 h-12 text-white/30 mb-4" />
              <h2 className="text-4xl font-display text-white mb-2 tracking-[0.3em] uppercase">Paused</h2>
              <p className="text-white/40 font-body text-sm mb-8">The forest waits for your return</p>
              <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                <div>
                  <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase mb-1">Score</p>
                  <p className="text-white text-2xl font-display tabular-nums">{score}</p>
                </div>
                <div>
                  <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase mb-1">Level</p>
                  <p className="text-accent text-2xl font-display">{level}</p>
                </div>
                <div>
                  <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase mb-1">Time</p>
                  <p className="text-white text-2xl font-display tabular-nums">{Math.floor(time)}s</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setPaused(false)} className="px-6 rounded-full bg-primary/80 text-white font-display tracking-widest" data-testid="button-resume-game">
                  <Play className="w-4 h-4 mr-2" />
                  RESUME
                </Button>
                <Button variant="outline" onClick={onExit} className="px-6 rounded-full border-white/15 text-white/70 font-display tracking-widest" data-testid="button-quit-game">
                  LEAVE REALM
                </Button>
              </div>
              <p className="text-white/20 text-[9px] tracking-widest uppercase mt-6">Press ESC to resume</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 bg-black/75 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
            >
              <Trophy className="w-14 h-14 text-accent mb-4" />
              <h2 className="text-4xl font-display text-white mb-1 tracking-tighter">SURVIVAL ENDED</h2>
              <p className="text-white/50 font-body text-sm mb-6 max-w-sm">Nature does not fight back. It waits for someone to protect it.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div>
                  <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase mb-1">Final Score</p>
                  <p className="text-white text-2xl font-display tabular-nums">{score}</p>
                </div>
                <div>
                  <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase mb-1">Collected</p>
                  <p className="text-primary text-2xl font-display tabular-nums">{collected}</p>
                </div>
                <div>
                  <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase mb-1">Destroyed</p>
                  <p className="text-orange-400 text-2xl font-display tabular-nums">{destroyed}</p>
                </div>
                <div>
                  <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase mb-1">Best Combo</p>
                  <p className="text-accent text-2xl font-display tabular-nums">{maxCombo}x</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <span className="text-white/40 text-[10px] tracking-widest uppercase">Level {level}</span>
                <span className="text-white/20">-</span>
                <span className="text-accent font-display text-sm">{levelName}</span>
                <span className="text-white/20">-</span>
                <span className="text-white/40 text-[10px] tabular-nums">{Math.floor(time)}s survived</span>
              </div>

              <div className="flex gap-3">
                <Button onClick={resetGame} className="px-6 rounded-full bg-primary text-white font-display tracking-widest" data-testid="button-restart-game">
                  REBIND SPIRIT
                </Button>
                <Button variant="outline" onClick={onExit} className="px-6 rounded-full border-white/15 text-white font-display tracking-widest" data-testid="button-leave-game">
                  LEAVE REALM
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls hint */}
      <div className="mt-4 flex items-center gap-6 text-white/20 font-display text-[9px] tracking-[0.4em] uppercase flex-wrap justify-center">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[8px]">A / D</kbd>
          <span>move</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[8px]">ESC</kbd>
          <span>pause</span>
        </div>
        <span className="text-primary/40">catch garbage in container for bonus</span>
        <span className="text-accent/40">chain hits for combo multiplier</span>
      </div>
    </motion.div>
  );
}
