import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sparkles, Trophy, X, Shield, Zap, Clock, TreePine, Mountain, Flower2, FlaskRound, ShoppingBag, Package, Trash2, Droplets, Cpu, Pause, Play, ChevronUp, Star, Wind, Flame, Heart, Globe, RotateCcw, Home, Crown, TreeDeciduous } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skull } from "lucide-react";
import { MalakarQuiz } from "./MalakarQuiz";
import type { Difficulty } from "./DifficultySelect";

interface GameObject {
  id: number;
  x: number;
  y: number;
  type: "bottle" | "bag" | "can" | "barrel" | "oil" | "ewaste";
  speed: number;
  isToxic: boolean;
  rotation: number;
  rotationSpeed: number;
  windOffset: number;
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

interface HitParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface GameProps {
  onExit: () => void;
  nickname: string;
  difficulty: Difficulty;
  onSaveScore?: (data: { score: number; level: number; levelName: string; difficulty: string; maxCombo: number; collected: number; destroyed: number; time: number }) => void;
}

const GARBAGE_CONFIG: Record<string, { icon: typeof Trash2; label: string; iconColor: string; bgGlow: string; color: string; toxicColor: string }> = {
  bottle: { icon: FlaskRound, label: "Plastic", iconColor: "text-sky-200", bgGlow: "shadow-sky-500/20", color: "bg-sky-950/60 border-sky-400/30", toxicColor: "bg-red-950/70 border-red-400/40" },
  bag: { icon: ShoppingBag, label: "Bag", iconColor: "text-amber-200", bgGlow: "shadow-amber-500/20", color: "bg-amber-950/60 border-amber-400/30", toxicColor: "bg-red-950/70 border-red-400/40" },
  can: { icon: Package, label: "Can", iconColor: "text-zinc-200", bgGlow: "shadow-zinc-400/20", color: "bg-zinc-800/60 border-zinc-400/30", toxicColor: "bg-red-950/70 border-red-400/40" },
  barrel: { icon: Trash2, label: "Toxic", iconColor: "text-orange-200", bgGlow: "shadow-orange-500/20", color: "bg-orange-950/60 border-orange-400/30", toxicColor: "bg-red-950/70 border-red-400/40" },
  oil: { icon: Droplets, label: "Oil", iconColor: "text-violet-200", bgGlow: "shadow-violet-500/20", color: "bg-violet-950/60 border-violet-400/30", toxicColor: "bg-red-950/70 border-red-400/40" },
  ewaste: { icon: Cpu, label: "E-waste", iconColor: "text-teal-200", bgGlow: "shadow-teal-500/20", color: "bg-teal-950/60 border-teal-400/30", toxicColor: "bg-red-950/70 border-red-400/40" },
};

const LEVEL_NAMES = [
  "Awakening", "Rising Pollution", "Toxic Storm", "Dark Currents", "Acid Rain",
  "Smog Siege", "Chemical Tide", "Wasteland", "Last Stand", "Gaia's Chosen",
];

const LEVEL_THRESHOLDS = [0, 300, 750, 1500, 2500, 4000, 6000, 8500, 12000, 16000];

const DIFFICULTY_CONFIG = {
  easy: { speedMult: 1.0, spawnMult: 1.0, toxicBase: 0.18, toxicScale: 0.05, damageMult: 1.0, healMult: 0.8, label: "Calm Nature", Icon: Leaf, color: "text-emerald-400", winTime: 60 },
  normal: { speedMult: 1.4, spawnMult: 0.7, toxicBase: 0.3, toxicScale: 0.08, damageMult: 1.5, healMult: 0.4, label: "Balanced Earth", Icon: Globe, color: "text-sky-400", winTime: 60 },
  hard: { speedMult: 1.8, spawnMult: 0.45, toxicBase: 0.42, toxicScale: 0.1, damageMult: 2.0, healMult: 0.15, label: "Nature in Crisis", Icon: Flame, color: "text-orange-400", winTime: 60 },
};

export function Game({ onExit, nickname, difficulty, onSaveScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
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
  const [hitParticles, setHitParticles] = useState<HitParticle[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [bgOffset, setBgOffset] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  const [windDirection, setWindDirection] = useState(0);

  const diffConfig = DIFFICULTY_CONFIG[difficulty];
  const DiffIcon = diffConfig.Icon;

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
  const gameWonRef = useRef(false);
  const playerPosRef = useRef(50);
  const activePowerUpRef = useRef<string | null>(null);
  const comboRef = useRef(0);
  const popupIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const scoreSavedRef = useRef(false);
  const timeRef = useRef(0);

  const PLAYER_Y = 85;
  const SHOT_SPEED = 2;
  const CONTAINER_Y = 95;
  const CONTAINER_WIDTH = 12;
  const NEAR_MISS_WIDTH = 20;
  const POLLUTION_TYPES: GameObject["type"][] = ["bottle", "bag", "can", "barrel", "oil", "ewaste"];
  const COMBO_TIMEOUT = 1800;
  const WIN_TIME = diffConfig.winTime;

  scoreRef.current = score;
  levelRef.current = level;
  healthRef.current = health;
  gameOverRef.current = gameOver;
  gameWonRef.current = gameWon;
  playerPosRef.current = playerPosition;
  activePowerUpRef.current = activePowerUp;
  comboRef.current = combo;
  pausedRef.current = paused;
  timeRef.current = time;

  useEffect(() => {
    if ((gameOver || gameWon) && !scoreSavedRef.current && onSaveScore) {
      scoreSavedRef.current = true;
      onSaveScore({
        score,
        level,
        levelName: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)],
        difficulty,
        maxCombo,
        collected,
        destroyed,
        time,
      });
    }
  }, [gameOver, gameWon]);

  const addPopup = useCallback((x: number, y: number, text: string, color: string) => {
    const id = ++popupIdRef.current;
    setScorePopups(prev => [...prev.slice(-8), { id, x, y, text, color }]);
    setTimeout(() => setScorePopups(prev => prev.filter(p => p.id !== id)), 1200);
  }, []);

  const addHitParticle = useCallback((x: number, y: number, color: string) => {
    const id = ++particleIdRef.current;
    setHitParticles(prev => [...prev.slice(-6), { id, x, y, color }]);
    setTimeout(() => setHitParticles(prev => prev.filter(p => p.id !== id)), 600);
  }, []);

  const triggerShake = useCallback(() => {
    setScreenShake(3);
    setTimeout(() => setScreenShake(0), 150);
  }, []);

  const incrementCombo = useCallback(() => {
    setCombo(c => {
      const newCombo = c + 1;
      setMaxCombo(m => Math.max(m, newCombo));
      if (newCombo === 10) {
        setScore(s => s + 50);
        setHealth(h => Math.min(100, h + 5));
        addPopup(50, 40, "STREAK x10! +50", "text-amber-200");
      } else if (newCombo === 20) {
        setScore(s => s + 150);
        setHealth(h => Math.min(100, h + 10));
        addPopup(50, 40, "STREAK x20! +150", "text-amber-100");
      } else if (newCombo === 30) {
        setScore(s => s + 300);
        setHealth(h => Math.min(100, h + 15));
        addPopup(50, 40, "UNSTOPPABLE! +300", "text-yellow-200");
      }
      return newCombo;
    });
    comboTimerRef.current = Date.now();
  }, [addPopup]);

  const getComboMultiplier = useCallback(() => {
    if (comboRef.current >= 20) return 4;
    if (comboRef.current >= 10) return 3;
    if (comboRef.current >= 5) return 2;
    return 1;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (gameOverRef.current || gameWonRef.current) return;
        keysRef.current.clear();
        setPaused(p => !p);
        return;
      }
      if (gameOverRef.current || gameWonRef.current || pausedRef.current) return;
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
      if (gameOverRef.current || gameWonRef.current) return;
      if (pausedRef.current) {
        gameLoopRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = lastTimestamp ? Math.min(timestamp - lastTimestamp, 50) : 16;
      lastTimestamp = timestamp;
      const dtScale = delta / 16.667;

      setBgOffset(prev => prev + 0.02 * dtScale);
      setTime(t => {
        const newTime = t + delta / 1000;
        if (newTime >= WIN_TIME && !gameWonRef.current) {
          setGameWon(true);
          gameWonRef.current = true;
        }
        return newTime;
      });
      setWindDirection(Math.sin(timestamp * 0.0008) * 0.15);

      const keys = keysRef.current;
      if (keys.has("arrowleft") || keys.has("a")) {
        setPlayerPosition(p => {
          const next = Math.max(5, p - 5 * dtScale);
          playerPosRef.current = next;
          return next;
        });
      }
      if (keys.has("arrowright") || keys.has("d")) {
        setPlayerPosition(p => {
          const next = Math.min(95, p + 5 * dtScale);
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
      const dc = DIFFICULTY_CONFIG[difficulty];
      const spawnRate = Math.max(300, (2000 - (currentLevel * 250)) * dc.spawnMult);
      if (timestamp - lastSpawnRef.current > spawnRate) {
        const type = POLLUTION_TYPES[Math.floor(Math.random() * POLLUTION_TYPES.length)];
        const toxicChance = Math.min(0.75, dc.toxicBase + (currentLevel * dc.toxicScale));
        const isToxic = Math.random() < toxicChance;
        const baseSpeed = 0.18 + Math.random() * 0.25;
        const levelMultiplier = 1 + currentLevel * 0.18;
        const slowFactor = activePowerUpRef.current === "slow" ? 0.4 : 1;

        setPollution(prev => [...prev, {
          id: Date.now() + Math.random(),
          x: Math.random() * 85 + 7.5,
          y: -5,
          type,
          speed: baseSpeed * levelMultiplier * slowFactor * dc.speedMult,
          isToxic,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 4,
          windOffset: 0
        }]);
        lastSpawnRef.current = timestamp;
      }

      if (timestamp - lastPowerUpRef.current > 15000) {
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

      const wind = Math.sin(timestamp * 0.0008) * 0.15;
      setPollution(prev => {
        let hDelta = 0;
        const remaining: GameObject[] = [];

        for (const p of prev) {
          const newY = p.y + p.speed * dtScale;
          const newWindOffset = p.windOffset + wind * dtScale;
          const effectiveX = Math.max(2, Math.min(98, p.x + newWindOffset * 0.3));
          if (newY > CONTAINER_Y) {
            const dist = Math.abs(effectiveX - playerPosRef.current);
            const inContainer = dist < CONTAINER_WIDTH;
            const nearMiss = !inContainer && dist < NEAR_MISS_WIDTH;
            if (inContainer) {
              const mult = getComboMultiplier();
              const pts = (p.isToxic ? 25 : 15) * mult;
              setCollected(c => c + 1);
              setScore(s => s + pts);
              hDelta += Math.round(2 * dc.healMult);
              incrementCombo();
              addPopup(effectiveX, CONTAINER_Y - 5, `+${pts}`, "text-emerald-300");
              addHitParticle(effectiveX, CONTAINER_Y - 3, "bg-emerald-400");
            } else {
              if (activePowerUpRef.current !== "shield") {
                const dmg = Math.round((p.isToxic ? 18 : 8) * dc.damageMult);
                hDelta -= dmg;
                triggerShake();
              }
              if (nearMiss) {
                const nearPts = 5 * getComboMultiplier();
                setScore(s => s + nearPts);
                addPopup(effectiveX, CONTAINER_Y - 8, `CLOSE! +${nearPts}`, "text-yellow-300");
              }
              setCombo(0);
            }
          } else {
            remaining.push({ ...p, x: effectiveX, y: newY, rotation: p.rotation + p.rotationSpeed * dtScale, windOffset: newWindOffset });
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
              setHealth(h => Math.min(100, h + Math.round(1 * dc.healMult)));
              setDestroyed(d => d + 1);
              incrementCombo();
              addPopup(hitPol.x, hitPol.y, `+${pts}`, "text-amber-300");
              addHitParticle(hitPol.x, hitPol.y, "bg-amber-400");
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
            setHealth(h => Math.min(100, h + 12));
            setShowSeedBurst(true);
            addPopup(50, 50, "+100 SEED BURST", "text-emerald-300");
            setTimeout(() => setShowSeedBurst(false), 1000);
          } else {
            setActivePowerUp(found.type);
            activePowerUpRef.current = found.type;
            setPowerUpTimer(10);
            addPopup(found.x, found.y, found.type.toUpperCase(), "text-amber-300");
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
  }, [addPopup, addHitParticle, incrementCombo, getComboMultiplier, triggerShake]);

  useEffect(() => {
    if (paused || gameOver || gameWon) return;
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
  }, [powerUpTimer, paused, gameOver, gameWon]);

  const resetGame = () => {
    setScore(0);
    setHealth(100);
    setTime(0);
    setLevel(1);
    setGameOver(false);
    setGameWon(false);
    setShowQuiz(false);
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
    setHitParticles([]);
    setPowerUpTimer(0);
    setScreenShake(0);
    scoreRef.current = 0;
    levelRef.current = 1;
    healthRef.current = 100;
    gameOverRef.current = false;
    gameWonRef.current = false;
    playerPosRef.current = 50;
    activePowerUpRef.current = null;
    comboRef.current = 0;
    scoreSavedRef.current = false;
    setPlayerPosition(50);
  };

  const healthPct = health / 100;
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const nextThreshold = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];
  const prevThreshold = LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)];
  const levelProgress = nextThreshold > prevThreshold ? ((score - prevThreshold) / (nextThreshold - prevThreshold)) * 100 : 100;
  const timeRemaining = Math.max(0, WIN_TIME - time);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, hsl(150, 30%, 6%) 0%, hsl(160, 20%, 3%) 60%, #000 100%)' }}
    >
      {/* HUD - Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-3 py-2">
        <div className="flex flex-wrap justify-between items-center gap-2 max-w-5xl mx-auto">
          {/* Left HUD */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Guardian name */}
            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06]">
              <p className="text-white/30 text-[8px] tracking-[0.3em] uppercase font-display leading-none mb-0.5">Guardian</p>
              <p className="text-white/90 text-xs tracking-widest font-display leading-none">{nickname}</p>
            </div>

            {/* Health */}
            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] min-w-[140px]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Heart className={cn("w-3 h-3", health < 30 ? "text-red-400" : "text-emerald-400")} />
                  <p className="text-white/30 text-[8px] tracking-[0.2em] uppercase font-display leading-none">Health</p>
                </div>
                <span className={cn("text-[10px] tabular-nums font-display", health < 30 ? "text-red-400" : "text-emerald-400")} data-testid="text-health">{health}%</span>
              </div>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", health < 30 ? "bg-red-500" : "bg-emerald-500")}
                  animate={{ width: `${health}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>

            {/* Level */}
            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] min-w-[130px]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <p className="text-white/30 text-[8px] tracking-[0.2em] uppercase font-display leading-none">Lv.{level}</p>
                </div>
                <span className="text-amber-400/80 text-[8px] font-display leading-none truncate max-w-[60px]">{levelName}</span>
              </div>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500/60 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, levelProgress)}%` }} />
              </div>
            </div>

            {/* Difficulty badge */}
            <div className="px-2.5 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] flex items-center gap-1.5">
              <DiffIcon className={`w-3 h-3 ${diffConfig.color}`} />
              <span className={`text-[8px] tracking-[0.15em] uppercase font-display ${diffConfig.color}`} data-testid="text-difficulty">{diffConfig.label}</span>
            </div>

            {/* Wind indicator */}
            <div className="px-2 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] flex items-center gap-1">
              <Wind className="w-3 h-3 text-teal-400/60" style={{ transform: `scaleX(${windDirection > 0 ? 1 : -1})` }} />
              <span className="text-teal-400/40 text-[7px] font-display tracking-wider uppercase">Wind</span>
            </div>
          </div>

          {/* Right HUD */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Combo */}
            <AnimatePresence>
              {combo >= 3 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 backdrop-blur-xl rounded-lg border border-amber-400/20"
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-300 text-xs font-bold tabular-nums font-display" data-testid="text-combo">{combo}x</span>
                  {getComboMultiplier() > 1 && (
                    <span className="text-amber-400/50 text-[8px] font-display">({getComboMultiplier()}x)</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Power-Up Timer */}
            <AnimatePresence>
              {activePowerUp && powerUpTimer > 0 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 backdrop-blur-xl rounded-lg border"
                  style={{
                    background: activePowerUp === "shield" ? "rgba(59,130,246,0.15)" : activePowerUp === "beam" ? "rgba(234,179,8,0.15)" : "rgba(139,92,246,0.15)",
                    borderColor: activePowerUp === "shield" ? "rgba(59,130,246,0.25)" : activePowerUp === "beam" ? "rgba(234,179,8,0.25)" : "rgba(139,92,246,0.25)",
                  }}
                  data-testid="powerup-timer"
                >
                  {activePowerUp === "shield" ? (
                    <Shield className="w-3 h-3 text-blue-400" />
                  ) : activePowerUp === "beam" ? (
                    <Zap className="w-3 h-3 text-yellow-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-violet-400" />
                  )}
                  <span className={cn(
                    "text-xs font-bold tabular-nums font-display uppercase",
                    activePowerUp === "shield" ? "text-blue-300" : activePowerUp === "beam" ? "text-yellow-300" : "text-violet-300"
                  )}>
                    {activePowerUp}
                  </span>
                  <div className="w-12 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        activePowerUp === "shield" ? "bg-blue-400" : activePowerUp === "beam" ? "bg-yellow-400" : "bg-violet-400"
                      )}
                      animate={{ width: `${(powerUpTimer / 10) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] tabular-nums font-display",
                    activePowerUp === "shield" ? "text-blue-400/60" : activePowerUp === "beam" ? "text-yellow-400/60" : "text-violet-400/60"
                  )}>
                    {powerUpTimer}s
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats */}
            <div className="flex items-center gap-0 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] overflow-hidden">
              <div className="px-3 py-1.5 text-center border-r border-white/[0.04]">
                <p className="text-white/25 text-[7px] tracking-[0.2em] uppercase font-display leading-none mb-0.5">Score</p>
                <p className="text-amber-300 text-base tabular-nums font-display leading-none" data-testid="text-score">{score}</p>
              </div>
              <div className="px-3 py-1.5 text-center border-r border-white/[0.04]">
                <p className="text-white/25 text-[7px] tracking-[0.2em] uppercase font-display leading-none mb-0.5">Saved</p>
                <p className="text-emerald-300 text-base tabular-nums font-display leading-none" data-testid="text-collected">{collected}</p>
              </div>
              <div className="px-3 py-1.5 text-center">
                <p className="text-white/25 text-[7px] tracking-[0.2em] uppercase font-display leading-none mb-0.5">Purified</p>
                <p className="text-orange-300 text-base tabular-nums font-display leading-none" data-testid="text-destroyed">{destroyed}</p>
              </div>
            </div>

            {/* Win Timer */}
            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] min-w-[100px]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400/70" />
                  <p className="text-white/30 text-[7px] tracking-[0.2em] uppercase font-display leading-none">Survive</p>
                </div>
                <span className={cn(
                  "text-[10px] tabular-nums font-display",
                  timeRemaining <= 10 ? "text-red-400" : timeRemaining <= 30 ? "text-amber-400" : "text-sky-400/80"
                )} data-testid="text-timer">
                  {Math.floor(timeRemaining / 60)}:{String(Math.floor(timeRemaining % 60)).padStart(2, "0")}
                </span>
              </div>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    timeRemaining <= 10 ? "bg-red-500" : timeRemaining <= 30 ? "bg-amber-500" : "bg-sky-500/60"
                  )}
                  animate={{ width: `${Math.max(0, (1 - time / WIN_TIME) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" onClick={() => { keysRef.current.clear(); setPaused(p => !p); }} className="rounded-lg bg-black/30 border border-white/[0.06]" data-testid="button-pause-game">
                {paused ? <Play className="w-4 h-4 text-white/60" /> : <Pause className="w-4 h-4 text-white/60" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onExit} className="rounded-lg bg-black/30 border border-white/[0.06]" data-testid="button-exit-game">
                <X className="w-4 h-4 text-white/60" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Stage */}
      <div
        className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden"
        style={{
          transform: screenShake ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : undefined,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 0 120px -30px rgba(74,222,128,0.08), inset 0 0 60px rgba(0,0,0,0.3)'
        }}
      >
        {/* ===== BACKGROUND ===== */}
        <div className="absolute inset-0">
          {/* Sky dome */}
          <div
            className="absolute inset-0"
            style={{
              background: health > 60
                ? `radial-gradient(ellipse at 50% 0%, hsl(200, 40%, ${14 + healthPct * 8}%) 0%, hsl(170, 30%, ${8 + healthPct * 6}%) 40%, hsl(140, 35%, ${5 + healthPct * 8}%) 80%, hsl(120, 30%, ${4 + healthPct * 4}%) 100%)`
                : health > 30
                ? `radial-gradient(ellipse at 50% 0%, hsl(35, 20%, 10%) 0%, hsl(30, 12%, 7%) 40%, hsl(50, 8%, 5%) 80%, hsl(60, 6%, 4%) 100%)`
                : `radial-gradient(ellipse at 50% 0%, hsl(0, 15%, 8%) 0%, hsl(350, 10%, 5%) 40%, hsl(340, 6%, 4%) 80%, hsl(0, 4%, 3%) 100%)`
            }}
          />

          {/* Atmospheric haze */}
          <div className="absolute inset-0" style={{
            background: health > 50
              ? 'radial-gradient(ellipse at 30% 70%, rgba(74,222,128,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(34,197,94,0.02) 0%, transparent 40%)'
              : 'none'
          }} />

          {/* Stars */}
          {[...Array(40)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${(i * 11 + 7) % 100}%`,
                top: `${(i * 9 + 2) % 30}%`,
                width: `${i % 5 === 0 ? 2 : 1}px`,
                height: `${i % 5 === 0 ? 2 : 1}px`,
                backgroundColor: `rgba(255,255,255,${0.06 + (i % 4) * 0.04})`,
                animation: `pulse ${2 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}

          {/* Moving clouds */}
          {health > 35 && [...Array(4)].map((_, i) => (
            <div
              key={`cloud-${i}`}
              className="absolute"
              style={{
                left: `${((bgOffset * (0.2 + i * 0.08) * 40 + i * 28) % 140) - 20}%`,
                top: `${5 + i * 7}%`,
                width: `${100 + i * 40}px`,
                height: `${8 + i * 3}px`,
                background: health > 60
                  ? `radial-gradient(ellipse, rgba(255,255,255,${0.015 + i * 0.005}) 0%, transparent 70%)`
                  : `radial-gradient(ellipse, rgba(180,160,130,${0.01}) 0%, transparent 70%)`,
                filter: 'blur(1px)'
              }}
            />
          ))}

          {/* Far mountains */}
          <div className="absolute bottom-[28%] left-0 right-0 pointer-events-none" style={{ transform: `translateX(${Math.sin(bgOffset * 0.08) * 1.5}px)` }}>
            <svg viewBox="0 0 1200 200" className="w-full" preserveAspectRatio="none">
              <path
                d="M0,200 L0,140 Q100,80 200,120 Q280,60 380,100 Q450,40 550,90 Q620,50 700,80 Q800,30 900,70 Q980,50 1050,100 Q1120,60 1200,120 L1200,200 Z"
                fill={health > 50 ? "rgba(6,78,59,0.35)" : health > 25 ? "rgba(80,60,30,0.2)" : "rgba(40,40,40,0.25)"}
              />
            </svg>
          </div>

          {/* Near mountains */}
          <div className="absolute bottom-[18%] left-0 right-0 pointer-events-none" style={{ transform: `translateX(${Math.sin(bgOffset * 0.12) * 2.5}px)` }}>
            <svg viewBox="0 0 1200 160" className="w-full" preserveAspectRatio="none">
              <path
                d="M0,160 L0,100 Q80,50 180,80 Q260,30 360,70 Q440,20 520,60 Q600,35 680,70 Q760,25 860,55 Q940,40 1020,80 Q1100,45 1200,90 L1200,160 Z"
                fill={health > 50 ? "rgba(6,78,59,0.5)" : health > 25 ? "rgba(60,50,25,0.3)" : "rgba(35,30,30,0.35)"}
              />
            </svg>
          </div>

          {/* Treeline silhouettes */}
          <div className="absolute bottom-[10%] left-0 right-0 pointer-events-none" style={{ transform: `translateX(${Math.sin(bgOffset * 0.15) * 3}px)` }}>
            <svg viewBox="0 0 1200 100" className="w-full" preserveAspectRatio="none">
              <path
                d="M0,100 L0,60 L30,55 L45,30 L60,55 L90,50 L105,20 L120,50 L150,45 L170,15 L190,45 L220,50 L240,25 L260,50 L290,55 L310,35 L330,55 L360,50 L385,18 L410,50 L440,55 L460,30 L480,55 L510,50 L535,22 L560,50 L590,45 L610,28 L630,48 L660,52 L680,20 L700,50 L730,55 L755,32 L780,52 L810,48 L830,15 L850,48 L880,55 L900,35 L920,52 L950,50 L970,25 L990,50 L1020,55 L1040,30 L1060,55 L1090,48 L1110,22 L1130,50 L1160,55 L1180,38 L1200,52 L1200,100 Z"
                fill={health > 50 ? "rgba(6,60,40,0.6)" : health > 25 ? "rgba(50,40,20,0.35)" : "rgba(25,22,22,0.4)"}
              />
            </svg>
          </div>

          {/* Ground */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[9%]"
            style={{
              background: health > 50
                ? 'linear-gradient(to bottom, hsl(140, 30%, 8%) 0%, hsl(120, 25%, 5%) 100%)'
                : health > 25
                ? 'linear-gradient(to bottom, hsl(40, 12%, 7%) 0%, hsl(35, 8%, 4%) 100%)'
                : 'linear-gradient(to bottom, hsl(0, 6%, 6%) 0%, hsl(0, 4%, 3%) 100%)'
            }}
          />

          {/* Grass detail line */}
          <div className="absolute bottom-[9%] left-0 right-0 h-[1px]"
            style={{
              background: health > 50
                ? 'linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.1) 20%, rgba(74,222,128,0.15) 50%, rgba(74,222,128,0.1) 80%, transparent 100%)'
                : health > 25
                ? 'linear-gradient(90deg, transparent 0%, rgba(150,120,60,0.08) 50%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(120,50,50,0.06) 50%, transparent 100%)'
            }}
          />

          {/* Grass blades */}
          {health > 30 && (
            <div className="absolute bottom-[8%] left-0 right-0 h-[5%] pointer-events-none overflow-hidden">
              <svg viewBox="0 0 1200 40" className="w-full h-full" preserveAspectRatio="none">
                {[...Array(60)].map((_, i) => {
                  const x = i * 20 + (i % 3) * 5;
                  const h = 12 + (i % 5) * 6;
                  const sway = Math.sin(bgOffset * 0.5 + i * 0.7) * 3;
                  const col = health > 50
                    ? `rgba(${34 + (i % 3) * 10},${140 + (i % 4) * 20},${80 + (i % 3) * 10},${0.25 + (i % 5) * 0.05})`
                    : `rgba(${80 + (i % 3) * 10},${70 + (i % 4) * 10},${30},${0.15 + (i % 5) * 0.03})`;
                  return (
                    <line key={`grass-${i}`} x1={x} y1={40} x2={x + sway} y2={40 - h} stroke={col} strokeWidth={i % 4 === 0 ? 2 : 1} strokeLinecap="round" />
                  );
                })}
              </svg>
            </div>
          )}

          {/* Aurora / Nature glow in upper sky */}
          {health > 60 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[30%]" style={{
                background: `linear-gradient(180deg, rgba(74,222,128,${0.02 + Math.sin(bgOffset * 0.15) * 0.01}) 0%, transparent 100%)`,
              }} />
              <div className="absolute top-0 left-[20%] w-[30%] h-[20%]" style={{
                background: `radial-gradient(ellipse, rgba(56,189,248,${0.015 + Math.sin(bgOffset * 0.2 + 1) * 0.008}) 0%, transparent 70%)`,
                filter: 'blur(8px)'
              }} />
              <div className="absolute top-0 right-[15%] w-[25%] h-[18%]" style={{
                background: `radial-gradient(ellipse, rgba(167,139,250,${0.012 + Math.sin(bgOffset * 0.18 + 2) * 0.006}) 0%, transparent 70%)`,
                filter: 'blur(10px)'
              }} />
            </div>
          )}

          {/* Falling leaves */}
          {health > 45 && [...Array(6)].map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              animate={{
                y: [-(20 + i * 10), 300],
                x: [0, Math.sin(i * 1.2) * 60, Math.cos(i * 0.8) * -40, Math.sin(i * 2) * 50],
                rotate: [0, 360, 180, 540],
                opacity: [0, 0.3, 0.25, 0]
              }}
              transition={{ repeat: Infinity, duration: 10 + i * 2.5, ease: "linear", delay: i * 1.8 }}
              className="absolute z-[2] pointer-events-none"
              style={{ left: `${8 + i * 15}%`, top: '5%' }}
            >
              <Leaf className={`w-2.5 h-2.5 ${health > 60 ? 'text-emerald-400/20' : 'text-amber-500/15'}`} />
            </motion.div>
          ))}

          {/* Light shafts */}
          {health > 50 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`shaft-${i}`}
                  className="absolute top-0"
                  style={{
                    left: `${10 + i * 18}%`,
                    width: '40px',
                    height: '65%',
                    background: `linear-gradient(to bottom, rgba(255,250,200,${0.02 + Math.sin(bgOffset * 0.4 + i) * 0.01}) 0%, transparent 100%)`,
                    transform: `rotate(${-6 + i * 3 + Math.sin(bgOffset * 0.25 + i * 1.5) * 1.5}deg) scaleX(${1 + Math.sin(bgOffset * 0.3 + i * 2) * 0.2})`,
                    transformOrigin: 'top center',
                    filter: 'blur(3px)'
                  }}
                />
              ))}
            </div>
          )}

          {/* Fireflies */}
          {health > 25 && [...Array(7)].map((_, i) => (
            <motion.div
              key={`firefly-${i}`}
              animate={{
                x: [0, 15 + i * 3, -(10 + i * 2), 12, 0],
                y: [0, -(10 + i * 2), 8, -(5 + i), 0],
                opacity: [0, 0.5, 0.2, 0.6, 0],
                scale: [0.8, 1.2, 0.9, 1.1, 0.8]
              }}
              transition={{ repeat: Infinity, duration: 5 + i * 1.5, ease: "easeInOut", delay: i * 0.8 }}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${10 + i * 13}%`,
                top: `${35 + (i % 4) * 12}%`,
                backgroundColor: 'rgba(250,240,100,0.5)',
                boxShadow: '0 0 6px rgba(250,220,50,0.3), 0 0 12px rgba(250,220,50,0.1)'
              }}
            />
          ))}

          {/* Floating pollen/spores */}
          {health > 40 && [...Array(4)].map((_, i) => (
            <motion.div
              key={`pollen-${i}`}
              animate={{
                y: [0, -80, -160],
                x: [0, (i % 2 === 0 ? 30 : -20), (i % 2 === 0 ? -10 : 25)],
                opacity: [0, 0.12, 0]
              }}
              transition={{ repeat: Infinity, duration: 12 + i * 3, ease: "linear", delay: i * 2.5 }}
              className="absolute w-[3px] h-[3px] bg-emerald-300/10 rounded-full"
              style={{ left: `${20 + i * 20}%`, bottom: '15%' }}
            />
          ))}
        </div>

        {/* Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none z-[3]" style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)'
        }} />

        {/* Pollution source pipes */}
        <div className="absolute top-0 left-0 right-0 h-4 flex justify-around items-start z-[4]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="relative">
              <div className="w-10 h-4 bg-zinc-900/90 border-x border-b border-zinc-700/15 rounded-b-sm flex items-center justify-center">
                <div className="w-4 h-[1px] bg-zinc-700/30" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-red-900/20 blur-[2px]" />
            </div>
          ))}
        </div>

        {/* Damage vignette */}
        {health < 30 && (
          <div className="absolute inset-0 pointer-events-none z-[5]" style={{
            background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(180,20,20,${0.08 + (1 - healthPct) * 0.1}) 100%)`,
            animation: 'pulse 2s ease-in-out infinite'
          }} />
        )}

        {/* Seed Burst */}
        <AnimatePresence>
          {showSeedBurst && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 3], opacity: [0.3, 0] }}
                transition={{ duration: 0.8 }}
                className="absolute w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"
              />
              <div className="flex flex-col items-center">
                <Sparkles className="w-14 h-14 text-emerald-300 mb-2" />
                <span className="text-emerald-300 font-display text-2xl tracking-[0.2em] uppercase">Seed Burst</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            >
              <div className="flex flex-col items-center gap-1 px-8 py-4 bg-black/50 backdrop-blur-xl rounded-xl border border-amber-400/20 shadow-[0_0_30px_rgba(250,190,50,0.1)]">
                <div className="flex items-center gap-1.5">
                  <ChevronUp className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-display text-sm tracking-[0.3em] uppercase">Level {level}</span>
                  <ChevronUp className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-white font-display text-xl tracking-tight">{levelName}</span>
                <span className="text-white/25 font-body text-[9px] mt-0.5">The pollution intensifies</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score Popups */}
        <AnimatePresence>
          {scorePopups.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -25, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`absolute z-30 font-display text-xs font-bold pointer-events-none drop-shadow-lg ${p.color}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Hit particles */}
        <AnimatePresence>
          {hitParticles.map(p => (
            <motion.div key={p.id} className="absolute z-30 pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: (Math.cos(i * Math.PI / 2) * 15),
                    y: (Math.sin(i * Math.PI / 2) * 15),
                    opacity: 0,
                    scale: 0
                  }}
                  transition={{ duration: 0.4 }}
                  className={`absolute w-1 h-1 rounded-full ${p.color}`}
                />
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ===== GAME OBJECTS ===== */}

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
              <div className={cn("relative transition-transform", p.isToxic && "scale-110")}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center border backdrop-blur-[2px]",
                  p.isToxic ? config.toxicColor : config.color,
                  "shadow-lg",
                  p.isToxic ? "shadow-red-500/15" : config.bgGlow
                )}>
                  <Icon className={cn("w-4 h-4", p.isToxic ? "text-red-300" : config.iconColor)} />
                </div>
                {p.isToxic && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-30" />
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-3 bg-gradient-to-b from-white/[0.06] to-transparent" />
              </div>
            </div>
          );
        })}

        {/* Projectiles - Green energy shots */}
        {projectiles.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
            className="absolute z-[6]"
          >
            <div className="relative">
              <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-200 via-emerald-400 to-green-600 rounded-full" />
              <div className="absolute inset-0 w-1.5 h-6 bg-emerald-300 rounded-full blur-[4px] opacity-50" />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-300/40 rounded-full blur-[3px]" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[2px] h-3 bg-gradient-to-b from-emerald-400/25 to-transparent" />
            </div>
          </div>
        ))}

        {/* Power-Ups */}
        {powerUps.map((p) => (
          <motion.div
            key={p.id}
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { repeat: Infinity, duration: 3, ease: "linear" }, scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } }}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-[7]"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center border backdrop-blur-sm bg-amber-500/10 border-amber-400/30 shadow-lg shadow-amber-500/10">
              {p.type === "shield" && <Shield className="w-3.5 h-3.5 text-amber-300" />}
              {p.type === "beam" && <Zap className="w-3.5 h-3.5 text-amber-300" />}
              {p.type === "slow" && <Clock className="w-3.5 h-3.5 text-amber-300" />}
              {p.type === "seed" && <Leaf className="w-3.5 h-3.5 text-amber-300" />}
            </div>
          </motion.div>
        ))}

        {/* Player + Container */}
        <div
          className="absolute bottom-0 left-0 -translate-x-1/2 z-[8]"
          style={{ left: `${playerPosition}%`, transition: 'left 0.03s linear' }}
        >
          <div className="relative flex flex-col items-center">
            {/* Guardian */}
            <div className="relative mb-0.5">
              {activePowerUp === "shield" && (
                <motion.div
                  animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -inset-5 rounded-full border border-amber-300/20 bg-amber-400/[0.03]"
                />
              )}
              <div className="absolute -inset-3 bg-emerald-400/10 rounded-full blur-lg" />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center relative z-10 border"
                style={{
                  background: 'linear-gradient(135deg, rgba(6,78,59,0.7) 0%, rgba(22,101,52,0.5) 100%)',
                  borderColor: 'rgba(74,222,128,0.3)',
                  boxShadow: '0 0 20px rgba(74,222,128,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                <Leaf className="w-5 h-5 text-emerald-300" style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.4))' }} />
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-300/40 rounded-full blur-[2px]" />
            </div>

            {/* Container */}
            <div className="relative w-24 h-8" data-testid="garbage-container">
              <div className="absolute inset-0 rounded-b-lg rounded-t-sm overflow-hidden border-2"
                style={{
                  background: 'linear-gradient(to bottom, rgba(6,78,59,0.6) 0%, rgba(6,60,40,0.8) 100%)',
                  borderColor: 'rgba(74,222,128,0.35)',
                  boxShadow: '0 0 15px rgba(74,222,128,0.1), inset 0 1px 0 rgba(255,255,255,0.04)'
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-400/30" />
                <div className="absolute top-[2px] left-1 right-1 h-[1px] bg-emerald-400/10" />
                <div className="absolute left-1 top-1 bottom-1 w-[1px] bg-emerald-400/10" />
                <div className="absolute right-1 top-1 bottom-1 w-[1px] bg-emerald-400/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 text-emerald-400/30 mr-1" />
                  <span className="text-[8px] text-emerald-400/40 font-display uppercase tracking-[0.3em]">recycle</span>
                </div>
              </div>
              <div className="absolute -inset-1 bg-emerald-400/[0.06] rounded-lg blur-md -z-10" />
              {collected > 0 && (
                <div className="absolute -inset-3 bg-emerald-400/[0.05] rounded-xl blur-xl -z-10" />
              )}
            </div>
          </div>
        </div>

        {/* Active power-up badge */}
        <AnimatePresence>
          {activePowerUp && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-2 bottom-2 bg-black/40 backdrop-blur-xl border border-amber-400/15 px-2 py-1 rounded-lg flex items-center gap-1.5 text-amber-300 font-display text-[9px] z-10"
            >
              {activePowerUp === "shield" && <Shield className="w-3 h-3" />}
              {activePowerUp === "beam" && <Zap className="w-3 h-3" />}
              {activePowerUp === "slow" && <Clock className="w-3 h-3" />}
              <span className="uppercase tracking-widest">{activePowerUp}</span>
              <span className="w-px h-2 bg-amber-400/15" />
              <span className="tabular-nums">{powerUpTimer}s</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== OVERLAYS ===== */}

        {/* Pause */}
        <AnimatePresence>
          {paused && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center"
              style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)', backdropFilter: 'blur(8px)' }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                  <Pause className="w-8 h-8 text-white/20" />
                </div>
                <h2 className="text-3xl font-display text-white/90 mb-1 tracking-[0.3em] uppercase">Paused</h2>
                <p className="text-white/30 font-body text-xs mb-6">The forest holds its breath</p>

                <div className="flex gap-4 mb-6">
                  {[
                    { label: "Score", value: score, color: "text-amber-300" },
                    { label: "Level", value: level, color: "text-emerald-300" },
                    { label: "Difficulty", value: diffConfig.label, color: diffConfig.color },
                    { label: "Time", value: `${Math.floor(time)}s`, color: "text-white/70" },
                  ].map(s => (
                    <div key={s.label} className="px-4 py-2 bg-white/[0.03] rounded-lg border border-white/[0.04] text-center min-w-[70px]">
                      <p className="text-white/20 text-[7px] tracking-[0.3em] uppercase font-display mb-0.5">{s.label}</p>
                      <p className={`text-lg font-display tabular-nums ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 w-full max-w-[220px]">
                  <Button onClick={() => setPaused(false)} className="w-full rounded-lg bg-emerald-600/80 text-white font-display text-xs tracking-widest border border-emerald-500/30" data-testid="button-resume-game">
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    RESUME
                  </Button>
                  <Button variant="ghost" onClick={resetGame} className="w-full rounded-lg text-white/60 font-display text-xs tracking-widest border border-white/[0.06]" data-testid="button-restart-level">
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    RESTART LEVEL
                  </Button>
                  <Button variant="ghost" onClick={onExit} className="w-full rounded-lg text-white/40 font-display text-xs tracking-widest border border-white/[0.06]" data-testid="button-quit-game">
                    <Home className="w-3.5 h-3.5 mr-1.5" />
                    EXIT TO HOME
                  </Button>
                </div>
                <p className="text-white/15 text-[8px] tracking-[0.3em] uppercase mt-4 font-display">ESC to resume</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center"
              style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.85) 100%)', backdropFilter: 'blur(12px)' }}
            >
              <motion.div
                initial={{ scale: 0.85, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col items-center max-w-md w-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/[0.06] border border-amber-400/15 flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-amber-400/80" />
                </div>
                <h2 className="text-3xl font-display text-white/90 mb-0.5 tracking-tight">Earth Fell Silent</h2>
                <p className="text-white/30 font-body text-xs mb-5">But the fight is not over. The villain still watches.</p>

                <div className="w-full grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: "Score", value: score, color: "text-amber-300" },
                    { label: "Saved", value: collected, color: "text-emerald-300" },
                    { label: "Purified", value: destroyed, color: "text-orange-300" },
                    { label: "Best Combo", value: `${maxCombo}x`, color: "text-amber-300" },
                  ].map(s => (
                    <div key={s.label} className="px-2 py-2 bg-white/[0.03] rounded-lg border border-white/[0.04] text-center">
                      <p className="text-white/20 text-[7px] tracking-[0.2em] uppercase font-display mb-0.5">{s.label}</p>
                      <p className={`text-lg font-display tabular-nums ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 mb-5 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.04]">
                  <Star className="w-3 h-3 text-amber-400/60" />
                  <span className="text-white/30 text-[9px] tracking-widest uppercase font-display">Level {level}</span>
                  <span className="text-white/10">-</span>
                  <span className="text-amber-300/80 font-display text-xs">{levelName}</span>
                  <span className="text-white/10">-</span>
                  <span className="text-white/30 text-[9px] tabular-nums font-display">{Math.floor(time)}s</span>
                </div>

                <p className="text-white/20 font-body text-[10px] italic mb-5">"Earth does not need a hero seeking glory. It needs a keeper who never stops."</p>

                <div className="flex gap-2">
                  <Button onClick={resetGame} className="px-5 rounded-lg bg-emerald-600/80 text-white font-display text-xs tracking-widest border border-emerald-500/30" data-testid="button-restart-game">
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    TRY AGAIN
                  </Button>
                  <Button variant="ghost" onClick={onExit} className="px-5 rounded-lg text-white/50 font-display text-xs tracking-widest border border-white/[0.06]" data-testid="button-leave-game">
                    <Home className="w-3.5 h-3.5 mr-1.5" />
                    EXIT
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Victory / Congratulations */}
        <AnimatePresence>
          {gameWon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center"
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, rgba(6,78,59,0.5) 0%, rgba(0,0,0,0.85) 100%)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <motion.div
                initial={{ scale: 0.7, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.2 }}
                className="flex flex-col items-center max-w-md w-full"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                  className="relative mb-5"
                >
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center border border-emerald-400/30"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,78,59,0.6) 0%, rgba(22,101,52,0.4) 100%)',
                      boxShadow: '0 0 60px rgba(74,222,128,0.2), 0 0 120px rgba(74,222,128,0.1)'
                    }}
                  >
                    <Crown className="w-10 h-10 text-amber-400" style={{ filter: 'drop-shadow(0 0 12px rgba(250,204,21,0.4))' }} />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -inset-4 rounded-3xl border border-emerald-400/10"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-[10px] tracking-[0.5em] uppercase font-display text-emerald-400/50 mb-2">Congratulations</p>
                  <h2 className="text-3xl md:text-4xl font-display text-white/95 mb-1 tracking-tight">Earth is Saved</h2>
                  <p className="text-emerald-300/50 font-body text-sm mb-6">The skies are clear. Nature breathes again, thanks to you, Keeper.</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="w-full grid grid-cols-4 gap-2 mb-4"
                >
                  {[
                    { label: "Score", value: score, color: "text-amber-300" },
                    { label: "Saved", value: collected, color: "text-emerald-300" },
                    { label: "Purified", value: destroyed, color: "text-orange-300" },
                    { label: "Best Combo", value: `${maxCombo}x`, color: "text-amber-300" },
                  ].map(s => (
                    <div key={s.label} className="px-2 py-2 bg-white/[0.03] rounded-lg border border-white/[0.04] text-center">
                      <p className="text-white/20 text-[7px] tracking-[0.2em] uppercase font-display mb-0.5">{s.label}</p>
                      <p className={`text-lg font-display tabular-nums ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="flex items-center gap-1.5 mb-4 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.04]"
                >
                  <Star className="w-3 h-3 text-amber-400/60" />
                  <span className="text-white/30 text-[9px] tracking-widest uppercase font-display">Level {level}</span>
                  <span className="text-white/10">-</span>
                  <span className="text-amber-300/80 font-display text-xs">{levelName}</span>
                  <span className="text-white/10">-</span>
                  <DiffIcon className={`w-3 h-3 ${diffConfig.color}`} />
                  <span className={`text-[9px] font-display ${diffConfig.color}`}>{diffConfig.label}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-emerald-500/[0.06] rounded-xl border border-emerald-400/15"
                >
                  <TreeDeciduous className="w-4 h-4 text-emerald-400/70" />
                  <p className="text-emerald-300/70 font-body text-xs italic leading-relaxed">
                    "A true keeper does not fight for victory. They fight so every leaf, every river, every breath of wind may live on."
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="flex gap-2"
                >
                  <Button onClick={() => setShowQuiz(true)} className="px-5 rounded-lg bg-purple-600/70 text-white font-display text-xs tracking-widest border border-purple-500/30" data-testid="button-face-malakar">
                    <Skull className="w-3.5 h-3.5 mr-1.5" />
                    FACE MALAKAR
                  </Button>
                  <Button variant="ghost" onClick={onExit} className="px-5 rounded-lg text-white/50 font-display text-xs tracking-widest border border-white/[0.06]" data-testid="button-victory-exit">
                    <Home className="w-3.5 h-3.5 mr-1.5" />
                    EXIT
                  </Button>
                </motion.div>
              </motion.div>

              {/* Victory particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={`victory-${i}`}
                    initial={{ opacity: 0, y: 200 + Math.random() * 300 }}
                    animate={{
                      opacity: [0, 0.6, 0],
                      y: [200 + Math.random() * 200, -(100 + Math.random() * 200)],
                      x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut",
                    }}
                    className="absolute rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      width: `${2 + Math.random() * 3}px`,
                      height: `${2 + Math.random() * 3}px`,
                      backgroundColor: i % 3 === 0 ? 'rgba(74,222,128,0.5)' : i % 3 === 1 ? 'rgba(250,204,21,0.4)' : 'rgba(147,197,253,0.3)',
                      boxShadow: `0 0 6px ${i % 3 === 0 ? 'rgba(74,222,128,0.3)' : i % 3 === 1 ? 'rgba(250,204,21,0.2)' : 'rgba(147,197,253,0.2)'}`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Malakar Quiz Overlay */}
      <AnimatePresence>
        {showQuiz && (
          <MalakarQuiz
            onPass={() => { setShowQuiz(false); onExit(); }}
            onPlayAgain={() => { setShowQuiz(false); resetGame(); }}
            onExit={() => { setShowQuiz(false); onExit(); }}
          />
        )}
      </AnimatePresence>

      {/* Bottom hints */}
      <div className="mt-3 flex items-center gap-4 text-white/15 font-display text-[8px] tracking-[0.3em] uppercase flex-wrap justify-center">
        <div className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[7px] tabular-nums">A/D</kbd>
          <span>Move</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[7px]">ESC</kbd>
          <span>Pause</span>
        </div>
        <span className="text-emerald-400/20">Catch trash for bonus</span>
        <span className="text-amber-400/20">Chain hits for combos</span>
      </div>
    </motion.div>
  );
}
