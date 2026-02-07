import { motion } from "framer-motion";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Loader2, Crown, TreeDeciduous, Shield, Globe, Flame, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const DIFFICULTY_DISPLAY = {
  easy: { label: "Calm", icon: Shield, color: "text-emerald-400" },
  normal: { label: "Balanced", icon: Globe, color: "text-sky-400" },
  hard: { label: "Crisis", icon: Flame, color: "text-orange-400" },
};

export default function Leaderboard() {
  const { data: entries, isLoading } = useLeaderboard();

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-[-2]"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, hsl(150, 25%, 10%) 0%, hsl(160, 15%, 4%) 40%, #000 100%)",
        }}
      />
      <div className="fixed inset-0 z-[-1] bg-black/40" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-28">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-4 sm:mb-5"
            style={{
              background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)",
              boxShadow: "0 0 40px rgba(74,222,128,0.08)",
            }}
          >
            <TreeDeciduous className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400/60" />
          </div>

          <p className="text-[10px] md:text-xs font-sans uppercase tracking-[0.5em] text-emerald-400/40 mb-3 sm:mb-4" data-testid="text-leaderboard-subtitle">
            Hall of Keepers
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-white/90 tracking-tight mb-2 sm:mb-3" data-testid="text-leaderboard-title">
            Ancient Records
          </h1>

          <p className="text-white/30 font-body text-xs sm:text-sm md:text-base italic max-w-md mx-auto px-2">
            The spirits whisper the names of the greatest keepers who defended Earth.
          </p>
        </motion.div>

        <div className="rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)" }}
        >
          {/* Desktop header */}
          <div className="hidden sm:grid px-5 py-3 grid-cols-12 gap-2 text-[9px] font-sans uppercase tracking-[0.3em] text-white/25 border-b border-white/[0.04]">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4">Keeper</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-1 text-center">Mode</div>
            <div className="col-span-2 text-right">Combo</div>
          </div>

          {/* Mobile header */}
          <div className="sm:hidden px-3 py-2.5 flex items-center justify-between text-[8px] font-sans uppercase tracking-[0.25em] text-white/25 border-b border-white/[0.04]">
            <span>#</span>
            <span>Keeper</span>
            <span>Score</span>
            <span>Combo</span>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-white/30 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500/50" />
              <span className="font-display text-xs tracking-widest">Consulting the roots...</span>
            </div>
          ) : !entries || entries.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-white/25 font-body text-sm italic mb-2">
                No records found yet.
              </p>
              <p className="text-white/15 font-body text-xs">
                Be the first to awaken the forest.
              </p>
            </div>
          ) : (
            <div>
              {entries.map((entry, index) => {
                const diffInfo = DIFFICULTY_DISPLAY[entry.difficulty] || DIFFICULTY_DISPLAY.normal;
                const DiffIcon = diffInfo.icon;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    data-testid={`row-leaderboard-${index}`}
                  >
                    {/* Desktop row */}
                    <div className={cn(
                      "hidden sm:grid grid-cols-12 gap-2 px-5 py-3.5 items-center border-b border-white/[0.03] last:border-b-0",
                      index === 0 && "bg-amber-500/[0.04]",
                      index === 1 && "bg-white/[0.015]",
                      index === 2 && "bg-white/[0.01]"
                    )}>
                      <div className="col-span-1 flex justify-center">
                        {index === 0 ? (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        ) : index === 1 ? (
                          <span className="text-sm font-display font-bold text-gray-300">2</span>
                        ) : index === 2 ? (
                          <span className="text-sm font-display font-bold text-amber-700">3</span>
                        ) : (
                          <span className="text-white/20 font-display text-sm">{index + 1}</span>
                        )}
                      </div>

                      <div className="col-span-4">
                        <span className={cn(
                          "font-display text-sm tracking-wide truncate block",
                          index === 0 ? "text-amber-300/90" : "text-white/70"
                        )} data-testid={`text-keeper-name-${index}`}>
                          {entry.nickname}
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className={cn(
                          "font-sans text-sm tabular-nums font-medium",
                          index === 0 ? "text-amber-300" : "text-white/50"
                        )} data-testid={`text-keeper-score-${index}`}>
                          {entry.score.toLocaleString()}
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="text-white/30 font-display text-xs truncate block" data-testid={`text-keeper-level-${index}`}>
                          {entry.levelName}
                        </span>
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <DiffIcon className={cn("w-3.5 h-3.5", diffInfo.color)} />
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <Zap className="w-3 h-3 text-amber-400/40" />
                        <span className="text-white/30 font-sans text-xs tabular-nums" data-testid={`text-keeper-combo-${index}`}>
                          {entry.maxCombo}x
                        </span>
                      </div>
                    </div>

                    {/* Mobile row */}
                    <div className={cn(
                      "sm:hidden flex items-center gap-2 px-3 py-3 border-b border-white/[0.03] last:border-b-0",
                      index === 0 && "bg-amber-500/[0.04]",
                      index === 1 && "bg-white/[0.015]",
                      index === 2 && "bg-white/[0.01]"
                    )}>
                      <div className="w-6 flex justify-center flex-shrink-0">
                        {index === 0 ? (
                          <Crown className="w-3.5 h-3.5 text-yellow-400" />
                        ) : (
                          <span className="text-white/20 font-display text-xs">{index + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "font-display text-xs tracking-wide truncate block",
                          index === 0 ? "text-amber-300/90" : "text-white/70"
                        )}>
                          {entry.nickname}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <DiffIcon className={cn("w-3 h-3", diffInfo.color)} />
                      </div>

                      <div className="flex-shrink-0 w-14 text-right">
                        <span className={cn(
                          "font-sans text-xs tabular-nums font-medium",
                          index === 0 ? "text-amber-300" : "text-white/50"
                        )}>
                          {entry.score.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 flex-shrink-0 w-10 justify-end">
                        <Zap className="w-2.5 h-2.5 text-amber-400/40" />
                        <span className="text-white/30 font-sans text-[10px] tabular-nums">
                          {entry.maxCombo}x
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-4 sm:gap-6 text-[8px] sm:text-[9px] font-sans uppercase tracking-[0.3em] text-white/15"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-400/30" />
            <span>Calm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-sky-400/30" />
            <span>Balanced</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-orange-400/30" />
            <span>Crisis</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
