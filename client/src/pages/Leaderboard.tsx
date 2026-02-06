import { motion } from "framer-motion";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Loader2, Crown, TreeDeciduous } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const { data: entries, isLoading } = useLeaderboard();

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-12 space-y-4"
      >
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-accent/10 border border-accent/20 mb-4">
          <TreeDeciduous className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
          Ancient Records
        </h1>
        <p className="text-white/60 font-body text-lg">
          The spirits whisper the names of the greatest keepers.
        </p>
      </motion.div>

      <div className="w-full max-w-3xl glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border-t border-white/10">
        <div className="bg-black/40 px-6 py-4 grid grid-cols-12 gap-4 text-xs font-sans uppercase tracking-widest text-white/40 border-b border-white/5">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Keeper Name</div>
          <div className="col-span-4 text-right">Spirit Score</div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-white/40 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="font-display tracking-wide">Consulting the roots...</span>
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="py-20 text-center text-white/40 font-body italic">
            No records found. Be the first to awaken the forest.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/5 transition-colors duration-200",
                  index === 0 && "bg-accent/5"
                )}
              >
                <div className="col-span-2 flex justify-center">
                  {index === 0 ? (
                    <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                  ) : index === 1 ? (
                    <span className="text-xl font-display font-bold text-gray-300">2</span>
                  ) : index === 2 ? (
                    <span className="text-xl font-display font-bold text-amber-700">3</span>
                  ) : (
                    <span className="text-white/30 font-display">{index + 1}</span>
                  )}
                </div>
                
                <div className="col-span-6">
                  <span className={cn(
                    "font-display text-lg tracking-wide",
                    index === 0 ? "text-accent font-bold" : "text-white/90"
                  )}>
                    {entry.nickname}
                  </span>
                </div>
                
                <div className="col-span-4 text-right font-sans font-medium text-white/60 tabular-nums">
                  {entry.score.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Ambient forest floor image */}
      <div className="fixed inset-0 z-[-1] opacity-30 pointer-events-none">
        <img 
          src="https://pixabay.com/get/gd1da73499796af4a0ca048356d43cfa1853207157cc0a059c6cc5d341e6f0bd5127de65041d2287dd3f2659418df7ce9aad8858fd91fa1782f764be6c0ac54ee_1280.jpg"
          alt="Forest Floor"
          className="w-full h-full object-cover object-bottom mask-gradient-b"
        />
      </div>
    </div>
  );
}
