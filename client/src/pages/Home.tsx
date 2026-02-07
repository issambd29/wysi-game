import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameProfile } from "@/hooks/use-game-profile";
import { ProfileModal } from "@/components/ProfileModal";
import { Game } from "@/components/Game";
import { CinematicIntro } from "@/components/CinematicIntro";
import { DifficultySelect, type Difficulty } from "@/components/DifficultySelect";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Link } from "wouter";


type GamePhase = "home" | "intro" | "difficulty" | "playing";

export default function Home() {
  const { profile, loading, createProfile, saveScore } = useGameProfile();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [phase, setPhase] = useState<GamePhase>("home");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");

  const isInGame = phase !== "home";

  useEffect(() => {
    if (isInGame) {
      document.body.classList.add("game-active");
    } else {
      document.body.classList.remove("game-active");
    }
    return () => document.body.classList.remove("game-active");
  }, [isInGame]);

  const handleEnterWorld = () => {
    if (!profile) {
      setShowProfileModal(true);
    } else {
      setPhase("intro");
    }
  };

  const handleProfileCreated = async (nickname: string) => {
    await createProfile(nickname);
    setShowProfileModal(false);
    setPhase("intro");
  };

  const handleIntroComplete = () => {
    setPhase("difficulty");
  };

  const handleDifficultySelect = (d: Difficulty) => {
    setDifficulty(d);
    setPhase("playing");
  };

  const handleExitGame = () => {
    setPhase("home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4 text-center overflow-hidden">
      <AnimatePresence>
        {phase === "intro" && (
          <CinematicIntro
            onComplete={handleIntroComplete}
            onSkip={handleIntroComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "difficulty" && (
          <DifficultySelect
            onSelect={handleDifficultySelect}
            onBack={() => setPhase("home")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "playing" && profile && (
          <Game
            nickname={profile.nickname}
            onExit={handleExitGame}
            difficulty={difficulty}
            onSaveScore={saveScore}
          />
        )}
      </AnimatePresence>

      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileCreated}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-4xl mx-auto space-y-8"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            EARTH<br />KEEPER
          </h1>
          <p className="text-lg md:text-2xl font-body text-accent/90 max-w-2xl mx-auto leading-relaxed tracking-wide text-shadow-glow">
            A silent war. A secret protector. The planet's last chance.
          </p>
        </motion.div>

        {!loading && profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-white/60 font-sans text-[10px] tracking-[0.4em] uppercase">
                Welcome back, Earth Keeper
              </span>
              <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm">
                {profile.nickname}
              </span>
              <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-ping" />
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8"
        >
          <Button
            size="lg"
            onClick={handleEnterWorld}
            className="group relative rounded-full text-xl font-display tracking-widest overflow-hidden bg-primary/20 border border-primary/50 shadow-[0_0_40px_-10px_rgba(74,222,128,0.3)]"
            data-testid="button-enter-world"
          >
            <span className="relative z-10 flex items-center gap-3 text-white">
              {profile ? "Continue Journey" : "Enter the World"}
              <ArrowRight className="w-6 h-6" />
            </span>
          </Button>

          <Link href="/story">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full text-xl font-display tracking-widest bg-transparent border-white/20 text-white/80"
              data-testid="button-story"
            >
              <span className="flex items-center gap-3">
                The Story
                <BookOpen className="w-5 h-5" />
              </span>
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <div className="fixed inset-0 z-0 opacity-40">
        <img 
          src="https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2832&auto=format&fit=crop"
          alt="Mystical Forest"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>
    </div>
  );
}
