import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sparkles, Trophy, X, Shield, Zap, Clock, TreePine, Mountain, Flower2, FlaskRound, ShoppingBag, Package, Trash2, Droplets, Cpu, Pause, Play, ChevronUp, ChevronLeft, ChevronRight, Star, Wind, Flame, Heart, Globe, RotateCcw, Home, Crown, TreeDeciduous, Volume2, VolumeX, Skull, Beer, Fuel, Battery, Biohazard, Bomb, AlertTriangle, CircleOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MalakarQuiz } from "./MalakarQuiz";
import { GameSounds, startAmbient, stopAmbient, speakVillain, stopVillainSpeech } from "@/lib/sounds";

const GARBAGE_CONFIG = {
  bottle: {
    icon: FlaskRound, label: "Plastic",
    iconColor: "#7dd3fc", glowColor: "rgba(56,189,248,0.35)",
    bgGrad: "linear-gradient(135deg, rgba(12,74,110,0.7) 0%, rgba(7,89,133,0.5) 100%)",
    borderColor: "rgba(56,189,248,0.4)",
    toxicGrad: "linear-gradient(135deg, rgba(127,29,29,0.7) 0%, rgba(153,27,27,0.5) 100%)",
    toxicBorder: "rgba(248,113,113,0.5)", toxicGlow: "rgba(248,113,113,0.4)",
    size: 9
  },
  bag: {
    icon: ShoppingBag, label: "Bag",
    iconColor: "#fcd34d", glowColor: "rgba(252,211,77,0.3)",
    bgGrad: "linear-gradient(135deg, rgba(120,53,15,0.7) 0%, rgba(146,64,14,0.5) 100%)",
    borderColor: "rgba(252,211,77,0.4)",
    toxicGrad: "linear-gradient(135deg, rgba(127,29,29,0.7) 0%, rgba(153,27,27,0.5) 100%)",
    toxicBorder: "rgba(248,113,113,0.5)", toxicGlow: "rgba(248,113,113,0.4)",
    size: 10
  },
  can: {
    icon: Beer, label: "Can",
    iconColor: "#d4d4d8", glowColor: "rgba(161,161,170,0.25)",
    bgGrad: "linear-gradient(135deg, rgba(63,63,70,0.7) 0%, rgba(82,82,91,0.5) 100%)",
    borderColor: "rgba(161,161,170,0.4)",
    toxicGrad: "linear-gradient(135deg, rgba(127,29,29,0.7) 0%, rgba(153,27,27,0.5) 100%)",
    toxicBorder: "rgba(248,113,113,0.5)", toxicGlow: "rgba(248,113,113,0.4)",
    size: 8
  },
  barrel: {
    icon: Biohazard, label: "Toxic Barrel",
    iconColor: "#fdba74", glowColor: "rgba(251,146,60,0.35)",
    bgGrad: "linear-gradient(135deg, rgba(124,45,18,0.7) 0%, rgba(154,52,18,0.5) 100%)",
    borderColor: "rgba(251,146,60,0.45)",
    toxicGrad: "linear-gradient(135deg, rgba(127,29,29,0.8) 0%, rgba(153,27,27,0.6) 100%)",
    toxicBorder: "rgba(248,113,113,0.6)", toxicGlow: "rgba(248,113,113,0.5)",
    size: 11
  },
  oil: {
    icon: Fuel, label: "Oil Spill",
    iconColor: "#c4b5fd", glowColor: "rgba(167,139,250,0.3)",
    bgGrad: "linear-gradient(135deg, rgba(76,29,149,0.7) 0%, rgba(91,33,182,0.5) 100%)",
    borderColor: "rgba(167,139,250,0.4)",
    toxicGrad: "linear-gradient(135deg, rgba(127,29,29,0.7) 0%, rgba(153,27,27,0.5) 100%)",
    toxicBorder: "rgba(248,113,113,0.5)", toxicGlow: "rgba(248,113,113,0.4)",
    size: 9
  },
  ewaste: {
    icon: Battery, label: "E-waste",
    iconColor: "#5eead4", glowColor: "rgba(45,212,191,0.3)",
    bgGrad: "linear-gradient(135deg, rgba(17,94,89,0.7) 0%, rgba(19,78,74,0.5) 100%)",
    borderColor: "rgba(45,212,191,0.4)",
    toxicGrad: "linear-gradient(135deg, rgba(127,29,29,0.7) 0%, rgba(153,27,27,0.5) 100%)",
    toxicBorder: "rgba(248,113,113,0.5)", toxicGlow: "rgba(248,113,113,0.4)",
    size: 9
  },
  bomb: {
    icon: Bomb, label: "Explosive",
    iconColor: "#fca5a5", glowColor: "rgba(248,113,113,0.4)",
    bgGrad: "linear-gradient(135deg, rgba(127,29,29,0.8) 0%, rgba(69,10,10,0.6) 100%)",
    borderColor: "rgba(248,113,113,0.5)",
    toxicGrad: "linear-gradient(135deg, rgba(127,29,29,0.9) 0%, rgba(69,10,10,0.7) 100%)",
    toxicBorder: "rgba(248,113,113,0.6)", toxicGlow: "rgba(248,113,113,0.5)",
    size: 10
  },
  nuclear: {
    icon: AlertTriangle, label: "Hazard",
    iconColor: "#fde047", glowColor: "rgba(250,204,21,0.35)",
    bgGrad: "linear-gradient(135deg, rgba(113,63,18,0.7) 0%, rgba(133,77,14,0.5) 100%)",
    borderColor: "rgba(250,204,21,0.45)",
    toxicGrad: "linear-gradient(135deg, rgba(127,29,29,0.8) 0%, rgba(153,27,27,0.6) 100%)",
    toxicBorder: "rgba(248,113,113,0.6)", toxicGlow: "rgba(248,113,113,0.5)",
    size: 9
  },
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

export function Game({ onExit, nickname, difficulty, onSaveScore }) {
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [paused, setPaused] = useState(false);

  const [playerPosition, setPlayerPosition] = useState(50);
  const [pollution, setPollution] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [activePowerUp, setActivePowerUp] = useState(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [showSeedBurst, setShowSeedBurst] = useState(false);
  const [collected, setCollected] = useState(0);
  const [destroyed, setDestroyed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [scorePopups, setScorePopups] = useState([]);
  const [hitParticles, setHitParticles] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [bgOffset, setBgOffset] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  const [windDirection, setWindDirection] = useState(0);

  const diffConfig = DIFFICULTY_CONFIG[difficulty];
  const DiffIcon = diffConfig.Icon;

  const gameLoopRef = useRef();
  const lastShotRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const lastPowerUpRef = useRef(0);
  const comboTimerRef = useRef(0);
  const keysRef = useRef(new Set());
  const pausedRef = useRef(false);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const healthRef = useRef(100);
  const gameOverRef = useRef(false);
  const gameWonRef = useRef(false);
  const playerPosRef = useRef(50);
  const activePowerUpRef = useRef(null);
  const comboRef = useRef(0);
  const popupIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const scoreSavedRef = useRef(false);
  const timeRef = useRef(0);
  const soundRef = useRef(true);
  const lastShotSoundRef = useRef(0);

  const PLAYER_Y = 85;
  const SHOT_SPEED = 2;
  const CONTAINER_Y = 95;
  const CONTAINER_WIDTH = 14;
  const NEAR_MISS_WIDTH = 22;
  const POLLUTION_TYPES = ["bottle", "bag", "can", "barrel", "oil", "ewaste", "bomb", "nuclear"];
  const COMBO_TIMEOUT = 1800;
  const WIN_TIME = diffConfig.winTime;
  const touchLeftRef = useRef(false);
  const touchRightRef = useRef(false);
  const [playerVelocity, setPlayerVelocity] = useState(0);
  const [playerTrail, setPlayerTrail] = useState([]);
  const playerTrailRef = useRef([]);
  const lastTrailTimeRef = useRef(0);

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
  soundRef.current = soundEnabled;

  useEffect(() => {
    if (soundEnabled) startAmbient();
    else stopAmbient();
    return () => { stopAmbient(); stopVillainSpeech(); };
  }, [soundEnabled]);

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
    if (gameOver && soundEnabled) {
      stopAmbient();
      GameSounds.gameOver();
    }
    if (gameWon && soundEnabled) {
      stopAmbient();
      GameSounds.victory();
    }
  }, [gameOver, gameWon]);

  const addPopup = useCallback((x, y, text, color) => {
    const id = ++popupIdRef.current;
    setScorePopups(prev => [...prev.slice(-8), { id, x, y, text, color }]);
    setTimeout(() => setScorePopups(prev => prev.filter(p => p.id !== id)), 1200);
  }, []);

  const addHitParticle = useCallback((x, y, color) => {
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
      if (newCombo === 5 && soundRef.current) {
        GameSounds.combo5();
      } else if (newCombo === 10) {
        setScore(s => s + 50);
        setHealth(h => Math.min(100, h + 5));
        addPopup(50, 40, "STREAK x10! +50", "text-amber-200");
        if (soundRef.current) GameSounds.combo10();
      } else if (newCombo === 20) {
        setScore(s => s + 150);
        setHealth(h => Math.min(100, h + 10));
        addPopup(50, 40, "STREAK x20! +150", "text-amber-100");
        if (soundRef.current) GameSounds.combo20();
      } else if (newCombo === 30) {
        setScore(s => s + 300);
        setHealth(h => Math.min(100, h + 15));
        addPopup(50, 40, "UNSTOPPABLE! +300", "text-yellow-200");
        if (soundRef.current) GameSounds.combo30();
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
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (gameOverRef.current || gameWonRef.current) return;
        keysRef.current.clear();
        setPaused(p => !p);
        return;
      }
      if (gameOverRef.current || gameWonRef.current || pausedRef.current) return;
      keysRef.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e) => {
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

    const tick = (timestamp) => {
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
      let moveDir = 0;
      if (keys.has("arrowleft") || keys.has("a") || touchLeftRef.current) {
        setPlayerPosition(p => {
          const next = Math.max(5, p - 5 * dtScale);
          playerPosRef.current = next;
          return next;
        });
        moveDir = -1;
      }
      if (keys.has("arrowright") || keys.has("d") || touchRightRef.current) {
        setPlayerPosition(p => {
          const next = Math.min(95, p + 5 * dtScale);
          playerPosRef.current = next;
          return next;
        });
        moveDir = 1;
      }
      setPlayerVelocity(prev => prev * 0.8 + moveDir * 0.2);

      if (moveDir !== 0 && timestamp - lastTrailTimeRef.current > 60) {
        lastTrailTimeRef.current = timestamp;
        const trailId = timestamp + Math.random();
        const newTrail = { id: trailId, x: playerPosRef.current, t: timestamp };
        playerTrailRef.current = [...playerTrailRef.current.slice(-8), newTrail];
        setPlayerTrail([...playerTrailRef.current]);
        setTimeout(() => {
          playerTrailRef.current = playerTrailRef.current.filter(t => t.id !== trailId);
          setPlayerTrail([...playerTrailRef.current]);
        }, 400);
      }

      if (Date.now() - comboTimerRef.current > COMBO_TIMEOUT && comboRef.current > 0) {
        setCombo(0);
      }

      const shotCooldown = activePowerUpRef.current === "beam" ? 150 : 300;
      if (timestamp - lastShotRef.current > shotCooldown) {
        setProjectiles(prev => [...prev, { id: Date.now() + Math.random(), x: playerPosRef.current, y: PLAYER_Y }]);
        lastShotRef.current = timestamp;
        if (soundRef.current && timestamp - lastShotSoundRef.current > 250) {
          GameSounds.shoot();
          lastShotSoundRef.current = timestamp;
        }
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
        const types = ["shield", "beam", "slow", "seed"];
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
        const remaining = [];

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
              if (soundRef.current) GameSounds.collectGarbage();
            } else {
              if (activePowerUpRef.current !== "shield") {
                const dmg = Math.round((p.isToxic ? 18 : 8) * dc.damageMult);
                hDelta -= dmg;
                triggerShake();
                if (soundRef.current) GameSounds.playerDamage();
              }
              if (nearMiss) {
                const nearPts = 5 * getComboMultiplier();
                setScore(s => s + nearPts);
                addPopup(effectiveX, CONTAINER_Y - 8, `CLOSE! +${nearPts}`, "text-yellow-300");
                if (soundRef.current) GameSounds.nearMiss();
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
        const consumed = new Set();
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
              if (soundRef.current) GameSounds.destroyGarbage();
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
            if (soundRef.current) GameSounds.seedBurst();
            setTimeout(() => setShowSeedBurst(false), 1000);
          } else {
            setActivePowerUp(found.type);
            activePowerUpRef.current = found.type;
            setPowerUpTimer(10);
            addPopup(found.x, found.y, found.type.toUpperCase(), "text-amber-300");
            if (soundRef.current) GameSounds.powerUp();
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
        if (soundRef.current) GameSounds.levelUp();
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
    setPlayerVelocity(0);
    setPlayerTrail([]);
    playerTrailRef.current = [];
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
      style={{ background: 'radial-gradient(ellipse at 50% 20%, hsl(150, 35%, 8%) 0%, hsl(155, 28%, 5%) 35%, hsl(160, 22%, 3%) 65%, hsl(165, 15%, 1%) 100%)' }}
    >
      {/* HUD - Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-1.5 sm:px-3 py-1 sm:py-2">
        <div className="flex flex-wrap justify-between items-start gap-1 sm:gap-2 max-w-5xl mx-auto">
          {/* Left HUD */}
          <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
            {/* Guardian name - hidden on very small screens */}
            <div className="hidden sm:block px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06]">
              <p className="text-white/30 text-[8px] tracking-[0.3em] uppercase font-display leading-none mb-0.5">Guardian</p>
              <p className="text-white/90 text-xs tracking-widest font-display leading-none">{nickname}</p>
            </div>

            {/* Health */}
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] min-w-[80px] sm:min-w-[140px]">
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <div className="flex items-center gap-1">
                  <Heart className={cn("w-3 h-3", health < 30 ? "text-red-400" : "text-emerald-400")} />
                  <p className="hidden sm:block text-white/30 text-[8px] tracking-[0.2em] uppercase font-display leading-none">Health</p>
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

            {/* Level - compact on mobile */}
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] min-w-[70px] sm:min-w-[130px]">
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <p className="text-white/30 text-[8px] tracking-[0.2em] uppercase font-display leading-none">Lv.{level}</p>
                </div>
                <span className="hidden sm:block text-amber-400/80 text-[8px] font-display leading-none truncate max-w-[60px]">{levelName}</span>
              </div>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500/60 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, levelProgress)}%` }} />
              </div>
            </div>

            {/* Difficulty badge - hidden on small mobile */}
            <div className="hidden sm:flex px-2.5 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] items-center gap-1.5">
              <DiffIcon className={`w-3 h-3 ${diffConfig.color}`} />
              <span className={`text-[8px] tracking-[0.15em] uppercase font-display ${diffConfig.color}`} data-testid="text-difficulty">{diffConfig.label}</span>
            </div>

            {/* Wind indicator - hidden on small mobile */}
            <div className="hidden md:flex px-2 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] items-center gap-1">
              <Wind className="w-3 h-3 text-teal-400/60" style={{ transform: `scaleX(${windDirection > 0 ? 1 : -1})` }} />
              <span className="text-teal-400/40 text-[7px] font-display tracking-wider uppercase">Wind</span>
            </div>
          </div>

          {/* Right HUD */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
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

            {/* Stats - compact on mobile */}
            <div className="flex items-center gap-0 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] overflow-hidden">
              <div className="px-1.5 sm:px-3 py-1 sm:py-1.5 text-center border-r border-white/[0.04]">
                <p className="text-white/25 text-[6px] sm:text-[7px] tracking-[0.2em] uppercase font-display leading-none mb-0.5">Score</p>
                <p className="text-amber-300 text-xs sm:text-base tabular-nums font-display leading-none" data-testid="text-score">{score}</p>
              </div>
              <div className="hidden sm:block px-3 py-1.5 text-center border-r border-white/[0.04]">
                <p className="text-white/25 text-[7px] tracking-[0.2em] uppercase font-display leading-none mb-0.5">Saved</p>
                <p className="text-emerald-300 text-base tabular-nums font-display leading-none" data-testid="text-collected">{collected}</p>
              </div>
              <div className="hidden sm:block px-3 py-1.5 text-center">
                <p className="text-white/25 text-[7px] tracking-[0.2em] uppercase font-display leading-none mb-0.5">Purified</p>
                <p className="text-orange-300 text-base tabular-nums font-display leading-none" data-testid="text-destroyed">{destroyed}</p>
              </div>
            </div>

            {/* Win Timer */}
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/[0.06] min-w-[70px] sm:min-w-[100px]">
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400/70" />
                  <p className="hidden sm:block text-white/30 text-[7px] tracking-[0.2em] uppercase font-display leading-none">Survive</p>
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
              <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(s => !s)} className="rounded-lg bg-black/30 border border-white/[0.06]" data-testid="button-toggle-sound">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-white/60" /> : <VolumeX className="w-4 h-4 text-white/30" />}
              </Button>
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
        className="relative w-full h-full sm:h-auto sm:max-w-5xl sm:aspect-video sm:rounded-xl overflow-hidden"
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
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const dist = 12 + Math.random() * 12;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(angle) * dist,
                      y: Math.sin(angle) * dist - 5,
                      opacity: 0,
                      scale: 0
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`absolute rounded-full ${p.color}`}
                    style={{ width: i % 3 === 0 ? '3px' : '2px', height: i % 3 === 0 ? '3px' : '2px' }}
                  />
                );
              })}
              <motion.div
                initial={{ scale: 0.5, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className={`absolute w-4 h-4 -translate-x-2 -translate-y-2 rounded-full ${p.color}`}
                style={{ filter: 'blur(4px)' }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ===== GAME OBJECTS ===== */}

        {/* Garbage */}
        {pollution.map((p) => {
          const config = GARBAGE_CONFIG[p.type] || GARBAGE_CONFIG.bottle;
          const Icon = config.icon;
          const sz = config.size || 9;
          const icoSz = Math.round(sz * 0.5);
          const wobble = Math.sin(p.rotation * 0.05) * 3;
          return (
            <div
              key={p.id}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.isToxic ? 1.15 : 1})`
              }}
              className="absolute z-[6]"
            >
              <div className="relative">
                {p.isToxic && (
                  <div className="absolute -inset-2 rounded-full animate-pulse" style={{
                    background: `radial-gradient(circle, ${config.toxicGlow} 0%, transparent 70%)`,
                  }} />
                )}
                {!p.isToxic && (
                  <div className="absolute -inset-1.5 rounded-full" style={{
                    background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
                    opacity: 0.5 + Math.sin(p.rotation * 0.08) * 0.3
                  }} />
                )}
                <div
                  className="flex items-center justify-center backdrop-blur-sm"
                  style={{
                    width: `${sz * 4}px`,
                    height: `${sz * 4}px`,
                    borderRadius: p.type === 'barrel' || p.type === 'bomb' ? '50%' : '10px',
                    background: p.isToxic ? config.toxicGrad : config.bgGrad,
                    border: `1.5px solid ${p.isToxic ? config.toxicBorder : config.borderColor}`,
                    boxShadow: `0 4px 16px ${p.isToxic ? config.toxicGlow : config.glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)`,
                    transform: `translateY(${wobble}px)`
                  }}
                >
                  <Icon
                    style={{
                      width: `${icoSz * 4}px`,
                      height: `${icoSz * 4}px`,
                      color: p.isToxic ? '#fca5a5' : config.iconColor,
                      filter: `drop-shadow(0 0 ${p.isToxic ? '6px rgba(248,113,113,0.6)' : `4px ${config.glowColor}`})`,
                    }}
                  />
                </div>
                {p.isToxic && (
                  <>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-40" />
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
                    <Skull className="absolute -bottom-1 -left-1 w-3 h-3 text-red-400/60" style={{ filter: 'drop-shadow(0 0 3px rgba(248,113,113,0.4))' }} />
                  </>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-4 rounded-full" style={{
                  background: `linear-gradient(to bottom, ${p.isToxic ? 'rgba(248,113,113,0.15)' : config.glowColor.replace(/[\d.]+\)$/, '0.12)')} 0%, transparent 100%)`
                }} />
              </div>
            </div>
          );
        })}

        {/* Projectiles - Energy shots */}
        {projectiles.map((p) => {
          const isBeam = activePowerUp === 'beam';
          return (
            <div
              key={p.id}
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
              className="absolute z-[6]"
            >
              <div className="relative">
                <div className="w-2 h-7 rounded-full" style={{
                  background: isBeam
                    ? 'linear-gradient(to bottom, #fef08a, #facc15, #ca8a04)'
                    : 'linear-gradient(to bottom, #a7f3d0, #34d399, #059669)'
                }} />
                <div className="absolute inset-0 w-2 h-7 rounded-full opacity-60" style={{
                  background: isBeam ? '#facc15' : '#6ee7b7',
                  filter: 'blur(5px)'
                }} />
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{
                  background: isBeam ? 'rgba(250,204,21,0.5)' : 'rgba(110,231,183,0.45)',
                  filter: 'blur(4px)'
                }} />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[2px] h-4 rounded-full" style={{
                  background: `linear-gradient(to bottom, ${isBeam ? 'rgba(250,204,21,0.3)' : 'rgba(74,222,128,0.25)'} 0%, transparent 100%)`
                }} />
              </div>
            </div>
          );
        })}

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

        {/* Player Trail */}
        {playerTrail.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0.25, scale: 1 }}
            animate={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute bottom-[6%] z-[7] pointer-events-none"
            style={{ left: `${t.x}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-3 h-6 rounded-full" style={{
              background: activePowerUp === 'shield' ? 'rgba(59,130,246,0.15)' : activePowerUp === 'beam' ? 'rgba(234,179,8,0.15)' : 'rgba(74,222,128,0.12)',
              filter: 'blur(4px)'
            }} />
          </motion.div>
        ))}

        {/* Player + Container */}
        <div
          className="absolute bottom-0 left-0 -translate-x-1/2 z-[8]"
          style={{
            left: `${playerPosition}%`,
            transition: 'left 0.03s linear',
            transform: `translateX(-50%) rotate(${playerVelocity * -12}deg)`,
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Guardian */}
            <div className="relative mb-0.5">
              {activePowerUp === "shield" && (
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.55, 0.3], rotate: [0, 180, 360] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  className="absolute -inset-6 rounded-full border-2 border-dashed border-blue-400/25"
                  style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
                />
              )}
              {activePowerUp === "beam" && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="absolute -inset-4 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)' }}
                />
              )}
              <div className="absolute -inset-4 rounded-full blur-xl" style={{
                background: activePowerUp === 'shield' ? 'rgba(59,130,246,0.12)' : activePowerUp === 'beam' ? 'rgba(234,179,8,0.12)' : 'rgba(74,222,128,0.1)'
              }} />
              <motion.div
                animate={{
                  y: [0, -2, 0, 1, 0],
                  scale: Math.abs(playerVelocity) > 0.1 ? [1, 1.05, 1] : 1
                }}
                transition={{ y: { repeat: Infinity, duration: 2, ease: "easeInOut" }, scale: { duration: 0.3 } }}
                className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10 border-2"
                style={{
                  background: activePowerUp === 'shield'
                    ? 'linear-gradient(135deg, rgba(30,64,175,0.7) 0%, rgba(37,99,235,0.5) 100%)'
                    : activePowerUp === 'beam'
                    ? 'linear-gradient(135deg, rgba(120,53,15,0.7) 0%, rgba(217,119,6,0.5) 100%)'
                    : 'linear-gradient(135deg, rgba(6,78,59,0.8) 0%, rgba(22,101,52,0.6) 100%)',
                  borderColor: activePowerUp === 'shield'
                    ? 'rgba(96,165,250,0.5)'
                    : activePowerUp === 'beam'
                    ? 'rgba(251,191,36,0.5)'
                    : 'rgba(74,222,128,0.4)',
                  boxShadow: `0 0 24px ${activePowerUp === 'shield' ? 'rgba(59,130,246,0.25)' : activePowerUp === 'beam' ? 'rgba(234,179,8,0.25)' : 'rgba(74,222,128,0.2)'}, inset 0 1px 0 rgba(255,255,255,0.08)`
                }}
              >
                <Leaf className="w-5.5 h-5.5" style={{
                  color: activePowerUp === 'shield' ? '#93c5fd' : activePowerUp === 'beam' ? '#fcd34d' : '#6ee7b7',
                  filter: `drop-shadow(0 0 6px ${activePowerUp === 'shield' ? 'rgba(96,165,250,0.5)' : activePowerUp === 'beam' ? 'rgba(251,191,36,0.5)' : 'rgba(74,222,128,0.5)'})`
                }} />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: activePowerUp === 'shield' ? 'rgba(96,165,250,0.6)' : activePowerUp === 'beam' ? 'rgba(251,191,36,0.6)' : 'rgba(250,204,21,0.5)',
                  boxShadow: `0 0 6px ${activePowerUp === 'shield' ? 'rgba(96,165,250,0.4)' : activePowerUp === 'beam' ? 'rgba(251,191,36,0.4)' : 'rgba(250,204,21,0.3)'}`
                }}
              />
            </div>

            {/* Container */}
            <div className="relative w-24 h-8" data-testid="garbage-container">
              <div className="absolute inset-0 rounded-b-lg rounded-t-sm overflow-hidden border-2"
                style={{
                  background: activePowerUp === 'shield'
                    ? 'linear-gradient(to bottom, rgba(30,64,175,0.5) 0%, rgba(30,58,138,0.7) 100%)'
                    : activePowerUp === 'beam'
                    ? 'linear-gradient(to bottom, rgba(120,53,15,0.5) 0%, rgba(92,45,14,0.7) 100%)'
                    : 'linear-gradient(to bottom, rgba(6,78,59,0.6) 0%, rgba(6,60,40,0.8) 100%)',
                  borderColor: activePowerUp === 'shield' ? 'rgba(96,165,250,0.45)' : activePowerUp === 'beam' ? 'rgba(251,191,36,0.4)' : 'rgba(74,222,128,0.35)',
                  boxShadow: `0 0 20px ${activePowerUp === 'shield' ? 'rgba(59,130,246,0.15)' : activePowerUp === 'beam' ? 'rgba(234,179,8,0.15)' : 'rgba(74,222,128,0.1)'}, inset 0 1px 0 rgba(255,255,255,0.04)`
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                  backgroundColor: activePowerUp === 'shield' ? 'rgba(96,165,250,0.4)' : activePowerUp === 'beam' ? 'rgba(251,191,36,0.35)' : 'rgba(74,222,128,0.3)'
                }} />
                <div className="absolute top-[2px] left-1 right-1 h-[1px] bg-white/[0.06]" />
                <div className="absolute left-1 top-1 bottom-1 w-[1px] bg-white/[0.06]" />
                <div className="absolute right-1 top-1 bottom-1 w-[1px] bg-white/[0.06]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 mr-1" style={{
                    color: activePowerUp === 'shield' ? 'rgba(96,165,250,0.35)' : activePowerUp === 'beam' ? 'rgba(251,191,36,0.3)' : 'rgba(74,222,128,0.3)'
                  }} />
                  <span className="text-[8px] font-display uppercase tracking-[0.3em]" style={{
                    color: activePowerUp === 'shield' ? 'rgba(96,165,250,0.45)' : activePowerUp === 'beam' ? 'rgba(251,191,36,0.4)' : 'rgba(74,222,128,0.4)'
                  }}>recycle</span>
                </div>
              </div>
              <div className="absolute -inset-1 rounded-lg blur-md -z-10" style={{
                backgroundColor: activePowerUp === 'shield' ? 'rgba(59,130,246,0.06)' : activePowerUp === 'beam' ? 'rgba(234,179,8,0.06)' : 'rgba(74,222,128,0.06)'
              }} />
              {collected > 0 && (
                <div className="absolute -inset-3 rounded-xl blur-xl -z-10" style={{
                  backgroundColor: activePowerUp === 'shield' ? 'rgba(59,130,246,0.05)' : activePowerUp === 'beam' ? 'rgba(234,179,8,0.05)' : 'rgba(74,222,128,0.05)'
                }} />
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

        {/* ===== TOUCH CONTROLS (mobile only) ===== */}
        <div className="sm:hidden absolute bottom-4 left-0 right-0 z-20 flex justify-between px-4 pointer-events-none"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <button
            className="pointer-events-auto w-16 h-16 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.12] flex items-center justify-center active:bg-white/[0.18] transition-colors touch-none select-none"
            onTouchStart={(e) => { e.preventDefault(); touchLeftRef.current = true; }}
            onTouchEnd={(e) => { e.preventDefault(); touchLeftRef.current = false; }}
            onTouchCancel={() => { touchLeftRef.current = false; }}
            data-testid="touch-move-left"
          >
            <ChevronLeft className="w-8 h-8 text-white/50" />
          </button>
          <button
            className="pointer-events-auto w-16 h-16 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.12] flex items-center justify-center active:bg-white/[0.18] transition-colors touch-none select-none"
            onTouchStart={(e) => { e.preventDefault(); touchRightRef.current = true; }}
            onTouchEnd={(e) => { e.preventDefault(); touchRightRef.current = false; }}
            onTouchCancel={() => { touchRightRef.current = false; }}
            data-testid="touch-move-right"
          >
            <ChevronRight className="w-8 h-8 text-white/50" />
          </button>
        </div>

        {/* ===== OVERLAYS ===== */}

        {/* Pause */}
        <AnimatePresence>
          {paused && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center"
              style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(6,40,30,0.6) 0%, rgba(0,10,8,0.8) 100%)', backdropFilter: 'blur(8px)' }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3 sm:mb-5">
                  <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white/20" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display text-white/90 mb-1 tracking-[0.2em] sm:tracking-[0.3em] uppercase">Paused</h2>
                <p className="text-white/30 font-body text-[10px] sm:text-xs mb-3 sm:mb-6">The forest holds its breath</p>

                <div className="grid grid-cols-4 gap-1.5 sm:flex sm:gap-4 mb-3 sm:mb-6 w-full max-w-xs sm:max-w-none">
                  {[
                    { label: "Score", value: score, color: "text-amber-300" },
                    { label: "Level", value: level, color: "text-emerald-300" },
                    { label: "Diff", value: diffConfig.label, color: diffConfig.color },
                    { label: "Time", value: `${Math.floor(time)}s`, color: "text-white/70" },
                  ].map(s => (
                    <div key={s.label} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white/[0.03] rounded-lg border border-white/[0.04] text-center">
                      <p className="text-white/20 text-[6px] sm:text-[7px] tracking-[0.2em] sm:tracking-[0.3em] uppercase font-display mb-0.5">{s.label}</p>
                      <p className={`text-sm sm:text-lg font-display tabular-nums ${s.color}`}>{s.value}</p>
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
                <p className="text-white/15 text-[8px] tracking-[0.3em] uppercase mt-4 font-display hidden sm:block">ESC to resume</p>
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
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at 50% 80%, rgba(30,20,10,0.7) 0%, rgba(15,8,4,0.9) 50%, rgba(0,0,0,0.95) 100%)',
                backdropFilter: 'blur(12px)'
              }}
            >
              {/* Withered nature background elements */}
              <div className="absolute inset-0 pointer-events-none">
                <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="xMidYMid slice">
                  <path d="M100,600 L100,350 Q95,320 105,280 Q98,250 110,200 Q105,170 100,150 Q90,120 95,80 L97,60 M95,250 Q70,230 50,240 M105,200 Q130,180 145,190 M98,320 Q60,310 45,330 M110,150 Q135,130 150,140" stroke="rgba(120,90,50,0.5)" strokeWidth="3" fill="none" />
                  <path d="M700,600 L700,380 Q695,340 705,300 Q698,260 710,220 Q705,180 700,160 Q690,130 695,100 L697,80 M695,280 Q670,260 650,270 M705,220 Q730,200 745,210 M698,350 Q660,340 645,360" stroke="rgba(120,90,50,0.5)" strokeWidth="3" fill="none" />
                </svg>
                {/* Drifting ash/ember particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`ash-${i}`}
                    animate={{
                      y: [100 + i * 40, -(50 + i * 20)],
                      x: [0, (i % 2 === 0 ? 20 : -15), (i % 2 === 0 ? -10 : 25)],
                      opacity: [0, 0.4, 0.2, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 6 + i * 1.5, ease: "linear", delay: i * 0.6 }}
                    className="absolute rounded-full"
                    style={{
                      left: `${5 + i * 8}%`,
                      bottom: '10%',
                      width: `${1 + (i % 3)}px`,
                      height: `${1 + (i % 3)}px`,
                      backgroundColor: i % 3 === 0 ? 'rgba(180,120,40,0.4)' : 'rgba(120,100,80,0.3)',
                    }}
                  />
                ))}
              </div>

              <motion.div
                initial={{ scale: 0.85, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col items-center max-w-md w-full relative z-10 px-4"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="relative mb-3 sm:mb-4"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border border-amber-700/30 bg-amber-900/30 shadow-[0_0_40px_rgba(180,120,40,0.1)]">
                    <TreePine className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600/70" />
                  </div>
                  <motion.div
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute -inset-3 rounded-3xl border border-amber-700/10"
                  />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-display text-amber-100/80 mb-0.5 tracking-tight">Earth Fell Silent</h2>
                <p className="text-amber-200/25 font-body text-[10px] sm:text-xs mb-3 sm:mb-5">The forests wither, but the roots remain. Rise again, Keeper.</p>

                <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {[
                    { label: "Score", value: score, color: "text-amber-300" },
                    { label: "Saved", value: collected, color: "text-emerald-400/80" },
                    { label: "Purified", value: destroyed, color: "text-orange-300" },
                    { label: "Best Combo", value: `${maxCombo}x`, color: "text-amber-300" },
                  ].map(s => (
                    <div key={s.label} className="px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg border text-center"
                      style={{
                        background: 'rgba(60,40,15,0.3)',
                        borderColor: 'rgba(140,100,40,0.1)'
                      }}
                    >
                      <p className="text-amber-200/20 text-[6px] sm:text-[7px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-display mb-0.5">{s.label}</p>
                      <p className={`text-sm sm:text-lg font-display tabular-nums ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 mb-3 sm:mb-5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border"
                  style={{
                    background: 'rgba(60,40,15,0.25)',
                    borderColor: 'rgba(140,100,40,0.1)'
                  }}
                >
                  <Star className="w-3 h-3 text-amber-500/50" />
                  <span className="text-amber-200/25 text-[9px] tracking-widest uppercase font-display">Level {level}</span>
                  <span className="text-amber-200/10">-</span>
                  <span className="text-amber-300/70 font-display text-xs">{levelName}</span>
                  <span className="text-amber-200/10">-</span>
                  <span className="text-amber-200/25 text-[9px] tabular-nums font-display">{Math.floor(time)}s</span>
                </div>

                <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl border border-amber-700/15"
                  style={{ background: 'rgba(60,40,15,0.2)' }}
                >
                  <Leaf className="w-4 h-4 text-amber-500/40" />
                  <p className="text-amber-200/30 font-body text-xs italic leading-relaxed">
                    "Earth does not need a hero seeking glory. It needs a keeper who never stops."
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[260px]">
                  <Button onClick={resetGame} className="w-full sm:w-auto px-5 rounded-lg bg-emerald-700/70 text-white font-display text-xs tracking-widest border border-emerald-600/40"
                    data-testid="button-restart-game"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    TRY AGAIN
                  </Button>
                  <Button variant="ghost" onClick={onExit} className="w-full sm:w-auto px-5 rounded-lg text-amber-200/40 font-display text-xs tracking-widest border border-amber-700/15" data-testid="button-leave-game">
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
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at 50% 100%, rgba(6,78,59,0.6) 0%, rgba(6,50,35,0.5) 30%, rgba(0,20,15,0.85) 70%, rgba(0,0,0,0.95) 100%)',
                backdropFilter: 'blur(16px)'
              }}
            >
              {/* Lush nature celebration background */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Green aurora glow at top */}
                <div className="absolute top-0 left-0 right-0 h-[40%]" style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.08) 0%, rgba(34,197,94,0.04) 40%, transparent 70%)'
                }} />
                {/* Sunlight beam from top-center */}
                <div className="absolute top-0 left-[40%] w-[20%] h-[60%]" style={{
                  background: 'linear-gradient(180deg, rgba(250,240,180,0.04) 0%, transparent 100%)',
                  filter: 'blur(20px)'
                }} />
                {/* Ground greenery glow */}
                <div className="absolute bottom-0 left-0 right-0 h-[25%]" style={{
                  background: 'radial-gradient(ellipse at 50% 100%, rgba(34,197,94,0.08) 0%, transparent 60%)'
                }} />
                {/* Treeline silhouette at bottom */}
                <svg viewBox="0 0 1200 200" className="absolute bottom-0 left-0 right-0 w-full opacity-[0.08]" preserveAspectRatio="none">
                  <path d="M0,200 L0,120 L30,115 L50,70 L70,115 L100,110 L120,55 L140,110 L170,105 L195,40 L220,105 L250,110 L275,60 L300,110 L330,115 L355,75 L380,115 L410,110 L440,50 L470,110 L500,115 L525,65 L550,115 L580,110 L610,45 L640,110 L670,115 L695,70 L720,115 L750,108 L780,55 L810,110 L840,115 L865,60 L890,115 L920,110 L950,42 L980,110 L1010,115 L1035,68 L1060,115 L1090,108 L1120,50 L1150,110 L1180,115 L1200,100 L1200,200 Z"
                    fill="rgba(34,120,80,0.6)"
                  />
                </svg>
              </div>

              {/* Rising nature particles - leaves, sparkles, pollen */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(25)].map((_, i) => {
                  const isLeaf = i % 5 === 0;
                  return (
                    <motion.div
                      key={`vp-${i}`}
                      initial={{ opacity: 0, y: 200 + (i % 8) * 40 }}
                      animate={{
                        opacity: [0, isLeaf ? 0.5 : 0.7, 0],
                        y: [200 + (i % 8) * 40, -(100 + (i % 6) * 40)],
                        x: [(i % 2 === 0 ? -1 : 1) * (i % 5) * 15, (i % 2 === 0 ? 1 : -1) * (i % 4) * 25],
                        rotate: isLeaf ? [0, 360] : [0, 0],
                      }}
                      transition={{
                        duration: 5 + (i % 5) * 1.5,
                        repeat: Infinity,
                        delay: i * 0.35,
                        ease: "easeOut",
                      }}
                      className="absolute"
                      style={{ left: `${3 + (i * 3.7) % 94}%` }}
                    >
                      {isLeaf ? (
                        <Leaf className="w-3 h-3 text-emerald-400/40" />
                      ) : (
                        <div className="rounded-full" style={{
                          width: `${2 + (i % 3)}px`,
                          height: `${2 + (i % 3)}px`,
                          backgroundColor: i % 4 === 0 ? 'rgba(74,222,128,0.6)' : i % 4 === 1 ? 'rgba(250,204,21,0.5)' : i % 4 === 2 ? 'rgba(147,197,253,0.4)' : 'rgba(167,243,208,0.5)',
                          boxShadow: `0 0 6px ${i % 4 === 0 ? 'rgba(74,222,128,0.3)' : i % 4 === 1 ? 'rgba(250,204,21,0.2)' : 'rgba(147,197,253,0.2)'}`,
                        }} />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ scale: 0.7, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.2 }}
                className="flex flex-col items-center max-w-md w-full relative z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                  className="relative mb-3 sm:mb-5"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border border-emerald-400/30"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,78,59,0.6) 0%, rgba(22,101,52,0.4) 100%)',
                      boxShadow: '0 0 60px rgba(74,222,128,0.2), 0 0 120px rgba(74,222,128,0.1)'
                    }}
                  >
                    <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" style={{ filter: 'drop-shadow(0 0 12px rgba(250,204,21,0.4))' }} />
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
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-display text-emerald-50/95 mb-1 tracking-tight">Earth is Saved</h2>
                  <p className="text-emerald-300/50 font-body text-xs sm:text-sm mb-4 sm:mb-6">The skies are clear. Nature breathes again, thanks to you, Keeper.</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="w-full grid grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4"
                >
                  {[
                    { label: "Score", value: score, color: "text-amber-300" },
                    { label: "Saved", value: collected, color: "text-emerald-300" },
                    { label: "Purified", value: destroyed, color: "text-orange-300" },
                    { label: "Best Combo", value: `${maxCombo}x`, color: "text-amber-300" },
                  ].map(s => (
                    <div key={s.label} className="px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg border text-center"
                      style={{
                        background: 'rgba(6,60,40,0.35)',
                        borderColor: 'rgba(74,222,128,0.1)'
                      }}
                    >
                      <p className="text-emerald-200/25 text-[6px] sm:text-[7px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-display mb-0.5">{s.label}</p>
                      <p className={`text-sm sm:text-lg font-display tabular-nums ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-lg border"
                  style={{
                    background: 'rgba(6,60,40,0.3)',
                    borderColor: 'rgba(74,222,128,0.08)'
                  }}
                >
                  <Star className="w-3 h-3 text-amber-400/60" />
                  <span className="text-emerald-200/30 text-[9px] tracking-widest uppercase font-display">Level {level}</span>
                  <span className="text-emerald-200/10">-</span>
                  <span className="text-amber-300/80 font-display text-xs">{levelName}</span>
                  <span className="text-emerald-200/10">-</span>
                  <DiffIcon className={`w-3 h-3 ${diffConfig.color}`} />
                  <span className={`text-[9px] font-display ${diffConfig.color}`}>{diffConfig.label}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl border border-emerald-500/15"
                  style={{ background: 'rgba(6,60,40,0.25)' }}
                >
                  <TreeDeciduous className="w-4 h-4 text-emerald-400/70" />
                  <p className="text-emerald-300/60 font-body text-xs italic leading-relaxed">
                    "A true keeper does not fight for victory. They fight so every leaf, every river, every breath of wind may live on."
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="flex flex-col sm:flex-row gap-2 w-full max-w-[260px]"
                >
                  <Button onClick={() => {
                    if (soundEnabled) {
                      speakVillain("You think you've won, little keeper? Let's see how well you truly know your precious Earth.");
                    }
                    setShowQuiz(true);
                  }} className="w-full sm:w-auto px-5 rounded-lg bg-purple-700/60 text-white font-display text-xs tracking-widest border border-purple-500/30"
                    data-testid="button-face-malakar"
                  >
                    <Skull className="w-3.5 h-3.5 mr-1.5" />
                    FACE MALAKAR
                  </Button>
                  <Button variant="ghost" onClick={onExit} className="w-full sm:w-auto px-5 rounded-lg text-emerald-200/40 font-display text-xs tracking-widest border border-emerald-500/10" data-testid="button-victory-exit">
                    <Home className="w-3.5 h-3.5 mr-1.5" />
                    EXIT
                  </Button>
                </motion.div>
              </motion.div>
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
      <div className="mt-3 hidden sm:flex items-center gap-4 text-white/15 font-display text-[8px] tracking-[0.3em] uppercase flex-wrap justify-center">
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
