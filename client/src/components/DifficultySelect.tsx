import { motion } from "framer-motion";
import { Leaf, Globe, Flame, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Difficulty = "easy" | "normal" | "hard";

interface DifficultySelectProps {
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
}

const DIFFICULTIES = [
  {
    id: "easy" as Difficulty,
    title: "Calm Nature",
    desc: "Slow garbage, fewer toxic items. A peaceful start.",
    Icon: Leaf,
    color: "text-emerald-400",
    borderColor: "border-emerald-400/30",
    bgColor: "rgba(6,78,59,0.3)",
    glowColor: "rgba(74,222,128,0.08)",
    iconGlow: "drop-shadow(0 0 8px rgba(74,222,128,0.4))",
  },
  {
    id: "normal" as Difficulty,
    title: "Balanced Earth",
    desc: "Moderate speed, mixed garbage. The true test.",
    Icon: Globe,
    color: "text-sky-400",
    borderColor: "border-sky-400/30",
    bgColor: "rgba(14,65,100,0.3)",
    glowColor: "rgba(56,189,248,0.08)",
    iconGlow: "drop-shadow(0 0 8px rgba(56,189,248,0.4))",
  },
  {
    id: "hard" as Difficulty,
    title: "Nature in Crisis",
    desc: "Fast garbage, high toxic density. Survive the storm.",
    Icon: Flame,
    color: "text-orange-400",
    borderColor: "border-orange-400/30",
    bgColor: "rgba(120,50,10,0.25)",
    glowColor: "rgba(251,146,60,0.08)",
    iconGlow: "drop-shadow(0 0 8px rgba(251,146,60,0.4))",
  },
];

export function DifficultySelect({ onSelect, onBack }: DifficultySelectProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(150, 30%, 6%) 0%, hsl(160, 20%, 3%) 60%, #000 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, -200],
              x: [0, (i % 2 === 0 ? 20 : -20)],
              opacity: [0, 0.15, 0],
            }}
            transition={{ repeat: Infinity, duration: 8 + i * 2, delay: i * 0.8, ease: "linear" }}
            className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
            style={{ left: `${8 + i * 8}%`, bottom: "10%" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-10 relative z-10"
      >
        <h2 className="text-3xl md:text-4xl font-display text-white/90 tracking-tight mb-2">Choose Your Path</h2>
        <p className="text-white/35 font-body text-sm">How will you face the pollution storm?</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-4 relative z-10 max-w-3xl w-full">
        {DIFFICULTIES.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
            onClick={() => onSelect(d.id)}
            className={`flex-1 flex flex-col items-center p-6 md:p-8 rounded-xl border ${d.borderColor} backdrop-blur-sm hover-elevate active-elevate-2 cursor-pointer`}
            style={{
              background: d.bgColor,
              boxShadow: `0 0 30px ${d.glowColor}`,
            }}
            data-testid={`button-difficulty-${d.id}`}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 border border-white/[0.06]"
              style={{ background: "rgba(0,0,0,0.3)" }}
            >
              <d.Icon className={`w-7 h-7 ${d.color}`} style={{ filter: d.iconGlow }} />
            </div>
            <h3 className={`text-lg font-display ${d.color} tracking-wide mb-1`}>{d.title}</h3>
            <p className="text-white/30 text-xs font-body leading-relaxed text-center">{d.desc}</p>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 relative z-10"
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-white/30 font-display text-xs tracking-[0.2em] uppercase border border-white/[0.06] rounded-lg"
          data-testid="button-difficulty-back"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back
        </Button>
      </motion.div>

      <p className="absolute bottom-6 text-white/10 text-[9px] font-display tracking-[0.4em] uppercase">
        Nature gives you one chance. Protect it.
      </p>
    </motion.div>
  );
}
