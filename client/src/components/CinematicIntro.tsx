import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, TreePine, Skull, AlertTriangle, Sparkles, Globe, Crosshair, Shield, Swords, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CinematicIntroProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface StoryBeat {
  id: string;
  lines: string[];
  bg: string;
  particleColor: string;
  glowColor: string;
  icon: typeof Leaf;
  iconColor: string;
  particleDir: "up" | "down";
}

const STORY_BEATS: StoryBeat[] = [
  {
    id: "silent-war",
    lines: [
      "A Silent War for a Living Planet",
      "",
      "Not long from now...",
      "the threat did not rise from Earth,",
      "but from a planet that forgot what life means.",
    ],
    bg: "radial-gradient(ellipse at 50% 60%, hsl(220, 30%, 8%) 0%, hsl(230, 20%, 4%) 60%, #000 100%)",
    particleColor: "rgba(100,140,200,0.15)",
    glowColor: "rgba(80,120,180,0.06)",
    icon: Globe,
    iconColor: "text-blue-400/60",
    particleDir: "down",
  },
  {
    id: "villain",
    lines: [
      "A villain ruled a dying world,",
      "one that drowned in its own waste.",
      "",
      "Unable to restore balance,",
      "he chose a darker solution.",
      "",
      "He turned garbage into a weapon.",
    ],
    bg: "radial-gradient(ellipse at 50% 40%, hsl(0, 15%, 8%) 0%, hsl(350, 10%, 4%) 60%, #000 100%)",
    particleColor: "rgba(200,60,40,0.15)",
    glowColor: "rgba(200,60,40,0.05)",
    icon: Skull,
    iconColor: "text-red-400/60",
    particleDir: "down",
  },
  {
    id: "ultimatum",
    lines: [
      "An ultimatum was sent to Earth.",
      "",
      "Pay the ransom.",
      "Resources. Wealth. Control.",
      "",
      "Earth did not answer.",
      "",
      "Not out of weakness\u2014",
      "but dignity.",
    ],
    bg: "radial-gradient(ellipse at 50% 50%, hsl(40, 12%, 7%) 0%, hsl(35, 8%, 3%) 60%, #000 100%)",
    particleColor: "rgba(200,170,80,0.12)",
    glowColor: "rgba(200,170,80,0.04)",
    icon: Shield,
    iconColor: "text-amber-400/60",
    particleDir: "up",
  },
  {
    id: "attack",
    lines: [
      "Enraged, the villain unleashed his punishment.",
      "",
      "From his planet,",
      "waves of trash were launched toward Earth.",
      "",
      "Garbage rained from the sky,",
      "falling onto forests,",
      "choking oceans,",
      "darkening cities in silence.",
    ],
    bg: "radial-gradient(ellipse at 50% 20%, hsl(30, 10%, 6%) 0%, hsl(20, 8%, 3%) 60%, #000 100%)",
    particleColor: "rgba(180,100,50,0.2)",
    glowColor: "rgba(180,100,50,0.05)",
    icon: AlertTriangle,
    iconColor: "text-orange-400/60",
    particleDir: "down",
  },
  {
    id: "keeper",
    lines: [
      "In secrecy,",
      "Earth awakened its last protector.",
      "",
      "You.",
      "",
      "No medals. No fame. No witnesses.",
      "",
      "Your mission is to protect...",
      "without being seen.",
    ],
    bg: "radial-gradient(ellipse at 50% 50%, hsl(150, 30%, 8%) 0%, hsl(140, 20%, 4%) 60%, #000 100%)",
    particleColor: "rgba(74,222,128,0.2)",
    glowColor: "rgba(74,222,128,0.08)",
    icon: Leaf,
    iconColor: "text-emerald-400/80",
    particleDir: "up",
  },
  {
    id: "mission",
    lines: [
      "Every piece of garbage you destroy",
      "gives Earth another breath.",
      "",
      "Every second you survive",
      "secures a future.",
      "",
      "The villain watches.",
      "The attacks grow stronger.",
      "Time grows shorter.",
    ],
    bg: "radial-gradient(ellipse at 50% 40%, hsl(150, 25%, 6%) 0%, hsl(160, 15%, 3%) 60%, #000 100%)",
    particleColor: "rgba(250,200,50,0.15)",
    glowColor: "rgba(250,200,50,0.05)",
    icon: Crosshair,
    iconColor: "text-amber-300/60",
    particleDir: "up",
  },
  {
    id: "call",
    lines: [
      "What falls today...",
      "is what we leave behind tomorrow.",
      "",
      "Earth does not need a hero seeking glory.",
      "It needs a keeper who never stops.",
    ],
    bg: "radial-gradient(ellipse at 50% 50%, hsl(150, 35%, 10%) 0%, hsl(140, 25%, 5%) 40%, #000 100%)",
    particleColor: "rgba(74,222,128,0.25)",
    glowColor: "rgba(74,222,128,0.1)",
    icon: Sparkles,
    iconColor: "text-emerald-300",
    particleDir: "up",
  },
];

export function CinematicIntro({ onComplete, onSkip }: CinematicIntroProps) {
  const [currentBeat, setCurrentBeat] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const lineTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const beatTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const beat = STORY_BEATS[currentBeat];
  const isLastBeat = currentBeat === STORY_BEATS.length - 1;

  useEffect(() => {
    setVisibleLines(0);

    let lineIdx = 0;
    const revealNext = () => {
      if (lineIdx < beat.lines.length) {
        lineIdx++;
        setVisibleLines(lineIdx);
        const delay = beat.lines[lineIdx - 1] === "" ? 400 : 900;
        lineTimerRef.current = setTimeout(revealNext, delay);
      } else {
        if (isLastBeat) {
          beatTimerRef.current = setTimeout(() => setShowPlayButton(true), 1200);
        } else {
          beatTimerRef.current = setTimeout(() => {
            setCurrentBeat(b => b + 1);
          }, 2000);
        }
      }
    };
    lineTimerRef.current = setTimeout(revealNext, 800);

    return () => {
      if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
      if (beatTimerRef.current) clearTimeout(beatTimerRef.current);
    };
  }, [currentBeat, beat.lines.length, isLastBeat]);

  const Icon = beat.icon;

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
          key={beat.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: beat.bg }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.4, 0],
                  y: beat.particleDir === "down" ? [-(i * 10), 500] : [i * 25, -(i * 20)],
                  x: [0, (i % 2 === 0 ? 12 : -12)],
                }}
                transition={{
                  duration: 5 + (i % 3) * 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "linear",
                }}
                className="absolute w-0.5 h-0.5 rounded-full"
                style={{
                  left: `${5 + (i * 7) % 90}%`,
                  top: beat.particleDir === "down" ? "0%" : "85%",
                  backgroundColor: beat.particleColor,
                  boxShadow: `0 0 4px ${beat.particleColor}`,
                }}
              />
            ))}
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${beat.glowColor} 0%, transparent 60%)`,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute"
            style={{ top: "20%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            <Icon className={`w-20 h-20 ${beat.iconColor}`} style={{ filter: "drop-shadow(0 0 20px currentColor)" }} />
          </motion.div>

          <div className="relative z-10 max-w-xl px-6 text-center">
            {beat.lines.map((line, i) => {
              if (i >= visibleLines) return null;
              if (line === "") return <div key={i} className="h-4" />;

              const isTitle = i === 0 && currentBeat === 0;
              const isEmphasis = line.startsWith("You.") || line.startsWith("Pay the ransom") || line.startsWith("Resources.");
              const isFinal = isLastBeat && (line.includes("Earth does not need") || line.includes("keeper who never stops"));

              return (
                <motion.p
                  key={`${beat.id}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className={
                    isTitle
                      ? "text-2xl md:text-4xl font-display text-white/90 mb-6 tracking-tight"
                      : isEmphasis
                      ? "text-lg md:text-xl font-display text-amber-300/90 leading-relaxed"
                      : isFinal
                      ? "text-lg md:text-xl font-body text-emerald-300/80 leading-relaxed italic"
                      : "text-base md:text-lg font-body text-white/50 leading-relaxed"
                  }
                >
                  {line}
                </motion.p>
              );
            })}
          </div>

          <AnimatePresence>
            {showPlayButton && isLastBeat && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
                className="absolute bottom-[14%] z-20 flex flex-col items-center gap-4"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/30 font-body text-sm tracking-wide"
                >
                  Protect the planet. Keep the balance.
                </motion.p>
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
                  <Swords className="w-5 h-5 mr-2 text-emerald-300" />
                  <span className="text-white">ENTER THE GAME</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-1.5">
          {STORY_BEATS.map((s, i) => (
            <div
              key={s.id}
              className={`h-0.5 rounded-full transition-all duration-500 ${
                i <= currentBeat ? "bg-white/25 w-4" : "bg-white/8 w-2"
              }`}
            />
          ))}
        </div>
        <button
          onClick={onSkip}
          className="text-white/15 text-[10px] font-display tracking-[0.3em] uppercase transition-colors"
          data-testid="button-skip-intro"
        >
          SKIP
        </button>
      </div>
    </motion.div>
  );
}
